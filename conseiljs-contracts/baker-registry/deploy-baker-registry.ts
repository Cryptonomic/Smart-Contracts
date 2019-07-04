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
    # Title: Tezos Baker Registry
    # Author: Teckhua Chiang
    # Company: Cryptonomic Inc.

    parameter (or string (or address (or (pair int (pair int mutez)) unit)));
storage
  (pair (map address (pair string address))
        (pair (map address (map int (pair int mutez))) string));
code { DUP ;
       DIP { CDR @storage_slash_1 } ;
       CAR @parameter_slash_2 ;
       DUP ;
       IF_LEFT
         { RENAME @name_slash_3 ;
           SENDER @sender10 ;
           DUUUUP ;
           CDR ;
           DUUUUUP ;
           CAR ;
           DUUUUUUP ;
           CAR ;
           DUUUUP @sender10 ;
           GET ;
           IF_NONE
             { DUUUP @sender10 ; PUSH string "" ; PAIR }
             { DUP @var17 ; DIP { DROP } } ;
           RENAME @recordOfNameAndPayer15 ;
           CDR ;
           DUUUUUP @name ;
           PAIR @newRecordOfNameAndPayer25 ;
           DUUUUP @sender10 ;
           DIP { SOME } ;
           UPDATE ;
           PAIR @storage28 ;
           NIL operation ;
           PAIR ;
           DIP { DROP } ;
           DIP { DROP } }
         { RENAME @var8_slash_9 ;
           DUP @var8 ;
           IF_LEFT
             { RENAME @payer_slash_10 ;
               SENDER @sender36 ;
               DUUUUUP ;
               CDR ;
               DUUUUUUP ;
               CAR ;
               DUUUUP @payer ;
               DUUUUUUUUP ;
               CAR ;
               DUUUUUP @sender36 ;
               GET ;
               IF_NONE
                 { DUUUUP @sender36 ; PUSH string "" ; PAIR }
                 { DUP @var43 ; DIP { DROP } } ;
               RENAME @recordOfNameAndPayer ;
               CAR ;
               PAIR @newRecordOfNameAndPayer ;
               DUUUUP @sender36 ;
               DIP { SOME } ;
               UPDATE ;
               PAIR @storage54 ;
               NIL operation ;
               PAIR ;
               DIP { DROP } ;
               DIP { DROP } }
             { RENAME @var34_slash_16 ;
               DUP @var34 ;
               IF_LEFT
                 { RENAME @_cycle_fee_minimum_slash_17 ;
                   SENDER @sender62 ;
                   DUUUUUUP ;
                   CDR ;
                   CDR ;
                   DUUUUUUUP ;
                   CDR ;
                   CAR ;
                   DUUUUUUUUP ;
                   CDR ;
                   CAR ;
                   DUUUUP @sender62 ;
                   GET ;
                   IF_NONE
                     { PUSH (map int (pair int mutez)) {} }
                     { DUP @var73 ; DIP { DROP } } ;
                   RENAME @recordsOfFeeAndMinimumAsOfCycle ;
                   DUUUUUP ;
                   CDR ;
                   CDR @minimum ;
                   DUUUUUUP ;
                   CDR ;
                   CAR @fee ;
                   PAIR @newRecordOfFeeAndMinimum ;
                   DUUUUUUP ;
                   CAR @cycle ;
                   DIP { SOME } ;
                   UPDATE @newRecordsOfFeeAndMinimumAsOfCycle ;
                   DUUUUP @sender62 ;
                   DIP { SOME } ;
                   UPDATE ;
                   PAIR ;
                   DUUUUUUUP ;
                   CAR ;
                   PAIR @storage90 ;
                   NIL operation ;
                   PAIR ;
                   DIP { DROP } ;
                   DIP { DROP } }
                 { RENAME @__slash_27 ;
                   SENDER @sender ;
                   DUUUUUUP ;
                   CDR ;
                   CDR ;
                   DUUUUUUUP ;
                   CDR ;
                   CAR ;
                   DUUUP @sender ;
                   DIP { NONE (map int (pair int mutez)) } ;
                   UPDATE ;
                   PAIR ;
                   DUUUUUUUP ;
                   CAR ;
                   DUUUP @sender ;
                   DIP { NONE (pair string address) } ;
                   UPDATE ;
                   PAIR @storage104 ;
                   NIL operation ;
                   PAIR ;
                   DIP { DROP } ;
                   DIP { DROP } } ;
               DIP { DROP } } ;
           DIP { DROP } } ;
       DIP { DROP ; DROP } };

    `;
    const michelson_storage = 'Pair {} (Pair {} "Author: Teckhua Chiang, Company: Cryptonomic")';
    const result = await TezosNodeWriter.sendContractOriginationOperation(tezosNode, keystore, 0, undefined, false, true, 100000, '', 1000, 100000, michelson, michelson_storage, TezosParameterFormat.Michelson);

    console.log(`Injected operation group id ${result.operationGroupID}`);
}

deployContract();