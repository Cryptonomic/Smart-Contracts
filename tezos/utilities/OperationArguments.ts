import { KeyStore } from 'conseiljs';

export interface operationArguments {
    server: string,
    keyStore: KeyStore;
    to: string;
}