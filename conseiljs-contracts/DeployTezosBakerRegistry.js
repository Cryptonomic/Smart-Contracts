"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var conseiljs_1 = require("conseiljs");
var tezosNode = 'https://tezos-dev.cryptonomic-infra.tech/';
function deployContract() {
    return __awaiter(this, void 0, void 0, function () {
        var keystore, michelson, michelson_storage, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    keystore = {
                        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
                        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
                        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
                        seed: '',
                        storeType: conseiljs_1.StoreType.Fundraiser
                    };
                    michelson = "\n    # Title: Tezos Baker Registry\n    # Author: Teckhua Chiang\n    # Company: Cryptonomic Inc.\n\n    parameter (or string (or address (or (pair int (pair int mutez)) unit)));\n    storage\n      (pair (map address (pair string address))\n            (pair (map address (map int (pair int mutez))) string));\n    code { DUP ;\n          DIP { CDR @storage_slash_1 } ;\n          CAR @parameter_slash_2 ;\n          DUP ;\n          IF_LEFT\n            { RENAME @name_slash_3 ;\n              SENDER @sender10 ;\n              DUUUUP ;\n              CDR ;\n              DUUUUUP ;\n              CAR ;\n              DUUUUUUP ;\n              CAR ;\n              DUUUUP @sender10 ;\n              GET ;\n              IF_NONE\n                { DUUUP @sender10 ; PUSH string \"\" ; PAIR }\n                { DUP @var17 ; DIP { DROP } } ;\n              RENAME @recordOfNameAndPayer15 ;\n              CDR ;\n              DUUUUUP @name ;\n              PAIR @newRecordOfNameAndPayer25 ;\n              DUUUUP @sender10 ;\n              DIP { SOME } ;\n              UPDATE ;\n              PAIR @storage28 ;\n              NIL operation ;\n              PAIR ;\n              DIP { DROP } ;\n              DIP { DROP } }\n            { RENAME @var8_slash_9 ;\n              DUP @var8 ;\n              IF_LEFT\n                { RENAME @payer_slash_10 ;\n                  SENDER @sender36 ;\n                  DUUUUUP ;\n                  CDR ;\n                  DUUUUUUP ;\n                  CAR ;\n                  DUUUUP @payer ;\n                  DUUUUUUUUP ;\n                  CAR ;\n                  DUUUUUP @sender36 ;\n                  GET ;\n                  IF_NONE\n                    { DUUUUP @sender36 ; PUSH string \"\" ; PAIR }\n                    { DUP @var43 ; DIP { DROP } } ;\n                  RENAME @recordOfNameAndPayer ;\n                  CAR ;\n                  PAIR @newRecordOfNameAndPayer ;\n                  DUUUUP @sender36 ;\n                  DIP { SOME } ;\n                  UPDATE ;\n                  PAIR @storage54 ;\n                  NIL operation ;\n                  PAIR ;\n                  DIP { DROP } ;\n                  DIP { DROP } }\n                { RENAME @var34_slash_16 ;\n                  DUP @var34 ;\n                  IF_LEFT\n                    { RENAME @_cycle_fee_minimum_slash_17 ;\n                      SENDER @sender62 ;\n                      DUUUUUUP ;\n                      CDR ;\n                      CDR ;\n                      DUUUUUUUP ;\n                      CDR ;\n                      CAR ;\n                      DUUUUUUUUP ;\n                      CDR ;\n                      CAR ;\n                      DUUUUP @sender62 ;\n                      GET ;\n                      IF_NONE\n                        { PUSH (map int (pair int mutez)) {} }\n                        { DUP @var73 ; DIP { DROP } } ;\n                      RENAME @recordsOfFeeAndMinimumAsOfCycle ;\n                      DUUUUUP ;\n                      CDR ;\n                      CDR @minimum ;\n                      DUUUUUUP ;\n                      CDR ;\n                      CAR @fee ;\n                      PAIR @newRecordOfFeeAndMinimum ;\n                      DUUUUUUP ;\n                      CAR @cycle ;\n                      DIP { SOME } ;\n                      UPDATE @newRecordsOfFeeAndMinimumAsOfCycle ;\n                      DUUUUP @sender62 ;\n                      DIP { SOME } ;\n                      UPDATE ;\n                      PAIR ;\n                      DUUUUUUUP ;\n                      CAR ;\n                      PAIR @storage90 ;\n                      NIL operation ;\n                      PAIR ;\n                      DIP { DROP } ;\n                      DIP { DROP } }\n                    { RENAME @__slash_27 ;\n                      SENDER @sender ;\n                      DUUUUUUP ;\n                      CDR ;\n                      CDR ;\n                      DUUUUUUUP ;\n                      CDR ;\n                      CAR ;\n                      DUUUP @sender ;\n                      DIP { NONE (map int (pair int mutez)) } ;\n                      UPDATE ;\n                      PAIR ;\n                      DUUUUUUUP ;\n                      CAR ;\n                      DUUUP @sender ;\n                      DIP { NONE (pair string address) } ;\n                      UPDATE ;\n                      PAIR @storage104 ;\n                      NIL operation ;\n                      PAIR ;\n                      DIP { DROP } ;\n                      DIP { DROP } } ;\n                  DIP { DROP } } ;\n              DIP { DROP } } ;\n          DIP { DROP ; DROP } };\n    ";
                    michelson_storage = 'Pair {} (Pair {} "Author: Teckhua Chiang, Company: Cryptonomic")';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractOriginationOperation(tezosNode, keystore, 0, undefined, false, true, 100000, '', 1000, 100000, michelson, michelson_storage, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
deployContract();
