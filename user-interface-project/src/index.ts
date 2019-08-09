import { TezosContractIntrospector, KeyStore, StoreType, ConseilServerInfo, EntryPoint } from 'conseiljs';

const tezosNode: string = 'https://tezos-dev.cryptonomic-infra.tech/';
const keystore: KeyStore = {
    publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
    privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
    publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
    seed: '',
    storeType: StoreType.Fundraiser
};
const network: string = 'alphanet';
const conseilServer: ConseilServerInfo = { url: 'https://conseil-dev.cryptonomic-infra.tech:443', apiKey: 'BUIDLonTezos-001' };

<div class="entrypoint">
    <span class="entrypointDescription">Transfer</span>
    <input type="text" class="entrypointInput" id="transferValue" value="1000"></input>
    <span class="entrypointDescription">from</span>
    <input type="text" class="entrypointInput" id="transferFrom" value="tz1U8b7PV5w6WEyFNRtFX3RPGVTcmAUAgNn1"></input>
    <span class="entrypointDescription">to</span>
    <input type="text" class="entrypointInput" id="transferTo" value="tz1Po8u9NrkFKDsXgkiAYKfLrjvmao2TYBce"></input>                    

    <button type="button" class="entrypointButton floatRight" onclick="transfer()">Transfer</button><br>
</div>

export async function viewEntryPoints() {
    const entryPoints: EntryPoint[] = await generateEntryPoints();
    let html = "";
    entryPoints.forEach(entryPoint => {
        html += `<div class="entrypoint">`
        
        html += `<span class="entrypointDescription">Transfer</span>`
        html = html + (`${entryPoint.name}(${entryPoint.parameters.map(parameter => (parameter.name || 'unnamed') + '/' + parameter.type).join(', ')})`)

        html += `<button type="button" class="entrypointButton floatRight" onclick="transfer()">Transfer</button><br>`
        html += `</div>`
        html += `\n`
    });
    document.getElementById('entryPoints').innerHTML = html;
}

export async function generateEntryPoints(): Promise<EntryPoint[]> {
    const contractAddress: string = (<HTMLInputElement>document.getElementById('contractAddress')).value;
    return await TezosContractIntrospector.generateEntryPointsFromAddress(conseilServer, network, contractAddress);
}

// Management Functions

/*
export async function burn() {
    const from: string = (<HTMLInputElement>document.getElementById('burnFrom')).value;
    const value: number = parseInt((<HTMLInputElement>document.getElementById('burnValue')).value);

    const result: operationResult = await TezosManagedLedger.burn(from, value, generateOpArgs());
    renewStorage(result);
}

// View Functions

export async function viewStorage() {
    const storage = await TezosManagedLedger.viewStorage(getContractAddress(), conseilServer, network);

    const ledger: string = storage.ledger;
    const admin: string = storage.admin;
    const paused: string = storage.paused;
    const totalSupply: string = storage.totalSupply;

    document.getElementById('contractStorage').innerHTML = `
        Ledger: ${ledger} <br>
        Admin: ${admin} <br>
        Paused: ${paused} <br>
        Total Supply: ${totalSupply}
    `;
}

export async function viewAllowance() {
    const address: string = '"' + (<HTMLInputElement>document.getElementById('viewAllowanceAddress')).value + '"';
    const allowance = await TezosManagedLedger.viewAllowance(address, getContractAddress(), conseilServer, network);
    document.getElementById('console').innerHTML = `Allowance from ${address} is ${allowance} <img src="./images/token.png" class="tokenIcon">`;
}

// Webpage Functions

export async function renewStorage(result: operationResult) {
    let waitState = 1;
    const previousStorage = document.getElementById('contractStorage').innerHTML;
    while (document.getElementById('contractStorage').innerHTML === previousStorage) {
        await delay(1000);
        if (waitState === 1) {
            document.getElementById('console').innerHTML = `Injected operation group id ${result.operationGroupID} <br> Processing.`;
            waitState++;
        } else if (waitState === 2) {
            document.getElementById('console').innerHTML = `Injected operation group id ${result.operationGroupID} <br> Processing..`;
            waitState++;
        } else {
            document.getElementById('console').innerHTML = `Injected operation group id ${result.operationGroupID} <br> Processing...`;
            waitState = 1;
        }
        viewStorage();
    }
    document.getElementById('console').innerHTML = `Ready to accept next command`;
}

async function delay(milliseconds: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

export function getContractAddress(): string {
    return (<HTMLInputElement>document.getElementById('contractAddress')).value;
}

export function generateOpArgs(): operationArguments {
    const contractAddress = getContractAddress();
    return {
        server: tezosNode,
        keyStore: keystore,
        to: contractAddress
    };
}

*/