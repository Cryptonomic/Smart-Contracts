import { setLogLevel, KeyStore, TezosTypes, TezosNodeWriter, TezosConseilClient, ConseilQueryBuilder, ConseilOperator, ConseilSortDirection, ConseilDataClient } from 'conseiljs';

const tezosNode = 'https://tezos-dev.cryptonomic-infra.tech/';
const conseilServer = { url: 'https://conseil-dev.cryptonomic-infra.tech:443', apiKey: 'galleon', network: 'babylonnet' };
const tnsAddress = '';
const contractAddress = ;
const networkBlockTime = 30 + 1;

setLogLevel('silent');

function clearRPCOperationGroupHash(hash: string) {
    return hash.replace(/\"/g, '').replace(/\n/, '');
}

/**
 * Calls the registerName entrypoint on the contract.
 * 
 * @param server Destination Tezos node.
 * @param keystore KeyStore object to sign the transaction with.
 * @param name Name to register in the contract.
 * @param resolver Resolver to register with name.
 * @param registrationPeriod Length of time to register name for.
 * @param fee Transaction fee.
 * @param freight Storage fee limit, if not provided - calculate storage limit.
 * @param gas Gas fee, if not provided - calculate gas limit.
 */
async function registerName(server: string, keystore: KeyStore, name: string, resolver: string, registrationPeriod: number, fee: number, freight?: number, gas?: number, derivationPath: string = '') {
    // calculate storage and gas costs if not provided - TODO: migrate this to constants
    if (!freight || !gas) {
		const cost = await TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contractAddress, 10000, fee, '', 1000, 100000, 'registerName', params, TezosTypes.TezosParameterFormat.Micheline);
    	if (!freight)
            freight = Number(cost['storageCost']) || 0;
    	if (!gas)
            gas = Number(cost['gas']) + 300; // + buffer
	}
    // call contract
    const parameters = ``;
    const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(
        tezosNode, 
        keystore, 
        contractAddress, 
        0, 
        fee, 
        derivationPath, 
        freight, 
        gas, 
        'registerName', 
        parameters, 
        TezosTypes.TezosParameterFormat.Micheline);
    const groupid = clearRPCOperationGroupHash(nodeResult.operationGroupID);
    const conseilResult = await TezosConseilClient.awaitOperationConfirmation(
        conseilServer, 
        conseilServer.network, 
        groupid, 
        5, 
        networkBlockTime);
}

/**
 * Calls the registerName entrypoint on the contract.
 * 
 * @param server Destination Tezos node.
 * @param keystore KeyStore object to sign the transaction with.
 * @param name Name to register in the contract.
 * @param resolver Resolver to register with name.
 * @param registrationPeriod Length of time to register name for.
 * @param fee Transaction fee.
 * @param freight Storage fee limit, if not provided calculate storage limit.
 * @param gas Gas fee, if not provided calculate gas limit.
 */
async function transferNameOwnership(server: string, keystore: KeyStore, name: string, newNameOwner: string, fee: number, freight?: number, gas?: number, derivationPath: string = '') {

}

/**
 * Calls the registerName entrypoint on the contract.
 * 
 * @param server Destination Tezos node.
 * @param keystore KeyStore object to sign the transaction with.
 * @param name Name to register in the contract.
 * @param resolver Resolver to register with name.
 * @param registrationPeriod Length of time to register name for.
 * @param fee Transaction fee.
 * @param freight Storage fee limit, if not provided calculate storage limit.
 * @param gas Gas fee, if not provided calculate gas limit.
 */
async function updateResolver(server: string, keystore: KeyStore, name: string, resolver: string, fee: number, freight?: number, gas?: number, derivationPath: string = '') {

}

/**
 * Calls the registerName entrypoint on the contract.
 * 
 * @param server Destination Tezos node.
 * @param keystore KeyStore object to sign the transaction with.
 * @param name Name to register in the contract.
 * @param resolver Resolver to register with name.
 * @param registrationPeriod Length of time to register name for.
 * @param fee Transaction fee.
 * @param freight Storage fee limit, if not provided calculate storage limit.
 * @param gas Gas fee, if not provided calculate gas limit.
 */
async function updateRegistrationPeriod(server: string, keystore: KeyStore, name: string, newRegistrationPeriod: number, fee: number, freight?: number, gas?: number, derivationPath: string = '') {

}

/**
 * Calls the registerName entrypoint on the contract.
 * 
 * @param server Destination Tezos node.
 * @param keystore KeyStore object to sign the transaction with.
 * @param name Name to register in the contract.
 * @param resolver Resolver to register with name.
 * @param registrationPeriod Length of time to register name for.
 * @param fee Transaction fee.
 * @param freight Storage fee limit, if not provided calculate storage limit.
 * @param gas Gas fee, if not provided calculate gas limit.
 */
async function deleteName(server: string, keystore: KeyStore, name: string, fee: number, freight?: number, gas?: number, derivationPath: string = '') {

}

async function getNameFromAddress(server: string, address: string) {
	const storageResult = await TezosNodeReader.getContractStorage(server, address);
    const jsonpath = new JSONPath();

    return {
        mapid: parseInt(jsonpath.query(storageResult, '$.args[0].int')[0]),
        owner: jsonpath.query(storageResult, '$.args[1].args[0].string')[0],
        signupFee: parseInt(jsonpath.query(storageResult, '$.args[1].args[1].args[0].int')[0]),
        updateFee: parseInt(jsonpath.query(storageResult, '$.args[1].args[1].args[1].int')[0])
    };
}

async function getNameInfo() {

}

async function run() {

}

run();

