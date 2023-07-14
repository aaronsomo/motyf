"""
Endpoints for authenticating users, performing logins/signups, and managing accounts.
"""

import os
import json
from datetime import datetime, timedelta
import secrets
from typing import Any

import requests
from flask import jsonify, request, abort, redirect, session, url_for, Blueprint
from flask_login import current_user, login_user, logout_user
from oauthlib.oauth2 import WebApplicationClient
from models import db, User, Waitlist
from enums import ERROR_CODES
from utils.permissions import permission_required
from utils.onboarding_status import onboarding_status
from utils.custom_error import CustomError

BACKDOOR_PASSWORD = 'motyf-backdoor-password'
ENABLE_USER_REGISTRATION = os.environ.get('ENABLE_USER_REGISTRATION', '1') == '1'

api_auth = Blueprint('api_auth', __name__)

@api_auth.route('/waitlist', methods=['POST'])
def join_waitlist() -> Any:
    content = request.json
    email = content['email']
    try:
        entry = Waitlist(email=email)
        db.session.add(entry)
        db.session.commit()
    except:
        print(f'Failed to add email: {email}')
    return jsonify(status='success')

@api_auth.route('/login', methods=['POST'])
def login() -> Any:
    content = request.json

    email = content.get("email")
    password = content.get("password")
    remember_me = content.get("remember_me", False)
    if email is None or password is None:
        raise CustomError(ERROR_CODES.ERR_NO_EMAIL_OR_PASSWORD_PROVIDED)

    user = db.session.query(User).filter(User.email == email).first()
    if user is None:
        raise CustomError(ERROR_CODES.ERR_EMAIL_OR_PASSWORD_INCORRECT)

    if not user.verify_password(password):
        raise CustomError(ERROR_CODES.ERR_EMAIL_OR_PASSWORD_INCORRECT)

    login_user(user, remember=remember_me)
    return jsonify(
        status="success",
    )


@api_auth.route('/register', methods=['POST'])
def register() -> Any:
    email = request.json.get("email")
    password = request.json.get("password")
    first_name = request.json.get("first_name")
    last_name = request.json.get("last_name")

    if email is None or password is None:
        raise CustomError(ERROR_CODES.ERR_NO_EMAIL_OR_PASSWORD_PROVIDED)

    if db.session.query(User).filter(User.email == email).count() > 0:
        raise CustomError(ERROR_CODES.ERR_USERNAME_EXISTS)

    if not ENABLE_USER_REGISTRATION and not (password == BACKDOOR_PASSWORD):
        raise CustomError(ERROR_CODES.ERR_PERMISSION_DENIED)

    user = User(
        email=email,
        first_name=first_name,
        last_name=last_name,
        email_verified=False,
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    login_user(user, remember=True)
    return jsonify(status="success")


@api_auth.route('/logout', methods=['POST'])
@permission_required()
def logout() -> Any:
    logout_user()
    return jsonify(status="success")

@api_auth.route('/check-login', methods=['GET'])
@permission_required()
def check_login() -> Any:
    permissions = []
    if current_user.admin:
        permissions.append("ADMIN")

    return jsonify(
        status="success",
        email=current_user.email,
        permissions=permissions,
        onboarding_status=onboarding_status(current_user),
        wallet=current_user.external_wallet
    )