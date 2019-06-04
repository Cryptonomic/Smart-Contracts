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
      let owner = Current.sender() in
      let entry = { owner; resolver; ttl } in
      let storage = storage.record <- Map.add domain entry storage.record in
      ([], storage)
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
      if Current.sender() = entry.owner then
        (* Update new owner *)
        let newEntry = entry.owner <- newOwner in
        let storage = storage.record <- Map.add domain newEntry storage.record in
        ([], storage)
      else
        failwith ("You do not own the domain: ", domain)