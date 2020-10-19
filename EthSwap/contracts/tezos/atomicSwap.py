import smartpy as sp


class State():
    Waiting = 0
    Initiated = 1


Swap = sp.TRecord(hashedSecret=sp.TBytes, initiator_eth=sp.TString, initiator=sp.TAddress,
                  participant=sp.TAddress, refundTimestamp=sp.TTimestamp, value=sp.TMutez, state=sp.TInt)


class AtomicSwap(sp.Contract):
    def __init__(self, _admin):
        self.init(admin=_admin, active=sp.bool(False),
                  swaps=sp.big_map(tkey=sp.TBytes, tvalue=Swap))

    def onlyByAdmin(self):
        sp.verify(sp.sender == self.data.admin)

    def onlyByInitiator(self, _hashedSecret):
        sp.verify(sp.sender == self.data.swaps[_hashedSecret].initiator)

    def contractIsActive(self):
        sp.verify(self.data.active == sp.bool(True))

    def isInitiatable(self, _hashedSecret, _participant, _refundTimestamp):
        sp.verify(~self.data.swaps.contains(_hashedSecret))
        sp.verify(sp.now < _refundTimestamp)

    def checkState(self, _hashedSecret, _state):
        sp.verify(self.data.swaps[_hashedSecret].state == _state)

    def isRedeemable(self, _hashedSecret, _secret):
        sp.verify(self.data.swaps[_hashedSecret].refundTimestamp > sp.now)
        sp.verify(self.data.swaps[_hashedSecret].hashedSecret == sp.sha256(
            sp.sha256(_secret)))

    def isRefundable(self, _hashedSecret):
        sp.verify((self.data.swaps[_hashedSecret].state == State.Initiated) | (
            self.data.swaps[_hashedSecret].state == State.Waiting))
        sp.verify(self.data.swaps[_hashedSecret].refundTimestamp <= sp.now)

    @sp.entry_point
    def toggleContractState(self, params):
        self.onlyByAdmin()
        self.data.active = params._active

    @sp.entry_point
    def initiateWait(self, params):
        self.contractIsActive()
        self.isInitiatable(params._hashedSecret,
                           params._participant, params._refundTimestamp)
        self.data.swaps[params._hashedSecret] = sp.record(hashedSecret=params._hashedSecret, initiator_eth=params.initiator_eth, initiator=sp.sender,
                                                          participant=sp.sender, refundTimestamp=params._refundTimestamp, value=sp.amount, state=State.Waiting)

    @sp.entry_point
    def addCounterParty(self, params):
        self.contractIsActive()
        self.checkState(params._hashedSecret, State.Waiting)
        self.onlyByInitiator(params._hashedSecret)
        self.data.swaps[params._hashedSecret].state = State.Initiated
        self.data.swaps[params._hashedSecret].participant = params._participant

    @sp.entry_point
    def redeem(self, params):
        self.checkState(params._hashedSecret, State.Initiated)
        self.isRedeemable(params._hashedSecret, params._secret)
        sp.send(self.data.swaps[params._hashedSecret].participant,
                self.data.swaps[params._hashedSecret].value)
        del self.data.swaps[params._hashedSecret]

    @sp.entry_point
    def refund(self, params):
        self.isRefundable(params._hashedSecret)
        sp.send(self.data.swaps[params._hashedSecret].initiator,
                self.data.swaps[params._hashedSecret].value)
        del self.data.swaps[params._hashedSecret]

    @sp.entry_point
    def setDelegate(self, params):
        self.onlyByAdmin()
        pass

    @sp.entry_point
    def withdraw(self, params):
        self.onlyByAdmin()
        pass


@sp.add_test(name="AtomicSwap")
def test():
    alice = sp.test_account("Alice")
    bob = sp.test_account("Bob")
    init_eth = "0x91f79893E7B923410Ef1aEba6a67c6fab0sfsdgffd"
    hashSecret = sp.sha256(sp.sha256(sp.bytes(
        "0x68656c6c6f666473667364666c64736a666c73646a6664736a6673646a6b666a")))

    c1 = AtomicSwap(_admin=bob.address)
    scenario = sp.test_scenario()
    scenario.table_of_contents()
    scenario.h1("Atomic Swap")
    scenario += c1

    scenario.h2("Swap[Wait] Testing")

    # no operations work without contract being active
    scenario += c1.initiateWait(_hashedSecret=hashSecret, initiator_eth=init_eth, _refundTimestamp=sp.timestamp(
        159682500)).run(sender=alice, amount=sp.tez(2), now=159682400, valid=False)

    # activate only by admin
    scenario += c1.toggleContractState(
        _active=True).run(sender=alice, valid=False)
    scenario += c1.toggleContractState(_active=True).run(sender=bob)

    # initiate new swap
    scenario += c1.initiateWait(_hashedSecret=hashSecret, initiator_eth=init_eth, _refundTimestamp=sp.timestamp(
        159682500)).run(sender=alice, amount=sp.tez(2), now=159682400)

    # balance check
    scenario.verify(c1.balance == sp.tez(2))

    # cannot redeem before it is activated & initiated
    scenario += c1.redeem(_hashedSecret=hashSecret, _secret=sp.bytes(
        "0x68656c6c6f666473667364666c64736a666c73646a6664736a6673646a6b666a")).run(sender=bob, now=159682450, valid=False)

    # succesful add participant only by initiator
    scenario += c1.addCounterParty(_hashedSecret=hashSecret,
                                   _participant=bob.address).run(sender=bob, valid=False)

    # succesful add participant only by initiator
    scenario += c1.addCounterParty(_hashedSecret=hashSecret,
                                   _participant=bob.address).run(sender=alice)

    # cannot be redeemed with wrong secret
    scenario += c1.redeem(_hashedSecret=hashSecret, _secret=sp.bytes(
        "0x12345678aa")).run(sender=bob, now=159682450, valid=False)

    # cannot be redeemed after refundtime has come
    scenario += c1.redeem(_hashedSecret=hashSecret, _secret=sp.bytes(
        "0x68656c6c6f666473667364666c64736a666c73646a6664736a6673646a6b666a")).run(sender=bob, now=159682550, valid=False)

    # new swap with the same hash cannot be added unless the previous one is redeemed/refunded
    scenario += c1.initiateWait(_hashedSecret=hashSecret, initiator_eth=init_eth, _refundTimestamp=sp.timestamp(
        159682500)).run(sender=alice, amount=sp.tez(2), now=159682400, valid=False)

    # succesful redeem can be initiated by anyone but funds transfered to participant
    scenario += c1.redeem(_hashedSecret=hashSecret,
                          _secret=sp.bytes("0x68656c6c6f666473667364666c64736a666c73646a6664736a6673646a6b666a")).run(sender=bob, now=159682450)

    # balance check
    scenario.verify(c1.balance == sp.tez(0))

    # succesful swap creation with same hash after redeem
    scenario += c1.initiateWait(_hashedSecret=hashSecret, initiator_eth=init_eth, _refundTimestamp=sp.timestamp(
        159682500)).run(sender=alice, amount=sp.tez(2), now=159682400)

    # balance check
    scenario.verify(c1.balance == sp.tez(2))

    # cannot be refunded before the refundtime
    scenario += c1.refund(_hashedSecret=hashSecret).run(sender=bob,
                                                        now=159682450, valid=False)
    scenario += c1.refund(_hashedSecret=hashSecret).run(sender=alice,
                                                        now=159682450, valid=False)

    # can be refunded in any initated or waiting state if refund time has come, can be done by anyone but funds transfered only to initiator
    scenario += c1.refund(_hashedSecret=hashSecret).run(sender=bob,
                                                        now=159682550)

    # cannot be refunded again once it has been refunded
    scenario += c1.refund(_hashedSecret=hashSecret).run(sender=alice,
                                                        now=159682550, valid=False)

    # balance check
    scenario.verify(c1.balance == sp.tez(0))
