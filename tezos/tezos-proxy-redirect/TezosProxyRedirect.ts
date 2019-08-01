import { TezosNodeWriter, TezosParameterFormat, OperationResult, KeyStore } from 'conseiljs';
import fs from 'fs';
import { InvocationArguments } from '../utilities/InvocationArguments';

/**
 * Deploys an instance of the Tezos Proxy Redirect.
 * 
 * @param {string} initialStorage - The initial storage in Michelson
 * @param {string} tezosNode - The URL of the Tezos node to connect to
 * @param {KeyStore} keyStore - The sender's key store with key pair and public key hash
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function deployContract(initialStorage: string = 'Pair "tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z" (Pair "tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z" "Author: Teckhua Chiang, Company: Cryptonomic")', tezosNode: string, keyStore: KeyStore): Promise<OperationResult> {
    const contractCode: string = fs.readFileSync(__dirname + '/tezos-proxy-redirect.tz', 'utf8');
    return await TezosNodeWriter.sendContractOriginationOperation(tezosNode, keyStore, 0, undefined, false, true, 100000, '', 1000, 100000, contractCode, initialStorage, TezosParameterFormat.Michelson);
}

/**
 * Entry point for the owner to set the destination address.
 * 
 * @param {string} destination - An address corresponding to the desired destination
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function setDestination(destination: string, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const parameters: string = destination;
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 50000, '', 1000, 100000, parameters, TezosParameterFormat.Michelson);
}