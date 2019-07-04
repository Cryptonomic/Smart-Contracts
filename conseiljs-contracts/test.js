"use strict";
exports.__esModule = true;
var TezosBakerRegistry = require("./TezosBakerRegistry");
var TezosProxyRedirect = require("./TezosProxyContract");
// Run each line individually because the previous transaction needs to complete before the next one can activate.
TezosBakerRegistry.updateName('"Juniper"');
TezosBakerRegistry.updatePaymentAddress('"tz1ZfRNceHjHNqbRS5sWBNnUbct3f96fzTkU"');
TezosBakerRegistry.updateTerms(264, 64, 16);
TezosBakerRegistry.deleteRegistration();
TezosProxyRedirect.setDestination('"KT1GkF5ty6vfjLhqYdaPQCcYBBDQKbUiC8vF"');
