import { TezosNodeWriter, TezosParameterFormat, OperationResult, KeyStore } from 'conseiljs';
import fs from 'fs';
import { InvocationArguments } from '../utilities/InvocationArguments';

/**
 * Deploys an instance of the Tezos Name Service Central Registry.
 * 
 * @param {string} initialStorage - The initial storage in Michelson
 * @param {string} tezosNode - The URL of the Tezos node to connect to
 * @param {KeyStore} keyStore - The sender's key store with key pair and public key hash
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function deployContract(initialStorage: string = 'Pair {} "Author: Teckhua Chiang, Company: Cryptonomic Inc."', tezosNode: string, keyStore: KeyStore): Promise<OperationResult> {
    const contractCode: string = fs.readFileSync('tezos-name-service-central-registry.tz','utf8');
    return await TezosNodeWriter.sendContractOriginationOperation(tezosNode, keyStore, 0, undefined, false, true, 100000, '', 1000, 100000, contractCode, initialStorage, TezosParameterFormat.Michelson);
}

/**
 * Entry point for a permitted user to register a new domain.
 * 
 * @param {string} domain - A string representing the domain name
 * @param {string} resolver - An address representing the resolver address
 * @param {number} ttlInSeconds - An int representing the time to live in seconds
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function registerDomain(domain: string, resolver: string, ttlInSeconds: number, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Left (Pair ' + domain + ' (Pair ' + resolver + ' ' + ttlInSeconds + '))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 50000, '', 1000, 100000, parameters, TezosParameterFormat.Michelson);
}

/**
 * Entry point for a domain owner to update the resolver for a domain.
 * 
 * @param {string} domain - A string representing the domain name
 * @param {string} resolver - An address representing the updated resolver address
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function updateResolver(domain: string, resolver: string, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Left (Pair ' + domain + ' ' + resolver + '))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 50000, '', 1000, 100000, parameters, TezosParameterFormat.Michelson);
}

/**
 * Entry point for a domain owner to update the time to live for a domain.
 * 
 * @param {string} domain - A string representing the domain name
 * @param {number} ttlInSeconds - An int representing the updated time to live in seconds
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function updateTTL(domain: string, ttlInSeconds: number, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Right (Left (Pair ' + domain + ' ' + ttlInSeconds + ')))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 50000, '', 1000, 100000, parameters, TezosParameterFormat.Michelson);
}

/**
 * Entry point for a permitted user to transfer ownership of a domain to another user.
 * 
 * @param {string} domain - A string representing the domain name
 * @param {string} newOwner - A string representing the new owner address
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function transferOwnership(domain: string, newOwner: string, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Right (Right (Left (Pair ' + domain + ' ' + newOwner + '))))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 50000, '', 1000, 100000, parameters, TezosParameterFormat.Michelson);
}

/**
 * Entry point for a permitted user to delete an existing domain.
 * 
 * @param {string} domain - A string representing the domain name to be deleted
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function deleteDomain(domain: string, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Right (Right (Right (Pair ' + domain + '))))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 50000, '', 1000, 100000, parameters, TezosParameterFormat.Michelson);
}