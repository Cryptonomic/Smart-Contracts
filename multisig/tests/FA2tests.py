#to execute test: ~/smartpy-cli/SmartPy.sh test tests/FA2tests.py output2



from audioop import mul
from typing import MutableMapping
import smartpy as sp
#SOURCE = sp.io.import_script_from_url("https://smartpy.io/templates/fa2_lib.py")

MULTI = sp.io.import_script_from_url("file:multisigFA2.py")

FA2_FUNGIBLE = sp.io.import_script_from_url("file:tests/template/fa2_fungible.py")
FA2_NEW = sp.io.import_script_from_url("file:tests/template/fa2.py")

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
    multisig_wallet.set_initial_balance(sp.tez(100))
    scenario += multisig_wallet
    c1 = FA2_FUNGIBLE.Fa2FungibleMinimal(multisig_wallet.address, FA2_FUNGIBLE.metadata_base, "https//example.com")
    scenario += c1
    
    
    c1.mint(sp.record(to_ = alice.address, amount = 50, token = sp.variant("new", tok0_md))).run(sender=multisig_wallet.address)
    scenario.verify(c1.data.next_token_id == sp.nat(1))
    scenario.verify(c1.data.ledger[(alice.address, 0)] == 50)
    
    c1.mint(sp.record(to_ = multisig_wallet.address, amount = 50, token = sp.variant("existing", 0))).run(sender=multisig_wallet.address)
    
    #UPDATE THRESHOLD/SIGNERS
    scenario.verify(c1.data.ledger[(multisig_wallet.address, 0)] == 50)
    scenario.verify(multisig_wallet.data.threshold == 1)
    multisig_wallet.addSigner(bob.address).run(sender = alice.address)
    multisig_wallet.addSigner(admin.address).run(sender = bob.address)
    scenario.verify(multisig_wallet.data.signers.contains(bob.address)) ## add bob as signer
    multisig_wallet.updateThreshold(2).run(sender = bob.address)
    scenario.verify(multisig_wallet.data.threshold == 2)
    multisig_wallet.updateThreshold(3).run(sender = bob.address)
    scenario.verify(multisig_wallet.data.threshold == 2)
    multisig_wallet.removeSigner(bob.address).run(sender = admin.address)
    multisig_wallet.removeSigner(bob.address).run(sender = alice.address)
    scenario.verify(multisig_wallet.data.threshold == 1)
    multisig_wallet.addSigner(bob.address).run(sender = alice.address)
    multisig_wallet.updateThreshold(2).run(sender = bob.address)
    scenario.verify(multisig_wallet.data.threshold == 2)
    

   
    
    # #MINT
    # scenario.verify(c1.data.ledger[(alice.address, 0)] == 60)
    # multisig_wallet.mint(sp.record(receiver = alice.address, amount = 10, tokenId = sp.nat(0), tokenAddress = c1.address)).run(sender = admin.address)
    # multisig_wallet.signAndExecute(1).run(sender = alice.address)
    # scenario.verify(c1.data.ledger[(alice.address, sp.nat(0))] == 70)
    
    #BURN - not available
    
    multisig_wallet.recoverToken(sp.record(receiver = alice.address, amount = 10, tokenId = sp.nat(0), tokenAddress = c1.address)).run(sender = admin.address)
    multisig_wallet.signAndExecute(0).run(sender = alice.address)
    
    
    c2 = FA2_NEW.FA2(config = FA2_NEW.environment_config(),
                                metadata = sp.utils.metadata_of_url("https://example.com"),
                                admin = multisig_wallet.address)
    
    scenario += c2
    c2.mint(sp.record(address = alice.address, amount = 50, metadata = tok0_md, token_id = 0)).run(sender=multisig_wallet.address)
    c2.mint(sp.record(address = multisig_wallet.address, amount = 50, metadata = tok0_md, token_id = 0)).run(sender=multisig_wallet.address)
    scenario.verify(c2.data.ledger[c2.ledger_key.make(alice.address, 0)].balance == 50)
    scenario.verify(c2.data.ledger[c2.ledger_key.make(multisig_wallet.address, 0)].balance == 50)
    
    # TRANSFER
    multisig_wallet.transfer(sp.record(receiver = alice.address, amount = 10, tokenId = sp.nat(0), tokenAddress = c2.address)).run(sender = admin.address)
    multisig_wallet.signAndExecute(1).run(sender = alice.address)
    scenario.verify(c2.data.ledger[c2.ledger_key.make(alice.address, 0)].balance == 60)
    scenario.verify(c2.data.ledger[c2.ledger_key.make(multisig_wallet.address, 0)].balance == 40)
    
    

    
    # MINT
    multisig_wallet.mint(sp.record(receiver = alice.address, amount = 10, tokenId = sp.nat(0), tokenAddress = c2.address, metadata = sp.map())).run(sender = admin.address)
    multisig_wallet.signAndExecute(2).run(sender = alice.address)
    scenario.verify(c2.data.ledger[c2.ledger_key.make(alice.address, 0)].balance == 70)
    scenario.verify(c2.data.ledger[c2.ledger_key.make(multisig_wallet.address, 0)].balance == 40)
    
    
    
    
    # ADMIN SWITC3
    multisig_wallet.addAdminSwitch(sp.record(receiver = alice.address, tokenAddress = c2.address, tokenId = 0)).run(sender = admin.address)
    multisig_wallet.signAndExecute(3).run(sender = alice.address)
    scenario.verify(c2.data.administrator == alice.address)
    
    
    
    
    
    
    


