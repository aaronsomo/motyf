import os
import sys

import pathlib
import json

from utils.web3_utils import deploy_contract, compile_contract

deploy = False if len(sys.argv) < 2 else sys.argv[1] == 'deploy'

if deploy:
  deploy_contract('', 10, 'MOTYF', 'MTF')
else:
  contract_interface = compile_contract()
  pathlib.Path("./scripts/results").mkdir(parents=True, exist_ok=True)
  with open('./scripts/results/Motyf.json', 'w') as f:
    json.dump(contract_interface, f)
  print('Contract abi written to scripts/results/Motyf.json')

