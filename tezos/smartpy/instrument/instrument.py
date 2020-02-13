# Cryptonomic trustless, decentralized, tokenized, delegation bond

import smartpy as sp

class Instrument(sp.Contract):
    # @param sp.amount availableCollateral is initialized to the amount sent to the contract on origination.
    # @param discountSchedule The (increasing) compounding schedule for XTZ->Token conversion.
    # @param duration Length of time (in seconds) for which this instrument will live. 
    # @param interval Length of time (in seconds) by which interest compounds. 
    # @param baker The baker to which the contract is delegating. 
    def __init__(self, discountSchedule, duration, interval, baker):
        # type constraints
        self.init(
            discountSchedule = sp.map(tkey = sp.TNat, tvalue = sp.TMutez),
            startTime = sp.TTimestamp,
            duration = sp.TTimestamp,
            interval = sp.TNat,
            baker = sp.TAddress,
            availableXTZCollateral = sp.TMutez,
            lockedXTZAmount = sp.TMutez,
            balances = sp.big_map(
                tkey = sp.TAddress,
                tvalue = sp.TRecord(
                    balance = sp.TNat,
                    approvals = sp.big_map(tkey = sp.TAddress, tvalue = sp.TNat))),
            administrator = sp.TAddress, 
            totalSupply = sp.TNat)

        # init instrument parameters
        self.data.discountSchedule = discountSchedule
        # sanity check on schedule length
        sp.verify(discountSchedule.contains(duration/interval), "Malformed discount schedule")

        self.data.startTime = sp.now
        self.data.duration = duration
        self.data.interval = interval
        
        self.data.baker = baker
        sp.set_delegate(baker)

        # init token parameters
        self.data.paused = False
        self.data.totalSupply = 0
        self.data.administrator = sp.sender

        # init ledger
        self.data.availableCollateral = sp.amount
        self.data.lockedXTZAmount = sp.tez(0)

    # The default entrypoint is used to deposit XTZ in exchange for tokens. 
    @sp.entry_point
    def default(self, params):
        sp.if sp.sender == self.data.baker:
            # add payouts to available collateral
            self.data.availableCollateral += sp.amount
        sp.else:
            # refund random transfers
            sp.send(sp.sender, sp.amount)

    # @params ()
    # 
    @sp.entry_point
    def deposit(self, params):
        # validate invocation
        validateAccount(sp.sender)
        validateDepositAmount(sp.amount)
        
        # calculate yield on amount
        lenToExpiration = self.data.duration - (sp.now - sp.startTime)
        xtzYield = calculateYield(sp.amount, calculatePeriods(lenToExpiration))
        
        # adjust xtz and token ledgers
        self.lockXTZ(sp.amount, xtzYield)
        self.issueTokens(sp.sender, sp.amount + xtzYield)
    
    # @params withdrawFrom Account to withdraw investment from.
    # @params tokenAmount Amount of tokens to redeem.
    # 
    @sp.entry_point
    def withdraw(self, params):
        # validate invocation
        validateAccount(sp.sender)
        validateWithdraw(sp.sender, params.tokenAmount)
        
        # calculate payout
        lenFromStart = sp.now - sp.startTime
        xtzPayout, xtzSpare = calculatePayout(params.tokenAmount, calculatePeriods(lenFromStart))
        
        # adjust xtz and token ledgers
        self.unlockXTZ(sp.amount, xtzPayout, xtzSpare)
        self.redeemTokens(params.withdrawFrom, params.tokenAmount)

    # @param transferFrom
    # @param transferTo
    # @param amount
    # Transfers 'amount' of tokens from 'transferFrom' to 'transferTo'
    @sp.entry_point
    def transfer(self, params):
        self.validateTransfer(sp.sender, params.transferFrom, params.amount)
        self.addAddressIfNecessary(params.transferTo)
        
        # adjust token ledger
        self.data.balances[transferFrom].balance -= params.amount
        self.data.balances[transferTo].balance += params.amount
        sp.if (params.transferFrom != sp.sender) | (self.data.administrator != sp.sender):
            self.data.balances[params.transferFrom].approvals[sp.sender] -= params.amount

    # @param ()
    # 
    @sp.entry_point
    def approve(self, params):
        pass

    # @param account The owner of the issued tokens.
    # @param tokenAmount The amount of tokens to issue.
    # Issues 'tokenAmount' of tokens to 'account'. 
    def issueTokens(self, account, tokenAmount):
        self.addAddressIfNecessary(account)
        self.data.balances[account].balance += tokenAmount

    # @param account The owner of the tokens being redeemed.
    # @param tokenAmount The amount of tokens being redeemed
    # Redeems 'tokenAmount' from 'account'.
    def redeemTokens(self, account, tokenAmount):
        self.data.balances[account].balance -= tokenAmount

    # @param xtzAmount Amount in XTZ to be locked.
    # @param xtzYield Yield from now until expiration (in XTZ).
    # Set aside collateral for issued tokens.
    def lockXTZ(self, xtzAmount, xtzYield):
        # adjust ledger
        self.data.availableCollateral -= xtzYield
        self.data.lockedXTZAmount += xtzAmount + xtzYield
    
    # @param xtzPayout The payout accrued 
    # @param xtzSpare The payout accrued 
    # Unlock the collateral set aside at time of issuance, adding the spare back to availableCollateral.
    # Sends the payout out to 'account'.
    def unlockXTZ(self, params):
        # adjust ledger
        self.data.lockedXTZAmount -= xtzPayout + xtzSpare
        self.data.availableCollateral += xtzSpare
        
        # payout to sender
        sendFunds(sp.sender, payout)

    # @param sp.sender Issuer that wishes to increase the capacity.
    # @param sp.amount Amount to be added to availableCollateral
    # Contract manager can withdraw their profits.
    @sp.entry_point
    def increaseAvailableCollateral(self, params):
        # validate invocation
        validateIssuer(sp.sender)
        
        # adjust ledger
        self.data.availableCollateral += sp.amount 
    
    # @param amount Amount to be withdrawn from availableCollateral
    # Contract manager can withdraw their profits.
    @sp.entry_point
    def decreaseAvailableCollateral(self, params):
        # validate invocation
        validateIssuer(sp.sender)
        validateDecreaseAvailableCollateral(params.amount)
        
        # adjust ledger
        self.data.availableCollateral -= params.amount # need to do safe_math
        sendFunds(self.data.issuer, params.amount)

    # @param ()
    #  
    @sp.entry_point
    def forceLiquidation(self, params):
        pass

    # @param baker The new baker to delegate to
    # Contract administrator can change delegate.
    @sp.entry_point
    def setDelegate(self, params):
        validateBaker(params.baker)
        self.data.baker = params.baker
        sp.set_delegate(params.baker)

    # @param admin The new administrator
    # Sets a new administrator for the instrument.
    @sp.entry_point
    def setAdministrator(self, params):
        self.validateAdministrator(sp.sender)
        self.data.administrator = params.admin

    # @param ()
    # 
    @sp.entry_point
    def getBalance(self, params):
        pass

    # @param ()
    # 
    @sp.entry_point
    def getAllowance(self, params):
        pass

    # @param ()
    # 
    @sp.entry_point
    def getTotalSupply(self, params):
        pass

    # @param ()
    # 
    @sp.entry_point
    def getAdministrator(self, params):
        pass

    # @param ()
    # 
    def addAddressIfNecessary(self, address):
        sp.if ~ self.data.balances.contains(address):
            self.data.balances[address] = sp.record(balance = 0, approvals = {})

    def calculatePeriods(self, length):
        # truncate length to instrument's duration if longer (payouts stop at expiration)
        sp.if length > self.data.duration:
            length = self.data.duration
        return (length / self.data.interval)

    # @param xtzAmount
    # @param periods
    # Calculate the yield for 'xtzAmount' in 'periods'
    def calculateYield(self, xtzAmount, periods):
        discount = self.data.discountSchedule[periods] 
        total = xtzAmount / discount
        return total - xtzAmount

    # @param tokenAmount
    # @param periods
    # Calculate the payout for 'tokenAmount' after 'periods'
    def calculatePayout(self, tokenAmount, periods):
        # calculate yield for full length of instrument
        actualPayout = tokenAmount * self.data.discountSchedule[periods]
        spare = tokenAmount - actualPayout
        return actualPayout, spare

    # @param xtzAmount The amount of XTZ being deposited
    # Validate that 'xtzAmount' can be covered by the instrument's currently available collateral
    def validateDepositAmount(self, xtzAmount):
        sp.verify(calculateYield(xtzAmount) <= self.data.availableCollateral, "Insufficient collateral")

    # @param account The withdrawing account
    # @param tokenAmount The amount of tokens being withdrawn
    # Validate that 'account' can withdraw 'tokenAmount' of tokens.
    def validateWithdrawalAmount(self, account, tokenAmount):
        sp.verify(self.data.balances.contains(account), "Address has no token balance")
        sp.verify(self.self.data.balances[account].balance >= tokenAmount,
            "Address does not have enough tokens")

    # @param txSender The address originating the transfer
    # @param transferFrom The owner of the tokens being transferred
    # @param tokenAmount The amount of tokens being transferred
    # Validate that a token transfer
    def validateTransfer(self, txSender, transferFrom, tokenAmount):
        sp.verify((sp.sender == self.data.administrator) |
            ((params.f == sp.sender) |
                 (self.data.balances[params.f].approvals[sp.sender] >= params.amount)), 
            "Invalid transfer")

    def validateBaker(self, baker):
        sp.verify(baker != self.data.baker, "Baker already set.")

@sp.add_test("RiskFreeInvestmentInstrument")
def test():
    scenario = sp.test_scenario()
    scenario.h1("Trustless Delegation Bond Tests")

    discountSchedule = {0 : 952380, 1 : 957557, 2 : 962763, 3 : 967996, 4 : 973258, 5 : 978548, 6 : 983868, 7 : 989216,
8 : 994593, 9 : 1000000}
    duration = 60*60*24*10
    interval = 60*60*24
    baker = sp.address("tz1aoLg7LtcbwJ2a7kfMj9MhUDs3fvehw6aa")

    # init contract
    instrument = Instrument(discountSchedule, duration, interval, baker)
    scenario += instrument
    
