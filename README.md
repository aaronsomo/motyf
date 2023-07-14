Development
-----------

You will need GNU Make, Docker, and Docker Compose. First, clone this repository.

Copy `config.sample.sh` as `config.sh` and fill in the fields where indicated in the file.


### Quickstart (autoreload)

Changes to your `localhost:5000` app will not be picked up until you run `make build_app` which is very slow.
To facilitate local dev, you can run both the server and React with autoreload. 

```
make start_dev_server # starts server at port 5555
cd frontend
yarn start # starts React server at port 3000
```

Changes to your src files should trigger automatic reloading!

### Common operations

* Rebuild the entire app (this is generally not necessary for backend changes, only frontend or dependency changes): `make build_app`.
* Clean up resources used by Docker Compose (e.g., stopped containers, networks): `make stop_app`.
* Open a `bash` shell inside the backend/frontend Docker container: `make enter_web`. This shell is useful for testing, debugging, and all sorts of other one-off tasks.
* Open a `psql` shell where you can directly interact with the development PostgreSQL database via SQL: `make enter_db`.
* Quickly restart the backend/frontend Docker container without restarting all of the other containers: `make restart_web`. This is much faster than restarting Docker Compose every time you want to refresh your changes.
* Create a new database migration (and autodetect changes): `make new_auto_migration_db`.
* Create a new database migration (from a blank template): `make new_migration_db`.
* Completely clear your local development database: `make nuke_db`. Generally, after this you will want to run `make migrate_db` to run all database migrations on top of this clean-slate state.

### Smart Contracts

We have developed a set of custom smart contracts to manage the Motyf NFT's. The smart contracts are deployed from the python backend using the web3 python package. Smart contract code is kept in the `backend/contracts` folder. Use `make compile_contracts` to compile the smart contracts into `backend/scripts/results` and `make deploy_contracts` to deploy the smart contracts onto the blockchain. What network the code gets deployed depends on the `QUICKNODE_HTTP_URL` that is configured in config.sh.

### Testing

Use `make test_backend` to run all tests.

Test are located in [backend/tests](/backend/tests).
Any file named `test_*.py` will be run as a test!

Before every test, the test database is cleared and migrated automatically so you always start with a clean slate. Your dev database is untouched! (See [backend/tests/__init__.py](/backend/tests/__init__.py) for details)

Make sure you have this import at the top of each test file 
```python
from tests import client
```

By default PyTest swallows all stdout when running tests. If you want to see the output of your print statements, run:

```
make test_backend_verbose
```

