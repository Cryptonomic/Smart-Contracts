import { TezosContractIntrospector, TezosNodeWriter, ConseilServerInfo, TezosParameterFormat, KeyStore, StoreType, EntryPoint, OperationResult } from 'conseiljs';
import * as StorageProcessor from './utilities/StorageProcessor'

const tezosNode: string = 'https://tezos-dev.cryptonomic-infra.tech/';
const keyStore: KeyStore = {
    publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
    privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
    publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
    seed: '',
    storeType: StoreType.Fundraiser
};
const network: string = 'alphanet';
const conseilServer: ConseilServerInfo = { url: 'https://conseil-dev.cryptonomic-infra.tech:443', apiKey: 'BUIDLonTezos-001' };

export async function viewEntryPoints() {
    const contractAddress: string = (<HTMLInputElement>document.getElementById('contractAddress')).value;
    const entryPoints: EntryPoint[] = await getEntryPoints(contractAddress);

    let html = "";
    entryPoints.forEach(entryPoint => {
        html += `<div class="entrypoint">`;
        
        entryPoint.parameters.forEach((parameter, index) => {
            html += `<span class="entrypointDescription">${parameter.name}/${parameter.type}</span>`;
            html += `<input type="text" class="entrypointInput" id="${entryPoint.name + parameter.name + index}" value="${parameter.type}"></input>`;
        })

        html += `<button type="button" class="entrypointButton floatRight" onclick="invokeEntryPoint('${entryPoint.name}', '${contractAddress}')">${entryPoint.name}</button><br>`;
        html += `</div>`;
    })

    document.getElementById('entryPoints').innerHTML = html;
}

export async function getEntryPoints(contractAddress: string): Promise<EntryPoint[]> {
    return await TezosContractIntrospector.generateEntryPointsFromAddress(conseilServer, network, contractAddress);
}

export async function invokeEntryPoint(entryPointName: string, contractAddress: string) {
    const entryPoints: EntryPoint[] = await getEntryPoints(contractAddress);
    for (let i = 0; i < entryPoints.length; i++) {
        if (entryPoints[i].name == entryPointName) {
            const entryPoint = entryPoints[i];
            let args: string[] = [];

            entryPoint.parameters.forEach((parameter, index) => {
                args.push((<HTMLInputElement>document.getElementById(`${entryPoint.name + parameter.name + index}`)).value);
            })

            const invocationParameter: string = entryPoint.generateParameter(...args);
            const result: OperationResult = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keyStore, contractAddress, 0, 50000, '', 1000, 100000, invocationParameter, TezosParameterFormat.Michelson);
            renewStorage(result);
        }
    }
}

export async function renewStorage(result: OperationResult) {
    let waitState = 1;
    const previousStorage = document.getElementById('contractStorage').innerHTML;
    document.getElementById('console').innerHTML = `Injected operation group id ${result.operationGroupID}`;

    while (document.getElementById('contractStorage').innerHTML === previousStorage) {
        await delay(1000);
        if (waitState === 1) {
            document.getElementById('processing').innerHTML = `Processing.`;
            waitState++;
        } else if (waitState === 2) {
            document.getElementById('processing').innerHTML = `Processing..`;
            waitState++;
        } else {
            document.getElementById('processing').innerHTML = `Processing...`;
            waitState = 1;
        }
        viewStorage();
    }
    
    document.getElementById('processing').innerHTML = ``;
    document.getElementById('console').innerHTML = `Ready to accept next command`;
}

async function delay(milliseconds: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

export async function viewStorage() {
    const storage: string[] = await StorageProcessor.processStorage(getContractAddress(), conseilServer, network);
    document.getElementById('contractStorage').innerHTML = `${storage}`;
}

export function getContractAddress(): string {
    return (<HTMLInputElement>document.getElementById('contractAddress')).value;
}