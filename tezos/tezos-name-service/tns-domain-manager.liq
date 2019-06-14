(* Title: Tezos Name Service Domain Manager *)
(* Author: Teckhua Chiang *)
(* Company: Cryptonomic Inc. *)

[%%version 1.04]

type record = {
  subdomainOwner : address;
  resolver : address;
  manager : address;
  ttlInSeconds : int;
}

type storage = {
  domainOwner : address;
  subdomainToRecord : (string, record) map;
  stamp : string;
}

let%init storage = {
  domainOwner = Current.sender ();
  subdomainToRecord = Map [];
  stamp = "Author: Teckhua Chiang, Company: Cryptonomic Inc.";
}

(* Default subdomain registration logic - Modify for your own purposes *)
(* Allows a user to register a new subdomain *)
let%entry registerSubdomain
    ((subdomain : string), (resolver : address), (manager : address), (ttlInSeconds : int))
    storage = 
  (* Check subdomain existence *)
  match Map.find subdomain storage.subdomainToRecord with
  | None -> 
      (* Create a new subdomain record *)
      let subdomainOwner = Current.sender () in
      let record = { subdomainOwner; resolver; manager; ttlInSeconds } in
      let storage = storage.subdomainToRecord <- Map.add subdomain record storage.subdomainToRecord in
      ([], storage)
  | Some _ ->
      failwith ("Subdomain is not available: ", subdomain)

(* Allows the domain owner or subdomain owner transfer ownership of a subdomain to another user *)
let%entry transferOwnership
    ((subdomain : string), (newSubdomainOwner : address))
    storage = 
  (* Check subdomain existence *)
  match Map.find subdomain storage.subdomainToRecord with
  | None -> failwith ("Subdomain does not exist: ", subdomain)
  | Some record ->
      if isPermitted record storage then
        (* Update the subdomain owner *)
        let newRecord = record.subdomainOwner <- newSubdomainOwner in
        let storage = storage.subdomainToRecord <- Map.add subdomain newRecord storage.subdomainToRecord in
        ([], storage)
      else
        failwith ("You do not own that subdomain: ", subdomain)

(* Allows a subdomain owner to update the resolver for a subdomain *)
let%entry updateResolver
    ((subdomain : string), (resolver : address))
    storage = 
  (* Check subdomain existence *)
  match Map.find subdomain storage.subdomainToRecord with
  | None -> failwith ("Subdomain does not exist: ", subdomain)
  | Some record -> 
      if Current.sender () = record.subdomainOwner then 
        (* Update the resolver *)
        let newRecord = record.resolver <- resolver in
        let storage = storage.subdomainToRecord <- Map.add subdomain newRecord storage.subdomainToRecord in
        ([], storage)
      else
        failwith ("You do not own that subdomain: ", subdomain)
  
(* Allows the subdomain owner to update the manager for a subdomain *)
let%entry updateManager
    ((subdomain : string), (manager : address))
    storage = 
  (* Check subdomain existence *)
  match Map.find subdomain storage.subdomainToRecord with
  | None -> failwith ("Subdomain does not exist: ", subdomain)
  | Some record -> 
      if Current.sender () = record.subdomainOwner then 
        (* Update the manager *)
        let newRecord = record.manager <- manager in
        let storage = storage.subdomainToRecord <- Map.add subdomain newRecord storage.subdomainToRecord in
        ([], storage)
      else
        failwith ("You do not own that subdomain: ", subdomain)

(* Allows the subdomain owner to update the TTL for a subdomain *)
let%entry updateTTL
    ((subdomain : string), (ttlInSeconds : int))
    storage = 
  (* Check subdomain existence *)
  match Map.find subdomain storage.subdomainToRecord with
  | None -> failwith ("Subdomain does not exist: ", subdomain)
  | Some record -> 
      if Current.sender () = record.subdomainOwner then 
        (* Update the TTL *)
        let newRecord = record.ttlInSeconds <- ttlInSeconds in
        let storage = storage.subdomainToRecord <- Map.add subdomain newRecord storage.subdomainToRecord in
        ([], storage)
      else
        failwith ("You do not own that subdomain: ", subdomain)

(* Allows the domain owner or subdomain owner of a subdomain to delete an existing subdomain *)
let%entry deleteSubdomain
    (subdomain : string)
    storage =
  match Map.find subdomain storage.subdomainToRecord with
  | None -> failwith ("Subdomain does not exist: ", subdomain)
  | Some record ->
      if isPermitted record storage then
        let storage = storage.subdomainToRecord <- Map.remove subdomain storage.subdomainToRecord in
        ([], storage)
      else
        failwith ("You do not own that subdomain: ", subdomain) 

(* Returns a bool representing a user's permission to manage a domain *)
let isPermitted
    (record : record)
    storage =
  Current.sender () = storage.domainOwner or Current.sender () = record.subdomainOwner