import { TezosNodeWriter, StoreType, TezosParameterFormat } from 'conseiljs';

const tezosNode = 'https://tezos-dev.cryptonomic-infra.tech/';

async function deployContract() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: StoreType.Fundraiser
    };

    const michelson = `
    # Title: Tezos Proxy Redirect
    # Author: Teckhua Chiang
    # Company: Cryptonomic Inc.

    parameter address;
  storage (pair address (pair address string));
  code { DUP ;
        DIP { CDR } ;
        CAR ;
        DUUP ;
        CAR ;
        SENDER ;
        COMPARE ;
        EQ ;
        IF { DUUP ;
              CDR ;
              CDR ;
              DUUP ;
              PAIR ;
              DUUUP ;
              CAR ;
              PAIR ;
              NIL operation ;
              PAIR }
            { PUSH string "You do not own this proxy contract" ; FAILWITH } ;
        DIP { DROP ; DROP } };
    `;
    const michelson_storage = 'Pair "tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z" (Pair "tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z" "Author: Teckhua Chiang, Company: Cryptonomic")';
    const result = await TezosNodeWriter.sendContractOriginationOperation(tezosNode, keystore, 0, undefined, false, true, 100000, '', 1000, 100000, michelson, michelson_storage, TezosParameterFormat.Michelson);

    console.log(`Injected operation group id ${result.operationGroupID}`);
}

deployContract();