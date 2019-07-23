import { TezosNodeWriter, TezosParameterFormat, OperationResult, KeyStore } from 'conseiljs';
import fs from 'fs';
import { InvocationArguments } from '../utilities/InvocationArguments';

/**
 * Deploys an instance of the Tezos Multisignature Wallet.
 * 
 * @param {string} initialStorage - The initial storage in Michelson
 * @param {string} tezosNode - The URL of the Tezos node to connect to
 * @param {KeyStore} keyStore - The sender's key store with key pair and public key hash
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function deployContract(initialStorage: string = 'Pair 0 (Pair 2 {})', tezosNode: string, keyStore: KeyStore, invokeArgs: InvocationArguments): Promise<OperationResult> {
    const contractCode: string = fs.readFileSync('tezos-multisignature-wallet.tz','utf8');
    return await TezosNodeWriter.sendContractOriginationOperation(tezosNode, keyStore, 0, undefined, false, true, 100000, '', 1000, 100000, contractCode, initialStorage, TezosParameterFormat.Michelson);
}

/**
 * transfer tokens
 * 
 * @param {number} counter - (nat) counter, used to prevent replay attacks
 * @param {number} amount - (mutez) amount to transfer
 * @param {string} dest - (contract unit) destination to transfer to
 * @param {string} sigs - (list (option signature)) signatures
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function transfer(counter: number, amount: number, dest: string, sigs: string, invokeArgs: InvocationArguments) {
    const parameter = 'Pair (Pair '+ counter + ' (Left (Pair ' + amount + ' ' + dest + '))) ' + sigs;
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
}

/**
 * change the delegate to this address
 * 
 * @param {number} counter - (nat) counter, used to prevent replay attacks
 * @param {string} delegate - (option key_hash) - new multisig delegate
 * @param {string} sigs - (list (option signature)) - signatures
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function changeDelegate(counter: number, delegate: string, sigs: string, invokeArgs: InvocationArguments) {
    const parameter = 'Pair (Pair ' + counter + ' (Right (Left' + delegate + ')) ' + sigs;
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
}

/**
 * change the keys controlling the multisig
 * 
 * @param {number} counter - (nat) counter, used to prevent replay attacks
 * @param {number} threshold - (nat) new threshold
 * @param {string} keys - (list key) new list of keys
 * @param {string} sigs - (list (option signature)) - signatures
 * @param {InvocationArguments} invokeArgs - The arguments for a contract invocation operation
 * @returns {Promise<OperationResult>} The result of the operation
 */
export async function changeKeys(counter: number, threshold: number, keys: string, sigs: string, invokeArgs: InvocationArguments) {
    const parameter = 'Pair (Pair ' + counter + ' (Right (Right (Pair ' + threshold + ' ' + keys + ')))) ' + sigs;
    return await TezosNodeWriter.sendContractInvocationOperation(invokeArgs.tezosNode, invokeArgs.keyStore, invokeArgs.contractAddress, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
}