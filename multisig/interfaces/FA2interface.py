import smartpy as sp

SIGNATURES_TYPE = sp.TMap(sp.TKeyHash, sp.TSignature)

TRANSFER_TYPE = sp.TRecord(sender = sp.TAddress, receiver = sp.TAddress, amount = sp.TNat, tokenId = sp.TNat, tokenAddress = sp.TAddress, signatures = sp.TSet(sp.TAddress), notSignatures = sp.TSet(sp.TAddress))
INIT_TRANSFER_TYPE = sp.TRecord(receiver = sp.TAddress, amount = sp.TNat, tokenId = sp.TNat, tokenAddress = sp.TAddress)

SIGNER_TYPE = sp.TRecord(isSigner = sp.TBool, signatures = sp.TSet(sp.TAddress), notSignatures = sp.TSet(sp.TAddress))
THRESHOLD_TYPE = sp.TRecord(signatures = sp.TSet(sp.TAddress), notSignatures = sp.TSet(sp.TAddress))




class MultiSigWalletInterface(sp.Contract):
    
    @sp.entry_point # initiate a tranfer proposition
    def transfer(self, params):
        pass
    
    @sp.entry_point # sign a tranfer/mint proposition
    def signTransfer(self, params):
        pass
    
    @sp.entry_point # sign and try to execute a transfer/mint proposition
    def signAndExecute(self, params):
        pass
    
    @sp.entry_point # unsign a tranfer/mint proposition
    def unsign(self, params):
        pass
    
    @sp.entry_point # to add/sign threshold proposition
    def addSigner(self, params):
        pass
        
    @sp.entry_point #to remove signer proposition
    def removeSigner(self, params):
        pass
    
    @sp.entry_point #initiate mint proposition
    def mint(self, params):
        pass
    
    @sp.entry_point # to add/sign threshold proposition
    def updateThreshold(self, params):
        pass
    
    @sp.entry_point #unsign and try to remove a threshold proposition
    def removeThresholdProp(self, params):
        pass
    
    @sp.entry_point #do a recovery token proposition
    def recoverToken(self, params):
        pass
    