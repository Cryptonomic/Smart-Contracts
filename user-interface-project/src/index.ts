import { TezosContractIntrospector, KeyStore, StoreType, ConseilServerInfo, EntryPoint } from 'conseiljs';

export async function generateEntryPoints() {
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

    const contractAddress: string = (<HTMLInputElement>document.getElementById('contractAddress')).value;
    const entryPoints: EntryPoint[] = await TezosContractIntrospector.generateEntryPointsFromAddress(conseilServer, network, contractAddress);
    document.getElementById('entryPoints').innerHTML = entryPoints.toString();
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