import { TezosNodeWriter, StoreType } from 'conseiljs';

const tezosNode = 'https://tezos-dev.cryptonomic-infra.tech/';

async function deployContract() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: StoreType.Fundraiser
    };
    const contract = `parameter string;
    storage string;
    code {CAR; NIL operation; PAIR;};`;
    const storage = 'Sample';

    const result = await TezosNodeWriter.sendContractOriginationOperation(tezosNode, keystore, 10000, undefined, true, true, 100000, '', '10000', '10000', contract, storage);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

deployContract();