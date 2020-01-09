# Title:    Tezos Name Service Domain Manager
import smartpy as sp

class Subdomain():
    def __init__(self, name, owner, resolver, manager, ttl):
        self.name = name
        self.owner = owner
        self.resolver = resolver
        self.manager = manager
        self.ttl = ttl

class TNSDomainManager(sp.Contract):
    def __init__(self, domainOwner, stamp):
        self.init(domainOwner = sp.address(),
                subdomainToRecord = sp.map(),
                stamp = stamp)

    # @param (subdomainName, resolver, manager, ttlInSeconds)
    @sp.entryPoint
    def registerSubdomain(self, params):
        self.isSubdomainAvailable(params.subdomainName)
        self.data.subdomainToRecord[params.subdomainName] = sp.record(
            name = params.subdomainName, 
            owner = sp.sender(), 
            resolver = params.resolver,
            manager = params.manager,
            ttl = params.ttl)

    # @param (subdomainName, newSubdomainOwner)
    @sp.entryPoint
    def transferSubdomainOwnership(self, params):
        self.canUpdate(params.subdomainName)
        self.data.subdomainToRecord[params.subdomainName].owner = newSubdomainOwner

    # @param (subdomain, resolver)
    @sp.entryPoint
    def updateResolver(self, params):
       self.canUpdate(params.subdomainName)
       self.data.subdomainToRecord[params.subdomainName].resolver = resolver

    # @param (subdomain, manager)
    @sp.entryPoint
    def updateManager(self, params):
       self.canUpdate(params.subdomainName)
       self.data.subdomainToRecord[params.subdomainName].manager = manager

    # @param (subdomain, ttl)
    @sp.entryPoint
    def updateTTL(self, params):
       self.canUpdate(params.subdomainName)
       self.data.subdomainToRecord[params.subdomainName].ttl = ttl

    # @param subdomain
    @sp.entryPoint
    def deleteSubdomain(self, params):
       self.canUpdate(params.subdomainName)
       del self.data.subdomainToRecord[params.subdomainName]

    # Verify that subdomainName is not already registered
    def isSubdomainAvailable(self, subdomainName):
        sp.verify(subdomainName not in self.data.subdomainToRecord.keys(),
            f"Subdomain {params.subdomainName} is not available")

    # Verify that the invoker has update rights on the record requested
    def validPermissions(self, record):
        sp.verify(sp.sender() == record.owner or sp.sender() == record.manager,
            f"{sp.sender()} does not have permissions to change {subdomainName}")

    # Performs all checks to see if the transaction can update the record 
    # corresponding to subdomainName.
    # @param subdomainName name of subdomain to be updated
    def canUpdate(self, subdomainName):
        self.isSubdomainAvailable(subdomainName)
        self.validPermissions(self.data.subdomainToRecord[subdomainName])

@sp.add_test("TNSDomainManagerTest")
def test():
    pass
