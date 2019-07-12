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
    parameter (pair
      (pair
         nat # counter, used to prevent replay attacks
         (or    # payload to sign, represents the requested action
            (pair     # transfer tokens
               mutez  # amount to transfer
               (contract unit)) # destination to transfer to
            (or
               (option key_hash) # change the delegate to this address
               (pair           # change the keys controlling the multisig
                  nat          # new threshold
                  (list key)))))     # new list of keys
      (list  (option signature)));    # signatures

      storage (pair nat (pair nat (list key))) ;

      code
      {
      UNPAIR ; SWAP ; DUP ; DIP { SWAP } ;
      DIP
      {
      UNPAIR ;
      # pair the payload with the current contract address, to ensure signatures
      # can't be replayed accross different contracts if a key is reused.
      DUP ; SELF ; ADDRESS ; PAIR ;
      PACK ;
      DIP { UNPAIR ; DIP { SWAP } } ; SWAP
      } ;

      # Check that the counters match
      UNPAIR ; DIP { SWAP };
      ASSERT_CMPEQ ;

      # Compute the number of valid signatures
      DIP { SWAP } ; UNPAIR ;
      DIP
      {
      # Running count of valid signatures
      PUSH nat 0; SWAP ;
      ITER
        {
          DIP { SWAP } ; SWAP ;
          IF_CONS
            {
              IF_SOME
                { SWAP ;
                  DIP
                    {
                      SWAP ; DIIP { DUUP } ;
                      # Checks signatures, fails if invalid
                      CHECK_SIGNATURE ; ASSERT ;
                      PUSH nat 1 ; ADD } }
                { SWAP ; DROP }
            }
            {
              # There were fewer signatures in the list
              # than keys. Not all signatures must be present, but
              # they should be marked as absent using the option type.
              FAIL
            } ;
          SWAP
        }
      } ;
      # Assert that the threshold is less than or equal to the
      # number of valid signatures.
      ASSERT_CMPLE ;
      DROP ; DROP ;

      # Increment counter and place in storage
      DIP { UNPAIR ; PUSH nat 1 ; ADD ; PAIR} ;

      # We have now handled the signature verification part,
      # produce the operation requested by the signers.
      NIL operation ; SWAP ;
      IF_LEFT
      { # Transfer tokens
      UNPAIR ; UNIT ; TRANSFER_TOKENS ; CONS }
      { IF_LEFT {
                # Change delegate
                SET_DELEGATE ; CONS }
              {
                # Change set of signatures
                DIP { SWAP ; CAR } ; SWAP ; PAIR ; SWAP }} ;
      PAIR }
    `;
    const michelson_storage = 'Pair 0 (Pair 2 {})';
    const result = await TezosNodeWriter.sendContractOriginationOperation(tezosNode, keystore, 0, undefined, false, true, 100000, '', 1000, 100000, michelson, michelson_storage, TezosParameterFormat.Michelson);

    console.log(`Injected operation group id ${result.operationGroupID}`);
}

deployContract();