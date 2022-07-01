import smartpy as sp

# FA2 standard: https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-12/tzip-12.md
# Documentation: https://smartpy.io/docs/guides/FA/FA2


class Fa2FungibleMinimal(sp.Contract):
   

    def __init__(self, administrator, metadata_base, metadata_url):
        self.init(
            administrator=administrator,
            ledger=sp.big_map(tkey=sp.TPair(sp.TAddress, sp.TNat), tvalue=sp.TNat),
            metadata=sp.utils.metadata_of_url(metadata_url),
            next_token_id=sp.nat(0),
            operators=sp.big_map(
                tkey=sp.TRecord(
                    owner=sp.TAddress, operator=sp.TAddress, token_id=sp.TNat
                ).layout(("owner", ("operator", "token_id"))),
                tvalue=sp.TUnit,
            ),
            supply=sp.big_map(tkey=sp.TNat, tvalue=sp.TNat),
            token_metadata=sp.big_map(
                tkey=sp.TNat,
                tvalue=sp.TRecord(
                    token_id=sp.TNat, token_info=sp.TMap(sp.TString, sp.TBytes)
                ),
            ),
        )
        metadata_base["views"] = [
            self.all_tokens,
            self.get_balance,
            self.is_operator,
            self.total_supply,
        ]
        self.init_metadata("metadata_base", metadata_base)

    @sp.entry_point
    def transfer(self, batch):
        """Accept a list of transfer operations.

        Each transfer operation specifies a source: `from_` and a list
        of transactions. Each transaction specifies the destination: `to_`,
        the `token_id` and the `amount` to be transferred.

        Args:
            batch: List of transfer operations.
        Raises:
            `FA2_TOKEN_UNDEFINED`, `FA2_NOT_OPERATOR`, `FA2_INSUFFICIENT_BALANCE`
        """
        with sp.for_("transfer", batch) as transfer:
            with sp.for_("tx", transfer.txs) as tx:
                sp.verify(tx.token_id < self.data.next_token_id, "FA2_TOKEN_UNDEFINED")
                from_ = (transfer.from_, tx.token_id)
                to_ = (tx.to_, tx.token_id)
                sp.verify(
                    (transfer.from_ == sp.sender)
                    | self.data.operators.contains(
                        sp.record(
                            owner=transfer.from_,
                            operator=sp.sender,
                            token_id=tx.token_id,
                        )
                    ),
                    "FA2_NOT_OPERATOR",
                )
                self.data.ledger[from_] = sp.as_nat(
                    self.data.ledger.get(from_, 0) - tx.amount,
                    "FA2_INSUFFICIENT_BALANCE",
                )
                self.data.ledger[to_] = self.data.ledger.get(to_, 0) + tx.amount

    @sp.entry_point
    def update_operators(self, actions):
        """Accept a list of variants to add or remove operators.

        Operators can perform transfer on behalf of the owner.
        Owner is a Tezos address which can hold tokens.

        Only the owner can change its operators.

        Args:
            actions: List of operator update actions.
        Raises:
            `FA2_NOT_OWNER`
        """
        with sp.for_("update", actions) as action:
            with action.match_cases() as arg:
                with arg.match("add_operator") as operator:
                    sp.verify(operator.owner == sp.sender, "FA2_NOT_OWNER")
                    self.data.operators[operator] = sp.unit
                with arg.match("remove_operator") as operator:
                    sp.verify(operator.owner == sp.sender, "FA2_NOT_OWNER")
                    del self.data.operators[operator]

    @sp.entry_point
    def balance_of(self, callback, requests):
        """Send the balance of multiple account / token pairs to a
        callback address.

        transfer 0 mutez to `callback` with corresponding response.

        Args:
            callback (contract): Where we callback the answer.
            requests: List of requested balances.
        Raises:
            `FA2_TOKEN_UNDEFINED`, `FA2_CALLBACK_NOT_FOUND`
        """

        def f_process_request(req):
            sp.verify(req.token_id < self.data.next_token_id, "FA2_TOKEN_UNDEFINED")
            sp.result(
                sp.record(
                    request=sp.record(owner=req.owner, token_id=req.token_id),
                    balance=self.data.ledger.get((req.owner, req.token_id), 0),
                )
            )

        t_request = sp.TRecord(owner=sp.TAddress, token_id=sp.TNat)
        sp.set_type(requests, sp.TList(t_request))
        sp.set_type(
            callback,
            sp.TContract(sp.TList(sp.TRecord(request=t_request, balance=sp.TNat))),
        )
        sp.transfer(requests.map(f_process_request), sp.mutez(0), callback)

    @sp.entry_point
    def mint(self, to_, amount, token):
        
        """(Admin only) Create new tokens from scratch and assign
        them to `to_`.

        If `token` is "existing": increase the supply of the `token_id`.
        If `token` is "new": create a new token and assign the `metadata`.

        Args:
            to_ (address): Receiver of the tokens.
            amount (nat): Amount of token to be minted.
            token (variant): "_new_": id of the token, "_existing_": metadata of the token.
        Raises:
            `FA2_NOT_ADMIN`, `FA2_TOKEN_UNDEFINED`
        """
        sp.verify(sp.sender == self.data.administrator, "FA2_NOT_ADMIN")
        with token.match_cases() as arg:
            with arg.match("new") as metadata:
                token_id = sp.compute(self.data.next_token_id)
                self.data.token_metadata[token_id] = sp.record(
                    token_id=token_id, token_info=metadata
                )
                self.data.supply[token_id] = amount
                self.data.ledger[(to_, token_id)] = amount
                self.data.next_token_id += 1
            with arg.match("existing") as token_id:
                sp.verify(token_id < self.data.next_token_id, "FA2_TOKEN_UNDEFINED")
                self.data.supply[token_id] += amount
                self.data.ledger[(to_, token_id)] = (
                    self.data.ledger.get((to_, token_id), 0) + amount
                )

    @sp.offchain_view(pure=True)
    def all_tokens(self):
        """(Offchain view) Return the list of all the `token_id` known to the contract."""
        sp.result(sp.range(0, self.data.next_token_id))

    @sp.offchain_view(pure=True)
    def get_balance(self, params):
        """(Offchain view) Return the balance of an address for the specified `token_id`."""
        sp.set_type(
            params,
            sp.TRecord(owner=sp.TAddress, token_id=sp.TNat).layout(
                ("owner", "token_id")
            ),
        )
        sp.verify(params.token_id < self.data.next_token_id, "FA2_TOKEN_UNDEFINED")
        sp.result(self.data.ledger.get((params.owner, params.token_id), 0))

    @sp.offchain_view(pure=True)
    def total_supply(self, params):
        """(Offchain view) Return the total number of tokens for the given `token_id` if known or
        fail if not."""
        sp.verify(params.token_id < self.data.next_token_id, "FA2_TOKEN_UNDEFINED")
        sp.result(self.data.supply.get(params.token_id, 0))

    @sp.offchain_view(pure=True)
    def is_operator(self, params):
        """(Offchain view) Return whether `operator` is allowed to transfer `token_id` tokens
        owned by `owner`."""
        sp.result(self.data.operators.contains(params))


metadata_base = {
    "name": "FA2 fungible minimal",
    "version": "1.0.0",
    "description": "This is a minimal implementation of FA2 (TZIP-012) using SmartPy.",
    "interfaces": ["TZIP-012", "TZIP-016"],
    "authors": ["SmartPy <https://smartpy.io/#contact>"],
    "homepage": "https://smartpy.io/ide?template=fa2_fungible_minimal.py",
    "source": {
        "tools": ["SmartPy"],
        "location": "https://gitlab.com/SmartPy/smartpy/-/raw/master/python/templates/fa2_fungible_minimal.py",
    },
    "permissions": {
        "operator": "owner-or-operator-transfer",
        "receiver": "owner-no-hook",
        "sender": "owner-no-hook",
    },
}

# if "templates" not in __name__:

#     fa2_admin = sp.test_account("fa2_admin")

#     @sp.add_test(name="Test")
#     def test():
#         scenario = sp.test_scenario()
#         c1 = Fa2FungibleMinimal(fa2_admin.address, metadata_base, "https//example.com")
#         scenario += c1

#     sp.add_compilation_target(
#         "Fa2FungibleMinimal",
#         Fa2FungibleMinimal(fa2_admin.address, metadata_base, "https//example.com"),
#     )
