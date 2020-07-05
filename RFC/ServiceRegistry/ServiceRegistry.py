import smartpy as sp

class ServiceRegistry(sp.Contract):
    def __init__(self, admin):
        self.init(
            registry = sp.big_map(tkey = sp.TAddress,
                                  tvalue = sp.TRecord(service = sp.TNat,
                                                      expiration = sp.TTimestamp,
                                                      recovery = sp.TOption(sp.TAddress))),
            admin = admin,
            isActive = False,
            serviceMap = sp.map(tkey = sp.TNat,
                                tvalue = sp.TRecord(name = sp.TString,
                                                    fee = sp.TMutez,
                                                    interval = sp.TNat,
                                                    maxDuration = sp.TNat))
        )

    @sp.entry_point
    def subscribe(self, params):
        sp.set_type(params.subscriber, sp.TOption(sp.TAddress))
        sp.set_type(params.recovery, sp.TOption(sp.TAddress))

        sp.verify(self.data.isActive, message = "Registry is not active")
        sp.verify(self.data.serviceMap.contains(params.service), message = "Invalid service")

        sp.verify(sp.amount >= self.data.serviceMap[params.service].fee, message = "Payment fee too low")

        subscriber = sp.local('subscriber', sp.sender)
        sp.if (params.subscriber.is_some()):
            subscriber.value = params.subscriber.open_some()

        periods = sp.ediv(sp.amount, self.data.serviceMap[params.service].fee)
        sp.if (periods.is_some()):
            sp.verify(sp.fst(periods.open_some()) <= self.data.serviceMap[params.service].maxDuration, message = "Invalid total duration")
            expiration = sp.to_int(sp.fst(periods.open_some()) * self.data.serviceMap[params.service].interval)
            self.data.registry[subscriber.value] = sp.record(service = params.service,
                                                             expiration = sp.now.add_days(expiration),
                                                             recovery = params.recovery)

    @sp.entry_point
    def assumeSubscription(self, params):
        sp.verify(self.data.isActive, message = "Registry is not active")
        sp.verify(self.data.registry.contains(params.subscriber), message = "Subscriber not found")
        sp.verify(sp.sender != params.subscriber, message = "Invalid recovery")

        recovery = sp.local('recovery', params.subscriber)
        sp.if (self.data.registry[params.subscriber].recovery.is_some()):
            recovery.value = self.data.registry[params.subscriber].recovery.open_some()
        sp.else:
            sp.failwith("Recovery impossible")

        sp.verify(sp.sender == recovery.value, message = "Recovery failed")

        self.data.registry[recovery.value] = sp.record(service = self.data.registry[params.subscriber].service,
                                                       expiration = self.data.registry[params.subscriber].expiration,
                                                       recovery = params.recovery)
        del self.data.registry[params.subscriber]

    @sp.entry_point
    def withdraw(self, params):
        sp.verify(sp.sender == self.data.admin, message = "Privileged operation")
        sp.send(sp.sender, sp.balance)

    @sp.entry_point
    def configure(self, params):
        sp.verify(sp.sender == self.data.admin, message = "Privileged operation")
        self.data.isActive = params.isActive
        self.data.serviceMap = params.serviceMap

    @sp.entry_point
    def setManager(self, params):
        sp.verify(sp.sender == self.data.admin, message = "Privileged operation")
        self.data.admin = params.admin

    @sp.entry_point
    def setDelegate(self, params):
        sp.verify(sp.sender == self.data.admin, message = "Privileged operation")
        sp.set_delegate(params.delegate)
        
    @sp.entry_point
    def registerName(self, params):
        sp.verify(sp.sender == self.data.admin, message = "Privileged operation")
        
        nameParams = sp.record(duration = params.duration, name = params.name, resolver = sp.to_address(sp.self))

        registerCall = sp.contract(sp.TRecord(duration = sp.TInt, name = sp.TString, resolver = sp.TAddress), params.registry, entry_point = "registerName").open_some()
        sp.transfer(nameParams, sp.amount, registerCall)

@sp.add_test("ServiceRegistry")
def test():
    scenario = sp.test_scenario()
    scenario.h1("ServiceRegistry")

    admin = sp.test_account("Admin")
    alice = sp.test_account("Alice")
    bob = sp.test_account("Robert")
    cindy = sp.test_account("Cindy")
    david = sp.test_account("David")
    vlad =  sp.test_account("Vlad")

    registry = ServiceRegistry(admin.address)
    scenario.register(registry)

    scenario.p("Alice fails to register due to inactive registry")
    scenario += registry.subscribe(service = sp.nat(0), subscriber = sp.none, recovery = sp.none).run(sender = alice, amount = sp.tez(6), valid = False)

    scenario.p("Cindy fails to configure registry")
    scenario += registry.configure(isActive = True,
                                   serviceMap = { 0: sp.record(name = "Z", fee = sp.tez(5000), interval = sp.nat(1), maxDuration = sp.nat(0)) }
                                   ).run(sender = cindy, valid = False)

    scenario.p("Admin configures the registry")
    scenario += registry.configure(isActive = True,
                                   serviceMap = { 0: sp.record(name = "Z", fee = sp.tez(5), interval = sp.nat(7), maxDuration = sp.nat(999)),
                                                  1: sp.record(name = "Y", fee = sp.tez(7), interval = sp.nat(30), maxDuration = sp.nat(999)),
                                                  2: sp.record(name = "X", fee = sp.tez(9), interval = sp.nat(365), maxDuration = sp.nat(1)) }
                                   ).run(sender = admin)

    scenario.p("Robert registers for one period of Z")
    scenario += registry.subscribe(service = sp.nat(0), subscriber = sp.none, recovery = sp.none).run(sender = bob, amount = sp.tez(5))

    scenario.p("Cindy fails to register for Z")
    scenario += registry.subscribe(service = sp.nat(0), subscriber = sp.none, recovery = sp.none).run(sender = cindy, amount = sp.mutez(4999999), valid = False)

    scenario.p("Cindy registers for 5 periods of Z")
    scenario += registry.subscribe(service = sp.nat(0), subscriber = sp.none, recovery = sp.none).run(sender = cindy, amount = sp.tez(25))

    scenario.p("Cindy fails to register for 5 periods of X")
    scenario += registry.subscribe(service = sp.nat(2), subscriber = sp.none, recovery = sp.none).run(sender = cindy, amount = sp.tez(45), valid = False)

    scenario.p("Cindy registers David for 3 periods of Z")
    scenario += registry.subscribe(service = sp.nat(0), subscriber = sp.some(david.address), recovery = sp.none).run(sender = cindy, amount = sp.tez(15))

    scenario.p("Vlad registers for 5 periods of Y, setting David as recovery")
    scenario += registry.subscribe(service = sp.nat(0), subscriber = sp.none, recovery = sp.some(david.address)).run(sender = vlad, amount = sp.tez(36))

    scenario.p("Alice fails to assume Vlad's subscription")
    scenario += registry.assumeSubscription(subscriber = vlad.address, recovery = sp.none).run(sender = alice, amount = sp.tez(0), valid = False)

    scenario.p("David assumes Vlad's subscription")
    scenario += registry.assumeSubscription(subscriber = vlad.address, recovery = sp.none).run(sender = david, amount = sp.tez(0))

    scenario.p("Admin sets a delegate")
    scenario += registry.setDelegate(delegate = sp.some(vlad.public_key_hash)).run(sender = admin)
    
    scenario.p("Admin withdraws the balance")
    scenario += registry.withdraw().run(sender = admin)
