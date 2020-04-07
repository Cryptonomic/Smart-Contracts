# TNS-1
# Title: Tezos Name Service Domain Manager
import smartpy as sp

class TNSNameManager(sp.Contract):
    def __init__(self, manager, interval, price, maxDuration):
        self.init(domainManager = manager,
            interval = sp.int(interval),
            price = sp.mutez(price),
            maxDuration = sp.int(maxDuration),
            nameRegistry = sp.big_map(
                tkey = sp.TString,
                tvalue = sp.TRecord(
                    name = sp.TString, 
                    owner = sp.TAddress,
                    resolver = sp.TAddress, 
                    registeredAt = sp.TTimestamp,
                    registrationPeriod = sp.TInt,
                    modified = sp.TBool)),
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
        cost.value = self.getCost(sp.amount, params.duration)

        # update registry
        self.data.nameRegistry[params.name] = sp.record(
            name = params.name, 
            owner = sp.sender,
            resolver = params.resolver,
            registeredAt = sp.now,
            registrationPeriod = params.duration,
            modified = False)
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
       cost.value = self.getCost(sp.amount, params.duration)

       self.data.nameRegistry[params.name].registrationPeriod = params.duration
       self.data.nameRegistry[params.name].modified = True

       # refund change
       sp.if (cost.value < (sp.amount - self.data.price)): 
           # if change is "significant"
           sp.send(sp.sender, sp.amount - cost.value)

    # @param (name, newNameOwner)
    @sp.entry_point
    def transferNameOwnership(self, params):
        self.validateUpdate(sp.sender, params.name)
        self.data.nameRegistry[params.name].owner = params.newNameOwner
        self.data.nameRegistry[params.name].modified = True

    # @param (name, resolver)
    @sp.entry_point
    def updateResolver(self, params):
       self.validateUpdate(sp.sender, params.name)
       self.data.nameRegistry[params.name].resolver = params.resolver
       self.data.nameRegistry[params.name].modified = True

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
        intervals = sp.as_nat(duration) / sp.as_nat(self.data.interval)
        # validate amount
        sp.verify(self.checkAmount(amount, intervals), message = "Insufficient payment")
        return sp.split_tokens(self.data.price, intervals, 1)

    # Verify that name is valid
    def checkName(self, name):
        return name != ""

    # Verify that the name is registered
    def checkRegistered(self, name):
        return self.data.nameRegistry.contains(name)

    # Verify that amount covers intervals
    def checkAmount(self, amount, intervals):
        return sp.split_tokens(self.data.price, intervals, 1) <= amount

    # Verify that duration does not exceed max
    def checkDuration(self, duration):
        return duration < self.data.maxDuration

    # Verify that name has not expired, requires name to be in self.data.nameRegistry
    def checkExpired(self, name):
        return sp.now > self.data.nameRegistry[name].registeredAt.add_seconds(self.data.nameRegistry[name].registrationPeriod)

    # Verify that the invoker has update rights on the record requested
    def checkNamePermissions(self, sender, record):
        return (sender == record.owner) | (sender == self.data.domainManager)

    # Verify that name is valid
    def validateName(self, name):
        sp.verify(self.checkName(name), message = "Invalid name")

    # Verify that the duration is valid
    def validateDuration(self, duration):
        sp.verify(self.checkDuration(duration), message = "Duration too long")

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

class NamedContract(sp.Contract):
    def __init__(self, admin):
        self.init(
            admin = admin)

    @sp.entry_point
    def registerName(self, params):
        sp.verify(sp.sender == self.data.admin, message = "Privileged operation")
        
        nameParams = sp.record(duration = params.duration, name = params.name, resolver = sp.to_address(sp.self))

        registerCall = sp.contract(sp.TRecord(duration = sp.TInt, name = sp.TString, resolver = sp.TAddress), params.registry, entry_point = "registerName").open_some()
        sp.transfer(nameParams, sp.amount, registerCall)


@sp.add_test("TNSNameManagerTest")
def test():
    # init test and create html output
    scenario = sp.test_scenario()
    scenario.h1("Tezos Name Service Manager")

    # init test values
    managerAddr = sp.test_account("Administrator")
    ownerAddr = sp.test_account("Alice")
    resolverAddr = sp.test_account("Robert")
    exactName = "exactName"
    changeName = "changeName"
    interval = 60
    price = 1000
    maxDuration = 60*60*24*365
    regPeriod = interval*10
    regPrice = price*10

    # init contract
    domainManager = TNSNameManager(managerAddr.address, interval, price, maxDuration)
    scenario += domainManager

    # test entry points
    scenario.h2("[ENTRYPOINT] registerName")
    scenario.h3("[SUCCESS-registerName] Testing with exact amount")
    scenario += domainManager.registerName(
        name = exactName,
        resolver = resolverAddr.address,
        duration = regPeriod).run(
            sender = ownerAddr, 
            amount = sp.mutez(regPrice),
            now = sp.timestamp(0))
    scenario.verify(domainManager.data.nameRegistry[exactName] ==
            sp.record(name = exactName,
            owner = ownerAddr.address,
            resolver = resolverAddr.address,
            registeredAt = sp.timestamp(0),
            registrationPeriod = regPeriod,
            modified = False))
    scenario.verify(domainManager.data.addressRegistry[resolverAddr.address] == exactName)

    scenario.h3("[SUCCESS-registerName] Testing correct change is refunded")
    scenario += domainManager.registerName(
        name = changeName,
        resolver = resolverAddr.address,
        duration = regPeriod).run(
            sender = ownerAddr,
            amount = sp.mutez(regPrice + price*2),
            now = sp.timestamp(0),
            valid = True)
    # scenario.verify(domainManager.balance == sp.mutez(regPeriod))

    scenario.h3("[FAILED-registerName] Invalid name")
    scenario += domainManager.registerName(
        name = "",
        resolver = resolverAddr.address,
        duration = regPeriod).run(
            sender = ownerAddr,
            amount = sp.mutez(regPrice),
            now = sp.timestamp(0),
            valid = False)
    scenario.verify(~(domainManager.data.nameRegistry.contains("")))

    scenario.h3("[FAILED-registerName] Name already exists")
    scenario += domainManager.registerName(
        name = exactName,
        resolver = resolverAddr.address,
        duration = regPeriod).run(
            sender = ownerAddr,
            amount = sp.mutez(regPrice),
            now = sp.timestamp(1),
            valid = False)
    # verify storage is unchanged
    scenario.verify(domainManager.data.nameRegistry[exactName] ==
        sp.record(name = exactName,
            owner = ownerAddr.address,
            resolver = resolverAddr.address,
            registeredAt = sp.timestamp(0),
            registrationPeriod = regPeriod,
            modified = False))

    scenario.h3("[FAILED-registerName] Duration too long")
    scenario += domainManager.registerName(
        name = "toolong",
        resolver = resolverAddr.address,
        duration = maxDuration + 1).run(
            sender = ownerAddr,
            amount = sp.mutez(price * (60*24*365+1)), # cover maxDuration + 1
            now = sp.timestamp(0),
            valid = False)
    scenario.verify(~(domainManager.data.nameRegistry.contains("toolong")))

    scenario.h3("[FAILED-registerName] Payment not enough")
    scenario += domainManager.registerName(
        name = "notenough",
        resolver = resolverAddr.address,
        duration = regPeriod).run(
            sender = ownerAddr,
            amount = sp.mutez(regPrice - 1),
            now = sp.timestamp(0),
            valid = False)
    scenario.verify(~domainManager.data.nameRegistry.contains("notenough"))

    scenario.h2("[ENTRYPOINT] updateResolver")
    scenario.h3("[SUCCESS-updateResolver]")
    newresolverAddr = sp.test_account("Cindy")
    scenario += domainManager.updateResolver(
            name = exactName,
            resolver = newresolverAddr.address).run(
                sender = ownerAddr,
                now = sp.timestamp(3))
    scenario.verify(domainManager.data.nameRegistry[exactName].resolver == newresolverAddr.address)
    scenario.verify(domainManager.data.nameRegistry[exactName].modified == True)

    scenario.h3("[ENTRYPOINT] updateRegistrationPeriod")
    scenario.h3("[SUCCESS-updateRegistrationPeriod]")
    newRegPeriod = interval * 5
    newRegPrice = price * 5
    scenario += domainManager.updateRegistrationPeriod(
            name = exactName,
            duration = newRegPeriod).run(
                sender = ownerAddr,
                amount = sp.mutez(newRegPrice),
                now = sp.timestamp(3))
    scenario.verify(domainManager.data.nameRegistry[exactName].registrationPeriod == newRegPeriod)
    scenario.verify(domainManager.data.nameRegistry[exactName].modified == True)

    scenario.h3("[FAILED-updateRegistrationPeriod] New period too long")

    scenario.h3("[FAILED-updateRegistrationPeriod] Payment not enough")

    scenario.h3("[ENTRYPOINT] transferNameOwnership")
    scenario.h3("[SUCCESS-transferNameOwnership]")
    newownerAddr = sp.address("tz1-newOwner")
    scenario += domainManager.transferNameOwnership(name = exactName, newNameOwner = newownerAddr).run(sender = ownerAddr, now = sp.timestamp(3))
    scenario.verify(domainManager.data.nameRegistry[exactName].owner == newownerAddr)

    scenario.h3("[FAILED-transferNameOwnership] Old owner cannot modify subdomain")
    scenario += domainManager.transferNameOwnership(name = exactName, newNameOwner = ownerAddr.address).run(sender = ownerAddr, valid = False)
    scenario.verify(domainManager.data.nameRegistry[exactName].owner == newownerAddr)

    scenario.h2("[ENTRYPOINT] deleteName")
    scenario.h3("[FAILED-deleteName] Unregistered/deleted domain cannot be deleted.")
    unregisteredName = "unregistered"
    scenario += domainManager.deleteName(name = unregisteredName).run(sender = newownerAddr, valid = False)
    scenario.h3("[FAILED-deleteName] Bad permissions")
    scenario += domainManager.deleteName(name = exactName).run(sender = ownerAddr, valid = False)

    scenario.h3("[SUCCESS-deleteName]")
    scenario += domainManager.deleteName(name = exactName).run(sender = newownerAddr)
    scenario.verify(~(domainManager.data.nameRegistry.contains(exactName)))

    namedContractManager = sp.test_account("Janice")
    namedContract = NamedContract(namedContractManager.address)
    scenario += namedContract

    scenario.h2("Register a contract by proxy")
    scenario.h3("[SUCCESS-registerName] ")
    scenario.p("An example of registring a contract with a manager invocation while preserving the source address for trustless contract name registration")
    scenario += namedContract.registerName(duration = sp.int(5), name = "Named Contract", registry = domainManager.address).run(amount = sp.tez(20), sender = namedContractManager)
