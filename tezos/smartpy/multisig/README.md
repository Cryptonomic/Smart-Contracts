# SmartPy Multisig Experiment

Start by deploying the contract. Storage type is specified in the `Multisig.__init__()` function.

Set up a new session by calling `Multisig.setup(payload, group)`, where `payload` is `Payload.get_type()` (notice this also includes the nonce for `payloadHash`. Will be `(lambda, nonce): sp.TPair(sp.TLambda, sp.TNat)`), and `group` is `Group.get_type()`.

Then generate `payloadHash = makePayloadHash(payload)` using `payload`.

Each signer in the group can call `sign(payloadHash, signature)` where `signature` is the signed payload. These are evaluated on execution, so a signer can call this twice with garbage value to revoke their signature.

The `execute(payloadHash)` entrypoint can be called at any point, but fails unless the session exists, `sp.sender` is part of its group, and signatures with sufficient weight for the group's threshold have been approved. The session is then deleted from the global session map. 

In `execute()`, I still have not started handling signature validation, compute execution cost (how to find out cost of a lambda on-chain?).

The types and layouts of entrypoints still need to be finalized but I need to polish this more before it can compile.

