# Title:    Tezos Name Service Domain Manager
import smartpy as sp

class TNSDomainManager(sp.Contract):
<<<<<<< Updated upstream
    def __init__(self, owner, stamp):
        self.init(domainOwner = owner,
=======
    def __init__(self, manager, interval, price, maxDuration):
        self.init(domainManager = manager,
            interval = interval,
            price = sp.mutez(price),
            maxDuration = sp.int(maxDuration),
>>>>>>> Stashed changes
            nameRegistry = sp.big_map(
                tkey = sp.TString,
                tvalue = sp.TRecord(
                    name = sp.TString, 
                    owner = sp.TAddress,
                    resolver = sp.TAddress, 
                    registeredAt = sp.TTimestamp,
<<<<<<< Updated upstream
                    registrationPeriod = sp.TInt)),
            stamp = stamp,
=======
                    registrationPeriod = sp.TInt,
                    modified = sp.TBool)),
>>>>>>> Stashed changes
            addressRegistry = sp.big_map(
                tkey = sp.TAddress,
                tvalue = sp.TString))

    # @param name The name to register
    # @param resolver The resolver to register for the name
    # @param duration The duration for which to register the name
    # @param sp.amount The payment for registration
    @sp.entry_point
    def registerName(self, params):
        self.validateName(params.name)
        self.validateAvailable(params.name)

        self.validateDuration(params.duration)
        cost = sp.local('cost', sp.mutez(0))
        cost.value = self.getCost(params.amount, params.duration)

        # update registry
        self.data.nameRegistry[params.name] = sp.record(
            name = params.name, 
            owner = sp.sender,
            resolver = params.resolver,
            registeredAt = sp.now,
<<<<<<< Updated upstream
            registrationPeriod = params.registrationPeriod)
=======
            registrationPeriod = params.duration,
            modified = False)
>>>>>>> Stashed changes
        self.data.addressRegistry[params.resolver] = params.name

        # refund change
        sp.if cost.value < sp.amount:
            sp.send(sp.sender, sp.amount - cost.value)

    # @param name The name for which to extend registration.
    # @param sp.amount The payment for the added registrationPeriod
    @sp.entry_point
    def updateRegistrationPeriod(self, params):
       self.validateUpdate(sp.sender, params.name)

       currentDuration = self.data.nameRegistry[params.name].registrationPeriod
       self.validateDuration(currentDuration + params.duration)
       cost = sp.local('cost', sp.mutez(0))
       cost.value = self.getCost(params.amount, params.duration)

       self.data.nameRegistry[params.name].registrationPeriod = param.duration
       self.data.nameRegistry[params.name].modified = True

       # refund change
       sp.if cost.value < (sp.amount - self.data.price): # if change is "significant"
           sp.send(sp.sender, sp.amount - cost.value)

    # @param (name, newNameOwner)
    @sp.entry_point
    def transferNameOwnership(self, params):
        self.validateUpdate(sp.sender, params.name)
        self.data.nameRegistry[params.name].owner = params.newNameOwner

    # @param (name, resolver)
    @sp.entry_point
    def updateResolver(self, params):
       self.validateUpdate(sp.sender, params.name)
       self.data.nameRegistry[params.name].resolver = params.resolver

<<<<<<< Updated upstream
    # @param (name, registrationPeriod)
    @sp.entry_point
    def updateRegistrationPeriod(self, params):
       self.validateUpdate(sp.sender, params.name)
       self.validateNewPeriod(params.name, params.registrationPeriod)
       self.data.nameRegistry[params.name].registrationPeriod = params.registrationPeriod

=======
>>>>>>> Stashed changes
    # @param name
    @sp.entry_point
    def deleteName(self, params):
       self.validateUpdate(sp.sender, params.name)
       del self.data.addressRegistry[self.data.nameRegistry[params.name].resolver]
       del self.data.nameRegistry[params.name]

    # @param amount Amount sent to pay for 'duration'
    # @param duration Duration to register for 'amount'
    # Verify that amount is enough to cover duration
    def getCost(self, amount, duration):
        # calculate actual cost of duration
        intervals = sp.local('intervals', 0)
        intervalsDiv = sp.ediv(duration, self.data.interval)
        # sanity check
        sp.verify(intervalsDiv.is_some(), message = "Invalid interval length set on origination")
        intervals.value = sp.fst(intervalsDiv.open_some())
        # validate amount
        sp.verify(checkAmount(amount, intervals.value), message = "Insufficient payment")
        return self.data.price * intervals.value

    # Verify that name is valid
    def checkName(self, name):
        return name != ""

    # Verify that the name is registered
    def checkRegistered(self, name):
        return self.data.nameRegistry.contains(name)

    # Verify that amount covers intervals
    def checkAmount(self, amount, intervals):
        return (self.data.price * intervals) <= amount

    # Verify that duration does not exceed max
    def checkDuration(self, duration):
        return duration < self.data.maxDuration

    # Verify that name has not expired, requires name to be in self.data.nameRegistry
    def checkExpired(self, name):
        return sp.now > self.data.nameRegistry[name].registeredAt.add_seconds(self.data.nameRegistry[name].registrationPeriod)

    # Verify that the invoker has update rights on the record requested
    def checkNamePermissions(self, sender, record):
        return sender == record.owner

    # Verify that name is valid
    def validateName(self, name):
        sp.verify(self.checkName(name), "Invalid name")

    # Verify that the duration is valid
    def validateDuration(self, duration):
        sp.verify(checkDuration(duration), message = "Duration too long")

    # Verify that name is not already registered
    def validateAvailable(self, name):
        sp.verify(~(self.checkRegistered(name) & ~(self.checkExpired(name))),
            message = "Name is currently registered")

    # Performs all checks to see if the transaction can update the record 
    # corresponding to name.
    def validateUpdate(self, sender, name):
        sp.verify(self.checkRegistered(name), message = "Name not registered")
        sp.verify(~self.checkExpired(name), message = "Name registration has expired")
        sp.verify(self.checkNamePermissions(sender, self.data.nameRegistry[name]),
            message = "Invalid permissions")

@sp.add_test("TNSDomainManagerTest")
def test():
    # init test and create html output
    scenario = sp.test_scenario()
    scenario.h1("Tezos Name Service Domain Manager")

    # init test values
    ownerAddr = sp.address("tz1-owner")
    resolverAddr = sp.address("tz1-resolver")
    testAddr = sp.address("tz1-notOwnerOrManager")
    name1 = "domain1"
    regPeriod = 60*10
    interval = 60
    price = sp.mutez(1000)
    maxDuration = 60*60*24*365

    # init contract
<<<<<<< Updated upstream
    domainManager = TNSDomainManager(ownerAddr, "test-stamp")
=======
    domainManager = TNSDomainManager(managerAddr, interval, price, maxDuration)
>>>>>>> Stashed changes
    scenario += domainManager

    # test entry points
    scenario.h2("Testing registerDomain entrypoint")
    scenario.h3("Testing successful domain registration")
    scenario += domainManager.registerName(
        name = name1,
        resolver = resolverAddr,
        duration = 60*60*24).run(
            sender = ownerAddr, 
            amount = sp.mutez(10000),
            now = sp.timestamp(0))
    scenario.verify(domainManager.data.nameRegistry[name1] ==
        sp.record(name = name1,
            owner = ownerAddr,
            resolver = resolverAddr,
            registeredAt = sp.timestamp(0),
            registrationPeriod = regPeriod))
    scenario.verify(domainManager.data.addressRegistry[resolverAddr] == name1)
    scenario.h3("Testing failed domain registration - already exists")
    scenario += domainManager.registerName(
        name = name1,
        resolver = resolverAdd).run(
            sender = ownerAddr,
            now = sp.timestamp(1),
            valid = False)
    # verify storage is unchanged
    scenario.verify(domainManager.data.nameRegistry[name1] ==
        sp.record(name = name1,
            owner = ownerAddr,
            resolver = resolverAddr,
            registeredAt = sp.timestamp(0),
            registrationPeriod = regPeriod))
    scenario.h3("Testing invalid name registration")
    scenario += domainManager.registerName(
            name = "",
            resolver = resolverAddr).run(
                sender = ownerAddr, 
                now = sp.timestamp(2),
                valid = False)
    scenario.verify(~(domainManager.data.nameRegistry.contains("")))

    scenario.h2("Testing domain updates")
    scenario.h3("Testing successful resovler update")
    newResolverAddr = sp.address("tz1-newResolver")
    scenario += domainManager.updateResolver(
            name = name1,
            resolver = newResolverAddr).run(
                sender = ownerAddr,
                now = sp.timestamp(3))
    scenario.verify(domainManager.data.nameRegistry[name1].resolver == newResolverAddr)

    scenario.h3("Testing successful registration period update")
    newRegPeriod = 300
    scenario += domainManager.updateRegistrationPeriod(
            name = name1).run(
                sender = ownerAddr,
                amount = 5000,
                now = sp.timestamp(3))
    scenario.verify(domainManager.data.nameRegistry[name1].registrationPeriod == newRegPeriod)
    scenario.h3("Testing unsuccessful registration period update: set to expire")
    badRegPeriod = 2
    scenario += domainManager.updateRegistrationPeriod(
            name = name1,
            registrationPeriod = badRegPeriod).run(
                sender = ownerAddr,
                now = sp.timestamp(3),
                valid = False)
    scenario.verify(domainManager.data.nameRegistry[name1].registrationPeriod == newRegPeriod)

    scenario.h3("Testing successful ownership transfer")
    newOwnerAddr = sp.address("tz1-newOwner")
    scenario += domainManager.transferNameOwnership(
            name = name1,
            newNameOwner = newOwnerAddr).run(
                sender = ownerAddr,
                now = sp.timestamp(3))
    scenario.verify(domainManager.data.nameRegistry[name1].owner == newOwnerAddr)
    scenario.h3("Testing that old owner cannot modify subdomain")
    scenario += domainManager.transferNameOwnership(
            name = name1,
            newNameOwner = ownerAddr).run(sender = ownerAddr, valid = False)
    scenario.verify(domainManager.data.nameRegistry[name1].owner == newOwnerAddr)

    scenario.h2("Testing subdomain deletion")
    scenario.h3("Testing unsuccessful deletion of unregistered/deleted domain")
    unregisteredName = "domain2"
    scenario += domainManager.deleteName(name = unregisteredName).run(sender = newOwnerAddr, valid = False)
    scenario.h3("Testing unsuccessful deletion of domain because of bad permissions")
    scenario += domainManager.deleteName(name = name1).run(sender = ownerAddr, valid = False)
    scenario.h3("Testing successful deletion")
    scenario += domainManager.deleteName(name = name1).run(sender = newOwnerAddr)
    scenario.verify(~(domainManager.data.nameRegistry.contains(name1)))
