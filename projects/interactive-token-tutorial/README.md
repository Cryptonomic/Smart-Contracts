# Interactive Token Tutorial for ConseilJS

![Interactive Token Tutorial](./interactive-token-tutorial.png)

This tutorial demonstrates how to use ConseilJS to deploy and interact with an implementation of the proposed [FA1.2 token](https://medium.com/tqtezos/assets-on-tezos-3c103e03abc9) contract standard. The [code](https://gitlab.com/tzip/tzip/blob/master/assets/FA1.2/ManagedLedger.md) referenced here was [written by Serokell](https://medium.com/tqtezos/implementing-asset-contracts-on-tezos-b74c8c6ecdc).

To view the app, simply drag `dist/index.html` into your favorite browser.

To build the project run `npm i && npm run build`.

Note that the contract included in the code is a modified version of FA1.2 that uses a `map` instead of a `big_map` to store token allocations and allowances. This may not scale well to a very large number of holders, but it is an effective way to demonstrate a toy token contract.