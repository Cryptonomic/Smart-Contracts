(* Title: Tezos Name Service Registry *)
(* Author: Teckhua Chiang *)
(* Company: Cryptonomic *)

[%%version 1.04]

type entry = {
  owner : address;
  resolver : address;
  ttl : int;
}

type storage = {
  record : (string, entry) big_map;
  stamp : string;
}

let%init storage = {
  record = BigMap [];
  stamp = "Author: Teckhua Chiang, Company: Cryptonomic";
}

(* Allows user to register a new domain *)
let%entry registerDomain
    ((domain : string), (resolver : address), (ttl : int))
    storage = 
  (* Check domain existence *)
  match Map.find domain storage.record with
  | None -> 
      if isPermitted domain storage then
        let owner = Current.sender() in
        let entry = { owner; resolver; ttl } in
        let storage = storage.record <- Map.add domain entry storage.record in
        ([], storage)
      else
        failwith ("You do not own the higher-level domain")
  | Some _ ->
      failwith ("Not an available domain: ", domain)
  
(* Allows owner to update domain information *)
let%entry updateInformation 
    ((domain : string), (resolver : address), (ttl : int))
    storage = 
  (* Check domain existence *)
  match Map.find domain storage.record with
  | None -> failwith ("Domain does not exist: ", domain)
  | Some entry -> 
      if Current.sender() = entry.owner then 
        (* Update resolver and ttl *)
        let newEntry = { owner = entry.owner; resolver; ttl } in
        let storage = storage.record <- Map.add domain newEntry storage.record in
        ([], storage)
      else
        failwith ("You do not own the domain: ", domain)

(* Allows owner to transfer ownership to another user *)
let%entry transferOwnership
    ((domain : string), (newOwner: address)) 
    storage = 
  (* Check domain existence *)
  match Map.find domain storage.record with
  | None -> failwith ("Not a registered domain: ", domain)
  | Some entry ->
      if isPermitted domain storage then
        (* Update new owner *)
        let newEntry = entry.owner <- newOwner in
        let storage = storage.record <- Map.add domain newEntry storage.record in
        ([], storage)
      else
        failwith ("You do not manage the domain: ", domain) 
    
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
    
(* Returns a string list containing the higher-level domains of a domain *)
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
              (* Slice the entire domain *)
              let substring = sliceStringByIndex 0p endIndex domain in 
              ( false, x.(1) <- substring :: x.(1) ) 
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
  List.rev splitList.(1)

(* Returns a bool representing a user's permission to manage a domain *)
let isPermitted
    (domain : string)
    storage =
  let domainHierarchy = getDomainHierarchy domain in
  let permitted = List.fold (fun (elt, acc) ->
      match Map.find elt storage.record with
      | None -> acc
      | Some higherEntry ->
          if Current.sender () = higherEntry.owner then
            true
          else
            acc
    ) domainHierarchy false
  in
  permitted