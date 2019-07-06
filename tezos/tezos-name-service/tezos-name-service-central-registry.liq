(* Title: Tezos Name Service Central Registry *)
(* Author: Teckhua Chiang *)
(* Company: Cryptonomic Inc. *)

[%%version 1.04]

type record = {
  owner : address;
  resolver : address;
  ttlInSeconds : int;
}

type storage = {
  domainToRecord : (string, record) big_map;
  stamp : string;
}

let%init storage = {
  domainToRecord = BigMap ["tez", { owner = KT1BEqzn5Wx8uJrZNvuS9DVHmLvG9td3fDLi; resolver = KT1BEqzn5Wx8uJrZNvuS9DVHmLvG9td3fDLi; ttlInSeconds = 0}];
  stamp = "Author: Teckhua Chiang, Company: Cryptonomic Inc.";
}

(* Allows a permitted user to register a new domain *)
let%entry registerDomain
    ((domain : string), (resolver : address), (ttlInSeconds : int))
    storage = 
  (* Check domain existence *)
  match Map.find domain storage.domainToRecord with
  | None -> 
      if isPermitted domain storage then
        (* Create a new domain record *)
        let owner = Current.sender () in
        let record = { owner; resolver; ttlInSeconds } in
        let storage = storage.domainToRecord <- Map.add domain record storage.domainToRecord in
        ([], storage)
      else
        failwith ("You do not have permission to register that domain: ", domain)
  | Some _ ->
      failwith ("Domain is not available: ", domain)
  
(* Allows a domain owner to update the resolver for a domain *)
let%entry updateResolver
    ((domain : string), (resolver : address))
    storage = 
  (* Check domain existence *)
  match Map.find domain storage.domainToRecord with
  | None -> failwith ("Domain does not exist: ", domain)
  | Some record -> 
      if Current.sender () = record.owner then 
        (* Update the resolver *)
        let newRecord = record.resolver <- resolver in
        let storage = storage.domainToRecord <- Map.add domain newRecord storage.domainToRecord in
        ([], storage)
      else
        failwith ("You do not own that domain: ", domain)
  
(* Allows a domain owner to update the TTL for a domain *)
let%entry updateTTL
    ((domain : string), (ttlInSeconds : int))
    storage = 
  (* Check domain existence *)
  match Map.find domain storage.domainToRecord with
  | None -> failwith ("Domain does not exist: ", domain)
  | Some record -> 
      if Current.sender () = record.owner then 
        (* Update the TTL *)
        let newRecord = record.ttlInSeconds <- ttlInSeconds in
        let storage = storage.domainToRecord <- Map.add domain newRecord storage.domainToRecord in
        ([], storage)
      else
        failwith ("You do not own that domain: ", domain)

(* Allows a permitted user to transfer ownership of a domain to another user *)
let%entry transferOwnership
    ((domain : string), (newOwner: address)) 
    storage = 
  (* Check domain existence *)
  match Map.find domain storage.domainToRecord with
  | None -> failwith ("Domain does not exist: ", domain)
  | Some record ->
      if isPermitted domain storage then
        (* Update the owner *)
        let newRecord = record.owner <- newOwner in
        let storage = storage.domainToRecord <- Map.add domain newRecord storage.domainToRecord in
        ([], storage)
      else
        failwith ("You do not have permission to transfer that domain: ", domain)
  
(* Allows a permitted user to delete an existing domain *)
let%entry deleteDomain
    (domain : string)
    storage =
  if isPermitted domain storage then
    let storage = storage.domainToRecord <- Map.remove domain storage.domainToRecord in
    ([], storage)
  else
    failwith ("You do not have permission to delete that domain: ", domain)

(* <!-- Auxillary Functions --> *)

(* Returns the nat difference of two nats *)
let subtractNat
    (nat1 : nat)
    (nat2 : nat) = 
  (* Transform int from nat subtraction into nat *)
  match%nat (nat1 - nat2) with
  | Plus r -> r
  | Minus _ -> failwith () 
  
(* Returns the substring between two indexes in a string *)
let sliceStringByIndex
    (startIndex : nat)
    (endIndex : nat)
    (original : string) =
  let length = subtractNat endIndex startIndex in
  (* Transform string option into string *)
  let substring = match String.slice startIndex length original with 
    | None -> failwith ()
    | Some p -> p in 
  substring 
    
(* Returns a string list containing the domain hierarchy of a domain *)
let getDomainHierarchy
    (domain : string) =
  let endIndex = String.length domain in
  (* Work backward from the end of the domain *)
  let splitList =
    Loop.loop (fun x ->
        (* Examine the previous character in the string *)
        match String.slice x.(0) 1p domain with
        | Some nextCharacter ->
            if x.(0) = 0p then
              ( false, x.(1) <- domain :: x.(1) ) 
            else if nextCharacter = "." then 
              (* Slice the higher-level domain and continue *)
              let substring = sliceStringByIndex (x.(0) + 1p) endIndex domain in
              ( true, ( subtractNat x.(0) 1p, substring :: x.(1) ) ) 
            else
              (* Decrement the searchIndex by 1 *)
              ( true, x.(0) <- subtractNat x.(0) 1p )
        | None -> failwith () 
      ) (subtractNat (String.length domain) 1p, []) (* searchIndex, splitList *)
  in
  splitList.(1)

(* Returns a bool representing a user's permission to manage a domain *)
let isPermitted
    (domain : string)
    storage =
  let domainHierarchy = getDomainHierarchy domain in
  (* True only if the user owns the domain or any higher-level domain *)
  List.fold (fun (higherDomain, permitted) ->
      match Map.find higherDomain storage.domainToRecord with
      | None -> permitted
      | Some higherRecord ->
          if Current.sender () = higherRecord.owner then
            permitted = true
          else
            permitted
    ) domainHierarchy false