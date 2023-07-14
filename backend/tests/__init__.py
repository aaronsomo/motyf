from time import sleep
import os
from urllib.parse import urlparse

import pytest
import sqlalchemy

# Dirty hack to make the app use a different test database instead of the usual one
ORIGINAL_DATABASE_URL = os.environ["DATABASE_URL"]
os.environ["DATABASE_URL"] = urlparse(ORIGINAL_DATABASE_URL)._replace(path='/motyf_test').geturl()

# Need to import models after server
from models import db, app
import server  # import the server in order to initialize all of the endpoints  # noqa
from flask_migrate import upgrade


@pytest.fixture
def client():
    # create a new database
    engine = sqlalchemy.create_engine(ORIGINAL_DATABASE_URL, isolation_level="AUTOCOMMIT", pool_pre_ping=True)  # the "AUTOCOMMIT" isolation_level disables SQLALchemy's smart transaction management, which is important because CREATE DATABASE/DROP DATABASE can't be run within transactions
    conn = engine.connect()
    conn.execute('DROP DATABASE IF EXISTS motyf_test')
    conn.execute('CREATE DATABASE motyf_test')
    conn.close()

    with app.app_context(), app.test_client() as client:
        # migrate db to latest revision
        upgrade()

        # run the actual test
        yield client

        # clean up all of our database connections
        db.session.remove()
        db.engine.dispose()

    # delete the new database we created
    conn = engine.connect()
    conn.execute('DROP DATABASE motyf_test')
    conn.close()