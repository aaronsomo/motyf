"""
Single threaded runner to guarantee custom order matching logic for the secondary marketplace
"""

import os
import sys
import time
from datetime import datetime, timezone, timedelta
import subprocess
import logging
from sqlalchemy import or_
sys.path.append(os.path.join(os.path.dirname(os.path.realpath(__file__)), '..'))
from models import db, OrderExecutorTasks

from scripts.execute_secondary_transactions import execute_next_orders
from scripts.mint_primary_purchases import find_and_mint_valid_orders
from scripts.payout_royalties import payout_royalties
from scripts.expire_listings import expire_old_listings

FAILED_RUN_ATTEMPTS_UNTIL_GIVE_UP = 10

def main():
    while True:
        logging.info('Starting new order_executor run')
        run_start_time = time.monotonic()
        try:
            for task in OrderExecutorTasks.query.filter(
                    or_(
                        OrderExecutorTasks.last_run_at.is_(None),
                        (OrderExecutorTasks.last_run_at + OrderExecutorTasks.run_interval < db.func.now())
                    )
            ):
                if task.failed_run_attempts >= FAILED_RUN_ATTEMPTS_UNTIL_GIVE_UP:
                    logging.info(f"Task {task.name!r} (interval {task.run_interval}) was last run {task.last_run_at.isoformat() if task.last_run_at is not None else 'never'}, but failed {task.failed_run_attempts} times in a row, ignoring")
                else:
                    logging.info(f"Task {task.name!r} (interval {task.run_interval}) was last run at {task.last_run_at.isoformat() if task.last_run_at is not None else 'never'} (failed in the past {task.failed_run_attempts} consecutive runs), running now")
                    task_start_time = time.monotonic()
                    try:
                        return_code = subprocess.call(task.shell_command, shell=True)
                        if return_code < 0:
                            logging.warning(f"Task {task.name!r} command was terminated by signal {-return_code}, after {time.monotonic() - task_start_time} seconds")
                            task.failed_run_attempts += 1
                        else:
                            logging.info(f"Task {task.name!r} command returned with return code {return_code}, took {time.monotonic() - task_start_time} seconds")
                            task.last_run_at = db.func.now()
                            if return_code == 0:
                                task.failed_run_attempts = 0
                            else:
                                task.failed_run_attempts += 1
                    except OSError:
                        logging.exception(f"Task {task.name!r} command execution failed")
                        task.failed_run_attempts = OrderExecutorTasks.failed_run_attempts + 1
                    db.session.add(task)
                    db.session.commit()
        except Exception:
            logging.exception('Error occurred during periodic order executor run, ignoring')
            db.session.rollback()
        db.session.close()
        logging.info(f'Completed order executor run, took {time.monotonic() - run_start_time} seconds')
        time.sleep(60)

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    main()
