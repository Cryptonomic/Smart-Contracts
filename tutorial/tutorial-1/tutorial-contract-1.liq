(* Title: Tezos Tutorial Contract 1 *)
(* Author: Teckhua Chiang *)
(* Company: Cryptonomic Inc. *)

[%%version 1.04]

(** Storage of this smart contract. *)
type storage = {
  record : (address, string) map;
  stamp : string;
}

(** Initialize the storage of this smart contract. *)
let%init storage = {
  record = Map [];
  stamp = "Author: Teckhua Chiang, Company: Cryptonomic Inc.";
} 
  
(** Entry point for a user to register their mark.
    @param mark A string that the user wishes to store.
    @param storage The storage of this smart contract. *)
let%entry setMark
    (mark : string)
    (storage : storage) =
  let sender = Current.sender () in
  let storage = storage.record <- Map.add sender mark storage.record in
  ([], storage)