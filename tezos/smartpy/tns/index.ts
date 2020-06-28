import * as fs from 'fs';
import fetch from 'node-fetch';
import * as log from 'loglevel';

import { registerFetch, registerLogger } from 'conseiljs';
import { KeyStore, TezosConseilClient, CryptonomicNameServiceHelper, TezosMessageUtils, TezosNodeReader, OperationKindType, TezosNodeWriter, TezosParameterFormat, Signer } from 'conseiljs';
import { KeyStoreUtils, SoftSigner } from 'conseiljs-softsigner';

const tezosNode = '...'; // https://nautilus.cloud
const conseilServer = { url: '...', apiKey: '...', network: '...' }; // https://nautilus.cloud
const networkBlockTime = 30 + 1;

let accounts = ['tz1aTPZXhAmKmisY2iRe6dEhxwe7Db3cPoVc', 'tz1esJd77NiytsZu5M73kHY9hCZf2jhxCf93', 'tz1...', 'tz1...'];
let actors = { admin: {} as KeyStore, usera: {} as KeyStore, userb: {} as KeyStore, userc: {} as KeyStore };
let contractAddress = '...';

function clearRPCOperationGroupHash(hash: string) {
    return hash.replace(/\"/g, '').replace(/\n/, '');
}

async function statOperation(groupid: string){
    const result = await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 7, networkBlockTime);

    if (result['status'] === 'failed') {
        console.log(`${result['kind']} ${groupid} ${result['status']} at block ${result['block_level']}`);
    } else if (result['status'] === 'applied') {
        let message = `${result['kind']} ${groupid} included in block ${result['block_level']} for ${result['consumed_gas']}g and ${result['paid_storage_size_diff']}f`

        if ('originated_contracts' in result && result['originated_contracts'] != null && result['originated_contracts'].length > 0) {
            message += ` new contract at ${result['originated_contracts']}`;
        }

        console.log(message);
    } else {
        console.log(JSON.stringify(result));
    }
}

function init(){
    const logger = log.getLogger('conseiljs');
    logger.setLevel('debug', false);
    registerLogger(logger);
    registerFetch(fetch);
}

async function loadAccounts() {
    console.log('~~ loadAccounts');

    actors.admin = await KeyStoreUtils.restoreIdentityFromSecretKey('edskS4t6wC6eCSzVmfpwPAaABCAPYVZ7g3cVRYyqdY9hHSbBviav1gbMgFHZPW6ftFd1gY5nN2PyfabeY8dm4pDTmqVyDt49Cx');
    actors.usera = await KeyStoreUtils.restoreIdentityFromSecretKey('edskS6T1fDhAXYZyJzTSXTBigT1yAsqBZmmMorQfhsuybW2DCi4SJkTSR9GyrTstDerVeUnTP6ZZoAGW7fCV8nJK9jbrYiK7iH');
    actors.userb = await KeyStoreUtils.restoreIdentityFromSecretKey('edsk...');
    actors.userc = await KeyStoreUtils.restoreIdentityFromSecretKey('edsk...');
}

async function deployMichelsonContract(keyStore: KeyStore): Promise<string> {
    console.log(`~~ deployMichelsonContract`);
    const maxDuration = 60*60*24*365; // sec
    const interval = 60; //sec
    const price = 1000; // µtz

    const contract = fs.readFileSync('tns.michelson', 'utf8');
    const storage = `(Pair (Pair {} (Pair "${keyStore.publicKeyHash}" ${interval})) (Pair ${maxDuration} (Pair {} ${price})))`;

    const fee = Number((await TezosConseilClient.getFeeStatistics(conseilServer, conseilServer.network, OperationKindType.Origination))[0]['high']);

    const signer: Signer = new SoftSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));

    const nodeResult = await TezosNodeWriter.sendContractOriginationOperation(tezosNode, signer, keyStore, 0, undefined, fee, 6000, 200000, contract, storage, TezosParameterFormat.Michelson);
    const groupid = clearRPCOperationGroupHash(nodeResult['operationGroupID']);
    console.log(`Injected origination operation with ${groupid}`);

    const conseilResult = await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 5, networkBlockTime);
    console.log(`Originated contract at ${conseilResult.originated_contracts}`);
    return conseilResult.originated_contracts;
}

async function queryContractMap(mapid: number, key: string, type: string = 'string') {
    const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(key, type), 'hex'));
    const mapResult = await TezosNodeReader.getValueForBigMapKey(tezosNode, mapid, packedKey);
    console.log(`value: ${JSON.stringify(mapResult)}`);
}

async function run() {
    await loadAccounts();

    contractAddress = await deployMichelsonContract(actors.admin);
    console.log(contractAddress);

    const nsConfig = await CryptonomicNameServiceHelper.getSimpleStorage(tezosNode, contractAddress);
    console.log(nsConfig);

    let keyStore = actors.usera;
    console.log(`Actor "${keyStore.publicKeyHash}"`)
    let signer: Signer = new SoftSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));

    let operationGroupID = '';
    operationGroupID = await CryptonomicNameServiceHelper.registerName(tezosNode, signer, keyStore, contractAddress, 'A-name-0', keyStore.publicKeyHash, nsConfig.interval * 100, nsConfig.intervalFee * 100, 500_000);
    console.log(`registerName: ${operationGroupID}`);
    statOperation(clearRPCOperationGroupHash(operationGroupID));

    console.log(await CryptonomicNameServiceHelper.getNameForAddress(tezosNode, nsConfig.addressMap, actors.usera.publicKeyHash));
    console.log(await CryptonomicNameServiceHelper.getNameInfo(tezosNode, nsConfig.nameMap, 'A-name-0'));
}

init();
run();
