## Multisig smart contract for FA1.2 and FA2 templates

**Link to the demo video:** https://drive.google.com/file/d/1nZL9Q9EJ1Y1RPJR24S0uGYNZ0zi2TCW1/view?usp=sharing

### How the mulitisigs work:

Both multisigs have the same functionalities:
- create a transaction request (transactions include token transfer, minting, recovery, approve the reception of tokens, change admin for FA1.2/FA2 token contract)
- add/remove signer
- increase/decrease the signing threshold (NOTE: threshold automatically decreases by one when a signer is removed)
- add/update baker delegate of the multisig


In order to use the mint/admin functionalities, the multisig contract has to be the admin of the corresponding FA1.2/FA2 contract.

For FA2 multisig: for each request, token address (address of the FA2 token contract) and token ID (ID of the token in corresponding contract) are required.

For FA1.2, only token address is needed.

How the signing process works: 
- one signer of the multisig create a transaction proposal, stored in the transaction map
- from there, other signers can either "sign" or "unsign" the transaction; if the number of signature reaches the threshold first, the transaction is made and removed from proposals (gas fee is paid by last signer) and otherwise, the transaction is just removed from proposals
- the same principle applies to delegates, signers and threshold modifications.
- for signers only: when signer is approved, all unsignatures are removed from transaction map

### Tests: 

- the tests for both multisigs are located in the *test* folder
- to run the tests, run command *~/smartpy-cli/SmartPy.sh test tests/FA2tests.py output2* in terminal for FA2 mulitisig, and *~/smartpy-cli/SmartPy.sh test tests/FA12tests.py output12* for FA1.2 multisig

### Deploying the contracts:

- compilation targets are in the *deploy* folder
- before deploying a multisig, put your address in the *signer* field so that you can access it after
- I also included FA1.2 and FA2 token templates contracts from SmartPy in you need to deploy tokens for testing
- to generate contract code, run *~/smartpy-cli/SmartPy.sh compile deploy/fa2target.py compiled* or *~/smartpy-cli/SmartPy.sh compile deploy/fa12target.py compiled*
- once the contract source code has been generated, go into the newly created *compiled* folder and deploy the contract using your method of choice. Here is an example that SmartPy provides: https://smartpy.io/docs/cli/

## User Interface

- Very simple react application to interact with multisig contracts on Jakartanet.
- To start the app, simply run *npm run start* in *UI* folder terminal
- Right now, contract origination is not working (*storage_exhausted.operation* error), so deployment has to be done manually. Once you have the address of your multisig, simple add it in the *UI/src/utils/operations.js* file as such: *const contractAddressTest = "your new multisig address";*
- You can then make calls to the multisig in the *operations*, *parameters* and *storage* pages once you are connected to your wallet.
- All the functionnalities are available, expect for minting with FA2 and approve for FA1.2
