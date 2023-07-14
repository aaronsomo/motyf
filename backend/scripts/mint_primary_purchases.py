"""
This Python script is used to fetch trades from the NorCap API and mint NFTs for validated orders.
Collects all Trades from the database and TransactAPI
On detecting trades that are fully funded and settled, it will mint the NFTs
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

def merge_trades(db_trades, norcap_trades):
    trades = {}
    accounts = set({})
    for trade in norcap_trades:
        trades[trade['orderId']] = {}
        trades[trade['orderId']]['accountId'] = trade['accountId']
        trades[trade['orderId']]['orderStatus'] = trade['orderStatus']
        trades[trade['orderId']]['shares'] = trade['totalShares']
        accounts.add(trade['accountId'])

    for trade in db_trades:
        trades[str(trade.trade_id)]['minted'] = trade.minted
        trades[str(trade.trade_id)]['mint_count'] = trade.mint_count or 0

    return trades, accounts

def get_all_orders(offering_id):
    db_trades = db.session.query(Trade).filter(
        Trade.offering_id == offering_id
    ).all()
    norcap_trades = transact_request('getTradesForOffering', payload={
        'offeringId': offering_id
    })

    if norcap_trades['statusCode'] != '101':
        print(norcap_trades)
        print(f'Error fetching trades from NorCap for offering {offering_id}')
        return None, None
    else:
        return merge_trades(db_trades, norcap_trades['Offering purchased details'])

def get_validated_orders(trades, accounts):
    users = db.session.query(User).filter(
        User.account_id.in_(accounts)
    ).all()

    account_to_users = {}
    for user in users:
        account_to_users[str(user.account_id)] = user

    validated_orders = []
    for tid, trade in trades.items():
        if trade['minted']:
            print(f'{tid} minted')
        elif trade['orderStatus'] != 'SETTLED':
            print(f'{tid} not settled')
        elif account_to_users[trade['accountId']].external_wallet == None:
            print(f'{trade["accountId"]} does not have a wallet, not minting {tid}')
        else:
            print(f'{tid} ready to mint to {trade["accountId"]}')
            validated_orders.append({
                'wallet': account_to_users[trade['accountId']].external_wallet,
                'tradeId': tid,
                'user': account_to_users[trade['accountId']].id,
                'shares': float(trade['shares']),
                'mint_count': float(trade['mint_count'])
            })
    return validated_orders

def mint_valid_orders(orders, offering):
    tokens_for_offering = Token.query.filter_by(offering_id=offering.id).all()
    nfts = list(filter(lambda x: x is not None, [token.NFT for token in tokens_for_offering]))
    max_token = 0
    if len(nfts) > 0:
        max_token = max(nfts)
    next_token = max_token + 1

    for order in orders:
        mints = int(order['shares'] - order['mint_count'])
        try:
            for mint in range(mints):
                token = Token(
                    offering_id=offering.id,
                    owner_id=order['user'],
                    NFT=next_token,
                )
                trade = Trade.query.filter_by(trade_id=order['tradeId']).first()
                mint_count = trade.mint_count + 1 if trade.mint_count else 1
                trade.minted = int(order['shares']) == mint_count
                trade.mint_count = mint_count
                trade.NFT = next_token
                db.session.add(token)
                db.session.add(Notification(
                    message='Your Motyf has been minted, click here to view it!',
                    user_id=order['user'],
                    redirect=f'/{offering.id}/token/{trade.NFT}',
                    is_read=False
                ))
                db.session.commit()
                txn_hash = mint_token(order['wallet'], offering.contract_address)
                print(f'Minted token {next_token} to {order["wallet"]} for trade {trade.trade_id}. {txn_hash}')
                next_token += 1
        except Exception as e:
            print(f'ERROR MINTING {e}')
            db.session.rollback()

def find_and_mint_valid_orders():
    offerings = db.session.query(Offering).all()
    for offering in offerings:
        if not offering.contract_address:
            print(f'Skipping {offering.id}, not deployed')
        else:
            orders, accounts = get_all_orders(offering.id)
            if orders:
                valid_orders = get_validated_orders(orders, accounts)
                mint_valid_orders(valid_orders, offering)


if __name__ == '__main__':
    find_and_mint_valid_orders()
