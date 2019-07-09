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
Object.defineProperty(exports, "__esModule", { value: true });
var conseiljs_1 = require("conseiljs");
var tezosNode = 'https://tezos-dev.cryptonomic-infra.tech/';
var keystore = {
    publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
    privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
    publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
    seed: '',
    storeType: conseiljs_1.StoreType.Fundraiser
};
var contractAddress = ''; // Tezos Managed Ledger - Alphanet
// Implementation of FA1.2
function transfer(from, to, value) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Left (Pair ' + from + ' (Pair ' + to + ' ' + value + '))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.transfer = transfer;
function approve(spender, value) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Right (Left (Pair ' + spender + ' ' + value + '))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.approve = approve;
function getAllowance(owner, spender, remaining) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Right (Right (Left (Pair (Pair ' + owner + ' ' + spender + ') ' + remaining + '))))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getAllowance = getAllowance;
function getBalance(owner, balance) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Right (Right (Right (Left (Pair ' + owner + ' ' + balance + '))))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getBalance = getBalance;
function getTotalSupply(totalSupply) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Right (Right (Right (Right (Left (Pair Unit ' + totalSupply + ')))))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getTotalSupply = getTotalSupply;
// Additional operations
function setPause(pause) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Right (Right (Right (Right (Right (Left ' + pause + ')))))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.setPause = setPause;
function setAdministrator(administrator) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Right (Right (Right (Right (Right (Right (Left ' + administrator + '))))))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.setAdministrator = setAdministrator;
function getAdministrator(administrator) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Right (Right (Right (Right (Right (Right (Right (Left (Pair Unit ' + administrator + '))))))))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getAdministrator = getAdministrator;
function mint(to, value) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Right (Right (Right (Right (Right (Right (Right (Right (Left (Pair ' + to + ' ' + value + ')))))))))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.mint = mint;
function burn(from, value) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Right (Right (Right (Right (Right (Right (Right (Right (Right (Left (Pair ' + from + ' ' + value + '))))))))))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 50000, '', 1000, 100000, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.burn = burn;
