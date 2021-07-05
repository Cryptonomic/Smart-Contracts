import { KeyStore, AlphaOperationsWithMetadata } from 'conseiljs';

export interface operationArguments {
    server: string,
    keyStore: KeyStore;
    to: string;
}

export interface operationResult {
    results: AlphaOperationsWithMetadata,
    operationGroupID: string;
}