import { TezosNodeWriter, TezosParameterFormat, ConseilServerInfo, OperationResult, KeyStore } from 'conseiljs';
import fs from 'fs';
import * as StorageProcessor from '../utilities/StorageProcessor'
import { InvocationArguments } from '../utilities/InvocationArguments';

/**
 * Deploys an instance of the Tezos Managed Ledger.
 * 
 * @param {string} initialStorage - The initial storage in Michelson
 * @param {string} tezosNode - The URL of the Tezos node to connect to
 * @param {KeyStore} keyStore - The sender's key store with key pair and public key hash
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function deployContract(initialStorage: string = 'Pair {} (Pair "tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z" (Pair False 0))', tezosNode: string, keyStore: KeyStore): Promise<OperationResult> {
    const contractCode: string = fs.readFileSync('tezos-managed-ledger.tz','utf8');
    return await TezosNodeWriter.sendContractOriginationOperation(tezosNode, keyStore, 0, undefined, false, true, 100000, '', 1000, 100000, contractCode, initialStorage, TezosParameterFormat.Michelson);
}

// <!-- Implementation of FA1.2 -->

/**
 * Sends the given amount of tokens from one address to another address.
 * 
 * @param {string} from - The address of the account from which the tokens are sent
 * @param {string} to - The address of the account to which the tokens are sent
 * @param {number} value - The amount of tokens to send
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function transfer(from: string, to: string, value: number, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Left (Pair "' + from + '" (Pair "' + to + '" ' + value + '))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 150000, '', 5392, 144382, parameters, TezosParameterFormat.Michelson);
}

/**
 * Allows another account to withdraw from your account, multiple times, up to the given amount.
 * If this function is called again it overwrites the current allowance with the new given amount.
 * 
 * @param {string} spender - The address of the account that can withdraw from your account
 * @param {number} value - The amount of allowance given to the spender
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function approve(spender: string, value: number, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Left (Pair "' + spender + '" ' + value + '))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 150000, '', 5392, 144382, parameters, TezosParameterFormat.Michelson);
}

/**
 * Returns the amount which an account is still allowed to withdraw from another account to a receiving smart contract.
 * 
 * @param {string} owner - The address of the account providing the allowance
 * @param {string} spender - The address of the account receiving the allowance
 * @param {string} remaining - A contract of type nat
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function getAllowance(owner: string, spender: string, remaining: string, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Right (Left (Pair (Pair "' + owner + '" "' + spender + '") ' + remaining + '))))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 150000, '', 5392, 144382, parameters, TezosParameterFormat.Michelson);
}

/**
 * Returns the account balance of an account with the given address to a receiving smart contract.
 * 
 * @param {string} owner - The address of the account from which the account balance is retrieved
 * @param {string} balance - A contract of type nat
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function getBalance(owner: string, balance: string, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Right (Right (Left (Pair "' + owner + '" ' + balance + '))))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 150000, '', 5392, 144382, parameters, TezosParameterFormat.Michelson);
}

/**
 * Returns the total token supply to a receiving smart contract.
 * 
 * @param {number} totalSupply - A contract of type nat
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function getTotalSupply(totalSupply: number, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Right (Right (Right (Left (Pair Unit ' + totalSupply + ')))))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 150000, '', 5392, 144382, parameters, TezosParameterFormat.Michelson);
}

// <!-- Additional operations -->

/**
 * Pauses operations when the parameter is True, and resumes them when the parameter is False.
 * During the pause, no contract can perform transfer or approval operations.
 * The administrator is still allowed to perform his operations.
 * 
 * @param {string} pause - The pause state of operations
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function setPause(pause: boolean, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const input = String(pause).charAt(0).toUpperCase() + String(pause).slice(1);
    const parameters: string = 'Right (Right (Right (Right (Right (Left ' + input + ')))))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 150000, '', 5392, 144382, parameters, TezosParameterFormat.Michelson);
}

/**
 * Changes the current administrator.
 * 
 * @param {string} administrator - The address of the new administrator
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function setAdministrator(administrator: string, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Right (Right (Right (Right (Right (Left "' + administrator + '"))))))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 150000, '', 5392, 144382, parameters, TezosParameterFormat.Michelson);
}

/**
 * Returns the address of the current administrator to a receiving smart contract.
 * 
 * @param {string} administrator - A contract of type string
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function getAdministrator(administrator: string, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Right (Right (Right (Right (Right (Right (Left (Pair Unit "' + administrator + '"))))))))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 150000, '', 5392, 144382, parameters, TezosParameterFormat.Michelson);
}

/**
 * Produces the given amount of tokens on the account associated with the given address.
 * 
 * @param {string} to - The address to which the newly minted tokens are sent
 * @param {number} value - The amount of tokens to mint
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function mint(to: string, value: number, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Right (Right (Right (Right (Right (Right (Right (Left (Pair "' + to + '" ' + value + ')))))))))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 150000, '', 5392, 144382, parameters, TezosParameterFormat.Michelson);
}

/**
 * Destroys the given amount of tokens on the account associated with the given address.
 * 
 * @param {string} from - The account from which the tokens are destroyed
 * @param {number} value - The amount of tokens to destroy
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function burn(from: string, value: number, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Right (Right (Right (Right (Right (Right (Right (Right (Pair "' + from + '" ' + value + ')))))))))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 150000, '', 5392, 144382, parameters, TezosParameterFormat.Michelson);
}

// <!-- View Storage Functions -->

// Storage elements of a Tezos Managed Ledger
interface TokenStorage {
    ledger: string;
    admin: string;
    paused: string;
    totalSupply: string;
}

/**
 * Gets the entire contents of storage.
 * 
 * @param {string} contractAddress - The address of a Tezos Managed Ledger smart contract
 * @param {ConseilServerInfo} conseilServer - Information for querying a Conseil server
 * @param {string} network - The Tezos network on which the Tezos Managed Ledger is deployed
 * @returns {Promise<TokenStorage>} The entire contents of storage
 */
export async function viewStorage(contractAddress: string, conseilServer: ConseilServerInfo, network: string): Promise<TokenStorage> {
    const storage: string[] = await StorageProcessor.processStorage(contractAddress, conseilServer, network);
    const formattedStorage: TokenStorage = { ledger: storage[0], admin: storage[1], paused: storage[2], totalSupply: storage[3] }
    return formattedStorage;
}

/**
 * Gets the token allowance permitted by a given account to the sender.
 * 
 * @param {string} address - The account permitting the token allowance to the sender
 * @param {string} contractAddress - The address of a Tezos Managed Ledger smart contract
 * @param {ConseilServerInfo} conseilServer - Information for querying a Conseil server
 * @param {string} network - The Tezos network on which the Tezos Managed Ledger is deployed
 * @returns {Promise<string>} The token allowance permitted by a given account to the sender
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
 * @param {string} address - The account from which the token balance is retrieved
 * @param {string} contractAddress - The address of a Tezos Managed Ledger smart contract
 * @param {ConseilServerInfo} conseilServer - Information for querying a Conseil server
 * @param {string} network - The Tezos network on which the Tezos Managed Ledger is deployed
 * @returns {Promise<string>} The token balance of a given account
 */
export async function viewBalance(address: string, contractAddress: string, conseilServer: ConseilServerInfo, network: string): Promise<string> {
    const storage: string[] = await StorageProcessor.processStorage(contractAddress, conseilServer, network);
    const ledger: Map<string, string> = StorageProcessor.processMap(storage[0]);
    const account: string = ledger.get(address) as string;
    const balance: string = StorageProcessor.processElement(account, 0);
    return balance;
}

/**
 * Gets the total supply of tokens.
 * 
 * @param {string} contractAddress - The address of a Tezos Managed Ledger smart contract
 * @param {ConseilServerInfo} conseilServer - Information for querying a Conseil server
 * @param {string} network - The Tezos network on which the Tezos Managed Ledger is deployed
 * @returns {Promise<string>} The total supply of tokens
 */
export async function viewTotalSupply(contractAddress: string, conseilServer: ConseilServerInfo, network: string): Promise<string> {
    const storage: string[] = await StorageProcessor.processStorage(contractAddress, conseilServer, network);
    return storage[3];
}

/**
 * Gets the pause state.
 * 
 * @param {string} contractAddress - The address of a Tezos Managed Ledger smart contract
 * @param {ConseilServerInfo} conseilServer - Information for querying a Conseil server
 * @param {string} network - The Tezos network on which the Tezos Managed Ledger is deployed
 * @returns {Promise<string>} The pause state
 */
export async function viewPaused(contractAddress: string, conseilServer: ConseilServerInfo, network: string): Promise<string> {
    const storage: string[] = await StorageProcessor.processStorage(contractAddress, conseilServer, network);
    return storage[2];
}

/**
 * Gets the address of the administrator.
 * 
 * @param {string} contractAddress - The address of a Tezos Managed Ledger smart contract
 * @param {ConseilServerInfo} conseilServer - Information for querying a Conseil server
 * @param {string} network - The Tezos network on which the Tezos Managed Ledger is deployed
 * @returns {Promise<string>} The address of the administrator
 */
export async function viewAdministrator(contractAddress: string, conseilServer: ConseilServerInfo, network: string): Promise<string> {
    const storage: string[] = await StorageProcessor.processStorage(contractAddress, conseilServer, network);
    return storage[1];
}