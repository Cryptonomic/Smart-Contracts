(* Title: Tezos Tutorial Contract 2 *)
(* Author: Teckhua Chiang *)
(* Company: Cryptonomic Inc. *)

[%%version 1.04]

(** Storage of this smart contract. *)
type storage = {
  sum : int;
  stamp : string;
}

(** Initialize the storage of this smart contract. *)
let%init storage = {
  sum = 0;
  stamp = "Author: Teckhua Chiang, Company: Cryptonomic Inc.";
} 
  
(** Entry point for a user to add two integers.
    @param (addend1, addend2) A tuple containing an int representing the first addend and an int representing the second addend, respectively.
    @param storage The storage of this smart contract. *)
let%entry setMark
    ((addend1 : int), (addend2 : int))
    (storage : storage) =
  let sum = addend1 + addend2 in
  let storage = storage.sum <- sum in
  ([], storage)