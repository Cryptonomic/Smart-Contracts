import { TezosNodeWriter, StoreType, TezosParameterFormat } from 'conseiljs';

const tezosNode = 'https://tezos-dev.cryptonomic-infra.tech/';

const keystore = {
    publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
    privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
    publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
    seed: '',
    storeType: StoreType.Fundraiser
};

const contractAddress = 'KT1GkF5ty6vfjLhqYdaPQCcYBBDQKbUiC8vF'; // Tezos Name Service - Alphanet

export async function registerDomain(destination: string) {
    const parameter = destination;
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

export async function updateResolver(destination: string) {
    const parameter = destination;
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

export async function updateTTL(destination: string) {
    const parameter = destination;
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

export async function transferOwnership(destination: string) {
    const parameter = destination;
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

export async function deleteDomain(destination: string) {
    const parameter = destination;
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}