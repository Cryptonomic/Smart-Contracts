(* Title: Tezos Name Service Registry *)
(* Author: Teckhua Chiang *)
(* Company: Cryptonomic Inc. *)

[%%version 1.04]

(** Record containing a domain's owner address, resolver address, and time to live in seconds *)
type record = {
  owner : address;
  resolver : address;
  ttlInSeconds : int;
}

(** Storage *)
type storage = {
  domainToRecord : (string, record) big_map;
  stamp : string;
}

(** Initialize storage *)
let%init storage = {
  domainToRecord = BigMap ["tez", { owner = KT1BEqzn5Wx8uJrZNvuS9DVHmLvG9td3fDLi; resolver = KT1BEqzn5Wx8uJrZNvuS9DVHmLvG9td3fDLi; ttlInSeconds = 0}];
  stamp = "Author: Teckhua Chiang, Company: Cryptonomic Inc.";
}

(** Entry point for a permitted user to register a new domain
    @param (domain, resolver, ttlInSeconds) A tuple containing a string representing the domain name, an address representing the resolver address, and an int representing the time to live in seconds, respectively
    @param storage The storage of the smart contract *)
let%entry registerDomain
    ((domain : string), (resolver : address), (ttlInSeconds : int))
    (storage : storage) =
  match Map.find domain storage.domainToRecord with
  | None -> 
      if isPermitted domain storage then
        let owner = Current.sender() in
        let record = { owner; resolver; ttlInSeconds } in
        let storage = storage.domainToRecord <- Map.add domain record storage.domainToRecord in
        ([], storage)
      else
        failwith ("You do not have permission to register that domain: ", domain)
  | Some _ ->
      failwith ("Domain is not available: ", domain)
  
(** Entry point for a domain owner to update the resolver for a domain
    @param (domain, resolver) A tuple containing a string representing the domain name and an address representing the updated resolver address, respectively
    @param storage The storage of the smart contract *)
let%entry updateResolver
    ((domain : string), (resolver : address))
    (storage : storage) =
  match Map.find domain storage.domainToRecord with
  | None -> failwith ("Domain does not exist: ", domain)
  | Some record -> 
      if Current.sender() = record.owner then 
        let newRecord = record.resolver <- resolver in
        let storage = storage.domainToRecord <- Map.add domain newRecord storage.domainToRecord in
        ([], storage)
      else
        failwith ("You do not own that domain: ", domain)
  
(** Entry point for a domain owner to update the time to live for a domain
    @param (domain, ttlInSeconds) A tuple containing a string representing the domain name and an int representing the updated time to live in seconds, respectively
    @param storage The storage of the smart contract *)
let%entry updateTTL
    ((domain : string), (ttlInSeconds : int))
    (storage : storage) = 
  match Map.find domain storage.domainToRecord with
  | None -> failwith ("Domain does not exist: ", domain)
  | Some record -> 
      if Current.sender() = record.owner then
        let newRecord = record.ttlInSeconds <- ttlInSeconds in
        let storage = storage.domainToRecord <- Map.add domain newRecord storage.domainToRecord in
        ([], storage)
      else
        failwith ("You do not own that domain: ", domain)

(** Entry point for a permitted user to transfer ownership of a domain to another user
    @param (domain, newOwner) A tuple containing a string representing the domain name and a string representing the new owner address, respectively
    @param storage The storage of the smart contract *)
let%entry transferOwnership
    ((domain : string), (newOwner: address)) 
    (storage : storage) = 
  match Map.find domain storage.domainToRecord with
  | None -> failwith ("Domain does not exist: ", domain)
  | Some record ->
      if isPermitted domain storage then
        let newRecord = record.owner <- newOwner in
        let storage = storage.domainToRecord <- Map.add domain newRecord storage.domainToRecord in
        ([], storage)
      else
        failwith ("You do not have permission to transfer that domain: ", domain)
  
(** Entry point for a permitted user to delete an existing domain
    @param domain A string representing the domain name to be deleted
    @param storage The storage of the smart contract *)
let%entry deleteDomain
    (domain : string)
    (storage : storage) =
  if isPermitted domain storage then
    let storage = storage.domainToRecord <- Map.remove domain storage.domainToRecord in
    ([], storage)
  else
    failwith ("You do not have permission to delete that domain: ", domain)

(* <!-- Auxillary Functions --> *)

(** Returns the nat difference of two nats
    @param nat1 A nat representing the minuend
    @param nat2 A nat representing the subtrahend
    @return A nat representing the difference of two nats *)
let subtractNat
    (nat1 : nat)
    (nat2 : nat) = 
  (* Transform int from nat subtraction into nat *)
  match%nat (nat1 - nat2) with
  | Plus r -> r
  | Minus _ -> failwith () 

(** Returns the substring between two indexes in a string
    @param startIndex A nat representing the start index (inclusive)
    @param endIndex A nat representing the end index (non-inclusive)
    @param original A string representing the string to be sliced
    @return A string representing the substring between two indexes in a string *)
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
    
(** Returns a string list containing the domain hierarchy of a domain
    @param domain A string representing the domain name
    @return A string list containing the domain hierarchy of a domain *)
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

(** Returns a bool representing a user's permission to manage a domain
    @param domain A string representing the domain name
    @param storage The storage of the smart contract
    @return A bool representing a user's permission to manage a domain *)
let isPermitted
    (domain : string)
    (storage : storage) =
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