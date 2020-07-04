# Title:    Tezos Name Service Domain Manager
import smartpy as sp

class TNSDomainManager(sp.Contract):
    def __init__(self, _manager, _price, _interval, _maxDuration, _minCommitTime, _maxCommitTime):
        self.init(domainManager = _manager,
            price = sp.mutez(_price),
            interval = sp.int(_interval),
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


    @sp.entry_point
    def default(self):
        sp.failwith("Contract does not accept XTZ transfers")


    @sp.entry_point
    def setDelegate(self, params):
        sp.verify(sp.sender == self.data.domainManager, "Invalid permissions")
        sp.set_delegate(params.baker)


    @sp.entry_point
    def withdrawFunds(self, params):
        sp.verify(sp.sender == self.data.domainManager, "Invalid permissions")
        sp.send(self.data.domainManager, sp.balance)


    @sp.entry_point
    def config(self, params):
        sp.verify(sp.sender == self.data.domainManager, "Invalid permissions")
        sp.if params.price.is_some():
            self.data.price = params.price
        sp.if params.interval.is_some():
            self.data.interval = params.interval
        sp.if params.maxDuration.is_some():
            self.data.maxDuration = params.maxDuration


    # @param commitment The commitment of the name that's being committed
    # User must call this entrypoint to commit to a name before registering it to avoid front-running.
    @sp.entry_point
    def commit(self, params):
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
        sp.set_type(params.nonce, sp.TInt)
        self.validateName(params.name)
        self.validateAvailable(params.name)
        self.validateDuration(params.duration)

        # consume commitment to get cost
        commitment = makeCommitment(params.name, sp.sender, params.nonce)
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
        sp.verify(sp.sender == self.data.domainManager, message = "Invalid permissions")
        self.data.minCommitTime = params._minCommitTime
        self.data.maxCommitTime = params._maxCommitTime


    # @param name The name to query from the registry
    # Returns the info associated with a name to the calling contract
    @sp.entry_point
    def sendNameInfo(self, params):
        # query registry
        sp.verify(self.data.nameRegistry.contains(params.name), message = "Name is not in registry")
        response = sp.record(name = params.name, info = self.data.nameRegistry[params.name])
        # send
        sp.transfer(response, sp.mutez(0), params.k)


    # @param addr The address to query from the registry
    # Returns the info associated with an address to the calling contract
    @sp.entry_point
    def sendAddressInfo(self, params):
        # query registry
        sp.verify(self.data.addressRegistry.contains(params.addr), message = "Address is not in registry")
        _name = self.data.addressRegistry[params.addr]
        response = sp.record(name = _name, info = self.data.nameRegistry[_name])
        # send
        sp.transfer(response, sp.mutez(0), params.k)


    # # @param names List of names to query
    # # Returns the info associated with the provided list of names to the calling contract
    # @sp.entry_point
    # def sendNameInfoList(self, params):
    #     # type of name record
    #     tNameInfo = sp.TRecord(
    #         name = sp.TString, 
    #         owner = sp.TAddress,
    #         resolver = sp.TAddress, 
    #         registeredAt = sp.TTimestamp,
    #         registrationPeriod = sp.TInt,
    #         modified = sp.TBool)
    #     tk = sp.TList(tNameInfo)
    #     # callback handle for the receiver entrypoint
    #     k = sp.contract(tk, sp.sender, entry_point = "recvNameInfoList").open_some()
    #     # query registry
    #     ret = sp.list(l = 0, t = tNameInfo)
    #     sp.for name in params.names:
    #         ret.push(self.data.nameRegistry[name])
    #     # send
    #     sp.transfer(ret, sp.mutez(0), k)


    # # @param addresses List of addresses to query
    # # Returns the info associated with the provided list of addresses to the calling contract
    # @sp.entry_point
    # def sendAddressInfoList(self, params):
    #     # type of name record
    #     tNameInfo = sp.TRecord(
    #         name = sp.TString, 
    #         owner = sp.TAddress,
    #         resolver = sp.TAddress, 
    #         registeredAt = sp.TTimestamp,
    #         registrationPeriod = sp.TInt,
    #         modified = sp.TBool)
    #     # type of callback
    #     tk = sp.TList(tNameInfo)
    #     # callback handle for the receiver entrypoint
    #     k = sp.contract(tk, sp.sender, entry_point = "recvNameInfoList").open_some()
    #     # query registry
    #     ret = sp.list(l = 0, t = tNameInfo)
    #     sp.for address in params.addresses:
    #         name = self.data.addressRegistry[address]
    #         ret.push(self.data.nameRegistry[name])
    #     # send
    #     sp.transfer(ret, sp.mutez(0), k)


    # @param commitment Commitment to consume
    # @param amount The amount of mutez sent with the transaction
    # @param duration The duration for which the name will be registered
    def consumeCommitment(self, commitment, amount, duration):
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
            message = "Commitment already exists, or is not expired")


class MockResolver(sp.Contract):
    def __init__(self, _registry):
        self.init(
            receivedNames = sp.big_map(
                tkey = sp.TString,
                tvalue = sp.TRecord(
                    name = sp.TString, 
                    owner = sp.TAddress,
                    resolver = sp.TAddress, 
                    registeredAt = sp.TTimestamp,
                    registrationPeriod = sp.TInt,
                    modified = sp.TBool)),
            registry = _registry)


    # @param name 
    # Invokes the sendNameInfo entrypoint in the registry to retreive the info for name.
    @sp.entry_point
    def getNameInfoFromRegistry(self, params):
        # type of callback (i.e. type of name record)
        tkResponse = sp.TRecord(
            name = sp.TString,
            info = sp.TRecord(
                name = sp.TString, 
                owner = sp.TAddress,
                resolver = sp.TAddress, 
                registeredAt = sp.TTimestamp,
                registrationPeriod = sp.TInt,
                modified = sp.TBool))
        # callback handle for the receiver entrypoint
        kResponse = sp.contract(tkResponse, sp.to_address(sp.self), entry_point = "recvNameInfo").open_some()
        
        # type of request
        tkRequest = sp.TRecord(name = sp.TString, k = sp.TContract(tkResponse))
        kRequest = sp.contract(tkRequest, self.data.registry, entry_point = "sendNameInfo").open_some()
        
        sp.transfer(sp.record(name = params.name, k = kResponse), sp.mutez(0), kRequest)


    # @param addr 
    # Invokes the sendNameInfo entrypoint in the registry to retreive the info for name.
    @sp.entry_point
    def getAddressInfoFromRegistry(self, params):
        # type of response
        tkResponse = sp.TRecord(
            name = sp.TString,
            info = sp.TRecord(
                name = sp.TString, 
                owner = sp.TAddress,
                resolver = sp.TAddress, 
                registeredAt = sp.TTimestamp,
                registrationPeriod = sp.TInt,
                modified = sp.TBool))
        # callback handle for the receiver entrypoint
        kResponse = sp.contract(tkResponse, sp.to_address(sp.self), entry_point = "recvAddressInfo").open_some()
        
        # type of request
        tkRequest = sp.TRecord(addr = sp.TAddress, k = sp.TContract(tkResponse))
        kRequest = sp.contract(tkRequest, self.data.registry, entry_point = "sendAddressInfo").open_some()

        sp.transfer(sp.record(addr = params.addr, k = kResponse), sp.mutez(0), kRequest)


    # @param name 
    # @param info Record containing the returned name
    # This is the receiving endpoint for a call against the registry's sendNameInfo entrypoint
    @sp.entry_point
    def recvNameInfo(self, params):
        self.data.receivedNames[params.name] = params.info


    # @param name 
    # @param info Record containing the returned name
    # This is the receiving endpoint for a call against the registry's sendAddressInfo entrypoint
    @sp.entry_point
    def recvAddressInfo(self, params):
        self.data.receivedNames[params.name] = params.info


# @param name
# @param owner
# @param nonce
# Recreates the hash which was committed for verification purpose
def makeCommitment(_name, _owner, _nonce):
    return sp.blake2b(sp.pack(sp.record(name = _name, owner = _owner, nonce = _nonce)))


@sp.add_test("TNSDomainManagerTest")
def test():
    # init test and create html output
    scenario = sp.test_scenario()
    scenario.h1("Tezos Name Service Domain Manager")

    # init test values
    # commitments
    minCommitTime = 5
    maxCommitTime = 100
    # addresses
    managerAddr = sp.test_account("manager")
    ownerAddr = sp.test_account("owner")
    resolverAddr = sp.test_account("resolver")
    newResolverAddr = sp.test_account("newResolver")
    newOwnerAddr = sp.test_account("newOwner")
    # names & commitments
    nonce1 = 1
    nonce2 = 2

    exactName = "exact"
    exactNameCommitment = makeCommitment(exactName, ownerAddr.address, nonce1)
    exactNameCommitment2 = makeCommitment(exactName, ownerAddr.address, nonce2)
    
    changeName = "change"
    changeNameCommitment = makeCommitment(changeName, ownerAddr.address, nonce1)
    
    uncommittedName = "uncommitted"
    expiredName = "expired"
    expiredNameCommitment = makeCommitment(expiredName, ownerAddr.address, nonce1)

    invalidName = ""
    invalidNameCommitment = makeCommitment(invalidName, ownerAddr.address, nonce1)

    longDurationName = "longduration"
    longDurationNameCommitment = makeCommitment(longDurationName, ownerAddr.address, nonce1)

    notEnoughName = "notenough"
    notEnoughNameCommitment = makeCommitment(notEnoughName, ownerAddr.address, nonce1)
    # pricing
    interval = 60 # 1 minute
    price = 1000 # 0.001 tez
    maxDuration = 60*60*24*365 # seconds*minutes*hours*days in a year
    regPeriod = interval*10 # register for 10 minutes
    regPrice = price*10 # pay for 10 intervals

    # init contract
    domainManager = TNSDomainManager(managerAddr.address, price, interval, maxDuration, minCommitTime, maxCommitTime)
    scenario += domainManager

    # test entry points
    scenario.h2("[ENTRYPOINT] commit")
    scenario.h3("[SUCCESS-commit] Commit to exactName")
    scenario += domainManager.commit(
        commitment = exactNameCommitment).run(
            sender = ownerAddr, 
            now = sp.timestamp(0),
            valid = True)
    scenario.verify(domainManager.data.commitments[exactNameCommitment] == sp.timestamp(0))

    # scenario.h3("[SUCCESS-commit] Old commitment expired")
    # scenario += domainManager.commit(
    #     commitment = exactNameCommitment).run(
    #         sender = ownerAddr, 
    #         now = sp.timestamp(maxCommitTime + 1),
    #         valid = True)
    # scenario.verify(domainManager.data.commitments[exactNameCommitment] == sp.timestamp(maxCommitTime + 1))

    scenario.h3("[FAILED-commit] Commitment already exists and has not expired (or hash collision)")
    scenario += domainManager.commit(
        commitment = exactNameCommitment).run(
            sender = ownerAddr, 
            now = sp.timestamp(1),
            valid = False)

    scenario.h2("[ENTRYPOINT] registerName")
    # scenario.h3("[SUCCESS-registerName] Testing with exact amount, commitment already made, exactly minCommitTime elapsed")
    # scenario += domainManager.registerName(
    #     name = exactName,
    #     resolver = resolverAddr.address,
    #     duration = regPeriod,
    #     nonce = nonce1).run(
    #         sender = ownerAddr, 
    #         amount = sp.mutez(regPrice),
    #         now = sp.timestamp(minCommitTime),
    #         valid = True)
    # scenario.verify(domainManager.data.nameRegistry[exactName] ==
    #         sp.record(name = exactName,
    #         owner = ownerAddr.address,
    #         resolver = resolverAddr.address,
    #         registeredAt = sp.timestamp(minCommitTime),
    #         registrationPeriod = regPeriod,
    #         modified = False))
    # scenario.verify(domainManager.data.addressRegistry[resolverAddr.address] == exactName)
    
    scenario.h3("[SUCCESS-registerName] Testing with exact amount, commitment already made, >minCommitTime elapsed")
    scenario += domainManager.registerName(
        name = exactName,
        resolver = resolverAddr.address,
        duration = regPeriod,
        nonce = nonce1).run(
            sender = ownerAddr, 
            amount = sp.mutez(regPrice),
            now = sp.timestamp(minCommitTime+1),
            valid = True)
    scenario.verify(domainManager.data.nameRegistry[exactName] ==
            sp.record(name = exactName,
            owner = ownerAddr.address,
            resolver = resolverAddr.address,
            registeredAt = sp.timestamp(minCommitTime+1),
            registrationPeriod = regPeriod,
            modified = False))
    scenario.verify(domainManager.data.addressRegistry[resolverAddr.address] == exactName)


    scenario.h3("[SUCCESS-registerName] Testing correct change is refunded")
    # commit to changeName
    scenario += domainManager.commit(
        commitment = changeNameCommitment).run(
            sender = ownerAddr, 
            now = sp.timestamp(0),
            valid = True)
    scenario.verify(domainManager.data.commitments[changeNameCommitment] == sp.timestamp(0))
    scenario += domainManager.registerName(
        name = changeName,
        resolver = resolverAddr.address,
        duration = regPeriod,
        nonce = nonce1).run(
            sender = ownerAddr,
            amount = sp.mutez(regPrice + price*2),
            now = sp.timestamp(minCommitTime),
            valid = True)
    scenario.verify(domainManager.balance == sp.mutez(2*regPrice))

    scenario.h3("[FAILED-registerName] No commitment made")
    scenario += domainManager.registerName(
        name = uncommittedName,
        resolver = resolverAddr.address,
        duration = regPeriod,
        nonce = nonce1).run(
            sender = ownerAddr,
            amount = sp.mutez(regPrice),
            now = sp.timestamp(0),
            valid = False)
    scenario.verify(~domainManager.data.nameRegistry.contains(uncommittedName))

    scenario.h3("[FAILED-registerName] minCommitTime not elapsed from commitment")
    scenario += domainManager.registerName(
        name = exactName,
        resolver = resolverAddr.address,
        duration = regPeriod,
        nonce = nonce1).run(
            sender = ownerAddr, 
            amount = sp.mutez(regPrice),
            now = sp.timestamp(minCommitTime-1),
            valid = False)
    
    scenario.h3("[FAILED-registerName] Commitment expired")
    scenario += domainManager.commit(
        commitment = expiredNameCommitment).run(
            sender = ownerAddr,
            now = sp.timestamp(0),
            valid = True)
    scenario += domainManager.registerName(
        name = expiredName,
        resolver = resolverAddr.address,
        duration = regPeriod,
        nonce = nonce1).run(
            sender = ownerAddr, 
            amount = sp.mutez(regPrice),
            now = sp.timestamp(maxCommitTime+1),
            valid = False)
    

    scenario.h3("[FAILED-registerName] Invalid name")
    scenario += domainManager.commit(
        commitment = invalidNameCommitment).run(
            sender = ownerAddr, 
            amount = sp.mutez(regPrice),
            now = sp.timestamp(0),
            valid = True)
    scenario += domainManager.registerName(
        name = invalidName,
        resolver = resolverAddr.address,
        duration = regPeriod,
        nonce = nonce1).run(
            sender = ownerAddr,
            amount = sp.mutez(regPrice),
            now = sp.timestamp(minCommitTime),
            valid = False)
    scenario.verify(~(domainManager.data.nameRegistry.contains("")))

    scenario.h3("[FAILED-registerName] Name already exists, after a new commitment is made")
    scenario += domainManager.commit(
        commitment = exactNameCommitment2).run(
            sender = ownerAddr,
            now = sp.timestamp(minCommitTime+1),
            valid = True) 
    scenario += domainManager.registerName(
        name = exactName,
        resolver = resolverAddr.address,
        duration = regPeriod,
        nonce = nonce2).run(
            sender = ownerAddr,
            amount = sp.mutez(regPrice),
            now = sp.timestamp(2*minCommitTime + 1),
            valid = False)

    scenario.h3("[FAILED-registerName] Duration too long")
    scenario += domainManager.commit(
        commitment = longDurationNameCommitment).run(
            sender = ownerAddr,
            now = sp.timestamp(0),
            valid = True) 
    scenario += domainManager.registerName(
        name = longDurationName,
        resolver = resolverAddr.address,
        duration = maxDuration + 1,
        nonce = nonce1).run(
            sender = ownerAddr,
            amount = sp.mutez(price * (60*24*365+1)), # cover maxDuration + 1
            now = sp.timestamp(minCommitTime),
            valid = False)
    scenario.verify(~(domainManager.data.nameRegistry.contains("toolong")))

    scenario.h3("[FAILED-registerName] Payment not enough")
    scenario += domainManager.commit(
        commitment = notEnoughNameCommitment).run(
            sender = ownerAddr,
            now = sp.timestamp(0),
            valid = True) 
    scenario += domainManager.registerName(
        name = notEnoughName,
        resolver = resolverAddr.address,
        duration = regPeriod,
        nonce = nonce1).run(
            sender = ownerAddr,
            amount = sp.mutez(regPrice - 1),
            now = sp.timestamp(minCommitTime),
            valid = False)
    scenario.verify(~domainManager.data.nameRegistry.contains("notenough"))

    scenario.h2("[ENTRYPOINT] updateResolver")
    scenario.h3("[SUCCESS-updateResolver]")
    scenario += domainManager.updateResolver(
        name = exactName,
        resolver = newResolverAddr.address).run(
            sender = ownerAddr,
            now = sp.timestamp(3),
            valid = True)
    scenario.verify(domainManager.data.nameRegistry[exactName].resolver == newResolverAddr.address)
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
            now = sp.timestamp(3),
            valid = True)
    scenario.verify(domainManager.data.nameRegistry[exactName].registrationPeriod == newRegPeriod)
    scenario.verify(domainManager.data.nameRegistry[exactName].modified == True)

    scenario.h3("[FAILED-updateRegistrationPeriod] New period too long")
    maxRegPrice = price * maxDuration
    scenario += domainManager.updateRegistrationPeriod(
        name = exactName,
        duration = maxDuration+1).run(
            sender = ownerAddr,
            amount = sp.mutez(maxDuration),
            now = sp.timestamp(3),
            valid = False)

    scenario.h3("[FAILED-updateRegistrationPeriod] Payment not enough")
    scenario += domainManager.updateRegistrationPeriod(
        name = exactName,
        duration = newRegPeriod).run(
            sender = ownerAddr,
            amount = sp.mutez(newRegPrice - 1),
            now = sp.timestamp(3),
            valid = False)


    scenario.h3("[ENTRYPOINT] transferNameOwnership")
    scenario.h3("[SUCCESS-transferNameOwnership]")
    scenario += domainManager.transferNameOwnership(
            name = exactName,
            newNameOwner = newOwnerAddr.address).run(
                sender = ownerAddr,
                now = sp.timestamp(3))
    scenario.verify(domainManager.data.nameRegistry[exactName].owner == newOwnerAddr.address)

    scenario.h3("[FAILED-transferNameOwnership] Old owner cannot modify subdomain")
    scenario += domainManager.transferNameOwnership(
        name = exactName, 
        newNameOwner = ownerAddr.address).run(
            sender = ownerAddr, 
            valid = False)
    scenario.verify(domainManager.data.nameRegistry[exactName].owner == newOwnerAddr.address)

    scenario.h2("[ENTRYPOINT] deleteName")
    scenario.h3("[FAILED-deleteName] Unregistered/deleted domain cannot be deleted.")
    unregisteredName = "unregistered"
    scenario += domainManager.deleteName(name = unregisteredName).run(sender = newOwnerAddr, valid = False)
    scenario.h3("[FAILED-deleteName] Bad permissions")
    scenario += domainManager.deleteName(
        name = exactName).run(
            sender = ownerAddr, 
            valid = False)

    scenario.h3("[SUCCESS-deleteName]")
    scenario += domainManager.deleteName(
        name = exactName).run(
            sender = newOwnerAddr)
    scenario.verify(~(domainManager.data.nameRegistry.contains(exactName)))

    scenario.h2("[ENTRYPOINT] setCommitmentAges")
    scenario.h3("[SUCCESS-setCommitmentAges]")
    newMinCommitTime = 2 * minCommitTime
    newMaxCommitTime = 2 * maxCommitTime
    scenario += domainManager.setCommitmentAges(
        _minCommitTime = newMinCommitTime,
        _maxCommitTime = newMaxCommitTime).run(
            sender = managerAddr,
            valid = True)
    scenario.verify(domainManager.data.minCommitTime == newMinCommitTime)
    scenario.verify(domainManager.data.maxCommitTime == newMaxCommitTime)

    scenario.h3("[FAILED-setCommitmentAges] Invalid permissions")
    scenario += domainManager.setCommitmentAges(
        _minCommitTime = newMinCommitTime,
        _maxCommitTime = newMaxCommitTime).run(
            sender = ownerAddr,
            valid = False)

    scenario.h2("[ENTRYPOINT] sendNameInfo")
    scenario.h3("[SUCCESS-sendNameInfo] Invoking MockResolver to check proper return value")
    mockResolver = MockResolver(domainManager.address)
    scenario += mockResolver
    scenario += mockResolver.getNameInfoFromRegistry(
        name = changeName).run(
            sender = ownerAddr,
            valid = True)
    scenario.verify(mockResolver.data.receivedNames[changeName] == domainManager.data.nameRegistry[changeName])

    # This works, just not sure how to mark a failed condition in the sendNameInfo (i.e. secondary) tx
    # scenario.h3("[FAILED-sendNameInfo] Name does not exist")
    # mockResolver = MockResolver(domainManager.address)
    # scenario += mockResolver
    # scenario += mockResolver.getNameInfoFromRegistry(
    #     name = exactName).run(
    #         sender = ownerAddr,
    #         valid = True)
    # scenario.verify(~(mockResolver.data.receivedNames.contains(exactName)))

    scenario.h3("[SUCCESS-sendAddressInfo] Invoking MockResolver to check proper return value")
    mockResolver = MockResolver(domainManager.address)
    scenario += mockResolver
    scenario += mockResolver.getAddressInfoFromRegistry(
        addr = resolverAddr.address).run(
            sender = ownerAddr,
            valid = True)
    scenario.verify(mockResolver.data.receivedNames[changeName] == domainManager.data.nameRegistry[changeName])

    # This works, just not sure how to mark a failed condition in the sendNameInfo (i.e. secondary) tx
    # scenario.h3("[FAILED-sendAddressInfo] Address does not exist")
    # mockResolver = MockResolver(domainManager.address)
    # scenario += mockResolver
    # scenario += mockResolver.getAddressInfoFromRegistry(
    #     addr = ownerAddr.address).run(
    #         sender = ownerAddr,
    #         valid = True)
