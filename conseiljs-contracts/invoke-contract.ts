import { TezosNodeWriter, StoreType } from 'conseiljs';

const tezosNode = 'https://tezos-dev.cryptonomic-infra.tech/';

async function invokeContract() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: StoreType.Fundraiser
    };
    const contractAddress = 'KT1KA7DqFjShLC4CPtChPX8QtRYECUb99xMY';

    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 10000, 100000, '', 1000, 100000, '"Cryptonomicon"');
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

invokeContract();