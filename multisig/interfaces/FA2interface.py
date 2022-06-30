import smartpy as sp

SIGNATURES_TYPE = sp.TMap(sp.TKeyHash, sp.TSignature)

TRANFER_TYPE = sp.TRecord(sender = sp.TAddress, receiver = sp.TAddress, amount = sp.TNat, tokenId = sp.TNat, tokenAddress = sp.TAddress, signatures = sp.TSet(sp.TKey), notSignatures = sp.TSet(sp.TKey))
INIT_TRANSFER_TYPE = sp.TRecord(receiver = sp.TAddress, amount = sp.TNat, tokenId = sp.TNat, tokenAddress = sp.TAddress)

SIGNER_TYPE = sp.TRecord(isSigner = sp.TBool, signatures = sp.TSet(sp.TKey), notSignatures = sp.TSet(sp.TKey))
THRESHOLD_TYPE = sp.TRecord(signatures = sp.TSet(sp.TKey), notSignatures = sp.TSet(sp.TKey))




class MultiSigWalletInterface(sp.Contract):
    
    @sp.entry_point
    def transfer(self, params):
        pass
    
    @sp.entry_point
    def signTransfer(self, params):
        pass
    
    @sp.entry_point
    def signAndExecute(self, params):
        pass
    
    @sp.entry_point
    def unsign(self, params):
        pass
    
    @sp.entry_point # to add/sign threshold proposition
    def addSigner(self, params):
        pass
        
    @sp.entry_point #to remove signer proposition
    def removeSigner(self, params):
        pass
    
    @sp.entry_point #not implemented yet
    def mint(self, params):
        pass
    
    @sp.entry_point # to add/sign threshold proposition
    def updateThreshold(self, params):
        pass
    
    @sp.entry_point
    def removeThresholdProp(self, params):
        pass
    
    @sp.entry_point
    def recoverToken(self, params):
        pass
    