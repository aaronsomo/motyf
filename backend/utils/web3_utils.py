import os

from web3 import Web3
from web3.middleware import geth_poa_middleware, construct_sign_and_send_raw_middleware
from eth_account import Account
from solcx import compile_files, install_solc, compile_solc

QUICKNODE_HTTP_URL = os.environ.get('QUICKNODE_HTTP_URL')
DEPLOYER_PRIVATE_KEY = os.environ.get('DEPLOYER_PRIVATE_KEY')
MAIN_CONTRACT_ABI = os.environ.get('MAIN_CONTRACT_ABI')

# inject the poa compatibility middleware to the innermost layer (0th layer)

w3 = Web3(Web3.HTTPProvider(QUICKNODE_HTTP_URL))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

acct = Account.from_key(DEPLOYER_PRIVATE_KEY)
w3.middleware_onion.add(construct_sign_and_send_raw_middleware(acct))
w3.eth.default_account = acct.address

def contract_interface(address):
  return w3.eth.contract(address=address, abi=MAIN_CONTRACT_ABI)

def checksum_address(address):
  return Web3.toChecksumAddress(address)

def mint_token(wallet, contract):
    contract = contract_interface(contract)
    txn_hash = contract.functions.mint(checksum_address(wallet)).transact()
    w3.eth.wait_for_transaction_receipt(txn_hash)
    return txn_hash.hex()

def transfer_token(to_addr, from_addr, token_id, contract):
    contract = contract_interface(contract)
    txn_hash = contract.functions.safeTransferFrom(
        checksum_address(from_addr),
        checksum_address(to_addr),
        int(token_id)
    ).transact()

    w3.eth.wait_for_transaction_receipt(txn_hash)
    return txn_hash.hex()

def deploy_contract(baseURI, maxTokenIds, name, symbol):
  contract_interface = compile_contract()
  bytecode = contract_interface['bin']
  abi = contract_interface['abi']

  Motyf = w3.eth.contract(abi=abi, bytecode=bytecode)
  txn_hash = Motyf.constructor(baseURI, maxTokenIds, name, symbol).transact()
  txn_receipt = w3.eth.wait_for_transaction_receipt(txn_hash)
  return txn_receipt

def compile_contract():
  compiled = compile_files(
    ['contracts/Motyf.sol'],
    output_values=['abi', 'bin'],
    import_remappings=["@openzeppelin=/node_modules/@openzeppelin"]
  )

  contract_id, contract_interface = compiled.popitem()
  return contract_interface
