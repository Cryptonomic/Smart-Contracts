# Tutorial 1
Deploy Tutorial Contract 1 onto the Tezos Alphanet with the ConseilJS Deployment Interface:
```bash
node DeployTutorialContract1.js
```

Find the address of the newly-originated smart contract by searching for the logged operation group hash with Arronax or Mininax. Set `contractAddress` to the new address in `TutorialContract1.ts` and recompile the module:
```bash
tsc TutorialContract1.ts
```

Run the example application that utilizes Tutorial Contract 1:
```bash
node invoke-tutorial-contract-1.js
```

Running `invoke-tutorial-contract-1.js` uses the corresponding ConseilJS Invocation Interface (`TutorialContract1.js`) to invoke the `setMark()` entry point of the smart contract with parameter `"Hello World"`.

Check the storage of the contract to confirm that it has changed to reflect the invocation of `setMark()`, which should map your sender address to `"Hello World"` in storage.

Change the parameters of `setMark()` in `invoke-tutorial-contract-1.ts`. Then, recompile and run the application again to execute your custom invocation operation:
```bash
tsc invoke-tutorial-contract-1.ts
node invoke-tutorial-contract-1.js
```