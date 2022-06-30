import smartpy as sp
FA2 = sp.io.import_script_from_url("https://smartpy.io/templates/fa2_lib.py")

MULTI = sp.io.import_script_from_url("file:multisigFA2.py")

class ExampleFa2Nft(FA2.Fa2Nft):
    pass

@sp.add_test(name = "FA2_Multisig_Tests")
def test():
    sc = sp.test_scenario()
    sc.h2("FA2")
    example_fa2_nft = ExampleFa2Nft(
        metadata = sp.utils.metadata_of_url("https://example.com")
    )
    sc += example_fa2_nft
    
    admin = sp.test_account("Administrator")
    alice = sp.test_account("Alice")
    bob   = sp.test_account("Robert")
    
    my_map = sp.map({ 1: "aa", 2: "bb" })
    del my_map[1] # my_map == { 2: "bb" }
    
    
    
    multisig_wallet = MULTI.MultiSigWallet(signer = alice.address)
    sc += multisig_wallet
