# Tutorial 2
Deploy Tutorial Contract 2 onto the Tezos Alphanet with the ConseilJS Deployment Interface `DeployTutorialContract2.ts`.
```bash
node DeployTutorialContract2.js
```

Find the newly-originated smart contract by searching for the logged operation group hash on Arronax or Mininax.

Run the simple example decentralized application (dApp), which will invoke the `addIntegers()` entry point by using the ConseilJS Invocation Interface `TutorialContract2.ts`
```bash
node invoke-tutorial-contract-2.js
```

Change the parameters of `addIntegers()` in `invoke-tutorial-contract-2.ts` and run `tsc invoke-tutorial-contract-2.ts` to recompile the program. Run `node invoke-tutorial-contract-2.js` to execute your custom invocation operation.