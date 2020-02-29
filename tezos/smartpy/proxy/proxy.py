import smartpy as sp

class Proxy(sp.Contract):
    def __init__(self, addr, owner):
        self.init(
            contract = addr,
            owner = owner)

    # @param newAddr The address of the updated contract
    @sp.entry_point
    def setAddr(self, params):
        sp.verify(sp.sender == self.data.owner, message = "Invalid permissions")
        self.data.contract = params.newAddr

@sp.add_test("")
def test():
    # init test and create html output
    scenario = sp.test_scenario()
    scenario.h1("SmartPy Proxy Contract")

    # init test values
    owner = sp.address("tz1-owner")
    notOwner = sp.address("tz1-notOwner")
    oldContract = sp.address("KT1-old")
    newContract = sp.address("KT1-new")

    # init contract
    proxy = Proxy(oldContract, owner)
    scenario += proxy
    # sanity check
    scenario.verify(proxy.data.contract == oldContract)

    # test entrypoints
    scenario.h2("[ENTRYPOINT] setAddr")
    scenario.h3("[SUCCESS-setAddr]")
    scenario += proxy.setAddr(newAddr = newContract).run(sender = owner)
    scenario.verify(proxy.data.contract == newContract)

    scenario.h3("[FAILED-setAddr] Invalid permissions")
    scenario += proxy.setAddr(newAddr = oldContract).run(
        sender = notOwner, 
        valid = False)

