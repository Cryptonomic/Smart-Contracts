import { TezosConseilClient } from 'conseiljs';
import * as StorageParser from './StorageParser';

const network = 'alphanet';
const conseilServer = { url: 'https://conseil-dev.cryptonomic-infra.tech:443', apiKey: 'hooman' };

const nearley = require("nearley");

export async function processStorage(address: string): Promise<string[]> {
    const account: any[] = await TezosConseilClient.getAccount(conseilServer, network, address);
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(StorageParser));
    parser.feed(account[0].storage);
    const rawStorage: string = parser.results[0];
    const processedStorage = splitStorageString(rawStorage);
    return processedStorage;
}

function splitStorageString(storage: string): string[] {
    let storageArray: string[] = [];
    let nestLevel: number = 0;
    let lastIndex: number = 0;

    for (let i = 0; i <= storage.length; i++) {
        if (storage.charAt(i) == '{' || storage.charAt(i) === ' \"') {
            nestLevel++;
        } else if (storage.charAt(i) == '}' || storage.charAt(i) === '\" ') {
            nestLevel--;
        } else if ((storage.charAt(i) === ',' && nestLevel === 0) || i === storage.length) {
            storageArray.push(storage.substring(lastIndex, i));
            lastIndex = i + 2;
        }
    }

    return storageArray;
}

export function processMap(map: string): Map<string, string> {
    let processedMap: Map<string, string> = new Map<string, string>();
    map = map.substring(1, map.length - 1);
    let mapArray: string[] = splitMapString(map);

    mapArray.forEach(function(element: string) {
        element = element.substring(1, element.length - 1);
        let firstCommaIndex: number = element.indexOf(',');
        processedMap.set(element.substring(0, firstCommaIndex), element.substring(firstCommaIndex + 2, element.length));
    });
    return processedMap;
}

function splitMapString(map: string): string[] {
    let mapArray: string[] = [];
    let nestLevel = 0;
    let lastIndex = 0;

    for (let i = 0; i <= map.length; i++) {
        if (map.charAt(i) == '[') {
            nestLevel++;
        } else if (map.charAt(i) == ']') {
            nestLevel--;
        } else if ((map.charAt(i) === ',' && nestLevel === 0) || i === map.length) {
            mapArray.push(map.substring(lastIndex, i));
            lastIndex = i + 2;
        }
    }

    return mapArray;
}

export function processElement(element: string, index: number): string {
    element = element.substring(1, element.length - 1);
    let elementArray = element.split(',');
    return elementArray[index];
}