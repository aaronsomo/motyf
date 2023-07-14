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
from models import db, Notification, User
from enums import ERROR_CODES
from utils.permissions import permission_required
from utils.onboarding_status import onboarding_status
from utils.custom_error import CustomError


api_notifications = Blueprint('api_notifications', __name__)

@api_notifications.route('/', methods=['GET'])
@permission_required()
def get_notifications() -> Any:
    notifications = db.session.query(
        Notification
    ).filter(
        Notification.user_id == current_user.id,
    ).order_by(Notification.created_at.desc()).all()

    return jsonify(
        status='success',
        notifications=[
            {
                'message': notification.message,
                'url': notification.redirect,
                'isRead': notification.is_read,
                'id': notification.id
            } for notification in notifications
        ]
    )

@api_notifications.route('/read-all', methods=['GET'])
@permission_required()
def read_notifications() -> Any:
    notifications = db.session.query(
        Notification
    ).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({ Notification.is_read: True })
    db.session.commit()
    return jsonify(
        status='success'
    )

@api_notifications.route('/delete', methods=['POST'])
@permission_required()
def delete_notification() -> Any:
    notif_id = request.json['id']
    notification = db.session.query(
        Notification
    ).filter(
        Notification.user_id == current_user.id,
        Notification.id == notif_id
    ).first()
    if notification:
        db.session.delete(notification)
    db.session.commit()
    return jsonify(
        status='success'
    )