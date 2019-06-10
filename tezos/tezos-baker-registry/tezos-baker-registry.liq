(* Title: Tezos Baker Registry *)
(* Author: Teckhua Chiang *)
(* Company: Cryptonomic Inc. *)

[%%version 1.04]

type recordOfNameAndPayer = {
  name : string;
  payer : address;
}

type recordOfFeeAndMinimum = {
  fee : int;
  minimum : tez;
} 
    
type recordsOfFeeAndMinimumAsOfCycle = (int, recordOfFeeAndMinimum) map

type storage = {
  recordsOfNameAndPayer : (address, recordOfNameAndPayer) map;
  recordsOfFeeAndMinimum : (address, recordsOfFeeAndMinimumAsOfCycle) map;
  stamp : string;
}

let%init storage = {
  recordsOfNameAndPayer = Map [];
  recordsOfFeeAndMinimum = Map [];
  stamp = "Author: Teckhua Chiang, Company: Cryptonomic Inc.";
}

(* Allows a baker to update their name *)
let%entry updateName
    (name : string)
    (storage : storage) =
  let sender = Current.sender () in 
  let recordOfNameAndPayer = match Map.find sender storage.recordsOfNameAndPayer with
    | None -> { name = ""; payer = sender }
    | Some r -> r in
  let newRecordOfNameAndPayer = recordOfNameAndPayer.name <- name in
  let storage = storage.recordsOfNameAndPayer <- Map.add sender newRecordOfNameAndPayer storage.recordsOfNameAndPayer in
  ([], storage)

(* Allows a baker to update their payment address *)
let%entry updatePaymentAddress
    (payer : address)
    (storage : storage) =
  let sender = Current.sender () in 
  let recordOfNameAndPayer = match Map.find sender storage.recordsOfNameAndPayer with
    | None -> { name = ""; payer = sender }
    | Some r -> r in
  let newRecordOfNameAndPayer = recordOfNameAndPayer.payer <- payer in
  let storage = storage.recordsOfNameAndPayer <- Map.add sender newRecordOfNameAndPayer storage.recordsOfNameAndPayer in
  ([], storage)
  
(* Allows a baker to update their fee and minimum as of a cycle *)                        
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
  
(* Allows a baker to delete their registration information *)
let%entry deleteRegistration
    ()
    storage =
  let sender = Current.sender () in
  let storage = storage.recordsOfNameAndPayer <- Map.remove sender storage.recordsOfNameAndPayer in
  let storage = storage.recordsOfFeeAndMinimum <- Map.remove sender storage.recordsOfFeeAndMinimum in
  ([], storage)