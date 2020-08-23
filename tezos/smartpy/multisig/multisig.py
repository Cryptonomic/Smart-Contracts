import smartpy as sp

## Need to add config data struct and funcs here


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
        # need to establish layout
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
        # use (dest, amount, nonce) but need to change to just (lambda, nonce)
        # need to establish layout
        return sp.TRec(
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
        # need to establish layout
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
        # how to thread config to types?
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
        # init entrypoints
        # layout
        # types: here or in entrypoint?


    # how to assert type? maybe use a decorator
    # @param    Payload.get_type()  payload The payload for the new session
    # @param    Group.get_type()    group   The group for the new session
    #
    # Create new multisig session. Sender must be a group member.
    @sp.entrypoint
    def setup(self, payload, group):
        payloadHash = sp.local('payloadHash', makePayloadHash(payload))
        # check if session exists
        self.validateFreeSession(payloadHash.value)
        # validate paramaters
        self.validateGroup(group)
        self.validatePayload(payload)
        self.validateSigner(self.signer.make(sp.sender), group)
        # add session
        self.data.sessions[payloadHash.value] = self.data.sessions.make(payload, group)


    # how to assert type? maybe use a decorator
    # @param    sp.TBytes   payloadHash The session to execute
    #
    # Provide a signature for a pending session. Sender must be a group member.
    @sp.entrypoint
    def sign(self, payloadHash, signature):
        # check if session exists
        self.validateExistingSession(payloadHash)
        # check if owner is part of group
        signer = self.signers.make(sp.sender)
        self.validateSigner(signer)
        # add signature
        self.data.sessions[payloadHash].group.signers[signer] = signature


    # how to assert type? maybe use a decorator
    # @param    sp.TBytes   payloadHash The session to execute
    #
    # Executes a session and removes it. Sender must be a group member.
    @sp.entrypoint
    def execute(self, payloadHash):
        # check if session exists
        self.validateExistingSession(payloadHash)
        # check if owner is part of group
        self.validateSigner(self.signer.make(sp.sender), self.data.sessions[payloadHash].group)
        # check group consensus
        self.validateExecution(payloadHash)
        # execute
        self.executeTransaction(payloadHash)
        # delete session
        del self.data.sessions[payloadHash]


    def executeTransaction(self, payloadHash):
        # simple send, then change to executing lambda
        pass


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


    def validateExecution(self, payloadHash):
        # validate signatures
        pass


def makePayloadHash(payload):
    return sp.blake2b(sp.pack(payload))

## Need to add test env class

## Tests
@sp.add_test(name = "setup_Success")
def setup_Success():
    pass

