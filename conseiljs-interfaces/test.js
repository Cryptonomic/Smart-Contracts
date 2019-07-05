"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var TezosBakerRegistry = __importStar(require("./TezosBakerRegistry"));
var TezosProxyRedirect = __importStar(require("./TezosProxyContract"));
// Run each line individually because the previous transaction needs to complete before the next one can activate.
TezosBakerRegistry.updateName('"Juniper"');
TezosBakerRegistry.updatePaymentAddress('"tz1ZfRNceHjHNqbRS5sWBNnUbct3f96fzTkU"');
TezosBakerRegistry.updateTerms(264, 64, 16);
TezosBakerRegistry.deleteRegistration();
TezosProxyRedirect.setDestination('"KT1GkF5ty6vfjLhqYdaPQCcYBBDQKbUiC8vF"');
