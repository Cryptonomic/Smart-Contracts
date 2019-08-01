import { TezosNodeWriter, TezosParameterFormat, OperationResult, KeyStore } from 'conseiljs';
import fs from 'fs';
import { InvocationArguments } from '../utilities/InvocationArguments';

/**
 * Deploys an instance of the Tezos Name Service Domain Manager.
 * 
 * @param {string} initialStorage - The initial storage in Michelson
 * @param {string} tezosNode - The URL of the Tezos node to connect to
 * @param {KeyStore} keyStore - The sender's key store with key pair and public key hash
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function deployContract(initialStorage: string = 'Pair "tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z" (Pair {} "Author: Teckhua Chiang, Company: Cryptonomic Inc.")', tezosNode: string, keyStore: KeyStore): Promise<OperationResult> {
    const contractCode: string = fs.readFileSync(__dirname + '/tezos-name-service-domain-manager.tz', 'utf8');
    return await TezosNodeWriter.sendContractOriginationOperation(tezosNode, keyStore, 0, undefined, false, true, 100000, '', 1000, 100000, contractCode, initialStorage, TezosParameterFormat.Michelson);
}

/**
 * Entry point for a user to register a new subdomain. Default subdomain registration logic. Modify for your own purposes.
 * 
 * @param {string} subdomain - A string representing the subdomain name
 * @param {string} resolver - An address representing the resolver address
 * @param {string} manager - An address representing the manager address
 * @param {number} ttlInSeconds - An int representing the time to live in seconds
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function registerSubdomain(subdomain: string, resolver: string, manager: string, ttlInSeconds: number, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Left (Pair ' + subdomain + ' (Pair ' + resolver + ' (Pair ' + manager + ' ' + ttlInSeconds + ')))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 50000, '', 1000, 100000, parameters, TezosParameterFormat.Michelson);
}

/**
 * Entry point for a controller to transfer ownership of a subdomain to another user.
 * 
 * @param {string} subdomain - A string representing the subdomain name
 * @param {string} newSubdomainOwner - An address representing the updated subdomain owner address
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function transferSubdomainOwnership(subdomain: string, newSubdomainOwner: string, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Left (Pair ' + subdomain + ' ' + newSubdomainOwner + '))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 50000, '', 1000, 100000, parameters, TezosParameterFormat.Michelson);
}

/**
 * Entry point for a subdomain owner to update the resolver address for a subdomain. Resolvers are full Tezos addresses registered as the destination of subdomains.
 * 
 * @param {string} subdomain - A string representing the subdomain name
 * @param {string} resolver - An address representing the updated resolver address
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function updateResolver(subdomain: string, resolver: string, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Right (Left (Pair ' + subdomain + ' ' + resolver + '))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 50000, '', 1000, 100000, parameters, TezosParameterFormat.Michelson);
}

/**
 * Entry point for the subdomain owner to update the manager address for a subdomain. Managers are smart contracts that manage a subdomain.
 * 
 * @param {string} subdomain - A string representing the subdomain name
 * @param {string} manager - An address representing the updated manager address
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function updateManager(subdomain: string, manager: string, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Right (Right (Left (Pair ' + subdomain + ' ' + manager + ')))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 50000, '', 1000, 100000, parameters, TezosParameterFormat.Michelson);
}

/**
 * Entry point for the subdomain owner to update the TTL for a subdomain.
 * 
 * @param {string} subdomain - A string representing the subdomain name
 * @param {number} ttlInSeconds - An int representing the updated time to live in seconds
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function updateTTL(subdomain: string, ttlInSeconds: number, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Right (Right (Right (Left (Pair ' + subdomain + ' ' + ttlInSeconds + ')))))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 50000, '', 1000, 100000, parameters, TezosParameterFormat.Michelson);
}

/**
 * Entry point for a controller to delete an existing subdomain.
 * 
 * @param {string} subdomain - A string representing the subdomain name
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function deleteSubdomain(subdomain: string, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = 'Right (Right (Right (Right (Right ' + subdomain + '))))';
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 50000, '', 1000, 100000, parameters, TezosParameterFormat.Michelson);
}