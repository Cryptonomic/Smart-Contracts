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
                    registeredAt = sp.TTimestamp,
                    registrationPeriod = sp.TInt,
                    modified = sp.TBool)),
            addressRegistry = sp.big_map(
                tkey = sp.TAddress,
                tvalue = sp.TString))


    # automatically fail any plain XTZ transfers
    @sp.entry_point
    def default(self):
        sp.failwith("Contract does not accept XTZ transfers")


    # @param baker The new baker to delegate to
    @sp.entry_point
    def setDelegate(self, params):
        sp.verify(sp.sender == self.data.domainManager, "Invalid permissions")
        sp.set_delegate(params.baker)


    # @param dest Destination to withdraw funds to
    # withdraw the funds to the target destination
    @sp.entry_point
    def withdrawFunds(self, params):
        sp.verify(sp.sender == self.data.domainManager, "Invalid permissions")
        sp.send(params.dest, sp.balance)

    
    # @param price
    # @param interval
    # @param maxDuration
    # @param minCommitTime
    # @param maxCommitTime
    # Optionally provide new config parameters
    @sp.entry_point
    def config(self, params):
        sp.verify(sp.sender == self.data.domainManager, "Invalid permissions")
        self.data.price = params.price
        self.data.interval = params.interval
        self.data.maxDuration = params.maxDuration
        self.data.minCommitTime = params.minCommitTime
        self.data.maxCommitTime = params.maxCommitTime


    # @param commitment The commitment of the name that's being committed
    # User must call this entrypoint to commit to a name before registering it to avoid front-running.
    @sp.entry_point
    def commit(self, params):
        self.validateCommitment(params.commitment)
        self.data.commitments[params.commitment] = sp.now


    # @param name The name to register
    # @param duration The duration for which to register the name
    # @param nonce The nonce used to hash the commitment
    # @param sp.amount The payment for registration
    # Registers the name for duration with the sender, consuming the previously made commitment
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
            registeredAt = sp.now,
            registrationPeriod = params.duration,
            modified = False)
        self.data.addressRegistry[sp.sender] = params.name

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


    # # @param (name, newNameOwner)
    # @sp.entry_point
    # def transferNameOwnership(self, params):
    #     # need to think about how to do this one, since we're only allowing sp.sender to register themselves,
    #     # how does one transfer ownership? maybe add something like committing to a sale (by current owner)
    #     # and then the commitment needs to be consumed (by new owner)?
    #     self.validateUpdate(sp.sender, params.name)
    #     self.data.nameRegistry[params.name].owner = params.newNameOwner
    #     self.data.nameRegistry[params.name].modified = True


    # @param (name, owner)
    @sp.entry_point
    def updateOwner(self, params):
       self.validateUpdate(sp.sender, params.name)
       self.data.nameRegistry[params.name].owner = params.owner
       self.data.nameRegistry[params.name].modified = True


    # @param name
    @sp.entry_point
    def deleteName(self, params):
       self.validateUpdate(sp.sender, params.name)
       del self.data.addressRegistry[self.data.nameRegistry[params.name].owner]
       del self.data.nameRegistry[params.name]


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


@sp.add_test("commit_Success_CommitToName")
def commit_Success_CommitToName():
    # init env
    env = Env("[commit-SUCCESS] Commit to exactName")
    
    name = env.names()
    owner = generateAccounts("owner")()
    commit = makeCommitment(name, owner.address, env.nonce())
    
    # execute tx
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    # verify commit
    env.scenario.verify(env.tns.data.commitments[commit] == sp.timestamp(env.time()))

    
@sp.add_test("commit_Success_OldCommitExpired")
def commit_Success_OldCommitExpired():
    # init env
    env = Env("[commit-SUCCESS] Old commitment expired")

    name = env.names()
    owner = generateAccounts("owner")()
    commit = makeCommitment(name, owner.address, env.nonce())
    timestep = env.tnsParams["_maxCommitTime"] + 1
    
    # execute tx
    env.scenario += env.tns.commit(
        commitment = commit).run( 
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.commit(
        commitment = commit).run( 
            sender = owner, 
            now = sp.timestamp(env.time(timestep)), 
            valid = True)
    # verify commit
    env.scenario.verify(env.tns.data.commitments[commit] == sp.timestamp(timestep))

   
@sp.add_test("commit_Failure_CommitmentAlreadyExists")
def commit_Failure_CommitmentAlreadyExists():
    # init env
    env = Env("[commit-FAILED] Commitment already exists and has not expired (or hash collision)")

    owner = generateAccounts("owner")()
    name = env.names()
    commit = makeCommitment(name, owner.address, env.nonce())
    
    # execute first commit
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    # execute second commit before the first is consumed
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time(1)), 
            valid = False)


@sp.add_test("registerName_Success_ExactAmount")
def registerName_Success_ExactAmount():
    # init env
    env = Env("[registerName-SUCCESS] Testing with exact amount, commitment already made, exactly minCommitTime elapsed")

    name = env.names()
    owner = generateAccounts("owner")()
    nonce = env.nonce()
    commit = makeCommitment(name, owner.address, nonce)
    periods = 10
    cost = env.tnsParams["_price"] * periods

    # execute tx
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods,
        nonce = nonce).run(
            sender = owner, 
            amount = sp.mutez(cost),
            now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"])),
            valid = True)
    # verify registration
    env.scenario.verify(env.tns.data.nameRegistry[name] ==
            sp.record(name = name,
            owner = owner.address,
            registeredAt = sp.timestamp(env.tnsParams["_minCommitTime"]),
            registrationPeriod = env.tnsParams["_interval"] * periods,
            modified = False))
    # verify changes
    env.scenario.verify(env.tns.data.addressRegistry[owner.address] == name)

 
@sp.add_test("registerName_Success_ChangeRefunded")
def registerName_Success_ChangeRefunded():
    # init env
    env = Env("[registerName-SUCCESS] Testing with exact amount, commitment already made, exactly minCommitTime elapsed")

    name = env.names()
    owner = generateAccounts("owner")()
    nonce = env.nonce()
    commit = makeCommitment(name, owner.address, nonce)
    periods = 10
    cost = env.tnsParams["_price"] * periods
    change = env.tnsParams["_price"]

    # execute tx
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods,
        nonce = nonce).run(
            sender = owner, 
            amount = sp.mutez(cost + change),
            now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"])),
            valid = True)
    # verify registration    
    env.scenario.verify(env.tns.data.nameRegistry[name] ==
            sp.record(name = name,
            owner = owner.address,
            registeredAt = sp.timestamp(env.tnsParams["_minCommitTime"]),
            registrationPeriod = env.tnsParams["_interval"] * periods,
            modified = False))
    # verify changes
    env.scenario.verify(env.tns.data.addressRegistry[owner.address] == name)
    env.scenario.verify(env.tns.balance == sp.mutez(cost))


@sp.add_test("registerName_Failure_NoCommitment")
def registerName_Failure_NoCommitment():
    # init env
    env = Env("[registerName-FAILED] No commitment made")

    name = env.names()
    owner = generateAccounts("owner")()
    nonce = env.nonce()
    periods = 10
    cost = env.tnsParams["_price"] * periods

    # execute tx
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods,
        nonce = nonce).run(
            sender = owner, 
            amount = sp.mutez(cost),
            now = sp.timestamp(env.time()),
            valid = False)


@sp.add_test("registerName_Failure_MinCommitTimeNotElapsed")
def registerName_Failure_MinCommitTimeNotElapsed():
    # init env
    env = Env("[registerName-FAILED] minCommitTime not elapsed from commitment")

    name = env.names()
    owner = generateAccounts("owner")()
    nonce = env.nonce()
    commit = makeCommitment(name, owner.address, nonce)
    periods = 10
    cost = env.tnsParams["_price"] * periods

    # execute tx
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods,
        nonce = nonce).run(
            sender = owner, 
            amount = sp.mutez(cost),
            now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"] - 1)),
            valid = False)


@sp.add_test("registerName_Failure_CommitmentExpired")
def registerName_Failure_CommitmentExpired():
    # init env
    env = Env("[registerName-FAILED] Commitment expired")

    name = env.names()
    owner = generateAccounts("owner")()
    nonce = env.nonce()
    commit = makeCommitment(name, owner.address, nonce)
    periods = 10
    cost = env.tnsParams["_price"] * periods

    # execute tx
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods,
        nonce = nonce).run(
            sender = owner, 
            amount = sp.mutez(cost),
            now = sp.timestamp(env.time(env.tnsParams["_maxCommitTime"] + 1)),
            valid = False)
  

@sp.add_test("registerName_Failure_InvalidName")
def registerName_Failure_InvalidName():
    # init env
    env = Env("[registerName-FAILED] Invalid name")

    name = ""
    owner = generateAccounts("owner")()
    nonce = env.nonce()
    commit = makeCommitment(name, owner.address, nonce)
    periods = 10
    cost = env.tnsParams["_price"] * periods

    # execute tx
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods,
        nonce = nonce).run(
            sender = owner, 
            amount = sp.mutez(cost),
            now = sp.timestamp(env.time(env.tnsParams["_maxCommitTime"])),
            valid = False)


@sp.add_test("registerName_Failure_NameAlreadyExists")
def registerName_Failure_NameAlreadyExists():
    # init env
    env = Env("[registerName-FAILED] Name already exists, after a new commitment is made")

    name = env.names()
    owner = generateAccounts("owner")()
    nonce1, nonce2 = env.nonce(), env.nonce()
    commit1, commit2 = makeCommitment(name, owner.address, nonce1), makeCommitment(name, owner.address, nonce2)
    periods = 10
    cost = env.tnsParams["_price"] * periods

    # execute tx
    # register original name
    env.scenario += env.tns.commit(
        commitment = commit1).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods,
        nonce = nonce1).run(
            sender = owner, 
            amount = sp.mutez(cost),
            now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"])),
            valid = True)
    # attempt second registration
    env.scenario += env.tns.commit(
        commitment = commit2).run(
            sender = owner,
            now = sp.timestamp(env.time(1)),
            valid = True)
    env.scenario += env.tns.registerName(
        name = name,
        duration = env.tnsParams["_interval"] * periods,
        nonce = nonce2).run(
            sender = owner,
            amount = sp.mutez(cost),
            now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"])),
            valid = False)


@sp.add_test("registerName_Failure_DurationTooLong")
def registerName_Failure_DurationTooLong():
    # init env
    env = Env("[registerName-FAILED] Duration too long")

    name = env.names()
    owner = generateAccounts("owner")()
    nonce = env.nonce()
    commit = makeCommitment(name, owner.address, nonce)
    periods = int((env.tnsParams["_maxDuration"] / env.tnsParams["_interval"])) + 1
    cost = env.tnsParams["_price"] * periods

    # execute tx
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods,
        nonce = nonce).run(
            sender = owner, 
            amount = sp.mutez(cost),
            now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"])),
            valid = False)


@sp.add_test("registerName_Failure_InsufficientPayment")
def registerName_Failure_InsufficientPayment():
    # init env
    env = Env("[registerName-FAILED] Insufficient payment")

    name = env.names()
    owner = generateAccounts("owner")()
    nonce = env.nonce()
    commit = makeCommitment(name, owner.address, nonce)
    periods = 10
    cost = env.tnsParams["_price"] * periods

    # execute tx
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods,
        nonce = nonce).run(
            sender = owner, 
            amount = sp.mutez(cost - 1),
            now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"])),
            valid = False)


@sp.add_test("updateRegistrationPeriod_Success")
def updateRegistrationPeriod_Success():
    # init env
    env = Env("[updateRegistrationPeriod-SUCCESS]")
    
    name = env.names()
    owner = generateAccounts("owner")()
    nonce = env.nonce()
    commit = makeCommitment(name, owner.address, nonce)
    periods1, periods2 = 10, 5
    cost1, cost2 = env.tnsParams["_price"] * periods1, env.tnsParams["_price"] * periods2

    # execute tx
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods1,
        nonce = nonce).run(
            sender = owner, 
            amount = sp.mutez(cost1),
            now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"])),
            valid = True)
    # update registration period
    env.scenario += env.tns.updateRegistrationPeriod(
        name = name,
        duration = env.tnsParams["_interval"] * periods2).run(
            sender = owner,
            amount = sp.mutez(cost2),
            now = sp.timestamp(env.time(1)),
            valid = True)
    # verify effects
    env.scenario.verify(env.tns.data.nameRegistry[name].registrationPeriod == env.tnsParams["_interval"] * periods2)
    env.scenario.verify(env.tns.data.nameRegistry[name].modified == True)


@sp.add_test("updateRegistrationPeriod_Failure_NewPeriodTooLong")
def updateRegistrationPeriod_Failure_NewPeriodTooLong():
    # init env
    env = Env("[updateRegistrationPeriod-FAILED] New period is too long")
    
    name = env.names()
    owner = generateAccounts("owner")()
    nonce = env.nonce()
    commit = makeCommitment(name, owner.address, nonce)
    periods1, periods2 = 10, int((env.tnsParams["_maxDuration"] / env.tnsParams["_interval"])) + 1
    cost1, cost2 = env.tnsParams["_price"] * periods1, env.tnsParams["_price"] * periods2

    # execute tx
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods1,
        nonce = nonce).run(
            sender = owner, 
            amount = sp.mutez(cost1),
            now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"])),
            valid = True)
    # try to update registration period
    env.scenario += env.tns.updateRegistrationPeriod(
        name = name,
        duration = env.tnsParams["_interval"] * periods2).run(
            sender = owner,
            amount = sp.mutez(cost2),
            now = sp.timestamp(env.time(1)),
            valid = False)


@sp.add_test("updateRegistrationPeriod_Failure_InsufficientPayment")
def updateRegistrationPeriod_Failure_InsufficientPayment():
    # init env
    env = Env("[updateRegistrationPeriod-FAILED] Insufficient Payment")
    
    name = env.names()
    owner = generateAccounts("owner")()
    nonce = env.nonce()
    commit = makeCommitment(name, owner.address, nonce)
    periods1, periods2 = 10, 5
    cost1, cost2 = env.tnsParams["_price"] * periods1, env.tnsParams["_price"] * periods2

    # execute tx
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods1,
        nonce = nonce).run(
            sender = owner, 
            amount = sp.mutez(cost1),
            now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"])),
            valid = True)
    # try to update registration period
    env.scenario += env.tns.updateRegistrationPeriod(
        name = name,
        duration = env.tnsParams["_interval"] * periods2).run(
            sender = owner,
            amount = sp.mutez(cost2 - 1),
            now = sp.timestamp(env.time(1)),
            valid = False)


# need to figure out transferNameOwnership and then modify the following tests
# @sp.add_test("transferNameOwnership_Success")
# def transferNameOwnership_Success():
#     # init env
#     env = Env("[transferNameOwnership-SUCCESS]")
    
#     name = env.names()
#     owners = generateAccounts("owner")
#     owner1, owner2 = owners(), owners()
#     nonce = env.nonce()
#     commit = makeCommitment(name, owner1.address, nonce)
#     periods = 10
#     cost = env.tnsParams["_price"] * periods

#     # execute tx

#     env.scenario += env.tns.commit(
#         commitment = commit).run(
#             sender = owner1, 
#             now = sp.timestamp(env.time()), 
#             valid = True)
#     env.scenario += env.tns.registerName(
#         name = name, 
#         duration = env.tnsParams["_interval"] * periods,
#         nonce = nonce).run(
#             sender = owner1, 
#             amount = sp.mutez(cost),
#             now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"])),
#             valid = True)
#     # update owner
#     env.scenario += env.tns.transferNameOwnership(
#         name = name,
#         newNameOwner = owner2.address).run(
#             sender = owner1,
#             amount = sp.mutez(cost),
#             now = sp.timestamp(env.time(1)),
#             valid = True)
#     # verify changes
#     env.scenario.verify(env.tns.data.nameRegistry[name].owner == owner2.address)


# @sp.add_test("transferNameOwnership_Failure_InvalidPermissions")
# def transferNameOwnership_Failure_InvalidPermissions():
#     # init env
#     env = Env("[transferNameOwnership-FAILED] Invalid permissions")
    
#     name = env.names()
#     owners = generateAccounts("owner")
#     owner1, owner2 = owners(), owners()
#     nonce = env.nonce()
#     commit = makeCommitment(name, owner1.address, nonce)
#     periods = 10
#     cost = env.tnsParams["_price"] * periods

#     # execute tx
#     # register name with original owner
#     env.scenario += env.tns.commit(
#         commitment = commit).run(
#             sender = owner1, 
#             now = sp.timestamp(env.time()), 
#             valid = True)
#     env.scenario += env.tns.registerName(
#         name = name, 
#         duration = env.tnsParams["_interval"] * periods,
#         nonce = nonce).run(
#             sender = owner1, 
#             amount = sp.mutez(cost),
#             now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"])),
#             valid = True)
#     # update owner
#     env.scenario += env.tns.transferNameOwnership(
#         name = name,
#         newNameOwner = owner2.address).run(
#             sender = owner2,
#             amount = sp.mutez(cost),
#             now = sp.timestamp(env.time(1)),
#             valid = False)


@sp.add_test("deleteName_Succcess")
def deleteName_Succcess():
    # init env
    env = Env("[deleteName-SUCCESS]")
    
    name = env.names()
    owner = generateAccounts("owner")()
    nonce = env.nonce()
    commit = makeCommitment(name, owner.address, nonce)
    periods = 10
    cost = env.tnsParams["_price"] * periods

    # execute tx
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods,
        nonce = nonce).run(
            sender = owner, 
            amount = sp.mutez(cost),
            now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"])),
            valid = True)
    # delete name
    env.scenario += env.tns.deleteName(
        name = name).run(
            sender = owner,
            valid = True)
    # verify changes
    env.scenario.verify(~(env.tns.data.nameRegistry.contains(name)))


@sp.add_test("deleteName_Failure_UnregisteredDomain")
def deleteName_Failure_UnregisteredDomain():
    # init env
    env = Env("[deleteName-FAILED] Unregistered domain cannot be deleted")
    
    name = env.names()
    owner = generateAccounts("owner")()
    
    # execute tx
    # try to delete name
    env.scenario += env.tns.deleteName(
        name = name).run(
            sender = owner,
            valid = False)


@sp.add_test("deleteName_Failure_InvalidPermissions")
def deleteName_Failure_InvalidPermissions():
    # init env
    env = Env("[deleteName-FAILED] Invalid Permissions")
    
    name = env.names()
    owners = generateAccounts("owner")
    owner1, owner2 = owners(), owners()
    nonce = env.nonce()
    commit = makeCommitment(name, owner1.address, nonce)
    periods = 10
    cost = env.tnsParams["_price"] * periods

    # execute tx
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner1, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods,
        nonce = nonce).run(
            sender = owner1, 
            amount = sp.mutez(cost),
            now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"])),
            valid = True)
    # delete name
    env.scenario += env.tns.deleteName(
        name = name).run(
            sender = owner2,
            valid = False)


@sp.add_test("sendNameInfo_Success")
def sendNameInfo_Success():
    # init env
    env = Env("[sendNameInfo-SUCCESS]")

    name = env.names()
    owner = generateAccounts("owner")()
    nonce = env.nonce()
    commit = makeCommitment(name, owner.address, nonce)
    periods = 10
    cost = env.tnsParams["_price"] * periods

    # execute tx
    # register name
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods,
        nonce = nonce).run(
            sender = owner, 
            amount = sp.mutez(cost),
            now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"])),
            valid = True)
    # add a MockResolver to scenario
    mockResolver = MockResolver(env.tns.address)
    env.scenario += mockResolver
    # invoke mockResolver
    env.scenario += mockResolver.getNameInfoFromRegistry(
        name = name).run(
            sender = owner,
            valid = True)
    # verify changes to mockResolver
    env.scenario.verify(mockResolver.data.receivedNames[name] == env.tns.data.nameRegistry[name])



@sp.add_test("sendNameInfo_Failure_NameDoesNotExist")
def sendNameInfo_Failure_NameDoesNotExist():
    # init env
    env = Env("[sendNameInfo-FAILED] Name does not exist")

    name = env.names()
    invoker = generateAccounts("invoker")()

    # execute tx
    # add a mockResolver to scenario
    mockResolver = MockResolver(env.tns.address)
    env.scenario += mockResolver
    # This works, but can't mark a failed condition in the sendNameInfo (i.e. secondary) tx with SmartPy
    # env.scenario += mockResolver.getNameInfoFromRegistry(
    #     name = name).run(
    #         sender = invoker,
    #         valid = False)
    # env.scenario.verify(~(mockResolver.data.receivedNames.contains(name)))


@sp.add_test("sendAddressInfo_Success")
def sendAddressInfo_Success():
    # init env
    env = Env("[sendAddressInfo-SUCCESS]")

    name = env.names()
    owner = generateAccounts("owner")()
    nonce = env.nonce()
    commit = makeCommitment(name, owner.address, nonce)
    periods = 10
    cost = env.tnsParams["_price"] * periods

    # execute tx
    # register name
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods,
        nonce = nonce).run(
            sender = owner, 
            amount = sp.mutez(cost),
            now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"])),
            valid = True)
    # add a MockResolver to scenario
    mockResolver = MockResolver(env.tns.address)
    env.scenario += mockResolver
    # invoke mockResolver
    env.scenario += mockResolver.getAddressInfoFromRegistry(
        addr = owner.address).run(
            sender = owner,
            valid = True)
    # verify changes to mockResolver
    env.scenario.verify(mockResolver.data.receivedNames[name] == env.tns.data.nameRegistry[name])



@sp.add_test("sendAddressInfo_Failure_AddressDoesNotExist")
def sendAddressInfo_Failure_AddressDoesNotExist():
    # init env
    env = Env("[sendAddressInfo-FAILED] Address does not exist")

    invoker = generateAccounts("invoker")()

    # execute tx
    # add a mockResolver to scenario
    mockResolver = MockResolver(env.tns.address)
    env.scenario += mockResolver
    # This works, but can't mark a failed condition in the sendAddressInfo (i.e. secondary) tx with SmartPy
    # env.scenario += mockResolver.getAddressInfoFromRegistry(
    #     addr = invoker.address).run(
    #         sender = invoker,
    #         valid = True)
    # env.scenario.verify(~(mockResolver.data.receivedNames.contains(invoker.address)))


@sp.add_test("default_Failure")
def default_Failure():
    # init env
    env = Env("[default-FAILED] Fail any plain XTZ transfer to the contract")

    account = generateAccounts("account")()

    # execute tx
    env.scenario += env.tns.default().run(
        sender = account,
        amount = sp.mutez(1),
        valid = False)


@sp.add_test("setDelegate_Success")
def setDelegate_Success():
    # init env
    env = Env("[setDelegate-SUCCESS]")

    manager = generateAccounts("manager")()
    baker = generateAccounts("baker")()

    # execute tx
    env.scenario += env.tns.setDelegate(
        baker = sp.some(baker.public_key_hash)).run(
            sender = manager,
            valid = True)
    # env.scenario.verify(env.tns.baker == baker.public_key_hash)


@sp.add_test("setDelegate_Failure_InvalidPermissions")
def setDelegate_Failure_InvalidPermissions():
    # init env
    env = Env("[setDelegate-FAILED] Invalid permissions")

    baker = generateAccounts("baker")()

    # execute tx
    env.scenario += env.tns.setDelegate(
        baker = sp.some(baker.public_key_hash)).run(
            sender = env.managers(),
            valid = False)


@sp.add_test("withdrawFunds_Success")
def withdrawFunds_Success():
    # init env
    env = Env("[withdrawFunds-SUCCESS]")

    name = env.names()
    owner = generateAccounts("owner")()
    nonce = env.nonce()
    commit = makeCommitment(name, owner.address, nonce)
    periods = 10
    cost = env.tnsParams["_price"] * periods
    manager = generateAccounts("manager")()

    # execute tx
    # register a name to accrue balance
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods,
        nonce = nonce).run(
            sender = owner, 
            amount = sp.mutez(cost),
            now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"])),
            valid = True)
    # withdraw funds
    env.scenario += env.tns.withdrawFunds(
        dest = manager.address).run(
            sender = manager,
            now = env.time(1), 
            valid = True)
    # verify contract balance
    env.scenario.verify(env.tns.balance == sp.mutez(0))
    # verify account balance
    # env.scenario.verify(manager.balance == sp.mutez(cost))



@sp.add_test("withdrawFunds_Failure_InvalidPermissions")
def withdrawFunds_Failure_InvalidPermissions():
    # init env
    env = Env("[withdrawFunds-SUCCESS]")

    name = env.names()
    owner = generateAccounts("owner")()
    nonce = env.nonce()
    commit = makeCommitment(name, owner.address, nonce)
    periods = 10
    cost = env.tnsParams["_price"] * periods

    # execute tx
    # register a name to accrue balance
    env.scenario += env.tns.commit(
        commitment = commit).run(
            sender = owner, 
            now = sp.timestamp(env.time()), 
            valid = True)
    env.scenario += env.tns.registerName(
        name = name, 
        duration = env.tnsParams["_interval"] * periods,
        nonce = nonce).run(
            sender = owner, 
            amount = sp.mutez(cost),
            now = sp.timestamp(env.time(env.tnsParams["_minCommitTime"])),
            valid = True)
    # withdraw funds
    env.scenario += env.tns.withdrawFunds(
        dest = owner.address).run(
            sender = owner,
            now = env.time(1), 
            valid = False)


@sp.add_test("config_Success")
def config_Success():
    # init env
    env = Env("[config-SUCCESS]")
    price = env.tnsParams["_price"] * 2
    interval = env.tnsParams["_interval"] * 2
    maxDuration = env.tnsParams["_maxDuration"] * 2
    minCommitTime = env.tnsParams["_minCommitTime"] * 2
    maxCommitTime = env.tnsParams["_maxCommitTime"] * 2
    manager = generateAccounts("manager")()

    # execute tx
    env.scenario += env.tns.config(
        price = sp.mutez(price),
        interval = interval,
        maxDuration = maxDuration,
        minCommitTime = minCommitTime,
        maxCommitTime = maxCommitTime).run(
            sender = manager,
            valid = True)


@sp.add_test("config_Failure_InvalidPermissions")
def config_Failure_InvalidPermissions():
    # init env
    env = Env("[config-FAILED] Invalid permissions")

    price = env.tnsParams["_price"] * 2
    interval = env.tnsParams["_interval"] * 2
    maxDuration = env.tnsParams["_maxDuration"] * 2
    minCommitTime = env.tnsParams["_minCommitTime"] * 2
    maxCommitTime = env.tnsParams["_maxCommitTime"] * 2
    
    invoker = generateAccounts("notManager")()  

    # execute tx
    env.scenario += env.tns.config(
        price = sp.mutez(price),
        interval = interval,
        maxDuration = maxDuration,
        minCommitTime = minCommitTime,
        maxCommitTime = maxCommitTime).run(
            sender = invoker,
            valid = False)


def generateAccounts(desc):
    curr = 0
    def newAccount():
        nonlocal curr
        curr += 1
        return sp.test_account(desc + str(curr))
    return newAccount


def generateNames(name):
    curr = 0
    def newName():
        nonlocal curr
        curr += 1
        return name + str(curr)
    return newName


def nonce():
    curr = 0
    def step():
        nonlocal curr
        curr += 1
        return curr
    return step


def time():
    curr = 0
    def step(l = 0):
        nonlocal curr
        curr += l
        return curr
    return step


class Env:
    def __init__(self, title):
        self.scenario = sp.test_scenario()
        self.scenario.h2(title)
        
        self.managers = generateAccounts("manager")
        self.names = generateNames("testName")
        self.nonce = nonce()
        self.time = time() # return curr time or after increment
        
        self.tnsParams = {
            "_manager": self.managers().address,
            "_interval": 60, # 1 minute
            "_maxDuration": 60*60*24*365, # 1 year
            "_price": 1000, # 0.001 tez
            "_minCommitTime": 30, # 0.5 minutes
            "_maxCommitTime": 600 # 10 minutes
        }
        self.tns = TNSDomainManager(**self.tnsParams)
        self.scenario += self.tns


