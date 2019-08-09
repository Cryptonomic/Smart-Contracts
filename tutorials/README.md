# ConseilJS Tutorials
Each directory contains an example of an end-to-end smart contract development process. Here are the general steps:
1. Liquidity Smart Contract (.liq) - Program the smart contract in Liquidity, a high-level smart contract language for Tezos that compiles to Michelson. Other high-level smart contract langauges can be used as well.
2. Michelson Smart Contract (.tz) - Compile the smart contract in Michelson, the language of smart contracts in Tezos, from the Liquidity smart contract. Use the Michelson as an input when originating the smart contract.
3. Micheline Smart Contract (.json) - Translate the Michelson into Micheline, the JSON version of Michelson. This is generally a debugging measure to confirm a successful orignation of the smart contract.
4. ConseilJS Deployment Interface (.ts/.js) - Run this TypeScript/JavaScript program to deploy the smart contract on the Tezos Alphanet. Requires both Michelson smart contract code and initial storage to forge the origination operation.
5. ConseilJS Invocation Interface (.ts/.js) - Import this TypeScript/JavaScript module and call its functions to invoke the corresponding entry points on the smart contract.

## Directory
* conseiljs-tutorial-1 - PKH:String Map
* conseiljs-tutorial-2 - Integer Addition

## Getting Started
First, we download the repository and install dependencies.
```bash
git clone https://github.com/Cryptonomic/Smart-Contracts.git
cd Smart-Contracts
npm install
```

Then, navigate into one of the tutorial directories and follow the corresponding instructions.