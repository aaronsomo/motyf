import os
import sys
import time
from datetime import datetime, timezone, timedelta
import subprocess
sys.path.append(os.path.join(os.path.dirname(os.path.realpath(__file__)), '..'))
from models import db, SecondaryListing, Notification, Offering

def expire_old_listings():
    today = datetime.now().date()
    listings = db.session.query(SecondaryListing, Offering).join(
        Offering, Offering.secondary_offering_id == SecondaryListing.secondary_offering_id
    ).filter(
        SecondaryListing.listing_expiry <= today
    ).all()
    print(f'Deleting {len(listings)} old listings')
    for listing, offering in listings:
        db.session.add(Notification(
            message='Your listing reached its expiry date, click here to relist it.',
            user_id=listing.user_id,
            redirect=f'/{offering.id}/list/{listing.NFT}',
            is_read=False
        ))
        db.session.delete(listing)
    db.session.commit()

if __name__ == '__main__':
    expire_old_listings()
