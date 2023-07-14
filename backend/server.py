from os import path
import os
import json
import itertools
from datetime import datetime, timedelta
from typing import Optional, Any, List, Dict

from flask import jsonify, request, send_from_directory, abort, Blueprint, stream_with_context, Response
import werkzeug.exceptions
from flask_login import LoginManager, current_user

from sqlalchemy import column, true
from endpoints.api_auth import api_auth
from endpoints.api_offerings import api_offerings
from endpoints.api_admin import api_admin
from endpoints.api_kyc import api_kyc
from endpoints.api_checkout import api_checkout
from endpoints.api_notifications import api_notifications

from models import app, db, User
from utils.custom_error import CustomError

FLASK_SECRET_KEY = os.environ['FLASK_SECRET_KEY']
API_URL_PREFIX = os.environ['API_URL_PREFIX']

# Initialize Flask-Login
app.config['SECRET_KEY'] = FLASK_SECRET_KEY
login_manager = LoginManager()
login_manager.init_app(app)


# intercepts raised CustomErrors and returns json in expected format
@app.errorhandler(CustomError)
def handle_bad_request(e: CustomError) -> Any:
    return jsonify(
        status='failure',
        error=e.error_code,
        error_meta=e.error_meta
    ), e.status_code


@login_manager.user_loader # type: ignore
def load_user(user_id: int) -> Any:
    if user_id is not None:
        try:
            return db.session.query(User).get(int(user_id))
        except Exception as e:
            print(e)
            db.session.rollback()
            print('Retrying..')
        return User.query.get(int(user_id))
    return None

api = Blueprint('api', __name__)

app.register_blueprint(api, url_prefix=API_URL_PREFIX)
app.register_blueprint(api_auth, url_prefix=f"{API_URL_PREFIX}/auth")
app.register_blueprint(api_offerings, url_prefix=f"{API_URL_PREFIX}/offerings")
app.register_blueprint(api_admin, url_prefix=f"{API_URL_PREFIX}/admin")
app.register_blueprint(api_kyc, url_prefix=f"{API_URL_PREFIX}/kyc")
app.register_blueprint(api_checkout, url_prefix=f"{API_URL_PREFIX}/checkout")
app.register_blueprint(api_notifications, url_prefix=f"{API_URL_PREFIX}/notifications")

@api.route('/healthcheck')
def healthcheck() -> Any:
    return jsonify(status="success")


# serve static files from the frontend build output
@app.route('/', defaults={'filepath': 'index.html'})
@app.route('/<path:filepath>')
def serve_static(filepath: str) -> Any:
    frontend_build_output_path = path.join(path.dirname(path.realpath(__file__)), '..', 'frontend', 'build')
    try:
        return send_from_directory(frontend_build_output_path, filepath)
    except werkzeug.exceptions.NotFound:
        return send_from_directory(frontend_build_output_path, 'index.html')
