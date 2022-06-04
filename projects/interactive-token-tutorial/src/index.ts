import * as DeployTezosManagedLedger from './interfaces/DeployTezosManagedLedger';
import * as TezosManagedLedger from './interfaces/TezosManagedLedger';
import { operationArguments, operationResult } from './utilities/OperationInformation';
import { StoreType, KeyStore, TezosConseilClient } from 'conseiljs';

const tezosNode: string = 'https://tezos-dev.cryptonomic-infra.tech/';

const keystore: KeyStore = {
    publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
    privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
    publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
    seed: '',
    storeType: StoreType.Fundraiser
};

const network: string = 'alphanet';
const conseilServer = { url: 'https://conseil-dev.cryptonomic-infra.tech:443', apiKey: 'BUIDLonTezos-001' };

// Deploy Function

export async function deploy() {
    const result: operationResult = await DeployTezosManagedLedger.deployContract(tezosNode, keystore);
    document.getElementById('console').innerHTML = `Injected operation group id ${result.operationGroupID} <br> Successfully deployed Tezos Managed Ledger`;
}

// Operation Functions

export async function transfer() {
    const from: string = (<HTMLInputElement>document.getElementById('transferFrom')).value;
    const to: string = (<HTMLInputElement>document.getElementById('transferTo')).value;
    const value: number = parseInt((<HTMLInputElement>document.getElementById('transferValue')).value);

    const result: operationResult = await TezosManagedLedger.transfer(from, to, value, generateOpArgs());
    updateStorageView(result);
}

export async function approve() {
    const spender: string = (<HTMLInputElement>document.getElementById('approveSpender')).value;
    const value: number = parseInt((<HTMLInputElement>document.getElementById('approveValue')).value);

    const result: operationResult = await TezosManagedLedger.approve(spender, value, generateOpArgs());
    updateStorageView(result);
}

// Management Functions

export async function setPause() {
    const pause: boolean = (<HTMLInputElement>document.getElementById('pause')).value.toLowerCase() === "true";

    let result: operationResult = await TezosManagedLedger.setPause(pause, generateOpArgs());
    updateStorageView(result);
}

export async function setAdministrator() {
    const administrator: string = (<HTMLInputElement>document.getElementById('administrator')).value;

    const result: operationResult = await TezosManagedLedger.setAdministrator(administrator, generateOpArgs());
    updateStorageView(result);
}

export async function mint() {
    const to: string = (<HTMLInputElement>document.getElementById('mintTo')).value;
    const value: number = parseInt((<HTMLInputElement>document.getElementById('mintValue')).value);

    const result: operationResult = await TezosManagedLedger.mint(to, value, generateOpArgs());
    updateStorageView(result);
}

export async function burn() {
    const from: string = (<HTMLInputElement>document.getElementById('burnFrom')).value;
    const value: number = parseInt((<HTMLInputElement>document.getElementById('burnValue')).value);

    const result: operationResult = await TezosManagedLedger.burn(from, value, generateOpArgs());
    updateStorageView(result);
}

// View Functions

export async function viewStorage(hash: string = '') {
    if (hash.length > 0) {
        await TezosConseilClient.awaitOperationConfirmation(conseilServer, network, hash, 5);
    }
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

export async function viewBalance() {
    const address: string = '"' + (<HTMLInputElement>document.getElementById('viewBalanceAddress')).value + '"';
    const balance = await TezosManagedLedger.viewBalance(address, getContractAddress(), conseilServer, network);
    document.getElementById('console').innerHTML = `Balance of ${address} is ${balance} <img src="./images/token.png" class="tokenIcon">`;
}

export async function viewTotalSupply() {
    const totalSupply = await TezosManagedLedger.viewTotalSupply(getContractAddress(), conseilServer, network);
    document.getElementById('console').innerHTML = `Total Supply: ${totalSupply} <img src="./images/token.png" class="tokenIcon">`;
}

export async function viewPaused() {
    const isPaused = await TezosManagedLedger.viewPaused(getContractAddress(), conseilServer, network);
    document.getElementById('console').innerHTML = `Paused: ${isPaused}`;
}

export async function viewAdministrator() {
    const admin = await TezosManagedLedger.viewAdministrator(getContractAddress(), conseilServer, network);
    document.getElementById('console').innerHTML = `Administrator: ${admin}`;
}

// Webpage Functions

export async function updateStorageView(result: operationResult) {
    const opgroupid = result.operationGroupID.replace(/"/g, '').trim();
    document.getElementById('console').innerHTML = `Injected ${opgroupid} <br> Waiting for blockchain confirmation...`;

    try {
        await viewStorage(opgroupid);
        document.getElementById('console').innerHTML = '';
    } catch (error) {
        document.getElementById('console').innerHTML = `Operation failed with error: ${error} <br>`;
    }

    document.getElementById('console').innerHTML += 'Ready to accept next command';
}

async function delay(milliseconds: number) {
    return new Promise<void>(resolve => { setTimeout(resolve, milliseconds); });
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
