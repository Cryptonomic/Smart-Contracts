import { setLogLevel, TezosWalletUtil, KeyStore, TezosParameterFormat, OperationKindType,
    TezosNodeWriter, TezosNodeReader, TezosContractIntrospector, TezosMessageUtils,
    TezosConseilClient, ConseilQueryBuilder, ConseilOperator, ConseilSortDirection, ConseilDataClient } from 'conseiljs';
import { JSONPath } from 'jsonpath';
import * as fs from 'fs';
import * as glob from 'glob';

const tezosNode = 'https://tezos-dev.cryptonomic-infra.tech/';
const conseilServer = { url: 'https://conseil-dev.cryptonomic-infra.tech:443', apiKey: 'galleon', network: 'babylonnet' };
const contractAddress = 'KT1LTkvHQiBvo7gMcA6qZAqb2ztwnAR8G4pc';
const networkBlockTime = 30 + 1;
let entryPoints = [];

setLogLevel('debug');

function clearRPCOperationGroupHash(hash: string) {
    return hash.replace(/\"/g, '').replace(/\n/, '');
}
let faucetAccount = {};
let keystore: KeyStore;

async function initAccount(): Promise<KeyStore> {
    console.log('~~~~~~~ initAccount');
    let faucetFiles: string[] = glob.sync('tz1*.json');

    if (faucetFiles.length === 0) {
        throw new Error('Did not find any faucet files, please go to faucet.tzalpha.net to get one');
    }

    console.log(`loading ${faucetFiles[0]} faucet file`);
    faucetAccount = JSON.parse(fs.readFileSync(faucetFiles[0], 'utf8'));

    const keystore = await TezosWalletUtil.unlockFundraiserIdentity(faucetAccount['mnemonic'].join(' '), faucetAccount['email'], faucetAccount['password'], faucetAccount['pkh']);
    console.log(`public key: ${keystore.publicKey}`);
    console.log(`secret key: ${keystore.privateKey}`);
    console.log(`account hash: ${keystore.publicKeyHash}`);

    return keystore;
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
    const parameters = entryPoints[1].generateInvocationString(`"${name}"`, registrationPeriod, `"${resolver}"`);
    // const parameters = `{
    //     "prim": "Left",
    //     "args": [{
    //         "prim": "Left",
    //         "args": [{
    //             "prim": "Left",
    //             "args": [{
    //                 "prim": "Right",
    //                 "args": [{
    //                     "prim": "Pair",
    //                     "args": [{
    //                         "prim": "Pair",
    //                         "args": [{
    //                             "string": "domain1"
    //                         }, {
    //                             "int": "99999"
    //                         }]
    //                     }, {
    //                         "string": "tz1aoLg7LtcbwJ2a7kfMj9MhUDs3fvehw6aa"
    //                     }]
    //                 }]
    //             }]
    //         }]
    //     }]
    // }`;
    console.log(`~~~~~~~ registerName: parameter string: ${parameters}`)
    // calculate storage and gas costs if not provided - TODO: migrate this to constants
    console.log(`~~~~~~~ registerName: calculating freight and gas if not provided`)
    if (!freight || !gas) {
		const cost = await TezosNodeWriter.testContractInvocationOperation(server, 'main', keystore, contractAddress, 10000, fee, '', 1000, 100000, 'registerName', parameters, TezosParameterFormat.Michelson);
    	if (!freight)
            freight = Number(cost['storageCost']) || 0;
    	if (!gas)
            gas = Number(cost['gas']) + 300; // + buffer
    }
    console.log(`~~~~~~~ registerName: freight:${freight} gas:${gas} `)
    // call contract
    const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, fee, derivationPath, freight, gas, '', parameters, TezosParameterFormat.Michelson);
    const groupid = clearRPCOperationGroupHash(nodeResult.operationGroupID);
    console.log(`~~~~~~~ registerName: operationId: ${groupid} `)
    const conseilResult = await TezosConseilClient.awaitOperationConfirmation(
        conseilServer, 
        conseilServer.network, 
        groupid, 
        5, 
        networkBlockTime);
}

/**
 * Calls the transferNameOwnership entrypoint on the contract.
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
 * Calls the updateResolver entrypoint on the contract.
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
 * Calls the updateRegistrationPeriod entrypoint on the contract.
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
 * Calls the deleteName entrypoint on the contract.
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
	const storageResult = await TezosNodeReader.getContractStorage(server, contractAddress);
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

async function queryContractMap(mapid: number, key: string) {
    const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(key, 'string'), 'hex'));
    const mapResult = await TezosNodeReader.getValueForBigMapKey(tezosNode, mapid, packedKey);
    console.log(`value: ${JSON.stringify(mapResult)}`);
}

async function run() {
    keystore = await initAccount();

    console.log(`~~~~~~~ calculating fee`);
    const fee = Number((await TezosConseilClient.getFeeStatistics(conseilServer, conseilServer.network, OperationKindType.Transaction))[0]['high']);

    console.log(`~~~~~~~ generating entrypoints`);
    entryPoints = await TezosContractIntrospector.generateEntryPointsFromAddress(conseilServer, conseilServer.network, contractAddress);
    // console.log(entryPoints)

    console.log(`~~~~~~~ invoking registerName`);
    await registerName(tezosNode, keystore, 'domain1', keystore.publicKeyHash, 99999, 500000, 20000, 200000);
    
    console.log(`~~~~~~~ querying nameRegistry`)
    await queryContractMap(1655 , 'domain1');
    console.log(`~~~~~~~ querying nameRegistry`)
    await queryContractMap(1656 , 'domain1');
    console.log(`~~~~~~~ querying addressRegistry`)
    await queryContractMap(1656, keystore.publicKeyHash);
    console.log(`~~~~~~~ querying addressRegistry`)
    await queryContractMap(1655, keystore.publicKeyHash);
}

run();
