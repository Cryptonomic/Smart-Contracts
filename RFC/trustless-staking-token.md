# Trustless Staking Token – a decentralized financial instrument

## February 2020

#### Mike Radin, Cryptonomic Inc ([@dsintermediatd](https://twitter.com/dsintermediatd))

#### With contributions from Keefer Taylor, Vishakh, Itamar Reif, et al.

# Abstract

The Tezos chain has some unique features that make DeFi instruments easier to implement in a trustless, fully decentralized manner.

This paper explores a design for a synthetic financial product based on stake delegation<sup>[9]</sup> rewards process that is intrinsic to the Tezos platform. This instrument has several features to make it appealing to various classes of investors and serves to demonstrate the vibrant possibilities blockchain-based finance makes possible. This smart contract, henceforth referred to as "Trustless Staking Token" or "TST", has the following properties:

*   Guaranteed returns
*   Fully unsupervised life-cycle
*   Tokenized
*   Independent of external information

# Motivation

Like other decentralized blockchains, Tezos maintains security through inflationary<sup>[1]</sup> rewards for block producers<sup>[2]</sup>. Any account holding a balance can assign the rights to a validator without releasing direct control of the funds. Through this process validators can accumulate a larger "delegated stake" which increases the number of blocks they create or validate thereby increasing their rewards. Presently there is a social contract in place on the Tezos network by which these validators share a large share of these rewards with the people delegating their balances. These payout commitments to the delegating accounts are not guaranteed by the protocol<sup>[3]</sup>.

Delegators take on two risks with their validator. First, they assume their validator is technically competent and able to obtain the maximum possible rewards, and secondly, they assume their validator is honest and will pay them the share of rewards they have been promised. In the early days of the Tezos network, bakers ran on reputation and thus delegators were relatively assured of protection against technical incompetence and bad actors. As the network grows, these risks for delegators grow as well. 

Insurance services appeared to mitigate this problem. These businesses will step in to cover any missed returns on behalf of a validator that pays fees to the insurer. This process however is off-chain and operated by direct human interaction. TST in contrast creates a trustless, unsupervised mechanism that among other things achieves the same goal.

Other interest-bearing blockchain-based instruments exist. To the best of our knowledge the contract described here is the only example of a fully-trustless design. This contract does not use oracle services, it does not allow the administrator any control over the life-cycle that would impact investor returns or access to funds. Such limitations could be added for deployments where they are desirable.

# Design

The TST smart contract is deployed by an issuer with some balance which will serve as the escrowed guarantee of investor returns. This contract will be delegated to some validator the issuer deems reliable. Several contract parameters are set up front. Discounted rate table, which determines the return investors get. The initial balance is the limiting factor for the amount of investment the contract can accept. For example an instance deployed with 1000 XTZ and a 5% return over one year can support up to 20,000 XTZ in investment. Accounts making deposits into the contract will receive a number of tokens with a 1:1 peg to XTZ at expiration – nominally 105% of the invested balance. Given that on-chain floating point math is difficult, the contract will be deployed with a discount table that would associate a payout rate in XTZ against a single token at a given compounding interval. Essentially this means that each token is worth a fixed amount at any given period of time, and they mature to be worth 1XTZ at expiration. 

Other deployment parameters are administrator address which is expected to be the issuer address<sup>[4]</sup>, duration and compounding interval<sup>[5]</sup>. 

During the validity period, the issuer cannot withdraw the escrowed funds. The issuer is never able to withdraw invested funds. The issuer cannot manually reassign token balances within the contract. At any point during the life-cycle of the instrument investors can withdraw their XTZ by swapping their tokens for XTZ at the token’s current value. At or post expiration the investor would receive the full interest, in this example 5%. Tokens are only minted to addresses making deposits and cannot be created or burned manually.

The above explains the simplest scenario for TST, but other features allow for a richer product. This design is intended for public blockchain deployments, as such it specifically excludes functionality that would give the contract administrator undue control over token balances and funds which may endanger investor rights.

# Interaction Mechanics

## Issuance

Using the example above any chain participant can deploy this contract to create a leveraged position in XTZ. Origination parameters are validity period, expiration rate of return and the address of the validator the contract will be delegated to initially and the reward payout address. The last parameter is necessary to distinguish between payout deposits and investment deposits. The investment capacity is derived from the balance the contract is deployed with and the rate of return. An instrument guaranteeing 5% that is deployed with a 1,000 XTZ balance will have the capacity of 20,000 XTZ.

## Investment

An investor would execute an operation against the contract to transfer an XTZ balance to it. The contract will record the deposit against the investors address, lock an appropriate amount of escrow on the assumption that the investor will hold the position to maturity, and finally issue a prorated amount of tokens to the investor address with a total value discounted to 1:1 to XTZ at expiration. Such valuation of the token allows the investor to open and close positions in the contract without concern for the final XTZ balance at contract expiration or position liquidation, whichever comes first.

The contract will reject and automatically refund a deposit if the available escrow balance has been exhausted. Note however that as delegation rewards are deposited into the contract from the predefined payout account can act to increase this escrow opening up additional investment.

## Balance Transfer

Lacking a readily available market for Tezos-based tokens, over-the-counter token trading would be the only way for two investors to trade. Settlement would happen outside of the contract's purview, but the balance assignment must happen inside. In this case the original investor will invoke a contract method to transfer some or all of their token balance to another account. Because these balances are discounted to present value the number of tokens sent from the seller is the same as the number of tokens received by the buyer. As stated in the 'Investment' section this allows either party to increase or decrease token holdings at will while maintaining accurate market value in XTZ.

## Termination & Withdrawal

The contract of the design described here is intended for deployment on a public blockchain. Some decisions were made specifically to increase appeal to the users participating on such chains. Withdrawal is one such function. Investors can redeem their token balances, partially or in full to XTZ at any point during the lifetime of the contract. Early withdrawal would result in partial returns being transmitted to the investor in addition to their principal. Investors are also free to re-enter the contract after closing their position.

The issuer has the ability to terminate the contract after expiration, redeeming all tokens for XTZ and depositing the appropriate returns into the investor accounts. This action would also unlock the issuer escrow allowing them to withdraw the remaining XTZ balance.

## Interest Accrual

Under normal circumstances the contract will receive delegation rewards from the designated validator. Incoming deposits will be checked against the expected reward distribution address to maintain balances correctly. Deposits coming into the contract from other sources are treated as investments.

The issuer may decide to change the validator throughout the validity period of the contract. This would likely occur if the current validator is not depositing rewards as expected or a different validator is now offering a better return. Changing the validator has no implications for the investors as their return is already guaranteed but this may improve issuer profits or limit their losses.

# Guarantees

It is worth itemizing the security features of this contract.

*   Issuer guarantees the return by provably locking the maximum interest amount at contract origination.
*   Issuer does not have the ability to withdraw any part of the escrow while the contract is active<sup>[6]</sup>.
*   Issuer does not have the ability to withdraw investor funds.
*   Issuer cannot change token balances of investors.
*   Invested funds can only be returned to the original account they were invested from.
*   Invested funds can be withdrawn at any time before or after maturity.
*   The contract is autonomous – it does not require manual administration for investors to gain access to their principal funds and returns.

# Incentives

Guaranteed returns are the headline feature of this instrument. While a large portion of blockchain early adopters may scoff at the idea of foregoing the maximum possible yield, there is a range of risk-sensitive institutions that will find this feature appealing. The hope is that traditionally conservative funds like retirement administrators will see the value of blockchain investment with this contract and this will in turn broaden blockchain adoption in traditional finance.

Additionally the simple fact that the returns are tied to a normal calendar<sup>[10]</sup>, not a blockchain-specific construct like a “cycle”, makes investment easier to understand to a larger set of people. Instead of learning the intricacies of Tezos chain mechanics they may simply view this instrument like a more flexible CD<sup>[7]</sup>.

This instrument also helps validators smooth out their returns. Presently a protocol upgrade is undergoing a vote process on Tezos that will make short-term inflationary returns smaller while maintaining a similar long-term target. By using this contract instead of direct delegation, smaller validators, who would be impacted the most by this change, can entice more delegators.

Lastly, delegation rewards in Tezos start on a 12-cycle delay and end with 5-cycle back-log. This means that under normal circumstances an account won't receive any rewards until that delay has passed. Once the account ceases to delegate to the given validator, the rewards will keep on arriving for five additional cycles, making it difficult to close a position or transfer the entirety of the XTZ balance to a different asset. This instrument solves that problem.

# Implications

TST makes blockchain investment more conceptually accessible to people who already understand traditional finance. It reduces the learning curve and allows investors to think about financial concepts instead of blockchain ones.

For the people already excited about blockchains in general and Tezos specifically, TST represents the first purely chain-based financial instrument. There are other tokens deployed on the Tezos platform, but they are not financial instruments. There are other financial instruments deployed on other blockchains but they require off-chain processing for lifecycle management via the use of oracles. Of course since TST is implemented as a token, it opens the door to higher order derivatives.

The regulatory challenges this instrument creates are not novel. What is new is the sophisticated financial characteristics and simplicity of life-cycle management that make it more appealing for blockchain participants to deploy and use.

For validators, this contract allows for simpler payout management. Now, many delegators can receive rewards via this contract as a proxy reducing the number of individual transactions the validator has to execute, which saves fees and increases profits. Investors might also delegate longer as there is now some additional friction to withdrawing their funds to spend them.

Not all implications are strictly positive. Some chain participants may balk at the loss of direct control of their balance, but the contract can be verified to confirm that the balance will be returned at some point during its life.

TST has interesting side effects specifically for the Tezos governance platform. A validator may deploy a version of this contract offering larger than normal returns in order to accumulate a larger stake to vote against<sup>[8]</sup> a particular chain upgrade proposal. In this case the issuer does not make money, but they are able to accumulate stake cheaply.

# Other Features

The contract described here explicitly omits certain functionality which would be useful in non-decentralized deployments. It would be trivial to expand this contract to include investor white-listing and forcible liquidation which may be required for KYC/AML and other regulatory reasons. The latter behavior is actually already present, but is intentionally limited by confirming expiration. The token is also always active, some contract conventions allow the administrator to deactivate token operations by its investors.

Economics of TST can be easily modified. Early withdrawals by investors could be disincentivized by adjusting the discount table the contract is deployed with. Payout structure can be changed to lock the invested funds until after expiration.

# Reference Implementation

The work is on-going and can be reviewed on [GitHub](https://github.com/Cryptonomic/Smart-Contracts).

---

1. Every cycle, 4096 blocks, up to 327,680 XTZ is minted in the form of block rewards to the validators assuming honest behavior. While these rewards are inflationary in nature there is no evidence thus far that the exchange rate to sovereign currencies is affected by this value creation.
2. Certain terminology and aspects of the Tezos chain are omitted in the paper to make it more broadly accessible. See [Tezos documentation](https://tezos.gitlab.io/index.html) for those details.
3. At present many validators run scripts that automatically calculate and submit reward shares to the "delegators". This is the most popular dApp use-case on Tezos.
4. The contract code can be deployed by an account other than the issuer/administrator.
5. Block rewards are generated, though not released at the beginning of every cycle. The validator account is credited on a 5-cycle delay. Compounding period should have a minimum duration of one cycle which is 68+ hours at the current 60-second block time.
6. This condition can be relaxed without loss of safety, but is left in place to simplify contract logic.
7. Albeit a CD tied to a potentially highly volatile crypto-currency.
8. All proposals on Tezos thus far have passed with overwhelming support and little to no dissent.
9. Tezos refers to their design as “Liquid Proof of Stake”.
10. The Michelson smart contract language has a `NOW` directive.
