import smartpy as sp

## Helper classes for types
class Signer:
    def __init__(self, config):
        self.config = config


    def get_type(self):
        return sp.TAddress


    def make(self, addr):
        r = sp.address(addr)
        return sp.set_type_expr(r, self.get_type())


class Group:
    def __init__(self, config):
        self.config = config


    def get_type(self):
        return sp.TRecord(
                threshold = sp.TNat,
                okWeight = sp.TNat,
                signers = sp.TMap(
                    key = self.config.signer.get_type(),
                    value = sp.TRecord(
                        weight = sp.TNat,
                        signature = sp.TSignature)), #,
                        #ok = sp.TBool)),
                executed = sp.TBool)


    def make(self, threshold, signerList):
        r = sp.record(
                threshold = threshold,
                okWeight = 0,
                signers = sp.map(), # how to init this?
                executed = False)
        return sp.set_type_expr(r, self.get_type())


class Payload:
    def __init__(self, config):
        self.config = config


    def get_type(self):
        # | Amount (To, Amount) :: (sp.address, sp.mutez)
        # | Lambda (Parameter, Result) :: sp.TLambda(tin, tout)
        # for now just use tuple
        return sp.TRecord(
                destination = sp.TAddress,
                amount = sp.TMutez,
                nonce = sp.TBytes)


    def make(self, destination, amount, nonce):
        r = sp.record(
                destination = destinatiodestination,
                amount = amount,
                nonce = nonce)
        return sp.set_type_expr(r, self.get_type())


class Session:
    def __init__(self, config):
        self.config = config


    def get_type(self):
        return sp.TRecord(
                payload = self.config.payload.get_type(),
                group = self.config.group.get_type())


    def make(self, payload, group):
        r = sp.record(
                payload = payload,
                group = group)
        return sp.set_type_expr(r, self.get_type())


## Contract implementation
class Multisig(sp.Contract):
    def __init__(self, config):
        # metaprogramming utils
        self.config = config
        self.signer = Signer(config)
        self.group = Group(config)
        self.payload = Payload(config)
        self.session = Session(config)
        # init storage
        self.init_type(sp.TRecord(
                sessions = sp.TBigMap(
                    key = sp.TBytes,
                    value = self.session.get_type())))


    @sp.entrypoint
    def setup(self, payload, group):
        payloadHash = sp.local('payloadHash', makePayloadHash(payload))
        self.validateFreeSession(payloadHash.value)
        self.validateGroup(group)
        self.validatePayload(payload)
        self.validateSigner(self.signer.make(sp.sender), group)
        # add session
        self.data.sessions[payloadHash.value] = self.data.sessions.make(payload, group)


    @sp.entrypoint
    def sign(self, payload, signature):
        payloadHash = sp.local('payloadHash', makePayloadHash(payload))
        # check if session exists
        self.validateExistingSession(payloadHash.value)
        # check if owner is part of group
        signer = self.signers.make(sp.sender)
        self.validateSigner(signer)
        # add signature
        self.data.sessions[payloadHash.value].group.signers[signer] = signature


    @sp.entrypoint
    def execute(self, payloadHash):
        # check if session exists
        self.validateExistingSession(payloadHash)
        # check if owner is part of group
        self.validateSigner(self.signer.make(sp.sender), self.data.sessions[payloadHash].group)
        # check group consensus
        self.validateExecution(payloadHash)
        # execute
        
        # delete session
        del self.data.sessions[payloadHash]


    def validateFreeSession(self, payloadHash):
        sp.verify(~self.data.sesions.contains(payloadHash), "Session already exists")


    def validateExistingSession(self, payloadHash):
        sp.verify(self.data.sesions.contains(payloadHash), "Session does not exist")


    def validateSigner(self, signer, group):
        sp.verify(group.signers.contains(signer), "Signer not in group")


    def validateGroup(self, group):
        # valid threshold
        sp.verify(group.threshold >= 1, "Threshold must be nonzero")
        # valid signers and weight
        weightCount = sp.local("weightCount", sp.nat(0))
        sp.for signer in group.signers.items():
            sp.verify(signer.key != sp.address(0), "Signer address cannot be null")
            sp.verify(signer.key != sp.self, "Signer address cannot be this contract")
            sp.verify(signer.value.ok == False, "Cannot initialize with presigned signatures")
            weightCount.value += signer.value.weight)
        sp.verify(weightCount <= group.threshold, "Threshold unreachable with specified weights")


    def validatePayload(self, payload, payment):
        # valid destination
        sp.verify(payload.destination != sp.address(0), "Invalid payload destination")
        # valid amount
        sp.verify(payload.amount > sp.mutez(0), "Invalid payment amount")
        sp.verify(payload.amount <= payment, "Insufficient funds")


def makePayloadHash(payload):
    return sp.blake2b(sp.pack(payload))


@sp.add_test(name = "setup_Success")
def setup_Success():
    pass
