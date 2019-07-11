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
var contractAddress = 'KT1Myqcyxp8MNgdB1aAhMpBApZHgVJ634nhm'; // Tezos Managed Ledger - Alphanet Modified
// 'KT1DhPDy765YJwPRY8fRupSZQ3SjuxVvoUYd'; // Tezos Managed Ledger - Alphanet Original
// Implementation of FA1.2
/**
 * Sends the given amount of tokens from one address to another address.
 *
 * @param from - The address of the account from which the tokens are sent
 * @param to - The address of the account to which the tokens are sent
 * @param value - The amount of tokens to send
 */
function transfer(from, to, value) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Left (Pair ' + from + ' (Pair ' + to + ' ' + value + '))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.transfer = transfer;
/**
 * Allows another account to withdraw from your account, multiple times, up to the given amount.
 * If this function is called again it overwrites the current allowance with the new given amount.
 *
 * @param spender - The address of the account that can withdraw from your account
 * @param value - The amount of allowance given to the spender
 */
function approve(spender, value) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Right (Left (Pair ' + spender + ' ' + value + '))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.approve = approve;
/**
 * Returns the amount which an account is still allowed to withdraw from another account to a receiving smart contract.
 *
 * @param owner - The address of the account providing the allowance
 * @param spender - The address of the account receiving the allowance
 * @param remaining - A contract of type nat
 */
function getAllowance(owner, spender, remaining) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Right (Right (Left (Pair (Pair ' + owner + ' ' + spender + ') ' + remaining + '))))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getAllowance = getAllowance;
/**
 * Returns the account balance of an account with the given address to a receiving smart contract.
 *
 * @param owner - The address of the account from which the account balance is retrieved
 * @param balance - A contract of type nat
 */
function getBalance(owner, balance) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Right (Right (Right (Left (Pair ' + owner + ' ' + balance + '))))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getBalance = getBalance;
/**
 * Returns the total token supply to a receiving smart contract.
 *
 * @param totalSupply - A contract of type nat
 */
function getTotalSupply(totalSupply) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Right (Right (Right (Right (Left (Pair Unit ' + totalSupply + ')))))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
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
/**
 * Pauses operations when the parameter is True, and resumes them when the parameter is False.
 * During the pause, no contract can perform transfer or approval operations.
 * The administrator is still allowed to perform his operations.
 *
 * @param pause - Whether the blockchain is frozen or not
 */
function setPause(pause) {
    return __awaiter(this, void 0, void 0, function () {
        var input, parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    input = String(pause).charAt(0).toUpperCase() + String(pause).slice(1);
                    parameter = 'Right (Right (Right (Right (Right (Left ' + input + ')))))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.setPause = setPause;
/**
 * Changes the current administrator.
 *
 * @param administrator - The address of the new administrator
 */
function setAdministrator(administrator) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Right (Right (Right (Right (Right (Right (Left ' + administrator + '))))))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.setAdministrator = setAdministrator;
/**
 * Returns the address of the current administrator to a receiving smart contract.
 *
 * @param administrator - A contract of type string
 */
function getAdministrator(administrator) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Right (Right (Right (Right (Right (Right (Right (Left (Pair Unit ' + administrator + '))))))))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getAdministrator = getAdministrator;
/**
 * Produces the given amount of tokens on the account associated with the given address.
 *
 * @param to - The address to which the newly minted tokens are sent
 * @param value - The amount of tokens to mint
 */
function mint(to, value) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Right (Right (Right (Right (Right (Right (Right (Right (Left (Pair ' + to + ' ' + value + ')))))))))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 150000, '', 5392, 144382, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.mint = mint;
/**
 * Destroys the given amount of tokens on the account associated with the given address.
 *
 * @param from - The account from which the tokens are destroyed
 * @param value - The amount of tokens to destroy
 */
function burn(from, value) {
    return __awaiter(this, void 0, void 0, function () {
        var parameter, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parameter = 'Right (Right (Right (Right (Right (Right (Right (Right (Right (Left (Pair ' + from + ' ' + value + '))))))))))';
                    return [4 /*yield*/, conseiljs_1.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 0, 300000, '', 55392, 504382, parameter, conseiljs_1.TezosParameterFormat.Michelson)];
                case 1:
                    result = _a.sent();
                    console.log("Injected operation group id " + result.operationGroupID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.burn = burn;
