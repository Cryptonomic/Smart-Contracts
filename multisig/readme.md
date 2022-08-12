## Multisig smart contract for FA1.2 and FA2 templates

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


