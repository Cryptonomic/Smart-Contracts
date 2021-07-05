// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var string: any;
declare var number: any;
declare var zeroArgData: any;
declare var singleArgData: any;
declare var lparen: any;
declare var rparen: any;
declare var doubleArgData: any;
declare var lbrace: any;
declare var rbrace: any;
declare var semicolon: any;
declare var elt: any;

const moo = require("moo");

const lexer = moo.compile({
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


    const singleArgDataFlatten = (d: Array<string>) => { return `${d[2]};`; }
    const singleArgDataWithParenFlatten = (d: Array<string>) => { return `${d[4]}`; }
    const doubleArgDataFlatten = (d: Array<string>) => { return `${d[2]}, ${d[4]}`; }
    const doubleArgDataWithParenFlatten = (d: Array<string>) => { return `${d[4]}, ${d[6]}`; }

    const listFlatten = (d: Array<string>) => { return `` }
    const mapFlatten = (d: Array<string>) => { return `{${d[2]}}` }
    const elementFlatten = (d: Array<string>) => { return `[${d[2]}, (${d[4]})]`; }
    const elementWithSemicolonFlatten = (d: Array<string>) => { return ` [${d[4]}, (${d[6]})]`; }

export interface Token { value: any; [key: string]: any };

export interface Lexer {
  reset: (chunk: string, info: any) => void;
  next: () => Token | undefined;
  save: () => any;
  formatError: (token: Token) => string;
  has: (tokenType: string) => boolean
};

export interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any
};

export type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

export var Lexer: Lexer | undefined = lexer;

export var ParserRules: NearleyRule[] = [
    {"name": "data", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": id},
    {"name": "data", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": id},
    {"name": "data", "symbols": [(lexer.has("zeroArgData") ? {type: "zeroArgData"} : zeroArgData)], "postprocess": id},
    {"name": "data", "symbols": [(lexer.has("singleArgData") ? {type: "singleArgData"} : singleArgData), "_", "data"], "postprocess": singleArgDataFlatten},
    {"name": "data", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("singleArgData") ? {type: "singleArgData"} : singleArgData), "_", "data", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": singleArgDataWithParenFlatten},
    {"name": "data", "symbols": [(lexer.has("doubleArgData") ? {type: "doubleArgData"} : doubleArgData), "_", "data", "_", "data"], "postprocess": doubleArgDataFlatten},
    {"name": "data", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("doubleArgData") ? {type: "doubleArgData"} : doubleArgData), "_", "data", "_", "data", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": doubleArgDataWithParenFlatten},
    {"name": "data", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": (d: Array<string>) => "{}"},
    {"name": "data$ebnf$1", "symbols": [(lexer.has("semicolon") ? {type: "semicolon"} : semicolon)], "postprocess": id},
    {"name": "data$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "data$ebnf$2", "symbols": ["data"], "postprocess": id},
    {"name": "data$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "data", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "data", "_", "data$ebnf$1", "_", "data$ebnf$2", "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": listFlatten},
    {"name": "data$ebnf$3", "symbols": ["element"]},
    {"name": "data$ebnf$3", "symbols": ["data$ebnf$3", "element"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "data", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "data$ebnf$3", "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": mapFlatten},
    {"name": "element", "symbols": [(lexer.has("elt") ? {type: "elt"} : elt), "_", "data", "_", "data", "_"], "postprocess": elementFlatten},
    {"name": "element", "symbols": [(lexer.has("semicolon") ? {type: "semicolon"} : semicolon), "_", (lexer.has("elt") ? {type: "elt"} : elt), "_", "data", "_", "data", "_"], "postprocess": elementWithSemicolonFlatten},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_", "symbols": ["_$ebnf$1"]}
];

export var ParserStart: string = "data";
