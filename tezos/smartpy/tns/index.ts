import { setLogLevel, TezosWalletUtil, KeyStore, TezosParameterFormat, OperationKindType,
    TezosNodeWriter, TezosNodeReader, TezosContractIntrospector, TezosMessageUtils,
    TezosConseilClient, ConseilQueryBuilder, ConseilOperator, ConseilSortDirection, ConseilDataClient } from 'conseiljs';
import { JSONPath } from 'jsonpath';
import * as fs from 'fs';
import * as glob from 'glob';

const tezosNode = 'https://tezos-dev.cryptonomic-infra.tech/';
const conseilServer = { url: 'https://conseil-dev.cryptonomic-infra.tech:443', apiKey: 'galleon', network: 'babylonnet' };
// const contractAddress = 'KT1LTkvHQiBvo7gMcA6qZAqb2ztwnAR8G4pc';
const contractAddress = 'KT1QoRuESD7T2PrcXrvT6xeYGe7b9tQWKJgd';
const networkBlockTime = 30 + 1;
const faucets = '/Users/itama/Google Drive/Programming/cryptonomic/faucets';

let entryPoints = [];
const registerNameIndex = 1;
const transferNameOwnershipIndex = 2;
const updateResolverIndex = 4;
const updateRegistrationPeriodIndex = 3;
const deleteNameIndex = 0;
const nameRegistryBigMapID = 1832;
const addressRegistryBigMapID = 1831;

setLogLevel('debug');

function clearRPCOperationGroupHash(hash: string) {
    return hash.replace(/\"/g, '').replace(/\n/, '');
}
let faucetAccount = {};

async function initAccount(keyAddress: string): Promise<KeyStore> {
    console.log('~~~~~~~ initAccount');
    // let faucetFiles: string[] = glob.sync(`../../../../faucets/${keyAddress}.json`);
    let faucetFiles: string[] = glob.sync(`${faucets}/${keyAddress}.json`);

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
    const parameters = entryPoints[registerNameIndex].generateInvocationString(`"${name}"`, registrationPeriod, `"${resolver}"`);
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
    const conseilResult = await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 5, networkBlockTime);
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
    const parameters = entryPoints[transferNameOwnershipIndex].generateInvocationString(`"${name}"`, `"${newNameOwner}"`);
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
    const conseilResult = await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 5, networkBlockTime);
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
    const parameters = entryPoints[updateResolverIndex].generateInvocationString(`"${name}"`, `"${resolver}"`);
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
    const conseilResult = await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 5, networkBlockTime);
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
    const parameters = entryPoints[updateRegistrationPeriodIndex].generateInvocationString(`"${name}"`, newRegistrationPeriod);
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
    const conseilResult = await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 5, networkBlockTime);
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
    const parameters = entryPoints[deleteNameIndex].generateInvocationString(`"${name}"`);
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
    const conseilResult = await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 5, networkBlockTime);

}

async function getNameFromAddress(server: string, address: string) {
    // need to figure out decoding here
}

async function getNameInfo(name: string) {
    const textDecoder = new TextDecoder();
    const jsonpath = new JSONPath();
    const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(name, 'string'), 'hex'));
    const mapResult = await TezosNodeReader.getValueForBigMapKey(tezosNode, nameRegistryBigMapID, packedKey);
    console.log(`value: ${JSON.stringify(mapResult)}`);
    return {
        name: name, // name        
        owner: jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[1].string')[0],  // owner
        resolver: jsonpath.query(mapResult, '$.args[1].string')[0], // resolver
        registeredAt: new Date(jsonpath.query(mapResult, '$.args[0].args[0].args[1].string')[0]), // registeredAt
        registrationPeriod: jsonpath.query(mapResult, '$.args[0].args[1].int')[0], // registrationPeriod
        modified: Boolean(jsonpath.query(mapResult, '$.args[0].args[0].args[0].args[0].args[0].prim')[0]) // modified
    };
}

async function queryContractMap(mapid: number, key: string) {
    const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(key, 'string'), 'hex'));
    const mapResult = await TezosNodeReader.getValueForBigMapKey(tezosNode, mapid, packedKey);
    console.log(`value: ${JSON.stringify(mapResult)}`);
}

async function run() {
    let keystore = await initAccount('tz1aoLg7LtcbwJ2a7kfMj9MhUDs3fvehw6aa');
    let keystore2 = await initAccount('tz1augmKQXU6PGRUq6KQ4ocDmWJRhrZ7G5kw')
    console.log(keystore);

    // console.log(`~~~~~~~ calculating fee`);
    // const fee = Number((await TezosConseilClient.getFeeStatistics(conseilServer, conseilServer.network, OperationKindType.Transaction))[0]['high']);

    // console.log(`~~~~~~~ generating entrypoints`);
    // entryPoints = await TezosContractIntrospector.generateEntryPointsFromAddress(conseilServer, conseilServer.network, contractAddress);
    // console.log(entryPoints)

    // let name = 'domain3';
    // console.log(`~~~~~~~ invoking registerName`);
    // await registerName(tezosNode, keystore, name, keystore.publicKeyHash, 99999, 500000, 20000, 200000);
    // console.log(`~~~~~~~ querying nameRegistry for name "domain3"`);
    // await queryContractMap(nameRegistryBigMapID , 'domain3');
    
    // console.log(`~~~~~~~ invoking transferNameOwnership`);
    // await transferNameOwnership(tezosNode, keystore, name, keystore2.publicKeyHash, 500000, 20000, 200000);
    // console.log(`~~~~~~~ querying nameRegistry for name "domain3" to check updated owner`);
    // await queryContractMap(nameRegistryBigMapID , 'domain3');

    // console.log(`~~~~~~~ invoking updateResolver`);    
    // await updateResolver(tezosNode, keystore, name, keystore2.publicKeyHash, 500000, 20000, 200000);
    // console.log(`~~~~~~~ querying nameRegistry for name "domain3" to check updated resolver`);
    // await queryContractMap(nameRegistryBigMapID , 'domain3');

    // console.log(`~~~~~~~ invoking updateRegistrationPeriod`);
    // await updateRegistrationPeriod(tezosNode, keystore, name, 9234632, 500000, 20000, 200000);
    // console.log(`~~~~~~~ querying nameRegistry for name "domain3" to check updated registration period`);
    // await queryContractMap(nameRegistryBigMapID , 'domain3');

    // console.log(`~~~~~~~ invoking deleteName`);
    // await deleteName(tezosNode, keystore, 'domain3', 500000, 20000, 200000);
    // console.log(`~~~~~~~ querying nameRegistry for name "domain3" to check if it was deleted`);
    // await queryContractMap(nameRegistryBigMapID , name);

    // let name2 = 'domain1';
    // console.log(`~~~~~~~ querying BigMap for name 'domain1`);
    // let nameInfo = await getNameInfo(name2);
    // console.log(nameInfo);
}

run();
