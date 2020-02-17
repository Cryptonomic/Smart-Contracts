# Reference implementation of the Trustless Staking Token for Tezos
# Written using SmartPy (https://smartpy.io/demo)
# Mike Radin, with input from Itamar Reif & the SmartPy team
# 2020, February

import smartpy as sp

class Instrument(sp.Contract):
    def __init__(self, schedule, duration, interval, periods, payer, issuer, start):
        self.init(
            schedule = schedule,
            duration = duration,
            interval = interval,
            periods = periods,
            payer = payer,
            issuer = issuer,
            start = start,
            freeCollateral = sp.mutez(0),
            balances = sp.big_map(
                tkey = sp.TAddress,
                tvalue = sp.TRecord(
                    balance = sp.TMutez,
                    approvals = sp.TMap(k = sp.TAddress, v = sp.TMutez)
                )
            )
        )

    @sp.entry_point
    def default(self, params):
        self.data.freeCollateral += sp.amount

    @sp.entry_point
    def deposit(self, params):
        sp.verify(sp.sender != self.data.issuer, message = "Invalid address")
        period = self.getPeriod()
        expectedReturn = sp.split_tokens(sp.split_tokens(sp.amount, 1, self.data.schedule[period]), 1_000_000, 1) - sp.amount
        sp.verify(expectedReturn <= self.data.freeCollateral, message = "Insufficient collateral")

        self.data.freeCollateral -= expectedReturn

        tokenBalance = sp.amount + expectedReturn # TODO: should be nat, not mutez
        sp.if ~ self.data.balances.contains(sp.sender):
            self.data.balances[sp.sender] = sp.record(balance = tokenBalance, approvals = {})
        sp.else:
            self.data.balances[sp.sender].balance += tokenBalance

    @sp.entry_point
    def redeem(self, params):
        sp.verify(self.data.balances.contains(sp.sender), message = "Address has no balance")
        sp.verify(self.data.balances[sp.sender].balance >= params.tokenAmount, message = "Insufficient token balance")

        period = self.getPeriod() # TODO: needs a concept of minimum holding period

        xtzBalance = sp.split_tokens(sp.split_tokens(params.tokenAmount, self.data.schedule[period], 1), 1, 1_000_000)
        releasedCollateral = params.tokenAmount - xtzBalance

        self.data.freeCollateral += releasedCollateral

        self.data.balances[sp.sender].balance -= params.tokenAmount
        sp.send(sp.sender, xtzBalance)

    @sp.entry_point
    def send(self, params):
        sp.verify(self.data.balances.contains(sp.sender), message = "Address has no balance")
        sp.verify(sp.sender != params.destination, message = "Invalid destination")
        sp.verify(self.data.balances[sp.sender].balance >= params.tokenBalance, "Insufficient token balance")

        sp.if ~ self.data.balances.contains(params.destination):
            self.data.balances[params.destination] = sp.record(balance = params.tokenBalance, approvals = {})
        sp.else:
            self.data.balances[params.destination].balance += params.tokenBalance

        self.data.balances[sp.sender].balance -= params.tokenBalance

    @sp.entry_point
    def approve(self, params):
        sp.verify(self.data.balances.contains(sp.sender), message = "Address has no balance")
        sp.verify(sp.sender != params.destination, message = "Invalid destination")
        sp.verify(self.data.balances[sp.sender].balance >= params.tokenBalance, message = "Insufficient token balance")

        sp.if ~ self.data.balances[sp.sender].approvals.contains(params.destination):
            self.data.balances[sp.sender].approvals[params.destination] = params.tokenBalance
        sp.else:
            self.data.balances[sp.sender].approvals[params.destination] += params.tokenBalance

    @sp.entry_point
    def transfer(self, params):
        sp.verify(sp.sender == params.destination , message = "Invalid source")
        sp.verify(self.data.balances.contains(params.source), message = "Address has no balance")
        sp.verify(params.source != params.destination, message = "Invalid destination")
        sp.verify(self.data.balances[params.source].approvals[params.destination] >= params.tokenBalance, message = "Insufficient token balance")

        sp.if ~ self.data.balances.contains(params.destination):
            self.data.balances[params.destination] = sp.record(balance = params.tokenBalance, approvals = {})
        sp.else:
            self.data.balances[params.destination].balance += params.tokenBalance

        self.data.balances[params.source].balance -= params.tokenBalance
        self.data.balances[params.source].approvals[params.destination] -= params.tokenBalance

    @sp.entry_point
    def setDelegate(self, params):
        sp.verify(sp.sender == self.data.issuer, message = "Privileged operation")

        sp.set_delegate(params.baker)

    @sp.entry_point
    def withdrawCollateral(self, params):
        sp.verify(sp.sender == self.data.issuer, message = "Privileged operation")
        sp.verify(params.amount <= self.data.freeCollateral, message = "Insufficient free collateral")

        self.data.freeCollateral -= params.amount
        sp.send(sp.sender, params.amount)

    def getPeriod(self):
        y = sp.local('y', self.data.periods)
        sp.if sp.now > self.data.start.add_seconds(sp.to_int(self.data.duration)):
            y.value = self.data.periods
        sp.else:
            ttm = sp.as_nat(self.data.duration - sp.as_nat(sp.now - self.data.start))
            y.value = (sp.as_nat(self.data.periods) - (ttm / self.data.interval))
        return y.value

@sp.add_test("Instrument")
def test():
    scenario = sp.test_scenario()
    scenario.h1("Trustless Staking Token Tests")

    schedule = { 0: 952380, 1 : 957557, 2 : 962763, 3 : 967996, 4 : 973258, 5 : 978548, 6 : 983868, 7 : 989216, 8 : 994593, 9 : 1000000 }
    duration = 60*60*24*10
    interval = 60*60*24
    periods = 10
    payer = sp.test_account("Payer")
    issuer = sp.test_account("Issuer")
    start = sp.timestamp(0)

    instrument = Instrument(schedule, duration, interval, periods, sp.some(payer.public_key_hash), issuer.address, start)
    scenario.register(instrument)

    alice = sp.test_account("Alice")
    bob = sp.test_account("Robert")
    cindy = sp.test_account("Cindy")
    david = sp.test_account("David")

    scenario.h4("Period 0")
    time = 60*60*24*0 + 1
    scenario.p("Alice fails to deposit 1000xtz")
    scenario.p("Issuer increases collateral by 1000xtz")
    scenario.p("Robert fails to deposit 40,000 xtz")
    scenario.p("Robert deposits 2,000xtz for a token balance of 1100")

    scenario += instrument.deposit().run(sender = alice, amount = sp.tez(1000), now = time, valid = False)
    scenario += instrument.default().run(sender = issuer, amount = sp.tez(1000), now = time)
    scenario += instrument.deposit().run(sender = bob, amount = sp.tez(40000), now = time, valid = False)
    scenario += instrument.deposit().run(sender = bob, amount = sp.tez(2000), now = time)

    scenario.h4("Period 1")
    time = 60*60*24*1 + 1
    scenario.p("Cindy fails to redeem 100 tokens")

    scenario += instrument.redeem(tokenAmount = sp.tez(100)).run(sender = cindy, now = time, valid = False)

    scenario.h4("Period 2")
    time = 60*60*24*2 + 1
    scenario.p("Robert approves an allowance of 500 tokens for David")
    scenario.p("Robert deposits 1000xtz for a token balance of xxx")

    scenario += instrument.approve(destination = david.address, tokenBalance = sp.tez(500)).run(sender = bob, now = time)
    scenario += instrument.deposit().run(sender = bob, amount = sp.tez(1000), now = time)

    scenario.h4("Period 3")
    time = 60*60*24*3 + 1
    scenario.p("David pulls 400 tokens from Robert's allowance")
    scenario.p("Robert redeems 1050 tokens for xxx xtz")

    scenario += instrument.transfer(destination = david.address, source = bob.address, tokenBalance = sp.tez(400)).run(sender = david, now = time)
    scenario += instrument.redeem(tokenAmount = sp.tez(1050)).run(sender = bob, now = time)

    scenario.h4("Period 4")
    time = 60*60*24*4 + 1
    scenario.p("Issuer changes the delegate")

    scenario += instrument.setDelegate(baker = sp.some(david.public_key_hash)).run(sender = issuer, now = time)

    #scenario += instrument.redeem(tokenAmount = sp.tez(1050)).run(sender = bob, now = 60*60*24*8 + 1)
    #scenario += instrument.send(destination = cindy.address, tokenBalance = sp.mutez(1_000_000_000)).run(sender = bob, now = 60*60*24*3)
    #scenario += instrument.redeem(tokenAmount = sp.tez(1000)).run(sender = cindy, now = 60*60*24*8 + 1)
    #scenario += instrument.default().run(sender = payer, amount = sp.mutez(500_000_000))
    #scenario += instrument.setDelegate(baker = sp.some(david.public_key_hash)).run(sender = issuer)
    #scenario += instrument.withdrawCollateral(amount = sp.mutez(1_450_000_000)).run(sender = issuer, now = 60*60*24*8 + 1, valid = False)

    scenario.h4("Period 11")
    time = 60*60*24*11 + 1
    scenario.p("Cindy fails to withdraw collateral")
    scenario.p("Issuer withdraws the free collateral")

    scenario += instrument.withdrawCollateral(amount = sp.tez(1)).run(sender = cindy, valid = False)
    scenario += instrument.withdrawCollateral(amount = sp.tez(907)).run(sender = issuer)

    #scenario.simulation(instrument)
