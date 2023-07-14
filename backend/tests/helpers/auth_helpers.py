
import json
from models import db, User

DEFAULT_USER = 'helper_user@example.com'
ADMIN_USER = 'admin@example.com'
ADMIN_PASSWORD = 'admin-password'

def register_user(client, email=DEFAULT_USER, password='password'):
    return client.post('/api/auth/register', data=json.dumps(dict(
        email=email,
        password=password,
        first_name='bob',
        last_name='jones'
    )), content_type='application/json')

def login_user(client, email=DEFAULT_USER, password='password'):
    return client.post('/api/auth/login', data=json.dumps(dict(
        email=email,
        password=password,
    )), content_type='application/json')

def register_and_login_user(client, email=DEFAULT_USER, password='password'):
    register_user(client, email, password)
    return login_user(client, email, password)

def new_admin(email=ADMIN_USER, password=ADMIN_PASSWORD):
    user = User(
        email=email,
        first_name='Admin',
        last_name='Example',
        email_verified=False,
        admin=True,
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()