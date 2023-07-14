"""
This file contains the logic for executing secondary marketplace transactions
Sales that have been confirmed are collected from the database, and funds are transferred
from the Buyers Dwolla wallet to the sellers wallet, and the NFT is transferred to the buyers
web3 wallet.
"""


import os
import sys
import time
from datetime import datetime, timezone, timedelta
import subprocess
import logging
from sqlalchemy import or_
sys.path.append(os.path.join(os.path.dirname(os.path.realpath(__file__)), '..'))
from models import db, SecondarySale, User, Offering, Trade, Token, SecondaryListing, RoyaltyPayout, Notification
from utils.transact_api import transact_request
from utils.web3_utils import checksum_address, mint_token, transfer_token
from utils.dwolla import Dwolla
from utils.construct_cap_table import cap_table_on

MOTYF_ISSUER_ID = os.environ['MOTYF_ISSUER_ID']
MOTYF_MEMBER_ID = os.environ['MOTYF_MEMBER_ID']
NON_MATCHING_STATUSES = ['--', 'RFQ']
DWOLLA_MASTER_FUNDING_ACCOUNT = os.environ['DWOLLA_MASTER_FUNDING_ACCOUNT']

def create_order(account_id, security_id, price, direction):
    req = transact_request('createOrder', payload={
        'memberid': MOTYF_MEMBER_ID,
        'issuerid': MOTYF_ISSUER_ID,
        'accountid': account_id,
        'securityid': security_id,
        'type': 'Limit',
        'action': direction,
        'quantity': '1',
        'price': float(price),
        'expiration': 'Day',
        'disclosePrice': 'Yes',
        'solicited': 'Unsolicited'
    })
    print(req)
    return req['orderDetails']['orderId']

def get_order_match(order_id):
    req = transact_request('getOrder', payload={
        'orderid': order_id
    })
    print(req)
    return req['orderDetails'][0]['matchedOrders'][0]['matchid']

def execute_sale(sale):
    seller = db.session.query(User).filter(User.id == sale.seller_id).first()
    buyer = db.session.query(User).filter(User.id == sale.buyer_id).first()

    db_token = db.session.query(Token, Offering).join(
        Offering, Offering.secondary_offering_id == sale.secondary_offering_id
    ).filter(
        Token.owner_id == sale.seller_id,
        Offering.id == Token.offering_id,
        Token.NFT == sale.NFT,
    ).first()

    token = db_token[0]
    offering = db_token[1]

    if not token or not offering:
        print('Token not found!')
        print(f'Cancelling sale {sale.order_id}!')
        sale.cancelled = True
        db.session.commit()
        return

    if not seller.external_wallet or not buyer.external_wallet:
        print('Buyer or seller wallet not found!')
        print(f'Cancelling sale {sale.order_id}!')
        sale.cancelled = True
        db.session.commit()
        return

    if not sale.bid_id:
        buy_id = create_order(buyer.account_id, sale.secondary_offering_id, sale.price, 'Buy')
        sale.bid_id = buy_id

    if not sale.ask_id:
        sell_id = create_order(seller.account_id, sale.secondary_offering_id, sale.price, 'Sell')
        sale.ask_id = sell_id

    db.session.commit()

    buyer_dwolla = Dwolla.get_or_create_customer(buyer)
    seller_dwolla = Dwolla.get_or_create_customer(seller)

    buyer_wallet = Dwolla.wallet(buyer)['id']
    seller_wallet = Dwolla.wallet(seller)['id']
    print(buyer_wallet)
    print(seller_wallet)

    print(f'Orders created, {sale.bid_id}, {sale.ask_id}')
    print('Sleeping to allow matching to succeed')
    time.sleep(5)

    buy_match_id = get_order_match(sale.bid_id)
    sell_match_id = get_order_match(sale.ask_id)

    if buy_match_id == sell_match_id:
        try:
            # Order id as Idempotency key prevents double send even if we retry here
            Dwolla.transfer(buyer_wallet, seller_wallet, sale.price, sale.order_id)
            sale.match_id = buy_match_id
            sale.executed = True
            token.owner_id = sale.buyer_id
            listing = db.session.query(SecondaryListing).filter(
                SecondaryListing.secondary_offering_id == sale.secondary_offering_id,
                SecondaryListing.NFT == sale.NFT,
            ).delete()
            txn = transfer_token(buyer.external_wallet, seller.external_wallet, sale.NFT, offering.contract_address)
            print(f'Transaction successful, {txn}')
            db.session.add(Notification(
                message=f'Your Motyf has been sold, ${sale.price} has been added to your wallet!',
                user_id=sale.seller_id,
                redirect='/secondary-wallet',
                is_read=False
            ))
            db.session.add(Notification(
                message='Your Motyf has arrived, click here to view it!',
                user_id=sale.buyer_id,
                redirect=f'/{offering.id}/token/{sale.NFT}',
                is_read=False
            ))
            db.session.commit()
        except Exception as e:
            print(f'ERROR TRANSFERRING {e}')
            db.session.rollback()

def is_clean_orderbook(security_id):
    req = transact_request('getClob', payload={
        'securityID': security_id,
        'issuerID': MOTYF_ISSUER_ID
    })
    print(req)
    if req['statusCode'] != '101':
        print(f'Error fetching orderbook: {req}')
        return False
    else:
        details = req['orderDetailsAll']
        bid = details['orderDetailsBid']
        offer = details['orderDetailsOffer']
        return bid in NON_MATCHING_STATUSES and offer in NON_MATCHING_STATUSES

def is_open(day, hour, minute, times, closed):
    closed_key = day + closed
    if times[closed_key] != 'No':
        print(f'Market is closed on {day}')
    else:
        startHour = times[day + 'StartHours']
        endHour = times[day + 'CloseHours']
        startMin = times[day + 'StartMins']
        endMin = times[day + 'CloseMins']
        if hour >= startHour and hour <= endHour:
            if minute >= startMin and  minute <= endMin:
                return True
        return False

def is_active_trading_hours(security_id):
    now = datetime.now().astimezone(timezone(-timedelta(hours=5)))
    day = now.strftime('%A').lower()
    if day == 'saturday' or day == 'sunday':
        times = transact_request('getMarketHolidays')
        if times['statusCode'] != '101':
            print('Could not retrieve market hours')
            return False
        times = times['globalMarketHolidays']

        return is_open(day, now.strftime('%H'), now.strftime('%M'), times, 'closed')
    else:
        times = transact_request('getSecurityMarketHours', payload={
            'securityId': security_id
        })
        if times['statusCode'] != '101':
            print('Could not retrieve market hours')
            return False
        times = times['securityHoursDetails']
        return is_open(day, now.strftime('%H'), now.strftime('%M'), times, 'Closed')

def execute_next_orders():
    sales_to_execute = db.session.query(SecondarySale).filter(
        SecondarySale.executed == False,
        or_(SecondarySale.cancelled == None, SecondarySale.cancelled == False)
    ).order_by(
        SecondarySale.created_at
    ).all()

    for sale in sales_to_execute:
        if is_clean_orderbook(sale.secondary_offering_id) and is_active_trading_hours(sale.secondary_offering_id):
            execute_sale(sale)
        else:
            print(f'Error: orderbook for {sale.secondary_offering_id} is not clean!')

if __name__ == '__main__':
    execute_next_orders()
