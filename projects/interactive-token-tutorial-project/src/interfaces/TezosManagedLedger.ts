import { TezosNodeWriter, TezosParameterFormat, ConseilServerInfo } from 'conseiljs';
import * as StorageProcessor from '../utilities/StorageProcessor'
import { operationArguments, operationResult } from '../utilities/OperationInformation'

// <!-- Implementation of FA1.2 -->

/**
 * Sends the given amount of tokens from one address to another address.
 * 
 * @param from - The address of the account from which the tokens are sent
 * @param to - The address of the account to which the tokens are sent
 * @param value - The amount of tokens to send
 */
export async function transfer(from: string, to: string, value: number, opArgs: operationArguments): Promise<operationResult> {
    const parameter = 'Left (Pair "' + from + '" (Pair "' + to + '" ' + value + '))';
    return await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
}

/**
 * Allows another account to withdraw from your account, multiple times, up to the given amount.
 * If this function is called again it overwrites the current allowance with the new given amount.
 * 
 * @param spender - The address of the account that can withdraw from your account
 * @param value - The amount of allowance given to the spender
 */
export async function approve(spender: string, value: number, opArgs: operationArguments): Promise<operationResult> {
    const parameter = 'Right (Left (Pair "' + spender + '" ' + value + '))';
    return await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
}

/**
 * Returns the amount which an account is still allowed to withdraw from another account to a receiving smart contract.
 * 
 * @param owner - The address of the account providing the allowance
 * @param spender - The address of the account receiving the allowance
 * @param remaining - A contract of type nat
 */
export async function getAllowance(owner: string, spender: string, remaining: string, opArgs: operationArguments): Promise<operationResult> {
    const parameter = 'Right (Right (Left (Pair (Pair "' + owner + '" "' + spender + '") ' + remaining + '))))';
    return await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
}

/**
 * Returns the account balance of an account with the given address to a receiving smart contract.
 * 
 * @param owner - The address of the account from which the account balance is retrieved
 * @param balance - A contract of type nat
 */
export async function getBalance(owner: string, balance: string, opArgs: operationArguments): Promise<operationResult> {
    const parameter = 'Right (Right (Right (Left (Pair "' + owner + '" ' + balance + '))))';
    return await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
}

/**
 * Returns the total token supply to a receiving smart contract.
 * 
 * @param totalSupply - A contract of type nat
 */
export async function getTotalSupply(totalSupply: number, opArgs: operationArguments): Promise<operationResult> {
    const parameter = 'Right (Right (Right (Right (Left (Pair Unit ' + totalSupply + ')))))';
    return await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
}

// <!-- Additional operations -->

/**
 * Pauses operations when the parameter is True, and resumes them when the parameter is False.
 * During the pause, no contract can perform transfer or approval operations.
 * The administrator is still allowed to perform his operations.
 * 
 * @param pause - The pause state of operations
 */
export async function setPause(pause: boolean, opArgs: operationArguments): Promise<operationResult> {
    const input = String(pause).charAt(0).toUpperCase() + String(pause).slice(1);
    const parameter = 'Right (Right (Right (Right (Right (Left ' + input + ')))))';
    return await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
}

/**
 * Changes the current administrator.
 * 
 * @param administrator - The address of the new administrator
 */
export async function setAdministrator(administrator: string, opArgs: operationArguments): Promise<operationResult> {
    const parameter = 'Right (Right (Right (Right (Right (Right (Left "' + administrator + '"))))))';
    return await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
}

/**
 * Returns the address of the current administrator to a receiving smart contract.
 * 
 * @param administrator - A contract of type string
 */
export async function getAdministrator(administrator: string, opArgs: operationArguments): Promise<operationResult> {
    const parameter = 'Right (Right (Right (Right (Right (Right (Right (Left (Pair Unit "' + administrator + '"))))))))';
    return await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
}

/**
 * Produces the given amount of tokens on the account associated with the given address.
 * 
 * @param to - The address to which the newly minted tokens are sent
 * @param value - The amount of tokens to mint
 */
export async function mint(to: string, value: number, opArgs: operationArguments): Promise<operationResult> {
    const parameter = 'Right (Right (Right (Right (Right (Right (Right (Right (Left (Pair "' + to + '" ' + value + ')))))))))';
    return await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
}

/**
 * Destroys the given amount of tokens on the account associated with the given address.
 * 
 * @param from - The account from which the tokens are destroyed
 * @param value - The amount of tokens to destroy
 */
export async function burn(from: string, value: number, opArgs: operationArguments): Promise<operationResult> {
    const parameter = 'Right (Right (Right (Right (Right (Right (Right (Right (Right (Pair "' + from + '" ' + value + ')))))))))';
    return await TezosNodeWriter.sendContractInvocationOperation(opArgs.server, opArgs.keyStore, opArgs.to, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
}

// <!-- View Storage Functions -->

// Storage elements of a Tezos Managed Ledger
interface tokenStorage {
    ledger: string;
    admin: string;
    paused: string;
    totalSupply: string;
}

/**
 * Gets the entire contents of storage.
 * 
 * @param contractAddress - The address of a Tezos Managed Ledger smart contract
 * @param conseilServer - Information for querying a Conseil server
 * @param network - The Tezos network on which the Tezos Managed Ledger is deployed
 * @returns The entire contents of storage
 */
export async function viewStorage(contractAddress: string, conseilServer: ConseilServerInfo, network: string): Promise<tokenStorage> {
    const storage: string[] = await StorageProcessor.processStorage(contractAddress, conseilServer, network);
    const formattedStorage: tokenStorage = { ledger: storage[0], admin: storage[1], paused: storage[2], totalSupply: storage[3] }
    return formattedStorage;
}

/**
 * Gets the token allowance permitted by a given account to the sender.
 * 
 * @param address - The account permitting the token allowance to the sender
 * @param contractAddress - The address of a Tezos Managed Ledger smart contract
 * @param conseilServer - Information for querying a Conseil server
 * @param network - The Tezos network on which the Tezos Managed Ledger is deployed
 * @returns The token allowance permitted by a given account to the sender
 */
export async function viewAllowance(address: string, contractAddress: string, conseilServer: ConseilServerInfo, network: string): Promise<string> {
    const storage: string[] = await StorageProcessor.processStorage(contractAddress, conseilServer, network);
    const ledger: Map<string, string> = StorageProcessor.processMap(storage[0]);
    const account: string = ledger.get(address) as string;
    const allowance: string = StorageProcessor.processElement(account, 1);
    return allowance;
}

/**
 * Gets the token balance of a given account.
 * 
 * @param address - The account from which the token balance is retrieved
 * @param contractAddress - The address of a Tezos Managed Ledger smart contract
 * @param conseilServer - Information for querying a Conseil server
 * @param network - The Tezos network on which the Tezos Managed Ledger is deployed
 * @returns The token balance of a given account
 */
export async function viewBalance(address: string, contractAddress: string, conseilServer: ConseilServerInfo, network: string) {
    const storage: string[] = await StorageProcessor.processStorage(contractAddress, conseilServer, network);
    const ledger: Map<string, string> = StorageProcessor.processMap(storage[0]);
    const account: string = ledger.get(address) as string;
    const balance: string = StorageProcessor.processElement(account, 0);
    return balance;
}

/**
 * Gets the total supply of tokens.
 * 
 * @param contractAddress - The address of a Tezos Managed Ledger smart contract
 * @param conseilServer - Information for querying a Conseil server
 * @param network - The Tezos network on which the Tezos Managed Ledger is deployed
 * @returns The total supply of tokens
 */
export async function viewTotalSupply(contractAddress: string, conseilServer: ConseilServerInfo, network: string) {
    const storage: string[] = await StorageProcessor.processStorage(contractAddress, conseilServer, network);
    return storage[3];
}

/**
 * Gets the pause state.
 * 
 * @param contractAddress - The address of a Tezos Managed Ledger smart contract
 * @param conseilServer - Information for querying a Conseil server
 * @param network - The Tezos network on which the Tezos Managed Ledger is deployed
 * @returns The pause state
 */
export async function viewPaused(contractAddress: string, conseilServer: ConseilServerInfo, network: string) {
    const storage: string[] = await StorageProcessor.processStorage(contractAddress, conseilServer, network);
    return storage[2];
}

/**
 * Gets the address of the administrator.
 * 
 * @param contractAddress - The address of a Tezos Managed Ledger smart contract
 * @param conseilServer - Information for querying a Conseil server
 * @param network - The Tezos network on which the Tezos Managed Ledger is deployed
 * @returns The address of the administrator
 */
export async function viewAdministrator(contractAddress: string, conseilServer: ConseilServerInfo, network: string) {
    const storage: string[] = await StorageProcessor.processStorage(contractAddress, conseilServer, network);
    return storage[1];
}