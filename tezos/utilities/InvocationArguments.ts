import { KeyStore } from 'conseiljs';

export interface InvocationArguments {
    tezosNode: string,
    keyStore: KeyStore;
    contractAddress: string;
}