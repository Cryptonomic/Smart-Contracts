import smartpy as sp

class NameRegistry(sp.Contract):
    def __init__(self):
        self.init(addressToName = sp.Map())

    @sp.entryPoint
    def register(self, params):
        sp.setType(params.name, str)
        self.data.addressToName[sp.sender] = params.name