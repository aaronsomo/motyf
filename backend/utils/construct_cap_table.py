from models import db, Trade, Token, SecondarySale, Offering
from collections import defaultdict

def cap_table_on(date, offering_id):
    # Date is MM-DD-YYYY
    offering = Offering.query.filter_by(id=offering_id).first()
    if not offering:
        return []

    trades = db.session.query(Trade).filter(
        Trade.offering_id == offering.id,
        Trade.minted == True,
        db.func.date(Trade.created_at) <= date
    ).all()

    sales = db.session.query(SecondarySale).filter(
        SecondarySale.secondary_offering_id == offering.secondary_offering_id,
        SecondarySale.executed == True,
        db.func.date(SecondarySale.created_at) <= date
    ).order_by(
        SecondarySale.NFT, SecondarySale.created_at.desc()
    ).distinct(SecondarySale.NFT)

    token_to_owner = {}

    for trade in trades:
        token_to_owner[trade.NFT] = trade.user_id

    for sale in sales:
        token_to_owner[sale.NFT] = sale.buyer_id

    owners_to_token = defaultdict(list)
    for token, owner in token_to_owner.items():
        owners_to_token[owner].append(token)

    return owners_to_token

