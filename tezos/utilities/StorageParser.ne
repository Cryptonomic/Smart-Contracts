@preprocessor typescript

@{%
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
%}

# Pass your lexer object using the @lexer option:
@lexer lexer

# Storage Data
data ->
    # Primitives
    %string {% id %}
  | %number {% id %}

    # Argument Data
  | %zeroArgData {% id %}
  | %singleArgData _ data {% singleArgDataFlatten %}
  | %lparen _ %singleArgData _ data _ %rparen {% singleArgDataWithParenFlatten %}
  | %doubleArgData _ data _ data {% doubleArgDataFlatten %}
  | %lparen _ %doubleArgData _ data _ data _ %rparen {% doubleArgDataWithParenFlatten %}

    # Data Structures
  | %lbrace _ %rbrace {% (d: Array<string>) => "{}" %}
  | %lbrace _ data _ %semicolon:? _ data:? _ %rbrace {% listFlatten %}
  | %lbrace _ element:+ _ %rbrace {% mapFlatten %}

# Map Elements
element ->
    %elt _ data _ data _ {% elementFlatten %}
  | %semicolon _ %elt _ data _ data _ {% elementWithSemicolonFlatten %}

# Whitespace
_ -> [\s]:*

# Post Processors
@{%
    const singleArgDataFlatten = (d: Array<string>) => { return `${d[2]};`; }
    const singleArgDataWithParenFlatten = (d: Array<string>) => { return `${d[4]}`; }
    const doubleArgDataFlatten = (d: Array<string>) => { return `${d[2]}, ${d[4]}`; }
    const doubleArgDataWithParenFlatten = (d: Array<string>) => { return `${d[4]}, ${d[6]}`; }

    const listFlatten = (d: Array<string>) => { return `${d[2]}, ${d[6]}` }
    const mapFlatten = (d: Array<string>) => { return `{${d[2]}}` }
    const elementFlatten = (d: Array<string>) => { return `[${d[2]}, (${d[4]})]`; }
    const elementWithSemicolonFlatten = (d: Array<string>) => { return ` [${d[4]}, (${d[6]})]`; }
%}