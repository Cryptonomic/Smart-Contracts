# Title:    Tezos Name Service Domain Manager
import smartpy as sp

class TNSDomainManager(sp.Contract):
    def __init__(self, owner, stamp):
        self.init(domainOwner = owner,
            nameRegistry = sp.big_map(
                tkey = sp.TString,
                tvalue = sp.TRecord(
                    name = sp.TString, 
                    owner = sp.TAddress,
                    resolver = sp.TAddress, 
                    registeredAt = sp.TTimestamp,
                    registrationPeriod = sp.TInt)),
            stamp = stamp,
            addressRegistry = sp.big_map(
                tkey = sp.TAddress,
                tvalue = sp.TString))

    # @param (name, resolver, registrationPeriod)
    @sp.entry_point
    def registerName(self, params):
        self.validateName(params.name)
        self.validateAvailable(params.name)
        self.data.nameRegistry[params.name] = sp.record(
            name = params.name, 
            owner = sp.sender,
            resolver = params.resolver,
            registeredAt = sp.now,
            registrationPeriod = params.registrationPeriod)
        self.data.addressRegistry[params.resolver] = params.name

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

    # @param (name, registrationPeriod)
    @sp.entry_point
    def updateRegistrationPeriod(self, params):
       self.validateUpdate(sp.sender, params.name)
       self.validateNewPeriod(params.name, params.registrationPeriod)
       self.data.nameRegistry[params.name].registrationPeriod = params.registrationPeriod

    # @param name
    @sp.entry_point
    def deleteName(self, params):
       self.validateUpdate(sp.sender, params.name)
       del self.data.addressRegistry[self.data.nameRegistry[params.name].resolver]
       del self.data.nameRegistry[params.name]

    # Verify that name is valid
    def checkName(self, name):
        return name != ""

    # Verify that the name is registered
    def checkRegistered(self, name):
        return self.data.nameRegistry.contains(name)

    # Verify that name has not expired, requires name to be in self.data.nameRegistry
    def checkExpired(self, name):
        return sp.now > self.data.nameRegistry[name].registeredAt.add_seconds(self.data.nameRegistry[name].registrationPeriod)

    # Verify that the invoker has update rights on the record requested
    def checkNamePermissions(self, sender, record):
        return sender == record.owner

    # Verify that name is valid
    def validateName(self, name):
        sp.verify(self.checkName(name), "Invalid name")
    
    # Verify that the the new registration period is valid
    def validateNewPeriod(self, name, newPeriod):
        sp.verify(sp.now < self.data.nameRegistry[name].registeredAt.add_seconds(newPeriod), "Cannot set expired registration period")

    # Verify that name is not already registered
    def validateAvailable(self, name):
        sp.verify(~(self.checkRegistered(name) & ~(self.checkExpired(name))),
            "Name is currently registered")
        #sp.if (self.checkRegistered(name) & ~(self.checkExpired(name))):
        #    sp.failwith(
        
    # Performs all checks to see if the transaction can update the record 
    # corresponding to name.
    def validateUpdate(self, sender, name):
        sp.verify(self.checkRegistered(name), "Name not registered")
        sp.verify(~self.checkExpired(name), "Name registration has expired")
        sp.verify(self.checkNamePermissions(sender, self.data.nameRegistry[name]),
            "Invalid permissions")

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
    regPeriod = 600

    # init contract
    domainManager = TNSDomainManager(ownerAddr, "test-stamp")
    scenario += domainManager

    # test entry points
    scenario.h2("Testing registerDomain entrypoint")
    scenario.h3("Testing successful domain registration")
    scenario += domainManager.registerName(
        name = name1,
        resolver = resolverAddr,
        registrationPeriod = regPeriod).run(
            sender = ownerAddr, 
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
        resolver = resolverAddr,
        registrationPeriod = regPeriod).run(
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
            resolver = resolverAddr,
            registrationPeriod = regPeriod).run(
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
    newRegPeriod = 4
    scenario += domainManager.updateRegistrationPeriod(
            name = name1,
            registrationPeriod = newRegPeriod).run(
                sender = ownerAddr,
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
