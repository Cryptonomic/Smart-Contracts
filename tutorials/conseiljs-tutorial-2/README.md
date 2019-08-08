# Tutorial 2
Deploy Tutorial Contract 2 onto the Tezos Alphanet with the ConseilJS Deployment Interface:
```bash
node DeployTutorialContract2.js
```

Find the address of the newly-originated smart contract by searching for the logged operation group hash with Arronax or Mininax. Set `contractAddress` to the new address in `TutorialContract2.ts` and recompile the module:
```bash
tsc TutorialContract2.ts
```

Run the example application that utilizes Tutorial Contract 2:
```bash
node invoke-tutorial-contract-2.js
```

Running `invoke-tutorial-contract-2.js` uses the corresponding ConseilJS Invocation Interface (`TutorialContract2.js`) to invoke the `addIntegers()` entry point of the smart contract with parameters `4` and `6`.

Check the storage of the contract to confirm that it has changed to reflect the invocation of `addIntegers()`, which should add `4` and `6` in order to write `10` to storage.

Change the parameters of `addIntegers()` in `invoke-tutorial-contract-2.ts`. Then, recompile and run the application again to execute your custom invocation operation:
```bash
tsc invoke-tutorial-contract-2.ts
node invoke-tutorial-contract-2.js
```