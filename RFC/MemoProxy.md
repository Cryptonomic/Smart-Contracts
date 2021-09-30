# MemoProxy

## Table Of Contents

- [MemoProxy](#memoproxy)
  - [Table Of Contents](#table-of-contents)
  - [Summary](#summary)
  - [Authors](#authors)
  - [Abstract](#abstract)
  - [Interface Specification](#interface-specification)
    - [Entrypoint Semantics](#entrypoint-semantics)
      - [`default`](#default)
      - [`sendMemo`](#sendmemo)
      - [`sendSimpleToken`](#sendsimpletoken)
      - [`sendIndexedToken`](#sendindexedtoken)
  - [Usecases](#usecases)
    - [Sending messages to anonymous users](#sending-messages-to-anonymous-users)
    - [SOMETHING-SOMETHING-kUSD](#something-something-kusd)
  - [Other considerations](#other-considerations)
  - [Copyright](#copyright)
  - [License](#license)

## Summary

There is a frequent desire to provide some metadata along with a transaction on the Tezos chain. For example a transfer of delegation rewards may include the cycle in which those rewards were generated. A payment for services may include an invoice number. This contract enables a cheap way to include this information without the need for a protocol upgrade. It is desiged to be cheap to use and be easily indexed.

## Authors

[Mike Radin](https://twitter.com/dsintermediatd), [Keefer Taylor](https://twitter.com/KeeferTaylor). Special thanks to the [SmartPy](https://smartpy.io) team and Sophia Gold.

## Abstract

This contract acts as a proxy between the sender and reciever to allow recording of a memo along with a balance transfer. This balance can be an XTZ coin amount or an [FA1.2](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-7/tzip-7.md) or [FA2 token](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-12/tzip-12.md) amount. Support for FA2 tokens implies that both asset-type and NFT-type tokens can be sent with a message.

Tezos only supports the Roman character set natively therefore this contract allows `string` or `byte` parameter values. The latter not only offers support for unicode, but also allows for encrypted memos. Additionally, structured data like JSON can be encoded into bytes for special applications. The memo argument is stored only as part of the operation parameters and isn't persisted in storage. There is indeed no storage defined at all aside from contract metadata nor is this contract meant to hold a coin balance. Plain XTZ deposit operations will be rejected. The memo is not persisted to reduce the cost of operations. Since it's included in the operation itself, it can be easily indexed and displayed in a UI like a wallet or a block explorer.

This contract has no permissioned operations, it cannot be "managed", upgraded or disabled.

This contract implements [tzip-16](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-16/tzip-16.md) metadata.

## Interface Specification

The contract has four entrypoints.

### Entrypoint Semantics

#### `default`

```
  (unit %default)
```

This entrypoint always fails to prevent incoming XTZ transfers.

#### `sendMemo`

```
  (pair %sendMemo
    (address %destination)
    (or %memo
        (string %string_memo)
        (bytes %bytes_memo)))
```

Forwards a coin transfer from the caller to the `destination` address.

#### `sendSimpleToken`

```
(pair %sendSimpleToken
    (nat %amount)
    (pair
        (address %destination)
        (address %token)))
```

Forwards an FA1.2 `token` transfer of specified `amount` from the caller to the `destination` address.

#### `sendIndexedToken`

```
  (pair %sendIndexedToken
    (pair
        (nat %amount)
        (address %destination))
    (pair
        (nat %index)
        (address %token))))
```

Forwards a transfer of some `amount` of an FA2 `token` with an `index` to the `destination` address.

## Usecases

### Sending messages to anonymous users

As is common practice on other chains, this allows communication to users who cannot be idenfied. For example, in the case of misdirected payment this contact and broad support in wallets and block explorers would allow the errant user to message to the incorrectly entered address with a plea for a refund.

### PAYMENTS-TBD

## Other considerations

Since the contract is fully trustless there is no way to extend functionality to include support for future token transfers and so on. As such it may be desireable to provide an entrypoint to support generic lambda execution along with a memo.

## Copyright

Copyright 2021 Mike Radin

## License

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
