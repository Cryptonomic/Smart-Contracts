import smartpy as sp

class Contract(sp.Contract):
  def __init__(self):
    self.init_type(sp.TRecord(last_token_id = sp.TNat, ledger = sp.TBigMap(sp.TNat, sp.TAddress), metadata = sp.TBigMap(sp.TString, sp.TBytes), operators = sp.TBigMap(sp.TRecord(operator = sp.TAddress, owner = sp.TAddress, token_id = sp.TNat).layout(("owner", ("operator", "token_id"))), sp.TUnit), token_metadata = sp.TBigMap(sp.TNat, sp.TRecord(token_id = sp.TNat, token_info = sp.TMap(sp.TString, sp.TBytes)).layout(("token_id", "token_info")))).layout((("last_token_id", "ledger"), ("metadata", ("operators", "token_metadata")))))
    self.init(last_token_id = 0,
              ledger = {},
              metadata = {'' : sp.bytes('0x68747470733a2f2f6578616d706c652e636f6d')},
              operators = {},
              token_metadata = {})

  @sp.entry_point
  def balance_of(self, params):
    sp.set_type(params, sp.TRecord(callback = sp.TContract(sp.TList(sp.TRecord(balance = sp.TNat, request = sp.TRecord(owner = sp.TAddress, token_id = sp.TNat).layout(("owner", "token_id"))).layout(("request", "balance")))), requests = sp.TList(sp.TRecord(owner = sp.TAddress, token_id = sp.TNat).layout(("owner", "token_id")))).layout(("requests", "callback")))
    sp.set_type(params.requests, sp.TList(sp.TRecord(owner = sp.TAddress, token_id = sp.TNat).layout(("owner", "token_id"))))
    def f_x0(_x0):
      sp.verify(self.data.token_metadata.contains(_x0.token_id), 'FA2_TOKEN_UNDEFINED')
      sp.result(sp.record(request = _x0, balance = sp.eif(self.data.ledger[_x0.token_id] == _x0.owner, 1, 0)))
    sp.transfer(params.requests.map(sp.build_lambda(f_x0)), sp.tez(0), params.callback)

  @sp.entry_point
  def transfer(self, params):
    sp.set_type(params, sp.TList(sp.TRecord(from_ = sp.TAddress, txs = sp.TList(sp.TRecord(amount = sp.TNat, to_ = sp.TAddress, token_id = sp.TNat).layout(("to_", ("token_id", "amount"))))).layout(("from_", "txs"))))
    sp.for transfer in params:
      sp.for tx in transfer.txs:
        sp.verify(self.data.token_metadata.contains(tx.token_id), 'FA2_TOKEN_UNDEFINED')
        sp.verify((sp.sender == transfer.from_) | (self.data.operators.contains(sp.record(owner = transfer.from_, operator = sp.sender, token_id = tx.token_id))), 'FA2_NOT_OPERATOR')
        sp.if tx.amount > 0:
          sp.verify((tx.amount == 1) & (self.data.ledger[tx.token_id] == transfer.from_), 'FA2_INSUFFICIENT_BALANCE')
          self.data.ledger[tx.token_id] = tx.to_

  @sp.entry_point
  def update_operators(self, params):
    sp.set_type(params, sp.TList(sp.TVariant(add_operator = sp.TRecord(operator = sp.TAddress, owner = sp.TAddress, token_id = sp.TNat).layout(("owner", ("operator", "token_id"))), remove_operator = sp.TRecord(operator = sp.TAddress, owner = sp.TAddress, token_id = sp.TNat).layout(("owner", ("operator", "token_id")))).layout(("add_operator", "remove_operator"))))
    sp.for action in params:
      with action.match_cases() as arg:
        with arg.match('add_operator') as add_operator:
          sp.verify(add_operator.owner == sp.sender, 'FA2_NOT_OWNER')
          self.data.operators[add_operator] = sp.unit
        with arg.match('remove_operator') as remove_operator:
          sp.verify(remove_operator.owner == sp.sender, 'FA2_NOT_OWNER')
          del self.data.operators[remove_operator]


sp.add_compilation_target("test", Contract())