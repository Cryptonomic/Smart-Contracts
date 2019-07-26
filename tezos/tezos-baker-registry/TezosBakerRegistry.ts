import { TezosNodeWriter, TezosParameterFormat, OperationResult, KeyStore } from 'conseiljs';
import fs from 'fs';
import { InvocationArguments } from '../utilities/InvocationArguments';

/**
 * Deploys an instance of the Tezos Baker Registry.
 * 
 * @param {string} initialStorage - The initial storage in Michelson
 * @param {string} tezosNode - The URL of the Tezos node to connect to
 * @param {KeyStore} keyStore - The sender's key store with key pair and public key hash
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function deployContract(initialStorage: string = 'Pair {} (Pair {} "Author: Teckhua Chiang, Company: Cryptonomic")', tezosNode: string, keyStore: KeyStore): Promise<OperationResult> {
    const contractCode: string = fs.readFileSync(__dirname + '/tezos-baker-registry.tz', 'utf8');
    return await TezosNodeWriter.sendContractOriginationOperation(tezosNode, keyStore, 0, undefined, false, true, 100000, '', 1000, 100000, contractCode, initialStorage, TezosParameterFormat.Michelson);
}

/**
 * Entry point for a baker to update their name.
 * 
 * @param {string} name - A string representing the updated name
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function updateName(name: string, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Left ' + name;
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 50000, '', 1000, 100000, parameters, TezosParameterFormat.Michelson);
}

/**
 * Entry point for a baker to update their payment address.
 * 
 * @param {string} paymentAddress - A string representing the updated payment address
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function updatePaymentAddress(paymentAddress: string, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Left ' + paymentAddress + ')';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 50000, '', 1000, 100000, parameters, TezosParameterFormat.Michelson);
}

/**
 * Entry point for a baker to update their fee and minimum as of a cycle.
 * 
 * @param {number} cycle - An int representing the effective cycle
 * @param {number} fee - An int representing the updated fee
 * @param {number} minimum - A tez amount representing the updated minimum
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function updateTerms(cycle: number, fee: number, minimum: number, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Right (Left (Pair ' + cycle + ' (Pair ' + fee + ' ' + minimum + '))))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 50000, '', 1000, 100000, parameters, TezosParameterFormat.Michelson);
}

/**
 * Entry point for a baker to delete their registration information.
 * 
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function deleteRegistration(invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Right (Right Unit))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 50000, '', 1000, 100000, parameters, TezosParameterFormat.Michelson);
}