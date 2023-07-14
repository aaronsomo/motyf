.PHONY: run_app
run_app: migrate_db
	. ./config.sh && docker-compose up

.PHONY: stop_app
stop_app:
	. ./config.sh && docker-compose down --remove-orphans

.PHONY: migrate_db
migrate_db:
	. ./config.sh && docker-compose run web bash -c 'FLASK_APP=models.py flask db upgrade'

.PHONY: downgrade_db
downgrade_db:
	. ./config.sh && docker-compose run web bash -c 'read -p "Downgrade $$DATABASE_URL? Type yes to continue: " prompt; if [[ $$prompt == "yes" ]]; then FLASK_APP=models.py flask db downgrade; else echo Cancelled; fi'

.PHONY: start_dev_server
start_dev_server:
	. ./config.sh && docker-compose run -p 127.0.0.1:5555:5555 web bash -c 'gunicorn server:app --bind 0.0.0.0:5555 --timeout 1000 --access-logfile - --reload'

# rebuild the app container (this usually is only necessary if dependencies change, because docker-compose.yml defines a volume that uses ./backend as /app/backend directly, so changes in that folder are reflected inside the container instantly)
.PHONY: build_app
build_app:
	. ./config.sh && docker-compose build

.PHONY: new_auto_migration_db
new_auto_migration_db:
	. ./config.sh && cd backend && docker-compose run web bash -c 'read -p "Migration description: " MESSAGE && FLASK_APP=models.py flask db migrate -m "$$MESSAGE"'

.PHONY: new_migration_db
new_migration_db:
	. ./config.sh && cd backend && docker-compose run web bash -c 'read -p "Migration description: " MESSAGE && FLASK_APP=models.py flask db revision -m "$$MESSAGE"'

.PHONY: nuke_db
nuke_db:
	. ./config.sh && docker-compose run web bash -c 'read -p "Nuke database $$DATABASE_URL? Type yes to continue: " prompt; if [[ $$prompt == "yes" ]]; then echo "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" | psql $$DATABASE_URL; echo Done; else echo Cancelled; fi'

.PHONY: test_backend
test_backend:
	. ./config.sample.sh && docker-compose run web bash -c 'PYTHONPATH=/app/backend pytest'

.PHONY: test_backend_verbose
test_backend_verbose:
	. ./config.sample.sh && docker-compose run web bash -c 'PYTHONPATH=/app/backend pytest -s'

.PHONY: restart_web
restart_web:
	docker-compose restart web

.PHONY: enter_web
enter_web:
	. ./config.sh && docker-compose run web bash

.PHONY: enter_db
enter_db:
	. ./config.sh && docker-compose run web bash -c 'psql $$DATABASE_URL'

.PHONY: enter_test_db
enter_test_db:
	docker-compose run web bash -c 'psql postgresql://motyf:dev_db_password@db_test/motyf'

.PHONY: compile_contracts
compile_contracts:
	. ./config.sh && docker-compose run web bash -c 'PYTHONPATH=/app/backend python3 scripts/deploy_smart_contracts.py'

.PHONY: deploy_contracts
deploy_contracts:
	. ./config.sh && docker-compose run web bash -c 'PYTHONPATH=/app/backend python3 scripts/deploy_smart_contracts.py deploy'

.PHONY: start_order_executor
start_order_executor:
	. ./config.sh && docker-compose run order_executor