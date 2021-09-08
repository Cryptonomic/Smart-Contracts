import smartpy as sp

FA2TransferType = sp.TRecord(to_ = sp.TAddress, token_id = sp.TNat, amount = sp.TNat).layout(("to_", ("token_id", "amount")))
FA2TransferBatchType = sp.TRecord(from_ = sp.TAddress, txs = sp.TList(FA2TransferType)).layout(("from_", "txs"))
FA12TransferType = sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_ as from", ("to_ as to", "value")))

MemoType = sp.TVariant(string_memo = sp.TString, bytes_memo = sp.TBytes).layout(("string_memo", "bytes_memo"))

class MemoProxy(sp.Contract):
    def __init__(self, _metadata):
        self.init(metadata = _metadata)

    @sp.entry_point
    def default(self):
        sp.failwith("not supported")

    @sp.entry_point
    def sendMemo(self, destination, memo):
        sp.set_type(destination, sp.TAddress)
        sp.set_type(memo, MemoType)

        sp.send(destination, sp.amount)

    @sp.entry_point
    def sendIndexedToken(self, token, index, destination, amount, memo):
        sp.verify(sp.amount == sp.tez(0), message = "coin amount must be 0")

        FA2TransferReference = sp.contract(FA2TransferBatchType, token, entry_point="transfer").open_some()
        transfer = sp.record(to_ = destination, token_id = index, amount = amount)
        sp.set_type(transfer, FA2TransferType)
        batch = sp.record(from_ = sp.sender, txs = [transfer])
        sp.set_type(batch, FA2TransferBatchType)
        sp.transfer(batch, sp.tez(0), FA2TransferReference)

    @sp.entry_point
    def sendSimpleToken(self, token, destination, amount, memo):
        sp.verify(sp.amount == sp.tez(0), message = "coin amount must be 0")

        FA12TransferReference = sp.contract(FA12TransferType, token, entry_point="transfer").open_some()
        transfer = sp.record(from_ = sp.sender, to_ = destination, value = amount)
        sp.set_type(transfer, FA12TransferType)
        sp.transfer(transfer, sp.tez(0), FA12TransferReference)

@sp.add_test("MemoProxy Tests")
def test():
    scenario = sp.test_scenario()
    scenario.h1("MemoProxy Contract")
    scenario.table_of_contents()

    alice = sp.test_account("Alice")
    robert= sp.test_account("Bob")

    metadata = sp.big_map({ "" : sp.utils.bytes_of_string("ipfs://") }, tkey = sp.TString, tvalue = sp.TBytes)

    proxy = MemoProxy(_metadata = metadata)
    scenario += proxy

    scenario.h1("Workflows")

    scenario.h2("Send with string memo")
    scenario += proxy.sendMemo(destination = robert.address, memo = sp.variant("string_memo", "blah")).run(sender = alice, amount = sp.tez(1))

    scenario.h2("Send with byte memo")
    scenario += proxy.sendMemo(destination = alice.address, memo = sp.variant("bytes_memo", sp.bytes("0x000000"))).run(sender = robert, amount = sp.tez(2))

