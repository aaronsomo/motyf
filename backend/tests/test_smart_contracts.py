import pytest
from tests import client

from web3 import (
    EthereumTesterProvider,
    Web3,
)
from utils.web3_utils import compile_contract

MAX_TOKENS = 5
CONTRACT_NAME = 'MOTYF'
CONTRACT_URL = 'https://example/'
CONTRACT_SYMBOL = 'MTF'
@pytest.fixture
def tester_provider():
    return EthereumTesterProvider()


@pytest.fixture
def eth_tester(tester_provider):
    return tester_provider.ethereum_tester


@pytest.fixture
def w3(tester_provider):
    return Web3(tester_provider)

@pytest.fixture
def motyf_contract(eth_tester, w3):
    deploy_address = eth_tester.get_accounts()[0]
    contract = compile_contract()

    MotyfContract = w3.eth.contract(abi=contract['abi'], bytecode=contract['bin'])

    tx_hash = MotyfContract.constructor(
      CONTRACT_URL,
      MAX_TOKENS,
      CONTRACT_NAME,
      CONTRACT_SYMBOL
    ).transact({
        'from': deploy_address,
        'gas': 30029122
    })
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash, 180)
    return MotyfContract(tx_receipt.contractAddress)


def mint_and_wait(address, w3, eth_tester, motyf_contract):
    tx_hash = motyf_contract.functions.mint(
        address
    ).transact({
        'from': eth_tester.get_accounts()[0]
    })
    return w3.eth.wait_for_transaction_receipt(tx_hash)

def test_metadata(w3, motyf_contract, eth_tester):
    mint_and_wait(eth_tester.get_accounts()[1], w3, eth_tester, motyf_contract)
    max_tokens = motyf_contract.caller.maxTokenIds()
    assert max_tokens == MAX_TOKENS
    name = motyf_contract.caller.name()
    assert name == CONTRACT_NAME
    symbol = motyf_contract.caller.symbol()
    assert symbol == CONTRACT_SYMBOL
    url = motyf_contract.caller.tokenURI(1)
    assert url == CONTRACT_URL + '1'
    owner = motyf_contract.caller.owner()
    assert owner == eth_tester.get_accounts()[0]
    balance_of_owner = motyf_contract.caller.balanceOf(eth_tester.get_accounts()[0])
    balance_of_minted = motyf_contract.caller.balanceOf(eth_tester.get_accounts()[1])
    assert balance_of_minted == 1
    assert balance_of_owner == 0
    owner_address = motyf_contract.caller.ownerOf(1)
    assert owner_address == eth_tester.get_accounts()[1]

def test_max_mints(w3, motyf_contract, eth_tester):
    for i in range(MAX_TOKENS):
        assert mint_and_wait(eth_tester.get_accounts()[1], w3, eth_tester, motyf_contract)['status'] == 1
        assert motyf_contract.caller.tokenIds() == i+1
    try:
        mint_and_wait(eth_tester.get_accounts()[1], w3, eth_tester, motyf_contract)
    except Exception as e:
        assert str(e) == 'execution reverted: Exceeded maximum token supply'
        return
    assert False, 'Minting over max tokens should error'

def test_mint_from_non_owner(w3, motyf_contract, eth_tester):
    try:
        tx_hash = motyf_contract.functions.mint(
            eth_tester.get_accounts()[1]
        ).transact({
            'from': eth_tester.get_accounts()[1]
        })
    except Exception as e:
        assert str(e) == 'execution reverted: Ownable: caller is not the owner'
        return
    assert False, 'Minting from non-deployer should error'

def test_transfer_by_deployer(w3, motyf_contract, eth_tester):
    assert mint_and_wait(eth_tester.get_accounts()[1], w3, eth_tester, motyf_contract)['status'] == 1
    assert mint_and_wait(eth_tester.get_accounts()[1], w3, eth_tester, motyf_contract)['status'] == 1
    # a1->t1,t2
    tx_hash = motyf_contract.functions.safeTransferFrom(
        eth_tester.get_accounts()[1],
        eth_tester.get_accounts()[2],
        1
    ).transact({
        'from': eth_tester.get_accounts()[0]
    })
    w3.eth.wait_for_transaction_receipt(tx_hash)
    # a2->t1, a1->t2
    assert motyf_contract.caller.ownerOf(1) == eth_tester.get_accounts()[2]
    assert motyf_contract.caller.ownerOf(2) == eth_tester.get_accounts()[1]
    assert mint_and_wait(eth_tester.get_accounts()[2], w3, eth_tester, motyf_contract)['status'] == 1
    # a2->t1,t3, a1->t2
    tx_hash = motyf_contract.functions.safeTransferFrom(
        eth_tester.get_accounts()[2],
        eth_tester.get_accounts()[3],
        3,
        b'test'
    ).transact({
        'from': eth_tester.get_accounts()[0]
    })
    w3.eth.wait_for_transaction_receipt(tx_hash)
    # a2->t1, a1->t2, a3->t3
    assert motyf_contract.caller.ownerOf(1) == eth_tester.get_accounts()[2]
    assert motyf_contract.caller.ownerOf(2) == eth_tester.get_accounts()[1]
    assert motyf_contract.caller.ownerOf(3) == eth_tester.get_accounts()[3]
    tx_hash = motyf_contract.functions.safeTransferFrom(
        eth_tester.get_accounts()[3],
        eth_tester.get_accounts()[1],
        3
    ).transact({
        'from': eth_tester.get_accounts()[0]
    })
    w3.eth.wait_for_transaction_receipt(tx_hash)
    # a2-> t1, a1->t2, t3
    assert motyf_contract.caller.ownerOf(1) == eth_tester.get_accounts()[2]
    assert motyf_contract.caller.ownerOf(2) == eth_tester.get_accounts()[1]
    assert motyf_contract.caller.ownerOf(3) == eth_tester.get_accounts()[1]

def test_transfer_by_owner(w3, motyf_contract, eth_tester):
    assert mint_and_wait(eth_tester.get_accounts()[1], w3, eth_tester, motyf_contract)['status'] == 1
    try:
        tx_hash = motyf_contract.functions.transferFrom(
            eth_tester.get_accounts()[1],
            eth_tester.get_accounts()[2],
            1
        ).transact({
            'from': eth_tester.get_accounts()[1]
        })
        w3.eth.wait_for_transaction_receipt(tx_hash)
    except Exception as e:
        assert str(e) == 'execution reverted: Ownable: caller is not the owner'
        return
    assert False, 'Minting from non-deployer should error'

def test_transfer_by_random(w3, motyf_contract, eth_tester):
    assert mint_and_wait(eth_tester.get_accounts()[1], w3, eth_tester, motyf_contract)['status'] == 1
    try:
        tx_hash = motyf_contract.functions.transferFrom(
            eth_tester.get_accounts()[1],
            eth_tester.get_accounts()[2],
            1
        ).transact({
            'from': eth_tester.get_accounts()[2]
        })
        w3.eth.wait_for_transaction_receipt(tx_hash)
    except Exception as e:
        assert str(e) == 'execution reverted: Ownable: caller is not the owner'
        return
    assert False, 'Minting from non-deployer should error'

def test_safe_transfer_by_owner(w3, motyf_contract, eth_tester):
    assert mint_and_wait(eth_tester.get_accounts()[1], w3, eth_tester, motyf_contract)['status'] == 1
    try:
        tx_hash = motyf_contract.functions.safeTransferFrom(
            eth_tester.get_accounts()[1],
            eth_tester.get_accounts()[2],
            1
        ).transact({
            'from': eth_tester.get_accounts()[1]
        })
        w3.eth.wait_for_transaction_receipt(tx_hash)
    except Exception as e:
        assert str(e) == 'execution reverted: Ownable: caller is not the owner'
        return
    assert False, 'Minting from non-deployer should error'

def test_safe_transfer_by_random(w3, motyf_contract, eth_tester):
    assert mint_and_wait(eth_tester.get_accounts()[1], w3, eth_tester, motyf_contract)['status'] == 1
    try:
        tx_hash = motyf_contract.functions.safeTransferFrom(
            eth_tester.get_accounts()[1],
            eth_tester.get_accounts()[2],
            1
        ).transact({
            'from': eth_tester.get_accounts()[2]
        })
        w3.eth.wait_for_transaction_receipt(tx_hash)
    except Exception as e:
        assert str(e) == 'execution reverted: Ownable: caller is not the owner'
        return
    assert False, 'Minting from non-deployer should error'


def test_safe_transfer_bytes_by_owner(w3, motyf_contract, eth_tester):
    assert mint_and_wait(eth_tester.get_accounts()[1], w3, eth_tester, motyf_contract)['status'] == 1
    try:
        tx_hash = motyf_contract.functions.safeTransferFrom(
            eth_tester.get_accounts()[1],
            eth_tester.get_accounts()[2],
            1,
            b'test'
        ).transact({
            'from': eth_tester.get_accounts()[1]
        })
        w3.eth.wait_for_transaction_receipt(tx_hash)
    except Exception as e:
        assert str(e) == 'execution reverted: Ownable: caller is not the owner'
        return
    assert False, 'Minting from non-deployer should error'

def test_safe_transfer_bytes_by_random(w3, motyf_contract, eth_tester):
    assert mint_and_wait(eth_tester.get_accounts()[1], w3, eth_tester, motyf_contract)['status'] == 1
    try:
        tx_hash = motyf_contract.functions.safeTransferFrom(
            eth_tester.get_accounts()[1],
            eth_tester.get_accounts()[2],
            1,
            b'test'
        ).transact({
            'from': eth_tester.get_accounts()[2]
        })
        w3.eth.wait_for_transaction_receipt(tx_hash)
    except Exception as e:
        assert str(e) == 'execution reverted: Ownable: caller is not the owner'
        return
    assert False, 'Minting from non-deployer should error'

