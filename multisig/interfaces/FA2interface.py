import smartpy as sp

SIGNATURES_TYPE = sp.TMap(sp.TKeyHash, sp.TSignature)

TRANSFER_TYPE = sp.TRecord(type = sp.TNat, sender = sp.TAddress, receiver = sp.TAddress, amount = sp.TNat, tokenId = sp.TNat, tokenAddress = sp.TAddress, signatures = sp.TSet(sp.TAddress), notSignatures = sp.TSet(sp.TAddress))
#Types: 0 transfer, 1 mint, 2 approve, 3 burn, 4 recover

INIT_TRANSFER_TYPE = sp.TRecord(receiver = sp.TAddress, amount = sp.TNat, tokenId = sp.TNat, tokenAddress = sp.TAddress)

SIGNER_TYPE = sp.TRecord(isSigner = sp.TBool, signatures = sp.TSet(sp.TAddress), notSignatures = sp.TSet(sp.TAddress))
THRESHOLD_TYPE = sp.TRecord(signatures = sp.TSet(sp.TAddress), notSignatures = sp.TSet(sp.TAddress))

DELEGATE_TYPE = sp.TRecord(isDelegate = sp.TBool, signatures = sp.TSet(sp.TAddress), notSignatures = sp.TSet(sp.TAddress))




class MultiSigWalletInterface(sp.Contract):
    
    @sp.entry_point # initiate a tranfer proposition
    def transfer(self, params):
        sp.set_type(params, INIT_TRANSFER_TYPE)
        pass
    
    @sp.entry_point # sign a tranfer/mint proposition
    def signTransfer(self, params):
        sp.set_type(params, sp.TNat)
        pass
    
    @sp.entry_point # sign and try to execute a transfer/mint proposition
    def signAndExecute(self, params):
        sp.set_type(params, sp.TNat)
        pass
    
    @sp.entry_point # unsign a tranfer/mint proposition
    def unsign(self, params):
        sp.set_type(params, sp.TNat)
        pass
    
    @sp.entry_point # to add/sign threshold proposition
    def addSigner(self, params):
        sp.set_type(params, sp.TAddress)
        pass
        
    @sp.entry_point #to remove signer proposition
    def removeSigner(self, params):
        sp.set_type(params, sp.TAddress)
        pass
    
    @sp.entry_point #initiate mint proposition
    def mint(self, params):
        sp.set_type(params, INIT_TRANSFER_TYPE)
        pass
    
    @sp.entry_point # to add/sign threshold proposition
    def updateThreshold(self, params):
        sp.set_type(params, sp.TInt)
        pass
    
    @sp.entry_point #unsign and try to remove a threshold proposition
    def removeThresholdProp(self, params):
        sp.set_type(params, sp.TInt)
        pass
    
    @sp.entry_point #do a recovery token proposition
    def recoverToken(self, params):
        sp.set_type(params, INIT_TRANSFER_TYPE)
        pass
    
    @sp.entry_point # to add/sign delegate proposition
    def addDelegate(self, params):
        sp.set_type(params, sp.TKeyHash)
        pass
        
    @sp.entry_point #to remove delegate proposition
    def removeDelegate(self, params):
        sp.set_type(params, sp.TKeyHash)
        pass