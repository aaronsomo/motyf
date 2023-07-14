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

DWOLLA_MASTER_FUNDING_ACCOUNT = os.environ['DWOLLA_MASTER_FUNDING_ACCOUNT']

def calculate_payout(shares, total_shares, payout):
    return round((shares/total_shares)*payout, 2)

def payout_royalties():
    royalties = db.session.query(RoyaltyPayout, Offering).join(
        Offering, RoyaltyPayout.offering_id == Offering.id
    ).filter(
        RoyaltyPayout.executed == False
    ).all()
    for royalty, db_offering in royalties:
        date = royalty.date.strftime('%m-%d-%y')
        cap_table = cap_table_on(date, royalty.offering_id)
        offering = transact_request('getOffering', payload={"offeringId": royalty.offering_id})['offeringDetails'][0]
        total_shares = offering['totalShares']
        for user, shares in cap_table.items():
            payout = calculate_payout(float(len(shares)), float(total_shares), float(royalty.amount))
            user = User.query.filter_by(id=user).first()
            # Need to handle failed Dwolla wallet creation
            Dwolla.get_or_create_customer(user)
            customer = Dwolla.wallet(user)['id']
            print(f'Transferring ${payout} to {user.id}')
            db.session.add(Notification(
                message=f'Your royalty payment of ${payout} for holding {len(shares)} shares of {db_offering.issue_name} has been deposited.',
                user_id=user.id,
                redirect=f'/secondary-wallet',
                is_read=False
            ))
            Dwolla.transfer(DWOLLA_MASTER_FUNDING_ACCOUNT, customer, payout, f'{royalty.date}+{royalty.id}+{user.id}+royalty')
        royalty.executed = True
        db.session.commit()
    print('Done processing royalties')

if __name__ == '__main__':
    payout_royalties()
