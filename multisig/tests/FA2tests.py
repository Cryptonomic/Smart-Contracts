#to execute test: ~/smartpy-cli/SmartPy.sh test tests/FA2tests.py output



from typing import MutableMapping
import smartpy as sp
#SOURCE = sp.io.import_script_from_url("https://smartpy.io/templates/fa2_lib.py")

MULTI = sp.io.import_script_from_url("file:multisigFA2.py")

FA2_FUNGIBLE = sp.io.import_script_from_url("file:tests/template/fa2_fungible.py")

def make_metadata(symbol, name, decimals):
    """Helper function to build metadata JSON bytes values."""
    return sp.map(
        l={
            "decimals": sp.utils.bytes_of_string("%d" % decimals),
            "name": sp.utils.bytes_of_string(name),
            "symbol": sp.utils.bytes_of_string(symbol),
        }
    )


@sp.add_test(name = "FA2_Multisig_Tests")
def test():
    
    admin = sp.test_account("Administrator")
    alice = sp.test_account("Alice")
    bob   = sp.test_account("Robert")
    
    tok0_md = make_metadata(name="Token Zero", decimals=1, symbol="Tok0")
    tok1_md = make_metadata(name="Token One", decimals=1, symbol="Tok1")
    tok2_md = make_metadata(name="Token Two", decimals=1, symbol="Tok2")
    
    scenario = sp.test_scenario()
    multisig_wallet = MULTI.MultiSigWallet(signer = alice.address)
    scenario += multisig_wallet
    c1 = FA2_FUNGIBLE.Fa2FungibleMinimal(multisig_wallet.address, FA2_FUNGIBLE.metadata_base, "https//example.com")
    scenario += c1
    
    
    c1.mint(sp.record(to_ = alice.address, amount = 50, token = sp.variant("new", tok0_md))).run(sender=multisig_wallet.address)
    scenario.verify(c1.data.next_token_id == sp.nat(1))
    

    
    
    
    
    
    
    c1.mint(sp.record(to_ = multisig_wallet.address, amount = 50, token = sp.variant("existing", 0))).run(sender=multisig_wallet.address)
    
    scenario.verify(multisig_wallet.data.threshold == 1)
    multisig_wallet.addSigner(bob.address).run(sender = alice.address)
    multisig_wallet.addSigner(admin.address).run(sender = bob.address)
    scenario.verify(multisig_wallet.data.signers.contains(bob.address)) ## add bob as signer
    multisig_wallet.updateThreshold(2).run(sender = bob.address)
    scenario.verify(multisig_wallet.data.threshold == 2)
    multisig_wallet.updateThreshold(3).run(sender = bob.address)
    scenario.verify(multisig_wallet.data.threshold == 2)
    # multisig_wallet.updateThreshold(3).run(sender = admin.address)
    # scenario.verify(multisig_wallet.data.threshold == 3)
    # multisig_wallet.removeSigner(bob.address).run(sender = admin.address)
    # multisig_wallet.removeSigner(bob.address).run(sender = alice.address)
    # scenario.verify(multisig_wallet.data.threshold == 1)
    
    # multisig_wallet.transfer(sp.record(receiver = alice.address, amount = 10, tokenId = sp.nat(0), tokenAddress = c1.address)).run(sender = admin.address)
    # multisig_wallet.signAndExecute(0).run(sender = alice.address)
    # multisig_wallet.recoverToken(sp.record(receiver = alice.address, amount = 10, tokenId = sp.nat(0), tokenAddress = c1.address)).run(sender = admin.address)
    multisig_wallet.mint(sp.record(receiver = alice.address, amount = 10, tokenId = sp.nat(0), tokenAddress = c1.address)).run(sender = admin.address)
    multisig_wallet.signAndExecute(0).run(sender = alice.address)
    
    
    
    
    
    
    

