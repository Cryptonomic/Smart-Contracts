(* Title: Tezos Baker Registry *)
(* Author: Teckhua Chiang *)
(* Company: Cryptonomic *)

[%%version 1.04]

type recordNP = {
  name : string;
  payer : address;
}

type recordFM = {
  fee : int;
  minimum : tez;
} 
    
type cycleToRecordFM = (int, recordFM) map (* Cycle to fee and minimum *)

type storage = {
  recordsNP : (address, recordNP) map; (* Address to name and payer *)
  recordsFM : (address, cycleToRecordFM) map; (* Address to cycle to fee and minimum *)
  stamp : string;
}

let%init storage = {
  recordsNP = Map [];
  recordsFM = Map [];
  stamp = "Author: Teckhua Chiang, Company: Cryptonomic";
}

(* Allows a baker to update their name *)
let%entry updateName
    (name : string)
    (storage : storage) =
  let sender = Current.sender () in 
  let recordNP = match Map.find sender storage.recordsNP with
    | None -> { name = ""; payer = sender }
    | Some r -> r in
  let newRecordNP = recordNP.name <- name in
  let storage = storage.recordsNP <- Map.add sender newRecordNP storage.recordsNP in
  ([], storage)

(* Allows a baker to update their payment address *)
let%entry updatePaymentAddress
    (payer : address)
    (storage : storage) =
  let sender = Current.sender () in 
  let recordNP = match Map.find sender storage.recordsNP with
    | None -> { name = ""; payer = sender }
    | Some r -> r in
  let newRecordNP = recordNP.payer <- payer in
  let storage = storage.recordsNP <- Map.add sender newRecordNP storage.recordsNP in
  ([], storage)
  
(* Allows a baker to update their fee and minimum as of a cycle *)                        
let%entry updateTerms
    ((cycle : int), (fee : int), (minimum : tez))
    (storage : storage) =
  let sender = Current.sender () in 
  let recordFM = { fee; minimum } in
  let cycleToRecordFM = match Map.find sender storage.recordsFM with
    | None -> Map []
    | Some ctrfm -> ctrfm in
  let newCycleToRecordFM = Map.add cycle recordFM cycleToRecordFM in
  let storage = storage.recordsFM <- Map.add sender newCycleToRecordFM storage.recordsFM in
  ([], storage)
  
let%entry deleteRegistration
    ()
    storage =
  let sender = Current.sender () in
  let storage = storage.recordsNP <- Map.remove sender storage.recordsNP in
  let storage = storage.recordsFM <- Map.remove sender storage.recordsFM in
  ([], storage)