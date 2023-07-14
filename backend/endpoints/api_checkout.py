
"""
Endpoints for fetching Offerings
"""

import json
from datetime import datetime, timedelta
import secrets
from typing import Any
import os
import io
from sqlalchemy import and_, or_
import requests
from flask import jsonify, request, abort, redirect, session, url_for, Blueprint
from flask_login import current_user, login_user, logout_user
from oauthlib.oauth2 import WebApplicationClient
from models import db, User, Offering, Trade, SecondaryListing, Token, SecondarySale, UserTokenLike, SecondaryOffer
from enums import ERROR_CODES, TRADE_FIELDS
from utils.permissions import permission_required
from utils.onboarding_status import onboarding_status
from utils.custom_error import CustomError
from utils.transact_api import transact_request, transact_upload
from enums import OnboardingStatuses
from utils.dwolla import Dwolla

api_checkout = Blueprint('api_checkout', __name__)

MOTYF_ISSUER_ID = os.environ['MOTYF_ISSUER_ID']
MOTYF_MEMBER_ID = os.environ['MOTYF_MEMBER_ID']

PAYMENT_PREFERENCES = {
    'Linked Credit Card': 'CREDITCARD',
    'Linked Bank Account': 'ACH'
}

@api_checkout.route('buy', methods=['POST'])
@permission_required()
def buy_offering() -> Any:
    content = request.json
    offering_id = content['offeringId']
    payment_method = content['paymentPreference']
    quantity = int(content['quantity'])

    if quantity <= 0 or quantity > 10:
        raise CustomError('Invalid Quantity')

    offering = transact_request('getOffering', payload={"offeringId": offering_id})
    if offering['statusCode'] != '101':
        raise CustomError('Offering not found')
    offering = offering['offeringDetails'][0]

    if payment_method not in PAYMENT_PREFERENCES.keys():
        raise CustomError('Invalid Payment Method')

    payment_type = PAYMENT_PREFERENCES[payment_method]
    if payment_type == 'CREDITCARD':
        req = transact_request('linkCreditCard', {'accountId': current_user.account_id})
        if req['statusCode'] != '710':
            raise CustomError('Payment method not found')
    elif payment_type == 'ACH':
        req = transact_request('getExternalAccount', {'types': 'Account', 'accountId': current_user.account_id})
        if req['statusCode'] != '101':
            raise CustomError('Payment method not found')
        nickname = req['statusDesc']['AccountNickName']

    onboard_status = onboarding_status(current_user)
    if onboard_status != OnboardingStatuses.ONBOARDING_COMPLETE.value:
        raise CustomError('User has not completed onboarding')

    req = transact_request('createTrade', payload={
        'offeringId': offering_id,
        'transactionUnits': quantity,
        'transactionType': payment_type,
        'accountId': current_user.account_id,
    })

    if req['statusCode'] != '101':
        raise CustomError(req['statusDesc'])

    data = req['purchaseDetails'][1][0]
    trade = data['tradeId']
    db.session.add(Trade(trade_id=trade, minted=False, offering_id=offering_id, user_id=current_user.id))
    db.session.commit()
    if payment_type == 'CREDITCARD':
        req = transact_request('ccFundMove', payload={
            'accountId': current_user.account_id,
            'tradeId': trade,
            'createdIpAddress': request.remote_addr,
        })
    elif payment_type == 'ACH':
        req = transact_request('externalFundMove', payload={
            'accountId': current_user.account_id,
            'tradeId': trade,
            'offeringId': offering_id,
            'NickName': nickname,
            'amount': float(offering['unitPrice'])*float(quantity),
            'description': f'Investment in {offering_id}',
            'checkNumber': trade
        })
    else:
        raise CustomError('Unkown Payment Method')

    if req['statusCode'] != '101':
        raise CustomError('Payment failed.')

    req = transact_request('sendSubscriptionDocument', payload={
        'accountId': current_user.account_id,
        'tradeId': trade,
        'offeringId': offering_id
    })

    return jsonify(
        status='success',
        tradeId=trade
    )

@api_checkout.route('secondary/buy', methods=['POST'])
@permission_required()
def buy_secondary_offering() -> Any:
    content = request.json
    tokenId = content['tokenId']
    offeringId = content['offeringId']

    offering = db.session.query(
        Offering
    ).filter(
        Offering.id == offeringId
    ).first()

    if not offering.secondary_offering_id:
        raise CustomError('Secondary sales are not enabled for this offering')

    if not current_user.external_wallet:
        raise CustomError('Connect a web3 wallet to participate in the secondary market')

    onboard_status = onboarding_status(current_user)
    if onboard_status != OnboardingStatuses.ONBOARDING_COMPLETE.value:
        raise CustomError('User has not completed onboarding')

    listing = db.session.query(
        SecondaryListing
    ).filter(
        SecondaryListing.secondary_offering_id == offering.secondary_offering_id,
        SecondaryListing.NFT == tokenId
    ).first()

    if not listing:
        raise CustomError('Token is not listed for sale')

    token = db.session.query(
        Token
    ).filter(
        Token.offering_id == offering.id,
        Token.NFT == tokenId,
        Token.owner_id == listing.user_id
    ).first()

    if not token:
        raise CustomError('Token not found')

    if not token.owner_id == listing.user_id:
        raise CustomError('User does not own listed token')

    if token.owner_id == current_user.id:
        raise CustomError('Cannot sell a token to yourself')

    balance = Dwolla.balance(current_user)['value']
    if float(balance) < listing.price:
        raise CustomError('Insufficent funds')

    sale = SecondarySale(
        order_id=listing.order_id,
        price=listing.price,
        secondary_offering_id=offering.secondary_offering_id,
        seller_id=token.owner_id,
        buyer_id=current_user.id,
        NFT=token.NFT,
        executed=False
    )
    try:
        db.session.delete(listing)
        db.session.add(sale)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify(
            status='failure',
            error=str(e)
        )

    req = transact_request('cancelOrder', {
        'orderid': sale.order_id
    })

    return jsonify(
        status='success',
        tradeId=listing.order_id
    )


@api_checkout.route('secondary/accept', methods=['POST'])
@permission_required()
def accept_secondary_offering_offer() -> Any:
    content = request.json
    tokenId = content['tokenId']
    offeringId = content['offeringId']
    offerId = content['offerId']

    offering = db.session.query(
        Offering
    ).filter(
        Offering.id == offeringId
    ).first()

    if not current_user.external_wallet:
        raise CustomError('Connect a web3 wallet to participate in the secondary market')

    onboard_status = onboarding_status(current_user)
    if onboard_status != OnboardingStatuses.ONBOARDING_COMPLETE.value:
        raise CustomError('User has not completed onboarding')

    offer = db.session.query(
        SecondaryOffer
    ).filter(
        SecondaryOffer.id == offerId,
        SecondaryOffer.NFT == tokenId,
        SecondaryOffer.secondary_offering_id == offering.secondary_offering_id
    ).first()

    buyer = db.session.query(User).filter(User.id == offer.user_id).first()

    if not offer:
        raise CustomError('Offer not found')

    token = db.session.query(
        Token
    ).filter(
        Token.offering_id == offering.id,
        Token.NFT == tokenId,
        Token.owner_id == current_user.id
    ).first()

    if not token:
        raise CustomError('Token not found')

    if not token.owner_id == current_user.id:
        raise CustomError('User does not own listed token')

    if offer.user_id == current_user.id:
        raise CustomError('Cannot accept an offer from yourself')

    balance = Dwolla.balance(buyer)['value']
    if float(balance) < offer.price:
        raise CustomError('Buyer has insufficent funds')

    listing = db.session.query(
        SecondaryListing
    ).filter(
        SecondaryListing.secondary_offering_id == offering.secondary_offering_id,
        SecondaryListing.NFT == tokenId
    ).first()

    sale = SecondarySale(
        order_id=(listing.order_id if listing else offer.id),
        price=offer.price,
        secondary_offering_id=offering.secondary_offering_id,
        seller_id=current_user.id,
        buyer_id=buyer.id,
        NFT=token.NFT,
        executed=False
    )
    try:
        if listing:
            db.session.delete(listing)
            req = transact_request('cancelOrder', {
                'orderid': listing.order_id
            })
        db.session.delete(offer)
        db.session.add(sale)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify(
            status='failure',
            error=str(e)
        )

    return jsonify(
        status='success',
        tradeId=sale.order_id
    )

@api_checkout.route('secondary/sell', methods=['POST'])
@permission_required()
def sell_secondary_offering() -> Any:
    content = request.json

    offeringId = content['offeringId']
    expiry = content['expiry']
    today = datetime.now().date()

    offering = db.session.query(
        Offering
    ).filter(
        Offering.id == offeringId
    ).first()

    if expiry and today >= datetime.strptime(expiry, '%Y-%m-%d').date():
        raise CustomError('Expiry must a date in the future')

    if not offering.secondary_offering_id:
        raise CustomError('Secondary sales are not enabled for this offering')

    securityId = offering.secondary_offering_id

    sanitize_content = {}
    sanitize_content['price'] = content['price']
    sanitize_content['securityid'] = securityId
    sanitize_content['token'] = content['token']

    sanitize_content['action'] = 'Sell'
    sanitize_content['quantity'] = '1'
    sanitize_content['expiration'] = 'GTC'
    sanitize_content['issuerid'] = MOTYF_ISSUER_ID
    sanitize_content['accountid'] = current_user.account_id
    sanitize_content['memberid'] = MOTYF_MEMBER_ID
    sanitize_content['type'] = 'RFQ'
    sanitize_content['solicited'] = 'Unsolicited'
    sanitize_content['disclosePrice'] = 'No'

    token = db.session.query(
        Token.owner_id, Token.NFT, Offering.id, SecondaryListing.order_id
    ).join(
        Offering, Offering.id == Token.offering_id
    ).outerjoin(
        SecondaryListing,
        and_(
            SecondaryListing.secondary_offering_id == Offering.secondary_offering_id,
            SecondaryListing.NFT == Token.NFT
        )
    ).filter(
        Token.owner_id == current_user.id,
        Token.NFT == content['token'],
        Offering.secondary_offering_id == securityId
    ).all()

    token = token[0]
    if not token:
        raise CustomError('User does not own Token')

    if token.order_id:
        listing = db.session.query(SecondaryListing).filter(
            SecondaryListing.order_id == token.order_id
        ).delete()
        db.session.commit()
        req = transact_request('cancelOrder', payload= {
            'orderid': token.order_id
        })

    req = transact_request('createOrder', payload=sanitize_content)

    if req['statusCode'] == '101':
        details = req['orderDetails']
        order = SecondaryListing(
            order_id=details['orderId'],
            secondary_offering_id=securityId,
            user_id=current_user.id,
            NFT=content['token'],
            price=content['price'],
            listing_expiry=content['expiry'],
        )
        db.session.add(order)
        db.session.commit()

        return jsonify(
            status='success',
            tradeId=details['orderId']
        )
    if req['statusCode'] == '106':
        raise CustomError(req['Error(s)'])
    return jsonify(status='failed')


@api_checkout.route('secondary/offer', methods=['POST'])
@permission_required()
def offer_secondary_offering() -> Any:
    content = request.json
    price = content['price']

    token = db.session.query(Token, Offering).filter(
        Token.offering_id == content['offeringId'],
        Token.NFT == content['token'],
    ).join(
        Offering, Token.offering_id == Offering.id
    ).first()
    token, offering = token[0], token[1]

    listing = db.session.query(SecondaryListing).filter(
        SecondaryListing.secondary_offering_id == offering.secondary_offering_id,
        SecondaryListing.NFT == content['token']
    ).first()

    balance = Dwolla.balance(current_user)['value']

    if not token or not offering:
        raise CustomError('Token not found.')
    if price <= 0:
        raise CustomError('Invalid price.')
    if listing and price >= listing.price:
        raise CustomError('Offer price cannot be above purchase price.')
    if token.owner_id == current_user.id:
        raise CustomError('You own this Motyf')
    if float(balance) < content['price']:
        raise CustomError('Insufficent funds')

    onboard_status = onboarding_status(current_user)
    if not current_user.external_wallet:
        raise CustomError('Connect a web3 wallet to participate in the secondary market')
    if onboard_status != OnboardingStatuses.ONBOARDING_COMPLETE.value:
        raise CustomError('User has not completed onboarding')


    existing_offer = db.session.query(SecondaryOffer).filter(
        SecondaryOffer.secondary_offering_id == offering.secondary_offering_id,
        SecondaryOffer.NFT == content['token'],
        SecondaryOffer.user_id == current_user.id
    ).first()

    if existing_offer:
        existing_offer.price = content['price']
    else:
        new_offer = SecondaryOffer(
            price=content['price'],
            secondary_offering_id=offering.secondary_offering_id,
            NFT=content['token'],
            user_id=current_user.id
        )
        db.session.add(new_offer)

    db.session.commit()

    return jsonify(status='success')

@api_checkout.route('/offers/<int:offering_id>/<int:token_id>', methods=['GET'])
@permission_required()
def get_offers(offering_id: int, token_id: int) -> Any:
    offers = db.session.query(SecondaryOffer.price, SecondaryOffer.user_id, SecondaryOffer.id, SecondaryOffer.NFT, Offering.id.label('offering_id')).join(
        Offering, Offering.id == offering_id
    ).filter(
        SecondaryOffer.secondary_offering_id == Offering.secondary_offering_id,
        SecondaryOffer.NFT == token_id,
    ).order_by(SecondaryOffer.price.desc()).all()

    return jsonify(
        status='success',
        offers=[{
            'amount': offer.price,
            'myOffer': offer.user_id == current_user.id,
            'id': offer.id,
            'NFT': offer.NFT,
            'offeringId': offer.offering_id,
        } for offer in offers]
    )

@api_checkout.route('order/<int:order_id>', methods=['GET'])
@permission_required()
def get_order(order_id) -> Any:
    sale = db.session.query(
        SecondarySale.order_id,
        SecondarySale.NFT,
        SecondarySale.price,
        SecondarySale.executed,
        Offering.contract_address,
        Offering.issue_name
    ).join(
        Offering, Offering.secondary_offering_id == SecondarySale.secondary_offering_id
    ).filter(
        or_(
            SecondarySale.buyer_id == current_user.id,
            SecondarySale.seller_id == current_user.id
        ),
        SecondarySale.order_id == order_id
    ).first()

    if not sale:
        return jsonify(
            status='failure'
        )

    return jsonify(
        status='success',
        order={
            'orderId': sale.order_id,
            'price': sale.price,
            'NFT': sale.NFT,
            'executed': sale.executed,
            'contractAddress': sale.contract_address,
            'issueName': sale.issue_name
        }
    )

@api_checkout.route('orders', methods=['GET'])
@permission_required()
def get_orders() -> Any:
    buys = db.session.query(
        SecondarySale.order_id,
        SecondarySale.NFT,
        SecondarySale.price,
        SecondarySale.executed,
        Offering.contract_address,
        Offering.issue_name
    ).join(
        Offering, Offering.secondary_offering_id == SecondarySale.secondary_offering_id
    ).filter(
        SecondarySale.buyer_id == current_user.id,
    ).all()

    sells = db.session.query(
        SecondarySale.order_id,
        SecondarySale.NFT,
        SecondarySale.price,
        SecondarySale.executed,
        Offering.contract_address,
        Offering.issue_name
    ).join(
        Offering, Offering.secondary_offering_id == SecondarySale.secondary_offering_id
    ).filter(
        SecondarySale.seller_id == current_user.id,
    ).all()


    return jsonify(
        status='success',
        buys=[{
            'orderId': sale.order_id,
            'price': sale.price,
            'NFT': sale.NFT,
            'executed': sale.executed,
            'contractAddress': sale.contract_address,
            'issueName': sale.issue_name
        } for sale in buys],
        sells=[{
            'orderId': sale.order_id,
            'price': sale.price,
            'NFT': sale.NFT,
            'executed': sale.executed,
            'contractAddress': sale.contract_address,
            'issueName': sale.issue_name
        } for sale in sells]
    )

@api_checkout.route('trade/<int:trade_id>', methods=['GET'])
@permission_required()
def get_trade(trade_id) -> Any:
    req = transact_request('getTrade', {
        'accountId': current_user.account_id,
        'tradeId': trade_id
    })

    if req['statusCode'] != '101':
        return jsonify(
            status='failure'
        )
    latest = req['partyDetails'][-1]
    if latest['transactionType'] == 'CREDITCARD':
        all_funding = transact_request('getCCFundMoveHistory', { 'accountId': current_user.account_id })
        movements = all_funding['creditcardDetails']
    elif latest['transactionType'] == 'ACH':
        all_funding = transact_request('getExternalFundMoveHistory', { 'accountId': current_user.account_id})
        movements = all_funding['accountDetails']
    movement = [movement for movement in movements if movement['tradeId'] == str(trade_id)]

    if len(movement) == 0:
        raise CustomError('Trade not found')

    movement = movement[0]
    sanitized_trade = sanitize_trade(req['partyDetails'][-1])
    sanitized_trade['transactionstatus'] = movement['transactionstatus']
    sanitized_trade['fundStatus'] = movement['fundStatus']

    return jsonify(
        status='success',
        trade=sanitized_trade,
    )



@api_checkout.route('trades', methods=['GET'])
@permission_required()
def get_trades() -> Any:
    req = transact_request('getAccountTradeHistory', {'accountId': current_user.account_id})
    details = req['accountDetails']
    # Join offering on trade to simplify
    trade_ids = [order['orderId'] for order in details]
    offering_ids = [order['offeringId'] for order in details]
    trades = Trade.query.filter(Trade.trade_id.in_(trade_ids)).all()
    offerings = Offering.query.filter(Offering.id.in_(offering_ids)).all()

    trade_by_id = {}
    for trade in trades:
        trade_by_id[str(trade.trade_id)] = trade

    offering_by_id = {}
    for offering in offerings:
        offering_by_id[str(offering.id)] = offering

    filtered_trades = []
    for order in details:
        sanitized = sanitize_trade(order)
        if order['offeringId'] in offering_by_id.keys():
            sanitized['contractAddress'] = offering_by_id[order['offeringId']].contract_address
        else:
            sanitized['contractAddress'] = ''

        if order['orderId'] in trade_by_id.keys():
            sanitized['tokenId'] = trade_by_id[order['orderId']].NFT
        else:
            sanitized['tokenId'] = None

        filtered_trades.append(sanitized)


    return jsonify(
        status='success',
        trades=filtered_trades
    )


@api_checkout.route('/tokens', methods=['GET'])
@permission_required()
def get_user_tokens() -> Any:
    db_tokens = db.session.query(
        Token.NFT, db.func.max(Offering.contract_address).label('contract_address'), db.func.max(Offering.id).label('id'),
        db.func.max(Offering.issue_name).label('issue_name'), db.func.max(UserTokenLike.token_id).label('token_id'),
        db.func.max(SecondaryListing.price).label('price'), db.func.max(SecondaryOffer.price).label('offer')
    ).filter(
        Token.owner_id == current_user.id,
    ).join(
        Offering, Offering.id == Token.offering_id
    ).outerjoin(
        UserTokenLike,
        and_(
            UserTokenLike.offering_id == Token.offering_id,
            UserTokenLike.token_id == Token.NFT,
            UserTokenLike.user_id == current_user.id
        )
    ).outerjoin(
        SecondaryListing,
        and_(
            SecondaryListing.NFT == Token.NFT,
            SecondaryListing.secondary_offering_id == Offering.secondary_offering_id
        )
    ).outerjoin(
        SecondaryOffer,
        and_(
            SecondaryOffer.NFT == Token.NFT,
            SecondaryOffer.secondary_offering_id == Offering.secondary_offering_id
        )
    ).group_by(
        Token.NFT, Offering.secondary_offering_id, Token.offering_id
    ).order_by(Token.offering_id, Token.NFT).all()

    db_trades = db.session.query(Trade, Offering.contract_address, Offering.id, Offering.issue_name).filter(
        Trade.minted == False,
        Trade.user_id == current_user.id
    ).join(
        Offering, Offering.id == Trade.offering_id
    ).order_by(Trade.created_at).all()


    offers = []
    listed = []
    unlisted = []
    for token in db_tokens:
        formatted_token = {
            'NFT': token.NFT,
            'contractAddress': token.contract_address,
            'price': token.price,
            'offeringId': token.id,
            'name': token.issue_name,
            'liked': True if token.token_id else False,
            'offer': token.offer
        }
        if token.offer:
            offers.append(formatted_token)
        elif token.price:
            listed.append(formatted_token)
        else:
            unlisted.append(formatted_token)


    pendingTokens = [
        {
            'NFT': -1,
            'contractAddress': trade.contract_address,
            'price': None,
            'offeringId': trade.id,
            'name': trade.issue_name,
            'liked': False,
            'orderNumber': trade[0].trade_id
        } for trade in db_trades
    ]

    return jsonify(
        status='success',
        pendingTokens=pendingTokens,
        listedTokens=listed,
        offeredTokens=offers,
        unlistedTokens=unlisted
    )


@api_checkout.route('/tokens/liked', methods=['GET'])
@permission_required()
def get_user_liked_tokens() -> Any:
    db_tokens = db.session.query(Token, Offering.contract_address, Offering.id, Offering.issue_name, UserTokenLike.token_id, SecondaryListing.price).join(
        Offering, Offering.id == Token.offering_id
    ).join(
        UserTokenLike,
        and_(
            UserTokenLike.offering_id == Token.offering_id,
            UserTokenLike.token_id == Token.NFT,
            UserTokenLike.user_id == current_user.id
        )
    ).outerjoin(
        SecondaryListing,
        and_(
            SecondaryListing.NFT == Token.NFT,
            SecondaryListing.secondary_offering_id == Offering.secondary_offering_id
        )
    ).order_by(Token.offering_id, Token.NFT).all()

    return jsonify(
        status='success',
        userTokens=[
            {
                'NFT': token[0].NFT,
                'contractAddress': token.contract_address,
                'price': token.price,
                'offeringId': token.id,
                'name': token.issue_name,
                'liked': True if token.token_id else False
            } for token in db_tokens
        ]
    )

@api_checkout.route('/token/<int:offering_id>/<int:token_id>', methods=['GET'])
@permission_required()
def get_token(offering_id: int, token_id: int) -> Any:
    token = db.session.query(Token, Offering.contract_address, Offering.id, Offering.issue_name, UserTokenLike.token_id, SecondaryListing.price, SecondaryListing.listing_expiry).filter(
        Token.NFT == token_id,
        Token.offering_id == offering_id
    ).join(
        Offering, Offering.id == Token.offering_id
    ).outerjoin(
        UserTokenLike,
        and_(
            UserTokenLike.offering_id == Token.offering_id,
            UserTokenLike.token_id == Token.NFT,
            UserTokenLike.user_id == current_user.id
        )
    ).outerjoin(
        SecondaryListing,
        and_(
            SecondaryListing.NFT == Token.NFT,
            SecondaryListing.secondary_offering_id == Offering.secondary_offering_id
        )
    ).first()

    return jsonify(
        status='success',
        token={
            'NFT': token[0].NFT,
            'contractAddress': token.contract_address,
            'price': token.price,
            'offeringId': token.id,
            'owner': token[0].owner_id == current_user.id,
            'name': token.issue_name,
            'liked': True if token.token_id else False,
            'expiry': str(token.listing_expiry) if token.listing_expiry else None
        }
    )

@api_checkout.route('/listings', methods=['GET'])
@permission_required()
def get_listings() -> Any:
    db_listings = db.session.query(
        SecondaryListing.NFT, SecondaryListing.price, Offering.id, Offering.contract_address, Offering.issue_name, UserTokenLike.token_id
    ).join(
        Offering, Offering.secondary_offering_id == SecondaryListing.secondary_offering_id
    ).outerjoin(
        UserTokenLike,
        and_(
            UserTokenLike.offering_id == Offering.id,
            UserTokenLike.token_id == SecondaryListing.NFT,
            UserTokenLike.user_id == current_user.id
        )
    ).filter(
        SecondaryListing.user_id != current_user.id
    ).all()


    return jsonify(
        status='success',
        userTokens=[
            {
                'NFT': listing.NFT,
                'contractAddress': listing.contract_address,
                'price': listing.price,
                'offeringId': listing.id,
                'name': listing.issue_name,
                'liked': True if listing.token_id else False
            } for listing in db_listings
        ]
    )

@api_checkout.route('resend', methods=['POST'])
@permission_required()
def resend_documents() -> Any:
    content = request.json
    offering_id = content['offeringId']
    trade_id = content['tradeId']
    req = transact_request('resendSubscriptionDocuments', payload={
        'accountId': current_user.account_id,
        'offeringId': offering_id,
        'tradeId': trade_id
    })
    req = transact_request('sendSubscriptionDocument', payload={
        'accountId': current_user.account_id,
        'offeringId': offering_id,
        'tradeId': trade_id
    })
    if req['statusCode'] == '101':
        return jsonify(
            status='success'
        )
    raise CustomError('Resend Documents Failed')

def token_key(nft, offering):
    return f'{nft}/{offering}'

def sanitize_trade(trade):
    new_trade = {}
    for field in TRADE_FIELDS:
        if field in trade and trade[field]:
            new_trade[field] = trade[field]
    return new_trade