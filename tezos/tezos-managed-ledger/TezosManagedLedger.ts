import { TezosNodeWriter, StoreType, TezosParameterFormat } from 'conseiljs';

const tezosNode = 'https://tezos-dev.cryptonomic-infra.tech/';

const keystore = {
    publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
    privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
    publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
    seed: '',
    storeType: StoreType.Fundraiser
};

const contractAddress = 'KT1Myqcyxp8MNgdB1aAhMpBApZHgVJ634nhm'; // Tezos Managed Ledger - Alphanet Modified
                     // 'KT1DhPDy765YJwPRY8fRupSZQ3SjuxVvoUYd'; // Tezos Managed Ledger - Alphanet Original

// Implementation of FA1.2

/**
 * Sends the given amount of tokens from one address to another address.
 * 
 * @param from - The address of the account from which the tokens are sent
 * @param to - The address of the account to which the tokens are sent
 * @param value - The amount of tokens to send
 */
export async function transfer(from: string, to: string, value: number) {
    const parameter = 'Left (Pair '+ from + ' (Pair ' + to + ' ' + value + '))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * Allows another account to withdraw from your account, multiple times, up to the given amount.
 * If this function is called again it overwrites the current allowance with the new given amount.
 * 
 * @param spender - The address of the account that can withdraw from your account
 * @param value - The amount of allowance given to the spender
 */
export async function approve(spender: string, value: number) {
    const parameter = 'Right (Left (Pair ' + spender + ' ' + value + '))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * Returns the amount which an account is still allowed to withdraw from another account to a receiving smart contract.
 * 
 * @param owner - The address of the account providing the allowance
 * @param spender - The address of the account receiving the allowance
 * @param remaining - A contract of type nat
 */
export async function getAllowance(owner: string, spender: string, remaining: string) {
    const parameter = 'Right (Right (Left (Pair (Pair ' + owner + ' ' + spender + ') ' + remaining + '))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * Returns the account balance of an account with the given address to a receiving smart contract.
 * 
 * @param owner - The address of the account from which the account balance is retrieved
 * @param balance - A contract of type nat
 */
export async function getBalance(owner: string, balance: string) {
    const parameter = 'Right (Right (Right (Left (Pair ' + owner + ' ' + balance + '))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * Returns the total token supply to a receiving smart contract.
 * 
 * @param totalSupply - A contract of type nat
 */
export async function getTotalSupply(totalSupply: number) {
    const parameter = 'Right (Right (Right (Right (Left (Pair Unit ' + totalSupply + ')))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

// Additional operations

/**
 * Pauses operations when the parameter is True, and resumes them when the parameter is False.
 * During the pause, no contract can perform transfer or approval operations.
 * The administrator is still allowed to perform his operations.
 * 
 * @param pause - Whether the blockchain is frozen or not
 */
export async function setPause(pause: boolean) {
    const input = String(pause).charAt(0).toUpperCase() + String(pause).slice(1);
    const parameter = 'Right (Right (Right (Right (Right (Left ' + input + ')))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * Changes the current administrator.
 * 
 * @param administrator - The address of the new administrator
 */
export async function setAdministrator(administrator: string) {
    const parameter = 'Right (Right (Right (Right (Right (Right (Left ' + administrator + '))))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * Returns the address of the current administrator to a receiving smart contract.
 * 
 * @param administrator - A contract of type string
 */
export async function getAdministrator(administrator: string) {
    const parameter = 'Right (Right (Right (Right (Right (Right (Right (Left (Pair Unit ' + administrator + '))))))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * Produces the given amount of tokens on the account associated with the given address.
 * 
 * @param to - The address to which the newly minted tokens are sent
 * @param value - The amount of tokens to mint
 */
export async function mint(to: string, value: number) {
    const parameter = 'Right (Right (Right (Right (Right (Right (Right (Right (Left (Pair ' + to + ' ' + value + ')))))))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * Destroys the given amount of tokens on the account associated with the given address.
 * 
 * @param from - The account from which the tokens are destroyed
 * @param value - The amount of tokens to destroy
 */
export async function burn(from: string, value: number) {
    const parameter = 'Right (Right (Right (Right (Right (Right (Right (Right (Right (Left (Pair ' + from + ' ' + value + '))))))))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 300000, '', 55392, 504382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}