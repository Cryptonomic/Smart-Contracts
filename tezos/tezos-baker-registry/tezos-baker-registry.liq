(* Title: Tezos Baker Registry *)
(* Author: Teckhua Chiang *)
(* Company: Cryptonomic *)

[%%version 1.04]

type entry = {
  name : string;
  fee : int;
  minimum : tez;
  payer : address;
}

type storage = {
  record : (address, entry) big_map;
  stamp : string;
}

let%init storage = {
  record = BigMap [];
  stamp = "Author: Teckhua Chiang, Company: Cryptonomic";
}

(* Allows a baker to update their information *)
let%entry update
    ((name : string), (fee : int), (minimum : tez), (payer : address))
    (storage : storage) =
  let entry = { name; fee; minimum; payer } in
  let storage = storage.record <- Map.add (Current.sender()) entry storage.record in
  ([], storage)