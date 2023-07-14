# flake8: noqa: F401, F811
import json

from tests import client
from tests.helpers.auth_helpers import register_user, login_user, register_and_login_user, new_admin, ADMIN_USER, ADMIN_PASSWORD
from tests.helpers.transact_responses import mock_transact

def test_create_account(client):
    # create account
    data = register_user(client, "test@example.com", "8x90Sffas#df789").json
    assert data["status"] == "success"

    data = login_user(client, "test@example.com", "8x90Sffas#df789").json
    assert data["status"] == "success"

    data = client.get('/api/auth/check-login').json
    assert data["email"] == "test@example.com"

    client.post('/api/auth/logout')
    rv = client.get('/api/auth/check-login')
    assert rv.status_code == 401

    rv = login_user(client, "test@example.com", "bad-password")
    assert rv.json['error'] == 'ERR_EMAIL_OR_PASSWORD_INCORRECT'

    rv = client.get('/api/auth/check-login')
    assert rv.status_code == 401

    data = register_user(client, 'test@example.com', 'new-password').json
    assert data['status'] == 'failure'


def test_admin_account(client, mocker):
    mocked = mock_transact(mocker, 'endpoints.api_admin.transact_request')
    new_admin()
    register_and_login_user(client)
    data = client.get('/api/auth/check-login').json
    assert(data['permissions'] == [])

    data = client.get('/api/admin/users').json
    assert(data['status'] == 'failure')
    assert(data['error'] == 'ERR_PERMISSION_DENIED')

    login_user(client, ADMIN_USER, ADMIN_PASSWORD)

    data = client.get('/api/auth/check-login').json
    assert(data['permissions'] == ['ADMIN'])

    data = client.get('/api/admin/users').json
    assert(data['status'] == 'success')
    mocked.assert_called_with('getAllParties')