# Title:    Tezos Name Service Domain Manager
import smartpy as sp

class TNSDomainManager(sp.Contract):
    def __init__(self, _manager, _interval, _price, _maxDuration, _minCommitTime, _maxCommitTime):
        self.init(domainManager = _manager,
            interval = sp.int(_interval),
            price = sp.mutez(_price),
            maxDuration = sp.int(_maxDuration),
            
            commitments = sp.big_map(
                tkey = sp.TBytes,
                tvalue = sp.TTimestamp),
            minCommitTime = sp.int(_minCommitTime),
            maxCommitTime = sp.int(_maxCommitTime),
            
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


    # @param commitment The commitment of the name that's being committed
    # User must call this entrypoint to commit to a name before registering it to avoid front-running.
    @sp.entry_point
    def commit(self, params):
        # TEST
        self.validateCommitment(params.commitment)
        self.data.commitments[params.commitment] = sp.now


    # @param name The name to register
    # @param resolver The resolver to register for the name
    # @param duration The duration for which to register the name
    # @param nonce The nonce used to hash the commitment
    # @param sp.amount The payment for registration
    # Registers the name for duration with the provided resolver, consuming the previously made commitment
    @sp.entry_point
    def registerName(self, params):
        self.validateName(params.name)
        self.validateAvailable(params.name)
        self.validateDuration(params.duration)

        commitment = makeCommitment(params.name, params.owner, params.nonce)
        cost = sp.local('cost', sp.mutez(0))
        cost.value = self.consumeCommitment(commitment, sp.amount, params.duration)

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


    # @param _minCommitTime New minCommitTime value
    # @param _maxCommitTime New maxCommitTime value
    @sp.entry_point
    def setCommitmentAges(self, params):
        # TEST this fails
        sp.verify(sp.sender == self.data.domainManager, message = "Invalid permissions")
        # TEST this works
        self.data.minCommitTime = params._minCommitTime
        self.data.maxCommitTime = params._maxCommitTime


    # @param commitment Commitment to consume
    # @param amount The amount of mutez sent with the transaction
    # @param duration The duration for which the name will be registered
    def consumeCommitment(self, commitment, amount, duration):
        # TEST both positive and negative
        sp.verify(self.data.commitments[commitment].add_seconds(self.data.minCommitTime) <= sp.now, 
            message = "Min commitment time not elapsed")
        sp.verify(self.data.commitments[commitment].add_seconds(self.data.maxCommitTime) > sp.now,
            message = "Commitment expired")

        del self.data.commitments[commitment]
        return self.getCost(amount, duration) # This will change into a call to price oracle


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
        sp.verify(self.checkName(name), "Invalid name")


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


    # Verifies that a commitment can be made (i.e. is not currently claimed)
    def validateCommitment(self, hash):
        sp.verify((~self.data.commitments.contains(hash)) 
            | (sp.now > self.data.commitments[hash].add_seconds(self.data.maxCommitTime)),
            message = "Commitment does not exist, or is expired")


# @param name
# @param owner
# @param nonce
# Recreates the hash which was committed for verification purpose
def makeCommitment(name, owner, nonce):
    return sp.blake2b(sp.pack([name, owner, nonce]))


@sp.add_test("TNSDomainManagerTest")
def test():
    # init test and create html output
    scenario = sp.test_scenario()
    scenario.h1("Tezos Name Service Domain Manager")

    # init test values
    minCommitTime = 5
    maxCommitTime = 100
    managerAddr = sp.address("tz1aoLg7LtcbwJ2a7kfMj9MhUDs3fvehw6aa")
    ownerAddr = sp.address("tz1-owner")
    resolverAddr = sp.address("tz1-resolver")
    testAddr = sp.address("tz1-notOwnerOrManager")
    exactName = "exactName"
    exactNameNonce = 1
    exactNameCommitment = makeCommitment(exactName, ownerAddr, exactNameNonce)
    changeName = "changeName"
    changeNameNonce = 1
    changeNameCommitment = makeCommitment(changeName, ownerAddr, changeNameNonce)
    interval = 60
    price = 1000
    maxDuration = 60*60*24*365
    regPeriod = interval*10
    regPrice = price*10

    # init contract
    domainManager = TNSDomainManager(managerAddr, interval, price, maxDuration, minCommitTime, maxCommitTime)
    scenario += domainManager

    # test entry points
    scenario.h2("[ENTRYPOINT] commit")
    scenario.h3("[SUCCESS-commit] Commit to exactName")
    scenario += domainManager.commit(
        hash = exactNameCommitment).run(
            sender = ownerAddr, 
            amount = sp.mutez(regPrice),
            now = sp.timestamp(0),
            valid = True)
    scenario.verify(domainManager.data.commitments[exactNameCommitment] == sp.timestamp(0))

    scenario.h3("[SUCCESS-commit] Old commitment expired")
    scenario += domainManager.commit(
        hash = exactNameCommitment).run(
            sender = ownerAddr, 
            amount = sp.mutez(regPrice),
            now = sp.timestamp(maxCommitTime + 1),
            valid = True)
    scenario.verify(domainManager.data.commitments[exactNameCommitment] == sp.timestamp(maxCommitTime + 1))

    scenario.h3("[FAILED-commit] Commitment already exists and has not expired (or hash collision)")
    scenario += domainManager.commit(
        hash = exactNameCommitment).run(
            sender = ownerAddr, 
            amount = sp.mutez(regPrice),
            now = sp.timestamp(1),
            valid = False)

#     scenario.h2("[ENTRYPOINT] registerName")
#     scenario.h3("[SUCCESS-registerName] Testing with exact amount, commitment already made")
#     scenario += domainManager.registerName(
#         name = exactName,
#         resolver = resolverAddr,
#         duration = regPeriod).run(
#             sender = ownerAddr, 
#             amount = sp.mutez(regPrice),
#             now = sp.timestamp(0),
#             valid = True)
#     scenario.verify(domainManager.data.nameRegistry[exactName] ==
#             sp.record(name = exactName,
#             owner = ownerAddr,
#             resolver = resolverAddr,
#             registeredAt = sp.timestamp(0),
#             registrationPeriod = regPeriod,
#             modified = False))
#     scenario.verify(domainManager.data.addressRegistry[resolverAddr] == exactName)

#     scenario.h3("[SUCCESS-registerName] Testing correct change is refunded")
#     scenario += domainManager.registerName(
#         name = changeName,
#         resolver = resolverAddr,
#         duration = regPeriod).run(
#             sender = ownerAddr,
#             amount = sp.mutez(regPrice + price*2),
#             now = sp.timestamp(0),
#             valid = True)
#     scenario.verify(domainManager.balance == sp.mutez(regPrice))

#     scenario.h3("[FAILED-registerName] No commitment made")
#     scenario += domainManager.registerName(
#         name = )
#     # use name that wasn't used yet


#     scenario.h3("[FAILED-registerName] Invalid name")
#     # need to commit to bad name ahead of time 
#     scenario += domainManager.registerName(
#         name = "",
#         resolver = resolverAddr,
#         duration = regPeriod).run(
#             sender = ownerAddr,
#             amount = sp.mutez(regPrice),
#             now = sp.timestamp(0),
#             valid = False)
#     scenario.verify(~(domainManager.data.nameRegistry.contains("")))

#     scenario.h3("[FAILED-registerName] Name already exists")
#     # need to commit to name again (use different nonce)
#     scenario += domainManager.registerName(
#         name = exactName,
#         resolver = resolverAddr,
#         duration = regPeriod).run(
#             sender = ownerAddr,
#             amount = sp.mutez(regPrice),
#             now = sp.timestamp(1),
#             valid = False)
#     # verify storage is unchanged
#     scenario.verify(domainManager.data.nameRegistry[exactName] ==
#         sp.record(name = exactName,
#             owner = ownerAddr,
#             resolver = resolverAddr,
#             registeredAt = sp.timestamp(0),
#             registrationPeriod = regPeriod,
#             modified = False))

#     scenario.h3("[FAILED-registerName] Duration too long")
#     # commit to name!
#     scenario += domainManager.registerName(
#         name = "toolong",
#         resolver = resolverAddr,
#         duration = maxDuration + 1).run(
#             sender = ownerAddr,
#             amount = sp.mutez(price * (60*24*365+1)), # cover maxDuration + 1
#             now = sp.timestamp(0),
#             valid = False)
#     scenario.verify(~(domainManager.data.nameRegistry.contains("toolong")))

#     scenario.h3("[FAILED-registerName] Payment not enough")
#     # name needs to be committed
#     scenario += domainManager.registerName(
#         name = "notenough",
#         resolver = resolverAddr,
#         duration = regPeriod).run(
#             sender = ownerAddr,
#             amount = sp.mutez(regPrice - 1),
#             now = sp.timestamp(0),
#             valid = False)
#     scenario.verify(~domainManager.data.nameRegistry.contains("notenough"))

#     scenario.h2("[ENTRYPOINT] updateResolver")
#     scenario.h3("[SUCCESS-updateResolver]")
#     newResolverAddr = sp.address("tz1-newResolver")
#     scenario += domainManager.updateResolver(
#             name = exactName,
#             resolver = newResolverAddr).run(
#                 sender = ownerAddr,
#                 now = sp.timestamp(3))
#     scenario.verify(domainManager.data.nameRegistry[exactName].resolver == newResolverAddr)
#     scenario.verify(domainManager.data.nameRegistry[exactName].modified == True)

#     scenario.h3("[ENTRYPOINT] updateRegistrationPeriod")
#     scenario.h3("[SUCCESS-updateRegistrationPeriod]")
#     newRegPeriod = interval * 5
#     newRegPrice = price * 5
#     scenario += domainManager.updateRegistrationPeriod(
#             name = exactName,
#             duration = newRegPeriod).run(
#                 sender = ownerAddr,
#                 amount = sp.mutez(newRegPrice),
#                 now = sp.timestamp(3))
#     scenario.verify(domainManager.data.nameRegistry[exactName].registrationPeriod == newRegPeriod)
#     scenario.verify(domainManager.data.nameRegistry[exactName].modified == True)

#     scenario.h3("[FAILED-updateRegistrationPeriod] New period too long")

#     scenario.h3("[FAILED-updateRegistrationPeriod] Payment not enough")

#     scenario.h3("[ENTRYPOINT] transferNameOwnership")
#     scenario.h3("[SUCCESS-transferNameOwnership]")
#     newownerAddr = sp.address("tz1-newOwner")
#     scenario += domainManager.transferNameOwnership(
#             name = exactName,
#             newNameOwner = newownerAddr).run(
#                 sender = ownerAddr,
#                 now = sp.timestamp(3))
#     scenario.verify(domainManager.data.nameRegistry[exactName].owner == newownerAddr)

#     scenario.h3("[FAILED-transferNameOwnership] Old owner cannot modify subdomain")
#     scenario += domainManager.transferNameOwnership(
#         name = exactName, newNameOwner = ownerAddr).run(
#         sender = ownerAddr, valid = False)
#     scenario.verify(domainManager.data.nameRegistry[exactName].owner == newownerAddr)

#     scenario.h2("[ENTRYPOINT] deleteName")
#     scenario.h3("[FAILED-deleteName] Unregistered/deleted domain cannot be deleted.")
#     unregisteredName = "unregistered"
#     scenario += domainManager.deleteName(name = unregisteredName).run(sender = newownerAddr, valid = False)
#     scenario.h3("[FAILED-deleteName] Bad permissions")
#     scenario += domainManager.deleteName(
#         name = exactName).run(
#         sender = ownerAddr, valid = False)

#     scenario.h3("[SUCCESS-deleteName]")
#     scenario += domainManager.deleteName(name = exactName).run(sender = newownerAddr)
#     scenario.verify(~(domainManager.data.nameRegistry.contains(exactName)))
