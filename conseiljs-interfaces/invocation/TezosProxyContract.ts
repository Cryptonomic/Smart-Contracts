import { TezosNodeWriter, TezosParameterFormat, KeyStore } from 'conseiljs';

const tezosNode = 'https://tezos-dev.cryptonomic-infra.tech/';

const contractAddress = 'KT1GkF5ty6vfjLhqYdaPQCcYBBDQKbUiC8vF'; // Tezos Proxy Contract - Alphanet

export async function setDestination(destination: string, keystore: KeyStore) {
    const parameter = destination;
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}