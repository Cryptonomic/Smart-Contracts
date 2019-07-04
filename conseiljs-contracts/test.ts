import * as TezosBakerRegistry from './tezos-baker-registry/TezosBakerRegistry';
//import * as TezosProxyRedirect from './tezos-proxy-redirect/TezosProxyContract';

// Run each line individually because the previous transaction needs to complete before the next one can activate.
TezosBakerRegistry.updateName('"Juniper"');
TezosBakerRegistry.updatePaymentAddress('"tz1ZfRNceHjHNqbRS5sWBNnUbct3f96fzTkU"');
TezosBakerRegistry.updateTerms(264, 64, 16);
TezosBakerRegistry.deleteRegistration();