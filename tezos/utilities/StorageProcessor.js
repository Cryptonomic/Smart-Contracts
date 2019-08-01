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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var conseiljs_1 = require("conseiljs");
var nearley = __importStar(require("nearley"));
var StorageParser = __importStar(require("./StorageParser"));
function processStorage(address, conseilServer, network) {
    return __awaiter(this, void 0, void 0, function () {
        var account, parser, rawStorage, processedStorage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, conseiljs_1.TezosConseilClient.getAccount(conseilServer, network, address)];
                case 1:
                    account = _a.sent();
                    parser = new nearley.Parser(nearley.Grammar.fromCompiled(StorageParser));
                    parser.feed(account[0].storage);
                    rawStorage = parser.results[0];
                    processedStorage = splitStorageString(rawStorage);
                    return [2 /*return*/, processedStorage];
            }
        });
    });
}
exports.processStorage = processStorage;
function splitStorageString(storage) {
    var storageArray = [];
    var nestLevel = 0;
    var lastIndex = 0;
    for (var i = 0; i <= storage.length; i++) {
        if (storage.charAt(i) == '{' || storage.charAt(i) === ' \"') {
            nestLevel++;
        }
        else if (storage.charAt(i) == '}' || storage.charAt(i) === '\" ') {
            nestLevel--;
        }
        else if ((storage.charAt(i) === ',' && nestLevel === 0) || i === storage.length) {
            storageArray.push(storage.substring(lastIndex, i));
            lastIndex = i + 2;
        }
    }
    return storageArray;
}
function processMap(map) {
    var processedMap = new Map();
    map = map.substring(1, map.length - 1);
    var mapArray = splitMapString(map);
    mapArray.forEach(function (element) {
        element = element.substring(1, element.length - 1);
        var firstCommaIndex = element.indexOf(',');
        processedMap.set(element.substring(0, firstCommaIndex), element.substring(firstCommaIndex + 2, element.length));
    });
    return processedMap;
}
exports.processMap = processMap;
function splitMapString(map) {
    var mapArray = [];
    var nestLevel = 0;
    var lastIndex = 0;
    for (var i = 0; i <= map.length; i++) {
        if (map.charAt(i) == '[') {
            nestLevel++;
        }
        else if (map.charAt(i) == ']') {
            nestLevel--;
        }
        else if ((map.charAt(i) === ',' && nestLevel === 0) || i === map.length) {
            mapArray.push(map.substring(lastIndex, i));
            lastIndex = i + 2;
        }
    }
    return mapArray;
}
function processElement(element, index) {
    element = element.substring(1, element.length - 1);
    var elementArray = element.split(',');
    return elementArray[index];
}
exports.processElement = processElement;
