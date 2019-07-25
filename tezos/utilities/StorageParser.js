"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d) { return d[0]; }
var moo = require("moo");
var lexer = moo.compile({
    wspace: /[ \t]+/,
    lparen: '(',
    rparen: ')',
    lbrace: '{',
    rbrace: '}',
    zeroArgData: ['Unit', 'True', 'False', 'None'],
    singleArgData: ['Left', 'Right', 'Some'],
    doubleArgData: ['Pair'],
    elt: ['Elt'],
    number: /-?[0-9]+/,
    string: /\".*?\"/,
    semicolon: ';'
});
var singleArgDataFlatten = function (d) { return d[2] + ";"; };
var singleArgDataWithParenFlatten = function (d) { return "" + d[4]; };
var doubleArgDataFlatten = function (d) { return d[2] + ", " + d[4]; };
var doubleArgDataWithParenFlatten = function (d) { return d[4] + ", " + d[6]; };
var listFlatten = function (d) { return d[2] + ", " + d[6]; };
var mapFlatten = function (d) { return "{" + d[2] + "}"; };
var elementFlatten = function (d) { return "[" + d[2] + ", (" + d[4] + ")]"; };
var elementWithSemicolonFlatten = function (d) { return " [" + d[4] + ", (" + d[6] + ")]"; };
;
;
;
exports.Lexer = lexer;
exports.ParserRules = [
    { "name": "data", "symbols": [(lexer.has("string") ? { type: "string" } : string)], "postprocess": id },
    { "name": "data", "symbols": [(lexer.has("number") ? { type: "number" } : number)], "postprocess": id },
    { "name": "data", "symbols": [(lexer.has("zeroArgData") ? { type: "zeroArgData" } : zeroArgData)], "postprocess": id },
    { "name": "data", "symbols": [(lexer.has("singleArgData") ? { type: "singleArgData" } : singleArgData), "_", "data"], "postprocess": singleArgDataFlatten },
    { "name": "data", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("singleArgData") ? { type: "singleArgData" } : singleArgData), "_", "data", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": singleArgDataWithParenFlatten },
    { "name": "data", "symbols": [(lexer.has("doubleArgData") ? { type: "doubleArgData" } : doubleArgData), "_", "data", "_", "data"], "postprocess": doubleArgDataFlatten },
    { "name": "data", "symbols": [(lexer.has("lparen") ? { type: "lparen" } : lparen), "_", (lexer.has("doubleArgData") ? { type: "doubleArgData" } : doubleArgData), "_", "data", "_", "data", "_", (lexer.has("rparen") ? { type: "rparen" } : rparen)], "postprocess": doubleArgDataWithParenFlatten },
    { "name": "data", "symbols": [(lexer.has("lbrace") ? { type: "lbrace" } : lbrace), "_", (lexer.has("rbrace") ? { type: "rbrace" } : rbrace)], "postprocess": function (d) { return "{}"; } },
    { "name": "data$ebnf$1", "symbols": [(lexer.has("semicolon") ? { type: "semicolon" } : semicolon)], "postprocess": id },
    { "name": "data$ebnf$1", "symbols": [], "postprocess": function () { return null; } },
    { "name": "data$ebnf$2", "symbols": ["data"], "postprocess": id },
    { "name": "data$ebnf$2", "symbols": [], "postprocess": function () { return null; } },
    { "name": "data", "symbols": [(lexer.has("lbrace") ? { type: "lbrace" } : lbrace), "_", "data", "_", "data$ebnf$1", "_", "data$ebnf$2", "_", (lexer.has("rbrace") ? { type: "rbrace" } : rbrace)], "postprocess": listFlatten },
    { "name": "data$ebnf$3", "symbols": ["element"] },
    { "name": "data$ebnf$3", "symbols": ["data$ebnf$3", "element"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
    { "name": "data", "symbols": [(lexer.has("lbrace") ? { type: "lbrace" } : lbrace), "_", "data$ebnf$3", "_", (lexer.has("rbrace") ? { type: "rbrace" } : rbrace)], "postprocess": mapFlatten },
    { "name": "element", "symbols": [(lexer.has("elt") ? { type: "elt" } : elt), "_", "data", "_", "data", "_"], "postprocess": elementFlatten },
    { "name": "element", "symbols": [(lexer.has("semicolon") ? { type: "semicolon" } : semicolon), "_", (lexer.has("elt") ? { type: "elt" } : elt), "_", "data", "_", "data", "_"], "postprocess": elementWithSemicolonFlatten },
    { "name": "_$ebnf$1", "symbols": [] },
    { "name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": function (d) { return d[0].concat([d[1]]); } },
    { "name": "_", "symbols": ["_$ebnf$1"] }
];
exports.ParserStart = "data";
