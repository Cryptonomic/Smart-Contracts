(* Title: Tezos Baker Registry *)
(* Author: Teckhua Chiang *)
(* Company: Cryptonomic Inc. *)

[%%version 1.04]

(** Record containing a baker's name and payment address *)
type recordOfNameAndPaymentAddress = {
  name : string;
  paymentAddress : address;
}

(** Record containing a baker's fee and minimum *)
type recordOfFeeAndMinimum = {
  fee : int;
  minimum : tez;
} 

(** Map associating a record of fee and minimum with its effective cycle *)
type recordsOfFeeAndMinimumAsOfCycle = (int, recordOfFeeAndMinimum) map

(** Storage *)
type storage = {
  recordsOfNameAndPaymentAddress : (address, recordOfNameAndPaymentAddress) map;
  recordsOfFeeAndMinimum : (address, recordsOfFeeAndMinimumAsOfCycle) map;
  stamp : string;
}

(** Initialize storage *)
let%init storage = {
  recordsOfNameAndPaymentAddress = Map [];
  recordsOfFeeAndMinimum = Map [];
  stamp = "Author: Teckhua Chiang, Company: Cryptonomic Inc.";
}

(** Entry point for a baker to update their name
    @param name A string representing the updated name
    @param storage The storage of the smart contract *)
let%entry updateName
    (name : string)
    (storage : storage) =
  let sender = Current.sender () in 
  let recordOfNameAndPaymentAddress = match Map.find sender storage.recordsOfNameAndPaymentAddress with
    | None -> { name = ""; paymentAddress = sender }
    | Some r -> r in
  let newRecordOfNameAndPaymentAddress = recordOfNameAndPaymentAddress.name <- name in
  let storage = storage.recordsOfNameAndPaymentAddress <- Map.add sender newRecordOfNameAndPaymentAddress storage.recordsOfNameAndPaymentAddress in
  ([], storage)

(** Entry point for a baker to update their payment address
    @param paymentAddress A string representing the updated payment address
    @param storage The storage of the smart contract *)
let%entry updatePaymentAddress
    (paymentAddress : address)
    (storage : storage) =
  let sender = Current.sender () in 
  let recordOfNameAndPaymentAddress = match Map.find sender storage.recordsOfNameAndPaymentAddress with
    | None -> { name = ""; paymentAddress = sender }
    | Some r -> r in
  let newRecordOfNameAndPaymentAddress = recordOfNameAndPaymentAddress.paymentAddress <- paymentAddress in
  let storage = storage.recordsOfNameAndPaymentAddress <- Map.add sender newRecordOfNameAndPaymentAddress storage.recordsOfNameAndPaymentAddress in
  ([], storage)
  
(** Entry point for a baker to update their fee and minimum as of a cycle
    @param (cycle, fee, minimum) A tuple containing an int representing the effective cycle, an int representing the updated fee, and a tez amount representing the updated minimum, respectively
    @param storage The storage of the smart contract *)                      
let%entry updateTerms
    ((cycle : int), (fee : int), (minimum : tez))
    (storage : storage) =
  let sender = Current.sender () in 
  let newRecordOfFeeAndMinimum = { fee; minimum } in
  let recordsOfFeeAndMinimumAsOfCycle = match Map.find sender storage.recordsOfFeeAndMinimum with
    | None -> Map []
    | Some r -> r in
  let newRecordsOfFeeAndMinimumAsOfCycle = Map.add cycle newRecordOfFeeAndMinimum recordsOfFeeAndMinimumAsOfCycle in
  let storage = storage.recordsOfFeeAndMinimum <- Map.add sender newRecordsOfFeeAndMinimumAsOfCycle storage.recordsOfFeeAndMinimum in
  ([], storage)
  
(** Entry point for a baker to delete their registration information
    @param storage The storage of the smart contract *)
let%entry deleteRegistration
    ()
    (storage : storage) =
  let sender = Current.sender () in
  let storage = storage.recordsOfNameAndPaymentAddress <- Map.remove sender storage.recordsOfNameAndPaymentAddress in
  let storage = storage.recordsOfFeeAndMinimum <- Map.remove sender storage.recordsOfFeeAndMinimum in
  ([], storage)