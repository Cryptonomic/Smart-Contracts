from cv2 import threshold
import smartpy as sp

FA12Interface = sp.io.import_script_from_url(
    "file:interfaces/FA12interface.py")




class MultiSigWallet(FA12Interface.MultiSigWalletInterface):
    
    def __init__(self,
                 signer,
    threshold = sp.int(1),
    delegateMap_ = sp.map(l = {}, 
                     tkey = sp.TKeyHash, 
                     tvalue = FA12Interface.DELEGATE_TYPE),
    thresholdMap_ = sp.map(l = {}, 
                     tkey = sp.TInt, 
                     tvalue = FA12Interface.THRESHOLD_TYPE)):
        self.init(
            operationId=sp.nat(0), # gives a different number to each operation 
            threshold=threshold, # threshold to approve transaction
            thresholdMap = thresholdMap_, # current thresholds suggestions    
            signers=sp.map(l = {signer: sp.record(isSigner = True, signatures = sp.set(l = [signer], t = sp.TAddress), notSignatures = sp.set(l = [], t = sp.TAddress))}, 
                     tkey = sp.TAddress, 
                     tvalue = FA12Interface.SIGNER_TYPE), # list of current/pending signers
            transferMap = sp.map(l = {}, tkey = sp.TNat, tvalue = FA12Interface.TRANSFER_TYPE), # map of pending transfers
            delegateMap = delegateMap_
            )
        
    
    
    @sp.entry_point
    def transfer(self, params): # new transfer proposition
        sp.set_type(params, FA12Interface.INIT_TRANSFER_TYPE)
        sp.verify(self.data.signers.contains(sp.sender), "NOT AUTHORIZED SIGNER")
        sp.verify(self.data.signers.get(sp.sender).isSigner, "NOT AUTHORIZED SIGNER")
      
        self.data.transferMap[self.data.operationId] = sp.record(type = 0,
                                                                sender = sp.sender, 
                                                                receiver = params.receiver,
                                                                amount = params.amount, 
                                                                tokenAddress = params.tokenAddress,
                                                                signatures = sp.set(l = [sp.sender], t = sp.TAddress),
                                                                notSignatures = sp.set(l = [], t = sp.TAddress))
        
        sp.if (self.data.threshold == 1):
            self.execute(self.data.operationId)
        self.data.operationId += 1
        
    @sp.entry_point
    def mint(self, params):
        sp.set_type(params, FA12Interface.INIT_TRANSFER_TYPE)
        
        sp.verify(self.data.signers.contains(sp.sender), "NOT AUTHORIZED SIGNER")
        sp.verify(self.data.signers.get(sp.sender).isSigner, "NOT AUTHORIZED SIGNER")
        
        self.data.transferMap[self.data.operationId] = sp.record(type = 1,
                                                                sender = params.tokenAddress, 
                                                                receiver = params.receiver,
                                                                amount = params.amount, 
                                                                tokenAddress = params.tokenAddress,
                                                                signatures = sp.set(l = [sp.sender], t = sp.TAddress),
                                                                notSignatures = sp.set(l = [], t = sp.TAddress))
        
        sp.if (self.data.threshold == 1):
            self.execute(self.data.operationId)
        self.data.operationId += 1
        
    @sp.entry_point
    def burn(self, params):
        sp.set_type(params, FA12Interface.INIT_TRANSFER_TYPE)
        
        sp.verify(self.data.signers.contains(sp.sender), "NOT AUTHORIZED SIGNER")
        sp.verify(self.data.signers.get(sp.sender).isSigner, "NOT AUTHORIZED SIGNER")
        
        self.data.transferMap[self.data.operationId] = sp.record(type = 3,
                                                                sender = params.receiver, 
                                                                receiver = params.tokenAddress,
                                                                amount = params.amount, 
                                                                tokenAddress = params.tokenAddress,
                                                                signatures = sp.set(l = [sp.sender], t = sp.TAddress),
                                                                notSignatures = sp.set(l = [], t = sp.TAddress))
        
        sp.if (self.data.threshold == 1):
            self.execute(self.data.operationId)
        self.data.operationId += 1
    
    @sp.entry_point
    def signTransfer(self,params): # sign current transfer proposition
        #params: id of transfer
        sp.set_type(params, sp.TNat)
        
    
        sp.verify(self.data.signers.contains(sp.sender), "NOT AUTHORIZED SIGNER")
        sp.verify(self.data.signers.get(sp.sender).isSigner, "NOT AUTHORIZED SIGNER")
        self.data.transferMap[params].notSignatures.remove(sp.sender)
        sp.verify(~(self.data.transferMap[params].signatures.contains(sp.sender)), "ALREADY SIGNED THIS TRANSACTION")
        self.data.transferMap[params].signatures.add(sp.sender)
        
    @sp.entry_point
    def signAndExecute(self, params): # sign and execute current transfer proposition if enough signatures
        #params: id of transfer
        sp.set_type(params, sp.TNat)
        
        sp.verify(self.data.signers.contains(sp.sender), "NOT AUTHORIZED SIGNER")
        sp.verify(self.data.signers.get(sp.sender).isSigner, "NOT AUTHORIZED SIGNER")
        self.data.transferMap[params].notSignatures.remove(sp.sender)
        sp.verify(~(self.data.transferMap[params].signatures.contains(sp.sender)), "ALREADY SIGNED THIS TRANSACTION")
        self.data.transferMap[params].signatures.add(sp.sender)
        
        
        nbSig = sp.to_int(sp.len(self.data.transferMap.get(params).signatures))
        sp.verify(nbSig >= self.data.threshold, "NOT ENOUGH SIGNATURES")
        self.execute(params)
        
        
        
        
    def execute(self, id): #executes a valid transfer
        sp.set_type(id, sp.TNat)
        
        sp.if (self.data.transferMap[id].type == 1):
            self.executeMint(id)
        sp.if (self.data.transferMap[id].type == 2):
            self.executeApprove(id)
        sp.if (self.data.transferMap[id].type == 3):
            self.executeBurn(id)
        sp.if (self.data.transferMap[id].type == 4):
            self.executeRecover(id)        
        sp.if (self.data.transferMap[id].type == 0):
        
            make_transfer = sp.contract(sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_ as from", ("to_ as to", "value"))), self.data.transferMap[id].tokenAddress, "transfer").open_some() 
            
            # messageType = sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat)
            # realMessage = messageType.layout(("from_ as from", ("to_ as to", "value")))
            message = sp.record(from_ = sp.self_address, to_ = self.data.transferMap[id].receiver, value = self.data.transferMap[id].amount)
            sp.set_type(message, sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_ as from", ("to_ as to", "value"))))
            
            sp.transfer(message, sp.tez(0), make_transfer)
            
        del self.data.transferMap[id]
        
    def executeMint(self, id): # type 1
        sp.set_type(id, sp.TNat)
        make_mint = sp.contract(sp.TRecord(address = sp.TAddress, value= sp.TNat), self.data.transferMap[id].tokenAddress, "mint").open_some()
        sp.transfer(sp.record(address = self.data.transferMap[id].receiver, value = self.data.transferMap[id].amount), sp.tez(0), make_mint)
    
    def executeApprove(self, id): # type 2
        sp.set_type(id, sp.TNat)
        make_mint = sp.contract(sp.TRecord(spender = sp.TAddress, value= sp.TNat), self.data.transferMap[id].tokenAddress, "approve").open_some()
        sp.transfer(sp.record(spender = self.data.transferMap[id].receiver, value = self.data.transferMap[id].amount), sp.tez(0), make_mint)
        
    def executeBurn(self, id): # type 3
        sp.set_type(id, sp.TNat)
        make_burn = sp.contract(sp.TRecord(address = sp.TAddress, value= sp.TNat), self.data.transferMap[id].tokenAddress, "burn").open_some()
        sp.transfer(sp.record(address = self.data.transferMap[id].sender, value = self.data.transferMap[id].amount), sp.tez(0), make_burn)
    
    def executeRecover(self, id):
        sp.set_type(id, sp.TNat)
        sp.send(self.data.transferMap[id].receiver, sp.utils.nat_to_tez(self.data.transferMap[id].amount))
        #sp.transfer(sp.unit, self.data.transferMap[id].amount, sp.contract(sp.TUnit, self.data.transferMap[id].receiver).open_some())
        
        
        
    @sp.entry_point
    def unsign(self, params): #unsigns a transfers proposition, and removes it in enough unsignatures
        #params: id of transfer
        sp.set_type(params, sp.TNat)
        sp.verify(self.data.signers.contains(sp.sender), "NOT AUTHORIZED SIGNER")
        sp.verify(self.data.signers.get(sp.sender).isSigner, "NOT AUTHORIZED SIGNER")
        
        sp.verify(~(self.data.transferMap[params].notSignatures.contains(sp.sender)), "ALREADY UNSIGNED THIS TRANSACTION")
        self.data.transferMap[params].notSignatures.add(sp.sender)
        self.data.transferMap[params].signatures.remove(sp.sender)
        
        #remove transaction from map is enough people have unsigned it
        nbSig = sp.to_int(sp.len(self.data.transferMap[params].notSignatures))
        sp.if (nbSig >= self.data.threshold):
            del self.data.transferMap[params]
            

    @sp.entry_point
    def addSigner(self, params): #signs to add a new signer to the contract
        sp.set_type(params, sp.TAddress)
        #params: address of new signer
        sp.verify(self.data.signers.contains(sp.sender), "NOT AUTHORIZED SIGNER")
        sp.verify(self.data.signers.get(sp.sender).isSigner, "NOT AUTHORIZED SIGNER")
        sp.if (self.data.signers.contains(params)):
            sp.verify(~(self.data.signers.get(params).signatures.contains(sp.sender)), "ALREADY SIGNED")
            self.data.signers.get(params).signatures.add(sp.sender)
            self.data.signers.get(params).notSignatures.remove(sp.sender)
            sp.if (sp.to_int(sp.len(self.data.signers.get(params).signatures)) >= self.data.threshold):
                self.data.signers.get(params).isSigner = True
                self.data.signers.get(params).notSignatures = sp.set(l = [], t = sp.TAddress)
        sp.else:
            self.data.signers[params] = sp.record(isSigner = False, 
                                                  signatures = sp.set(l = [sp.sender], 
                                                  t = sp.TAddress), notSignatures = sp.set(l = [], t = sp.TAddress))
            sp.if (self.data.threshold == 1):
                self.data.signers.get(params).isSigner = True
                
                
    @sp.entry_point
    def removeSigner(self, params): #unsigns current signer in the contract
        sp.set_type(params, sp.TAddress)
        #params: address of signer we want to remove
        sp.verify(self.data.signers.contains(sp.sender), "NOT AUTHORIZED SIGNER")
        sp.verify(self.data.signers.get(sp.sender).isSigner, "NOT AUTHORIZED SIGNER")
        sp.verify(self.data.signers.contains(params), "PROVIDED ADDRESS IS NOT SIGNER")
        sp.verify(~(self.data.signers.get(params).notSignatures.contains(sp.sender)), "ALREADY UNSIGNED")
        self.data.signers.get(params).notSignatures.add(sp.sender)
        self.data.signers.get(params).signatures.remove(sp.sender)
        sp.if (sp.to_int(sp.len(self.data.signers.get(params).notSignatures)) >= self.data.threshold):
            del self.data.signers[params]
            self.data.threshold = self.data.threshold - 1
            
    @sp.entry_point
    def updateThreshold(self, params):
        sp.set_type(params, sp.TInt)
        #params: new suggested threshold
        sp.verify(self.data.signers.contains(sp.sender), "NOT AUTHORIZED SIGNER")
        sp.verify(self.data.signers.get(sp.sender).isSigner, "NOT AUTHORIZED SIGNER")
        sp.if (self.data.thresholdMap.contains(params)):
            sp.verify(~(self.data.thresholdMap.get(params).signatures.contains(sp.sender)), "ALREADY SIGNED")
            self.data.thresholdMap.get(params).signatures.add(sp.sender)
            self.data.thresholdMap.get(params).notSignatures.remove(sp.sender)
            sp.if (sp.to_int(sp.len(self.data.thresholdMap.get(params).signatures)) >= self.data.threshold):
                self.data.threshold = params
                del self.data.thresholdMap[params]
        sp.else:
            self.data.thresholdMap[params] = sp.record(
                                                  signatures = sp.set(l = [sp.sender], 
                                                  t = sp.TAddress), notSignatures = sp.set(l = [], t = sp.TAddress))
            sp.if (self.data.threshold == 1):
                self.data.threshold = params
                del self.data.thresholdMap[params]
                
    @sp.entry_point
    def removeThresholdProp(self, params):
        sp.set_type(params, sp.TInt)
        #params: threshold we want to remove from suggestions
        sp.verify(self.data.signers.contains(sp.sender), "NOT AUTHORIZED SIGNER")
        sp.verify(self.data.signers.get(sp.sender).isSigner, "NOT AUTHORIZED SIGNER")
        sp.verify(self.data.thresholdMap.contains(params), "PROVIDED ADDRESS IS NOT SIGNER")
        sp.verify(~(self.data.thresholdMap.get(params).notSignatures.contains(sp.sender)), "ALREADY UNSIGNED")
        self.data.thresholdMap.get(params).notSignatures.add(sp.sender)
        self.data.thresholdMap.get(params).signatures.remove(sp.sender)
        sp.if (sp.to_int(sp.len(self.data.thresholdMap.get(params).notSignatures)) >= self.data.threshold):
            del self.data.thresholdMap[params]
        
    @sp.entry_point
    def recoverToken(self, params):
        sp.set_type(params, FA12Interface.INIT_TRANSFER_TYPE)
        
        sp.verify(self.data.signers.contains(sp.sender), "NOT AUTHORIZED SIGNER")
        sp.verify(self.data.signers.get(sp.sender).isSigner, "NOT AUTHORIZED SIGNER")
        
        self.data.transferMap[self.data.operationId] = sp.record(type = 4,
                                                                sender = sp.self_address, 
                                                                receiver = params.receiver,
                                                                amount = params.amount, 
                                                                tokenAddress = params.receiver,
                                                                signatures = sp.set(l = [sp.sender], t = sp.TAddress),
                                                                notSignatures = sp.set(l = [], t = sp.TAddress))
        
        
        sp.if (self.data.threshold == 1):
            self.execute(self.data.operationId)
        self.data.operationId += 1
        
    @sp.entry_point
    def addApprove(self, params):
        sp.set_type(params, FA12Interface.APPROVE_TYPE)
        
        sp.verify(self.data.signers.contains(sp.sender), "NOT AUTHORIZED SIGNER")
        sp.verify(self.data.signers.get(sp.sender).isSigner, "NOT AUTHORIZED SIGNER")
        
        self.data.transferMap[self.data.operationId] = sp.record(type = 2,
                                                                sender = params.tokenAddress, 
                                                                receiver = params.spender,
                                                                amount = params.amount, 
                                                                tokenAddress = params.tokenAddress,
                                                                signatures = sp.set(l = [sp.sender], t = sp.TAddress),
                                                                notSignatures = sp.set(l = [], t = sp.TAddress))
        
        sp.if (self.data.threshold == 1):
            self.execute(self.data.operationId)
        self.data.operationId += 1
        
        
    @sp.entry_point
    def addDelegate(self, params): #signs to add a new signer to the contract
        sp.set_type(params, sp.TKeyHash)
        #params: address of new signer
        sp.verify(self.data.signers.contains(sp.sender), "NOT AUTHORIZED SIGNER")
        sp.verify(self.data.signers.get(sp.sender).isSigner, "NOT AUTHORIZED SIGNER")
        sp.if (self.data.delegateMap.contains(params)):
            sp.verify(~(self.data.delegateMap.get(params).signatures.contains(sp.sender)), "ALREADY SIGNED")
            self.data.delegateMap.get(params).signatures.add(sp.sender)
            self.data.delegateMap.get(params).notSignatures.remove(sp.sender)
            sp.if (sp.to_int(sp.len(self.data.delegateMap.get(params).signatures)) >= self.data.threshold):
                self.data.delegateMap.get(params).isDelegate = True
                self.data.delegateMap.get(params).notSignatures = sp.set(l = [], t = sp.TAddress)
                sp.set_delegate(sp.some(params))
        sp.else:
            self.data.delegateMap[params] = sp.record(isDelegate = False, 
                                                  signatures = sp.set(l = [sp.sender], 
                                                  t = sp.TAddress), notSignatures = sp.set(l = [], t = sp.TAddress))
            sp.if (self.data.threshold == 1):
                self.data.delegateMap.get(params).isDelegate = True
                sp.set_delegate(sp.some(params))
                
                
    @sp.entry_point
    def removeDelegate(self, params): #unsigns current signer in the contract
        sp.set_type(params, sp.TKeyHash)
        #params: address of signer we want to remove
        sp.verify(self.data.signers.contains(sp.sender), "NOT AUTHORIZED SIGNER")
        sp.verify(self.data.signers.get(sp.sender).isSigner, "NOT AUTHORIZED SIGNER")
        sp.verify(self.data.delegateMap.contains(params), "PROVIDED ADDRESS IS NOT DELEGATE")
        sp.verify(~(self.data.delegateMap.get(params).notSignatures.contains(sp.sender)), "ALREADY UNSIGNED")
        self.data.delegateMap.get(params).notSignatures.add(sp.sender)
        self.data.delegateMap.get(params).signatures.remove(sp.sender)
        sp.if (sp.to_int(sp.len(self.data.delegateMap.get(params).notSignatures)) >= self.data.threshold):
            del self.data.delegateMap[params]
            sp.set_delegate(sp.none)
        

        
        
        
###############################################################################################################################################
#TESTS


