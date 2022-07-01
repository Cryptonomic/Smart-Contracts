import smartpy as sp
#SOURCE = sp.io.import_script_from_url("https://smartpy.io/templates/fa2_lib.py")

MULTI = sp.io.import_script_from_url("file:multisigFA12.py")

FA12_TEMPLATE = sp.io.import_script_from_url("file:tests/template/fa12.py")



@sp.add_test(name = "FA12")
def test():
    
    admin = sp.test_account("Administrator")
    alice = sp.test_account("Alice")
    bob   = sp.test_account("Robert")

    scenario = sp.test_scenario()
    multisig_wallet = MULTI.MultiSigWallet(signer = alice.address)
    scenario += multisig_wallet
    
   
    

    # Let's display the accounts:
    scenario.h1("Accounts")
    scenario.show([admin, alice, bob])

    scenario.h1("Contract")
    token_metadata = {
        "decimals"    : "18",               # Mandatory by the spec
        "name"        : "My Great Token",   # Recommended
        "symbol"      : "MGT",              # Recommended
        # Extra fields
        "icon"        : 'https://smartpy.io/static/img/logo-only.svg'
    }
    contract_metadata = {
        "" : "ipfs://QmaiAUj1FFNGYTu8rLBjc3eeN9cSKwaF8EGMBNDmhzPNFd",
    }
    c1 = FA12_TEMPLATE.FA12(
        multisig_wallet.address,
        config              = FA12_TEMPLATE.FA12_config(support_upgradable_metadata = True),
        token_metadata      = token_metadata,
        contract_metadata   = contract_metadata
    )
    scenario += c1
    
    
    c1.mint(sp.record(address = alice.address, value = 50)).run(sender=multisig_wallet.address)
    c1.mint(sp.record(address = multisig_wallet.address, value = 50)).run(sender=multisig_wallet.address)
    
    

    
    
    
    
    
    
   
    
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
    
    # multisig_wallet.transfer(sp.record(receiver = alice.address, amount = 10, tokenAddress = c1.address)).run(sender = admin.address)
    # multisig_wallet.signAndExecute(0).run(sender = alice.address)
    # multisig_wallet.recoverToken(sp.record(receiver = alice.address, amount = 10, tokenAddress = c1.address)).run(sender = admin.address)
    # multisig_wallet.mint(sp.record(receiver = alice.address, amount = 10, tokenAddress = c1.address)).run(sender = admin.address)
    # multisig_wallet.signAndExecute(2).run(sender = alice.address)
    multisig_wallet.addApprove(sp.record(spender = alice.address, amount = 10, tokenAddress = c1.address)).run(sender = alice.address)
    
    
    
    
    

    # scenario.h1("Offchain view - token_metadata")
    # # Test token_metadata view
    # offchainViewTester =FA12_TEMPLATE.TestOffchainView(c1.token_metadata)
    # scenario.register(offchainViewTester)
    # offchainViewTester.compute(data = c1.data, params = 0)
    # scenario.verify_equal(
    #     offchainViewTester.data.result,
    #     sp.some(
    #         sp.record(
    #             token_id = 0,
    #             token_info = sp.map({
    #                 "decimals"    : sp.utils.bytes_of_string("18"),
    #                 "name"        : sp.utils.bytes_of_string("My Great Token"),
    #                 "symbol"      : sp.utils.bytes_of_string("MGT"),
    #                 "icon"        : sp.utils.bytes_of_string('https://smartpy.io/static/img/logo-only.svg')
    #             })
    #         )
    #     )
    # )

    
