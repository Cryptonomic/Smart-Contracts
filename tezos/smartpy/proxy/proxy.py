import smartpy as sp

class Proxy(sp.Contract):
    def __init__(self, addr, owner):
        self.init(
            contract = sp.address(addr),
            owner = sp.address(owner))

    # @param newAddr The address of the updated contract
    @sp.entry_point
    def setAddr(self, params):
        sp.verify(sp.sender == self.data.owner)
        self.data.contract = params.newAddr

@sp.add_test("")
def test():
    pass
