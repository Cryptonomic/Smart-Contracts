#to execute test: ~/smartpy-cli/SmartPy.sh test tests/FA2tests.py output



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
    c1 = FA2_FUNGIBLE.Fa2FungibleMinimal(admin.address, FA2_FUNGIBLE.metadata_base, "https//example.com")
    scenario += c1
    
    
    c1.mint(sp.record(to_ = alice.address, amount = 50, token = sp.variant(0, tok0_md))).run(sender=admin)
    

    
    
    
    
    multisig_wallet = MULTI.MultiSigWallet(signer = alice.address)
    scenario += multisig_wallet
    
    sp.verify(multisig_wallet.data.signers.contains(alice.address), "FAILED TO ADD SIGNER")
    multisig_wallet.addSigner(bob.address).run(sender = alice.address)
    #sp.verify(multisig_wallet.data.signers.contains(bob.address), "FAILED TO ADD SIGNER")
    
    
    


