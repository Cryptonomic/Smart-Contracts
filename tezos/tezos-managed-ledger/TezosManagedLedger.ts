import { TezosNodeWriter, TezosParameterFormat } from 'conseiljs';
import * as StorageProcessor from '../utilities/StorageProcessor'
import { operationArguments } from '../utilities/OperationArguments'

// Implementation of FA1.2

/**
 * Sends the given amount of tokens from one address to another address.
 * 
 * @param from - The address of the account from which the tokens are sent
 * @param to - The address of the account to which the tokens are sent
 * @param value - The amount of tokens to send
 */
export async function transfer(from: string, to: string, value: number, opArgs: operationArguments) {
    const parameter = 'Left (Pair ' + from + ' (Pair ' + to + ' ' + value + '))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * Allows another account to withdraw from your account, multiple times, up to the given amount.
 * If this function is called again it overwrites the current allowance with the new given amount.
 * 
 * @param spender - The address of the account that can withdraw from your account
 * @param value - The amount of allowance given to the spender
 */
export async function approve(spender: string, value: number, opArgs: operationArguments) {
    const parameter = 'Right (Left (Pair ' + spender + ' ' + value + '))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * Returns the amount which an account is still allowed to withdraw from another account to a receiving smart contract.
 * 
 * @param owner - The address of the account providing the allowance
 * @param spender - The address of the account receiving the allowance
 * @param remaining - A contract of type nat
 */
export async function getAllowance(owner: string, spender: string, remaining: string, opArgs: operationArguments) {
    const parameter = 'Right (Right (Left (Pair (Pair ' + owner + ' ' + spender + ') ' + remaining + '))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * Returns the account balance of an account with the given address to a receiving smart contract.
 * 
 * @param owner - The address of the account from which the account balance is retrieved
 * @param balance - A contract of type nat
 */
export async function getBalance(owner: string, balance: string, opArgs: operationArguments) {
    const parameter = 'Right (Right (Right (Left (Pair ' + owner + ' ' + balance + '))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * Returns the total token supply to a receiving smart contract.
 * 
 * @param totalSupply - A contract of type nat
 */
export async function getTotalSupply(totalSupply: number, opArgs: operationArguments) {
    const parameter = 'Right (Right (Right (Right (Left (Pair Unit ' + totalSupply + ')))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
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
export async function setPause(pause: boolean, opArgs: operationArguments) {
    const input = String(pause).charAt(0).toUpperCase() + String(pause).slice(1);
    const parameter = 'Right (Right (Right (Right (Right (Left ' + input + ')))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * Changes the current administrator.
 * 
 * @param administrator - The address of the new administrator
 */
export async function setAdministrator(administrator: string, opArgs: operationArguments) {
    const parameter = 'Right (Right (Right (Right (Right (Right (Left ' + administrator + '))))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * Returns the address of the current administrator to a receiving smart contract.
 * 
 * @param administrator - A contract of type string
 */
export async function getAdministrator(administrator: string, opArgs: operationArguments) {
    const parameter = 'Right (Right (Right (Right (Right (Right (Right (Left (Pair Unit ' + administrator + '))))))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * Produces the given amount of tokens on the account associated with the given address.
 * 
 * @param to - The address to which the newly minted tokens are sent
 * @param value - The amount of tokens to mint
 */
export async function mint(to: string, value: number, opArgs: operationArguments) {
    const parameter = 'Right (Right (Right (Right (Right (Right (Right (Right (Left (Pair ' + to + ' ' + value + ')))))))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * Destroys the given amount of tokens on the account associated with the given address.
 * 
 * @param from - The account from which the tokens are destroyed
 * @param value - The amount of tokens to destroy
 */
export async function burn(from: string, value: number, opArgs: operationArguments) {
    const parameter = 'Right (Right (Right (Right (Right (Right (Right (Right (Right (Pair ' + from + ' ' + value + ')))))))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

// View storage

interface tokenStorage {
    ledger: string;
    admin: string;
    paused: string;
    totalSupply: string;
}

export async function viewStorage(opArgs: operationArguments) {
    const storage: string[] = await StorageProcessor.processStorage(opArgs.to);
    const formattedStorage: tokenStorage = { ledger: storage[0], admin: storage[1], paused: storage[2], totalSupply: storage[3] }
    console.log(formattedStorage);
    return formattedStorage;
}

export async function viewAllowance(address: string, opArgs: operationArguments) {
    const storage: string[] = await StorageProcessor.processStorage(opArgs.to);
    const ledger: Map<string, string> = StorageProcessor.processMap(storage[0]);
    const account: string = ledger.get(address) as string;
    const allowance: string = StorageProcessor.processElement(account, 1);
    console.log("Allowance of " + address + ": " + allowance);
    return allowance;
}

export async function viewBalance(address: string, opArgs: operationArguments) {
    const storage: string[] = await StorageProcessor.processStorage(opArgs.to);
    const ledger: Map<string, string> = StorageProcessor.processMap(storage[0]);
    console.log(ledger);
    const account: string = ledger.get(address) as string;
    const balance: string = StorageProcessor.processElement(account, 0);
    console.log("Balance of " + address + ": " + balance);
    return balance;
}

export async function viewTotalSupply(opArgs: operationArguments) {
    const storage: string[] = await StorageProcessor.processStorage(opArgs.to);
    console.log("Total Supply: " + storage[3]);
    return storage[3];
}

export async function viewPaused(opArgs: operationArguments) {
    const storage: string[] = await StorageProcessor.processStorage(opArgs.to);
    console.log("Paused: " + storage[2]);
    return storage[2];
}

export async function viewAdmin(opArgs: operationArguments) {
    const storage: string[] = await StorageProcessor.processStorage(opArgs.to);
    console.log("Admin: " + storage[1]);
    return storage[1];
}