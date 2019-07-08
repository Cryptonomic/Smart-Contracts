import { TezosNodeWriter, StoreType, TezosParameterFormat } from 'conseiljs';

const tezosNode = 'https://tezos-dev.cryptonomic-infra.tech/';

const keystore = {
    publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
    privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
    publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
    seed: '',
    storeType: StoreType.Fundraiser
};

const contractAddress = ''; // Tezos Managed Ledger - Alphanet

// Implementation of FA1.2

export async function transfer(from: string, to: string, value: number) {
    const parameter = 'Left (Pair '+ from + ' (Pair ' + to + ' ' + value + '))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

export async function approve(spender: string, value: number) {
    const parameter = 'Right (Left (Pair ' + spender + ' ' + value + '))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

export async function getAllowance(owner: string, spender: string, remaining: number) {
    const parameter = 'Right (Right (Left (Pair (Pair ' + owner + ' ' + spender + ') ' + remaining + '))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

export async function getBalance(owner: string, balance: number) {
    const parameter = 'Right (Right (Right (Left (Pair ' + owner + ' ' + balance + '))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

export async function getTotalSupply(totalSupply: number) {
    const parameter = 'Right (Right (Right (Right (Left (Pair Unit ' + totalSupply + ')))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

// Additional operations

export async function setPause(pause: boolean) {
    const parameter = 'Right (Right (Right (Right (Right (Left ' + pause + ')))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

export async function setAdministrator(administrator: string) {
    const parameter = 'Right (Right (Right (Right (Right (Right (Left ' + administrator + '))))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

export async function getAdministrator(administrator: string) {
    const parameter = 'Right (Right (Right (Right (Right (Right (Right (Left (Pair Unit ' + administrator + '))))))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

export async function mint(to: string, value: number) {
    const parameter = 'Right (Right (Right (Right (Right (Right (Right (Right (Left (Pair ' + to + ' ' + value + ')))))))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

export async function burn(from: string, value: number) {
    const parameter = 'Right (Right (Right (Right (Right (Right (Right (Right (Right (Left (Pair ' + from + ' ' + value + '))))))))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}