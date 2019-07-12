import { TezosNodeWriter, StoreType, TezosParameterFormat } from 'conseiljs';

const tezosNode = 'https://tezos-dev.cryptonomic-infra.tech/';

const keystore = {
    publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
    privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
    publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
    seed: '',
    storeType: StoreType.Fundraiser
};

const contractAddress = 'KT1BzMC1KL6bEkyiGXUGTd6AGjL1ibFxyxyM'; // Tezos Multisignature Wallet - Alphanet

/**
 * transfer tokens
 * 
 * @param counter - (nat) counter, used to prevent replay attacks
 * @param amount - (mutez) amount to transfer
 * @param dest - (contract unit) destination to transfer to
 * @param sigs - (list (option signature)) signatures
 */
export async function transfer(counter: number, amount: number, dest: string, sigs: string) {
    const parameter = 'Pair (Pair '+ counter + ' (Left (Pair ' + amount + ' ' + dest + '))) ' + sigs;
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * change the delegate to this address
 * 
 * @param counter - (nat) counter, used to prevent replay attacks
 * @param delegate - (option key_hash) - new multisig delegate
 * @param sigs - (list (option signature)) - signatures
 */
export async function action(counter: number, delegate: string, sigs: string) {
    const parameter = 'Pair (Pair ' + counter + ' (Right ' + delegate + '))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

/**
 * change the keys controlling the multisig
 * @param counter - (nat) counter, used to prevent replay attacks
 * @param threshold - (nat) new threshold
 * @param keys - (list key) new list of keys
 * @param sigs - (list (option signature)) - signatures
 */
/*
export async function getAllowance(counter: number, threshold: number, keys: string, sigs: string) {
    const parameter = 'Right (Right (Left (Pair (Pair ' + owner + ' ' + spender + ') ' + remaining + '))))';
    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}
*/