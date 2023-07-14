import os
import uuid
from typing import Dict, Union, List

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import UserMixin
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.orm import column_property
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.middleware.proxy_fix import ProxyFix
from datetime import datetime

app = Flask(__name__, static_folder=None)

# since the app will typically be run behind a proxy or load balancer, we need to read proxy headers such as X-Forwarded-Proto
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1)  # type: ignore

# Flask-SQLAlchemy config
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# database config
db: SQLAlchemy = SQLAlchemy(app)
migrate = Migrate(app, db, compare_type=True)

class TimestampModel(db.Model):
    __abstract__ = True
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String, nullable=False)
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    email_verified = db.Column(db.Boolean)
    admin = db.Column(db.Boolean)
    party_id = db.Column(db.String)
    account_id = db.Column(db.String)
    dwolla_id = db.Column(db.String)
    external_wallet = db.Column(db.String)

    def verify_password(self, password: str) -> bool:
        # Ignored type checking for this call as it is from an external dependency.
        return check_password_hash(self.password_hash, password) # type: ignore

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password, "sha256")

    def party(self):
        return Party.query.get(self.party_id) if self.party_id else None

    def account(self):
        return Account.query.get(self.account_id) if self.account_id else None

class Party(db.Model):
    party_id = db.Column(db.String, db.ForeignKey("user.party_id"), nullable=False, primary_key=True)
    kyc_request_id = db.Column(db.String, nullable=True)
    kyc_requested = db.Column(db.Boolean, nullable=True)
    kyc_request_uploads = db.Column(db.Integer, nullable=False)

class Account(db.Model):
    account_id = db.Column(db.String, db.ForeignKey("user.account_id"), nullable=False, primary_key=True)
    suitability_submitted = db.Column(db.Boolean, nullable=True)

class Offering(db.Model):
    id = db.Column(db.Integer, nullable=False, primary_key=True)
    contract_address = db.Column(db.String, nullable=True)
    issue_name = db.Column(db.String, nullable=True)
    secondary_offering_id = db.Column(db.Integer, nullable=True)
    website = db.Column(db.String)
    discord = db.Column(db.String)
    social = db.Column(db.String)

class Trade(TimestampModel):
    trade_id = db.Column(db.Integer, nullable=False, primary_key=True)
    minted = db.Column(db.Boolean, nullable=False)
    offering_id = db.Column(db.Integer, db.ForeignKey("offering.id"), nullable=False)
    NFT = db.Column(db.Integer, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    mint_count = db.Column(db.Integer, nullable=True)

class Token(TimestampModel):
    id = db.Column(db.Integer, nullable=False, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    offering_id = db.Column(db.Integer, db.ForeignKey("offering.id"), nullable=False)
    NFT = db.Column(db.Integer, nullable=True)

class SecondaryListing(TimestampModel):
    order_id = db.Column(db.Integer, nullable=False, primary_key=True)
    price = db.Column(db.Numeric(10,2), nullable=False)
    secondary_offering_id = db.Column(db.Integer, db.ForeignKey("offering.secondary_offering_id"), nullable=False)
    NFT = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    listing_expiry = db.Column(db.Date)

class SecondarySale(TimestampModel):
    order_id = db.Column(db.Integer, nullable=False, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    buyer_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    secondary_offering_id = db.Column(db.Integer, db.ForeignKey("offering.secondary_offering_id"), nullable=False)
    price = db.Column(db.Numeric(10,2), nullable=False)
    NFT = db.Column(db.Integer, nullable=False)
    executed = db.Column(db.Boolean, nullable=False)
    cancelled = db.Column(db.Boolean, nullable=True)
    ask_id = db.Column(db.Integer, nullable=True)
    bid_id = db.Column(db.Integer, nullable=True)
    match_id = db.Column(db.Integer, nullable=True)

class UserTokenLike(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    token_id = db.Column(db.Integer, db.ForeignKey("token.id"), nullable=False)
    offering_id = db.Column(db.Integer, db.ForeignKey("offering.id"), nullable=False)


class DividendHistory(db.Model):
    # For charts on token pages
    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer)
    quarter = db.Column(db.Integer)
    amount = db.Column(db.Numeric(10,2))
    offering_id = db.Column(db.Integer, db.ForeignKey("offering.id"), nullable=False)


class SongDividend(db.Model):
    # For charts on token pages
    id = db.Column(db.Integer, primary_key=True)
    offering_id = db.Column(db.Integer, db.ForeignKey("offering.id"), nullable=False)
    amount = db.Column(db.Numeric(10,2))
    song = db.Column(db.String, nullable=True)

class DividendRegion(db.Model):
    # For charts on token pages
    id = db.Column(db.Integer, primary_key=True)
    offering_id = db.Column(db.Integer, db.ForeignKey("offering.id"), nullable=False)
    domestic = db.Column(db.Numeric(10,2))
    international = db.Column(db.Numeric(10,2))

class RoyaltyPayout(db.Model):
    # Actual payout records
    id = db.Column(db.Integer, primary_key=True)
    offering_id = db.Column(db.Integer, db.ForeignKey("offering.id"), nullable=False)
    amount = db.Column(db.Numeric(10,2), nullable=False)
    date = db.Column(db.Date, nullable=False)
    executed = db.Column(db.Boolean, nullable=False)

class SecondaryOffer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    price = db.Column(db.Numeric(10,2), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    NFT = db.Column(db.Integer, db.ForeignKey("token.id"), nullable=False)
    secondary_offering_id = db.Column(db.Integer, db.ForeignKey("offering.secondary_offering_id"), nullable=False)

class Waitlist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, nullable=False, unique=True)

class OrderExecutorTasks(TimestampModel):
    name = db.Column(db.String, primary_key=True)
    shell_command = db.Column(db.Text, nullable=False)
    run_interval = db.Column(db.Interval, nullable=False)
    last_run_at = db.Column(db.DateTime)
    failed_run_attempts = db.Column(db.Integer, nullable=False, server_default="0")

class Notification(TimestampModel):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    message = db.Column(db.String(255), nullable=False)
    redirect = db.Column(db.String(255), nullable=True)