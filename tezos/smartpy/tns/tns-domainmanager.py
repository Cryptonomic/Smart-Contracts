# Title:    Tezos Name Service Domain Manager
import smartpy as sp

class TNSDomainManager(sp.Contract):
    def __init__(self, owner, stamp):
        self.init(domainOwner = owner,
            domainRegistry = sp.big_map(
                tkey = sp.TString,
                tvalue = sp.TRecord(
                    name = sp.TString, 
                    owner = sp.TAddress,
                    resolver = sp.TAddress, 
                    ttl = sp.TNat)),
            stamp = stamp)

    # @param (subdomainName, resolver, ttl)
    @sp.entry_point
    def registerSubdomain(self, params):
        self.isSubdomainValid(params.subdomainName)
        self.isSubdomainAvailable(params.subdomainName)
        self.data.domainRegistry[params.subdomainName] = sp.record(
            name = params.subdomainName, 
            owner = sp.sender, 
            resolver = params.resolver,
            ttl = params.ttl)

    # @param (subdomainName, newSubdomainOwner)
    @sp.entry_point
    def transferSubdomainOwnership(self, params):
        self.canUpdate(sp.sender, params.subdomainName)
        self.data.domainRegistry[params.subdomainName].owner = params.newSubdomainOwner

    # @param (subdomain, resolver)
    @sp.entry_point
    def updateResolver(self, params):
       self.canUpdate(sp.sender, params.subdomainName)
       self.data.domainRegistry[params.subdomainName].resolver = params.resolver

    # @param (subdomain, ttl)
    @sp.entry_point
    def updateTTL(self, params):
       self.canUpdate(sp.sender, params.subdomainName)
       self.data.domainRegistry[params.subdomainName].ttl = params.ttl

    # @param subdomain
    @sp.entry_point
    def deleteSubdomain(self, params):
       self.canUpdate(sp.sender, params.subdomainName)
       del self.data.domainRegistry[params.subdomainName]

    # Verify that subdomainName is valid
    def isSubdomainValid(self, subdomainName):
        sp.verify(subdomainName != "", "Invalid subdomain name: Empty")

    # Verify that subdomainName is not already registered
    def isSubdomainAvailable(self, subdomainName):
        sp.verify(~(self.data.domainRegistry.contains(subdomainName)),
            "Subdomain is not available")

    # Verify that the invoker has update rights on the record requested
    def validPermissions(self, sender, record):
        sp.verify(sender == record.owner,
            "Sender does not have permissions to change this subdomain")

    # Performs all checks to see if the transaction can update the record 
    # corresponding to subdomainName.
    # @param subdomainName name of subdomain to be updated
    def canUpdate(self, sender, subdomainName):
        self.isSubdomainValid(subdomainName)
        sp.verify(self.data.domainRegistry.contains(subdomainName),
            "Subdomain is not registered")
        self.validPermissions(sender, self.data.domainRegistry[subdomainName])

@sp.add_test("TNSDomainManagerTest")
def test():
    # init test and create html output
    scenario = sp.test_scenario()
    scenario.h1("Tezos Name Service Domain Manager")

    # init test values
    ownerAddr = sp.address("tz1-owner")
    resolverAddr = sp.address("tz1-resolver")
    testAddr = sp.address("tz1-notOwnerOrManager")
    subdomainName1 = "domain1"
    testTtl = 1

    # init contract
    domainManager = TNSDomainManager(ownerAddr, "test-stamp")
    scenario += domainManager

    # test entry points
    scenario.h2("Testing registerDomain entrypoint")
    scenario.h3("Testing successful domain registration")
    scenario += domainManager.registerSubdomain(
        subdomainName = subdomainName1,
        resolver = resolverAddr,
        ttl = testTtl).run(sender = ownerAddr)
    scenario.verify(domainManager.data.domainRegistry[subdomainName1] ==
        sp.record(name = subdomainName1,
            owner = ownerAddr,
            resolver = resolverAddr,
            ttl = testTtl)) 
    scenario.h3("Testing failed domain registration - already exists")
    scenario += domainManager.registerSubdomain(
        subdomainName = subdomainName1,
        resolver = resolverAddr,
        ttl = testTtl).run(sender = ownerAddr, valid = False)
    # verify storage is unchanged
    scenario.verify(domainManager.data.domainRegistry[subdomainName1] ==
        sp.record(name = subdomainName1,
            owner = ownerAddr,
            resolver = resolverAddr,
            ttl = testTtl))
    scenario.h3("Testing invalid name registration")
    scenario += domainManager.registerSubdomain(
            subdomainName = "",
            resolver = resolverAddr,
            ttl = testTtl).run(sender = ownerAddr, valid = False)
    scenario.verify(~(domainManager.data.domainRegistry.contains("")))

    scenario.h2("Testing domain updates")
    scenario.h3("Testing successful resovler update")
    newResolverAddr = sp.address("tz1-newResolver")
    scenario += domainManager.updateResolver(
            subdomainName = subdomainName1,
            resolver = newResolverAddr).run(sender = ownerAddr)
    scenario.verify(domainManager.data.domainRegistry[subdomainName1].resolver == newResolverAddr)

    scenario.h3("Testing successful TTL update")
    newTTL = 2
    scenario += domainManager.updateTTL(
            subdomainName = subdomainName1,
            ttl = newTTL).run(sender = ownerAddr)
    scenario.verify(domainManager.data.domainRegistry[subdomainName1].ttl == newTTL)

    scenario.h3("Testing successful ownership transfer")
    newOwnerAddr = sp.address("tz1-newOwner")
    scenario += domainManager.transferSubdomainOwnership(
            subdomainName = subdomainName1,
            newSubdomainOwner = newOwnerAddr).run(sender = ownerAddr)
    scenario.verify(domainManager.data.domainRegistry[subdomainName1].owner == newOwnerAddr)
    scenario.h3("Testing that old owner cannot modify subdomain")
    scenario += domainManager.transferSubdomainOwnership(
            subdomainName = subdomainName1,
            newSubdomainOwner = ownerAddr).run(sender = ownerAddr, valid = False)
    scenario.verify(domainManager.data.domainRegistry[subdomainName1].owner == newOwnerAddr)

    scenario.h2("Testing subdomain deletion")
    scenario.h3("Testing unsuccessful deletion of unregistered/deleted domain")
    unregisteredSubdomainName = "domain2"
    scenario += domainManager.deleteSubdomain(subdomainName = unregisteredSubdomainName).run(sender = newOwnerAddr, valid = False)
    scenario.h3("Testing unsuccessful deletion of domain because of bad permissions")
    scenario += domainManager.deleteSubdomain(subdomainName = subdomainName1).run(sender = ownerAddr, valid = False)
    scenario.h3("Testing successful deletion")
    scenario += domainManager.deleteSubdomain(subdomainName = subdomainName1).run(sender = newOwnerAddr)
    scenario.verify(~(domainManager.data.domainRegistry.contains(subdomainName1)))

