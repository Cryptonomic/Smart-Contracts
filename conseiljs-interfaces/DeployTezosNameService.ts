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
    # Title: Tezos Name Service
    # Author: Teckhua Chiang
    # Company: Cryptonomic Inc.

    parameter
    (or (pair string (pair address int))
        (or (pair string address) (or (pair string int) (or (pair string address) string))));
    storage (pair (big_map string (pair address (pair address int))) string);
    code { DUP ;
        DIP { CDR ;
        CAR ;
        LAMBDA 
            (pair nat nat)
            nat
            { RENAME ;
            DUP ;
            CDR ;
            DUUP ;
            CAR ;
            SUB ;
            DUP ;
            ABS ;
            SWAP ;
            GE ;
            IF {} { UNIT ; FAILWITH } ;
            DIP { DROP } } ;
        DUP ;
        DUUP ;
        LAMBDA 
            (pair (pair nat (pair nat string)) (lambda (pair nat nat) nat))
            string
            { RENAME ;
            DUP ;
            CAR ;
            CAR ;
            DUUP ;
            CAR ;
            CDR ;
            CDR ;
            DUUUP ;
            CDR ;
            DUUUP ;
            DUUUUUP ;
            CAR ;
            CDR ;
            CAR ;
            PAIR ;
            EXEC ;
            DUUUP ;
            SLICE ;
            IF_NONE { UNIT ; FAILWITH } {} ;
            DIP { DROP ; DROP } } ;
        PAIR ;
        PAIR ;
        LAMBDA 
            (pair string
                (pair (pair (lambda (pair (pair nat (pair nat string)) (lambda (pair nat nat) nat)) string)
                            (lambda (pair nat nat) nat))
                        (lambda (pair nat nat) nat)))
            (list string)
            { RENAME ;
            NIL string ;
            DUUP ;
            CDR ;
            CDR ;
            PUSH nat 1 ;
            DUUUUP ;
            CAR ;
            SIZE ;
            PAIR ;
            EXEC ;
            PAIR ;
            PUSH bool True ;
            LOOP { RENAME ;
                    DUUP ;
                    CAR ;
                    PUSH nat 1 ;
                    DUUUP ;
                    CAR ;
                    SLICE ;
                    IF_NONE
                        { UNIT ; FAILWITH }
                        { PUSH nat 0 ;
                        DUUUP ;
                        CAR ;
                        COMPARE ;
                        EQ ;
                        IF { DUUP ;
                            CDR ;
                            DUUUUP ;
                            CAR ;
                            CONS ;
                            DUUUP ;
                            CAR ;
                            PAIR ;
                            PUSH bool False ;
                            PAIR }
                            { PUSH string "." ;
                            DUUP ;
                            COMPARE ;
                            EQ ;
                            IF { DUUUP ;
                                    CDR ;
                                    CAR ;
                                    DUUUP ;
                                    CDR ;
                                    DUUP ;
                                    CAR ;
                                    DUUUP ;
                                    DIIIP { DROP } ;
                                    CDR ;
                                    DUUUUUUP ;
                                    CAR ;
                                    DUUUUUUUP ;
                                    CAR ;
                                    SIZE ;
                                    PAIR ;
                                    PUSH nat 1 ;
                                    DUUUUUUUP ;
                                    CAR ;
                                    ADD ;
                                    PAIR ;
                                    PAIR ;
                                    EXEC ;
                                    CONS ;
                                    DUUUUP ;
                                    CDR ;
                                    CDR ;
                                    PUSH nat 1 ;
                                    DUUUUUP ;
                                    CAR ;
                                    PAIR ;
                                    EXEC ;
                                    PAIR ;
                                    PUSH bool True ;
                                    PAIR }
                                { DUUP ;
                                    CDR ;
                                    DUUUUP ;
                                    CDR ;
                                    CDR ;
                                    PUSH nat 1 ;
                                    DUUUUUP ;
                                    CAR ;
                                    PAIR ;
                                    EXEC ;
                                    PAIR ;
                                    PUSH bool True ;
                                    PAIR } } ;
                        DIP { DROP } } ;
                    DIP { DROP } ;
                    DUP ;
                    CAR ;
                    DIP { CDR } } ;
            DIP { DROP } ;
            RENAME ;
            CDR } ;
        PAIR ;
        LAMBDA 
            (pair (pair string (pair (big_map string (pair address (pair address int))) string))
                (pair (lambda
                            (pair string
                                (pair (pair (lambda (pair (pair nat (pair nat string)) (lambda (pair nat nat) nat)) string)
                                            (lambda (pair nat nat) nat))
                                        (lambda (pair nat nat) nat)))
                            (list string))
                        (pair (pair (lambda (pair (pair nat (pair nat string)) (lambda (pair nat nat) nat)) string)
                                    (lambda (pair nat nat) nat))
                            (lambda (pair nat nat) nat))))
            bool
            { RENAME ;
            DUP ;
            CDR ;
            PUSH bool False ;
            DUUP ;
            CAR ;
            DUUUP ;
            CDR ;
            DUUUUUP ;
            CAR ;
            CAR ;
            PAIR ;
            EXEC ;
            ITER { RENAME ;
                    DIP { DUP } ;
                    PAIR ;
                    DUUUUP ;
                    CAR ;
                    CDR ;
                    CAR ;
                    DUUP ;
                    CAR ;
                    GET ;
                    IF_NONE
                        { DUP ; CDR }
                        { DUP ;
                        CAR ;
                        SENDER ;
                        COMPARE ;
                        EQ ;
                        IF { PUSH bool True ; DUUUP ; CDR ; COMPARE ; EQ } { DUUP ; CDR } ;
                        DIP { DROP } } ;
                    DIP { DROP ; DROP } } ;
            DIP { DROP ; DROP } } ;
        DUUP ;
        DUUP ;
        PAIR ;
        DUUUUUP ;
        IF_LEFT
            { RENAME ;
            DUP ;
            CAR ;
            DUUUUUUUUP ;
            CAR ;
            DUUP ;
            GET ;
            IF_NONE
                { DUUUUP ;
                DUUUUUUP ;
                DUUUUUUUUUUP ;
                DUUUUP ;
                PAIR ;
                PAIR ;
                EXEC ;
                IF { DUUUUUUUUP ;
                        CDR ;
                        DUUUUUUUUUP ;
                        CAR ;
                        DUUUUP ;
                        CDR ;
                        CDR ;
                        DUUUUUP ;
                        CDR ;
                        CAR ;
                        PAIR ;
                        SENDER ;
                        PAIR ;
                        DUUUUP ;
                        DIP { SOME } ;
                        UPDATE ;
                        PAIR ;
                        NIL operation ;
                        PAIR }
                    { DUP ;
                        PUSH string "You do not have permission to register that domain: " ;
                        PAIR ;
                        FAILWITH } }
                { DUUP ;
                PUSH string "Domain is not available: " ;
                PAIR ;
                FAILWITH } ;
            DIP { DROP ; DROP } }
            { RENAME ;
            DUP ;
            IF_LEFT
                { RENAME ;
                DUP ;
                CAR ;
                DUUUUUUUUUP ;
                CAR ;
                DUUP ;
                GET ;
                IF_NONE
                    { DUP ; FAILWITH }
                    { DUP ;
                    CAR ;
                    SENDER ;
                    COMPARE ;
                    EQ ;
                    IF { DUUUUUUUUUUP ;
                            CDR ;
                            DUUUUUUUUUUUP ;
                            CAR ;
                            DUUUP ;
                            CDR ;
                            CDR ;
                            DUUUUUUP ;
                            CDR ;
                            PAIR ;
                            DUUUUP ;
                            CAR ;
                            PAIR ;
                            DUUUUUP ;
                            DIP { SOME } ;
                            UPDATE ;
                            PAIR ;
                            NIL operation ;
                            PAIR }
                        { DUUP ;
                            PUSH string "You do not own that domain: " ;
                            PAIR ;
                            FAILWITH } ;
                    DIP { DROP } } ;
                DIP { DROP ; DROP } }
                { RENAME ;
                DUP ;
                IF_LEFT
                    { RENAME ;
                    DUP ;
                    CAR ;
                    DUUUUUUUUUUP ;
                    CAR ;
                    DUUP ;
                    GET ;
                    IF_NONE
                        { DUP ; FAILWITH }
                        { DUP ;
                        CAR ;
                        SENDER ;
                        COMPARE ;
                        EQ ;
                        IF { DUUUUUUUUUUUP ;
                                CDR ;
                                DUUUUUUUUUUUUP ;
                                CAR ;
                                DUUUUUP ;
                                CDR ;
                                DUUUUP ;
                                CDR ;
                                CAR ;
                                PAIR ;
                                DUUUUP ;
                                CAR ;
                                PAIR ;
                                DUUUUUP ;
                                DIP { SOME } ;
                                UPDATE ;
                                PAIR ;
                                NIL operation ;
                                PAIR }
                            { DUUP ;
                                PUSH string "You do not own that domain: " ;
                                PAIR ;
                                FAILWITH } ;
                        DIP { DROP } } ;
                    DIP { DROP ; DROP } }
                    { RENAME ;
                    DUP ;
                    IF_LEFT
                        { RENAME ;
                        DUP ;
                        CAR ;
                        DUUUUUUUUUUUP ;
                        CAR ;
                        DUUP ;
                        GET ;
                        IF_NONE
                            { DUP ; FAILWITH }
                            { DUUUUUUUUP ;
                            DUUUUUUUUUUP ;
                            DUUUUUUUUUUUUUUP ;
                            DUUUUUP ;
                            PAIR ;
                            PAIR ;
                            EXEC ;
                            IF { DUUUUUUUUUUUUP ;
                                    CDR ;
                                    DUUUUUUUUUUUUUP ;
                                    CAR ;
                                    DUUUP ;
                                    CDR ;
                                    DUUUUUUP ;
                                    CDR ;
                                    PAIR ;
                                    DUUUUUP ;
                                    DIP { SOME } ;
                                    UPDATE ;
                                    PAIR ;
                                    NIL operation ;
                                    PAIR }
                                { DUUP ;
                                    PUSH string "You do not have permission to transfer that domain: " ;
                                    PAIR ;
                                    FAILWITH } ;
                            DIP { DROP } } ;
                        DIP { DROP ; DROP } }
                        { RENAME ;
                        DUUUUUUP ;
                        DUUUUUUUUP ;
                        DUUUUUUUUUUUUP ;
                        DUUUUP ;
                        PAIR ;
                        PAIR ;
                        EXEC ;
                        IF { DUUUUUUUUUUP ;
                                CDR ;
                                DUUUUUUUUUUUP ;
                                CAR ;
                                DUUUP ;
                                DIP { NONE (pair address (pair address int)) } ;
                                UPDATE ;
                                PAIR ;
                                NIL operation ;
                                PAIR }
                            { DUP ;
                                PUSH string "You do not have permission to delete that domain: " ;
                                PAIR ;
                                FAILWITH } ;
                        DIP { DROP } } ;
                    DIP { DROP } } ;
                DIP { DROP } } ;
            DIP { DROP } } ;
        DIP { DROP ; DROP ; DROP ; DROP ; DROP ; DROP } };
    `;
    const michelson_storage = 'Pair "tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z" (Pair "tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z" "Author: Teckhua Chiang, Company: Cryptonomic")';
    const result = await TezosNodeWriter.sendContractOriginationOperation(tezosNode, keystore, 0, undefined, false, true, 100000, '', 1000, 100000, michelson, michelson_storage, TezosParameterFormat.Michelson);

    console.log(`Injected operation group id ${result.operationGroupID}`);
}

deployContract();