import * as TezosBakerRegistry from './tezos-baker-registry/TezosBakerRegistry';
import * as TezosProxyRedirect from './tezos-proxy-redirect/TezosProxyRedirect';
import * as TezosManagedLedger from './tezos-managed-ledger/TezosManagedLedger';
import * as KeystoreGenerator from '../utilities/KeystoreGenerator';
import { TezosWalletUtil, StoreType } from 'conseiljs';

const keystore = {
    publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
    privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
    publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
    seed: '',
    storeType: StoreType.Fundraiser
};

//console.log(TezosWalletUtil.restoreIdentityWithSecretKey("249f83edf6696c8b4f38f409b89a755166e2df09"));

// Run each line individually because the previous transaction needs to complete before the next one can activate.

//TezosBakerRegistry.updateName('"Juniper"');
//TezosBakerRegistry.updatePaymentAddress('"tz1ZfRNceHjHNqbRS5sWBNnUbct3f96fzTkU"');
//TezosBakerRegistry.updateTerms(1020, 50, 360);
//TezosBakerRegistry.deleteRegistration();

TezosProxyRedirect.setDestination('"tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z"', keystore);

//TezosManagedLedger.transfer('"tz1NxX9cmcU8FKtAt8xLaK6zgkT1ZxwgE4jk"', '"KT1DhPDy765YJwPRY8fRupSZQ3SjuxVvoUYd"', 79);
//TezosManagedLedger.approve('"KT1DhPDy765YJwPRY8fRupSZQ3SjuxVvoUYd"', 580);

/*
TezosManagedLedger.getAllowance
TezosManagedLedger.getBalance
TezosManagedLedger.getTotalSupply
*/

//TezosManagedLedger.setPause(false);

//TezosManagedLedger.setAdministrator('"tz1NxX9cmcU8FKtAt8xLaK6zgkT1ZxwgE4jk"');

//TezosManagedLedger.mint('"tz1Po8u9NrkFKDsXgkiAYKfLrjvmao2TYBce"', 20000);

//TezosManagedLedger.burn('"tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z"', 50);