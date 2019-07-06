(* Title: Tezos Name Service Domain Manager *)
(* Author: Teckhua Chiang *)
(* Company: Cryptonomic Inc. *)

[%%version 1.04]

(** Record containing a subdomain's owner address, resolver address, manager address, and time to live in seconds. *)
type record = {
  subdomainOwner : address;
  resolver : address;
  manager : address;
  ttlInSeconds : int;
}

(** Storage of this smart contract. *)
type storage = {
  domainOwner : address;
  subdomainToRecord : (string, record) map;
  stamp : string;
}

(** Initialize the storage of this smart contract. *)
let%init storage = {
  domainOwner = Current.sender ();
  subdomainToRecord = Map [];
  stamp = "Author: Teckhua Chiang, Company: Cryptonomic Inc.";
}

(** Entry point for a user to register a new subdomain. Default subdomain registration logic. Modify for your own purposes.
    @param (subdomain, resolver, manager, ttlInSeconds) A tuple containing a string representing the subdomain name, an address representing the resolver address, an address representing the manager address, and an int representing the time to live in seconds, respectively.
    @param storage The storage of this smart contract. *)
let%entry registerSubdomain
    ((subdomain : string), (resolver : address), (manager : address), (ttlInSeconds : int))
    (storage : storage) =
  match Map.find subdomain storage.subdomainToRecord with
  | None ->
      let subdomainOwner = Current.sender () in
      let record = { subdomainOwner; resolver; manager; ttlInSeconds } in
      let storage = storage.subdomainToRecord <- Map.add subdomain record storage.subdomainToRecord in
      ([], storage)
  | Some _ ->
      failwith ("Subdomain is not available: ", subdomain)

(** Entry point for a controller to transfer ownership of a subdomain to another user.
    @param (subdomain, newSubdomainOwner) A tuple containing a string representing the subdomain name and an address representing the updated subdomain owner address, respectively.
    @param storage The storage of this smart contract. *)
let%entry transferSubdomainOwnership
    ((subdomain : string), (newSubdomainOwner : address))
    (storage : storage) =
  match Map.find subdomain storage.subdomainToRecord with
  | None -> failwith ("Subdomain does not exist: ", subdomain)
  | Some record ->
      if isController record storage then
        let newRecord = record.subdomainOwner <- newSubdomainOwner in
        let storage = storage.subdomainToRecord <- Map.add subdomain newRecord storage.subdomainToRecord in
        ([], storage)
      else
        failwith ("You do not have permission to transfer that subdomain: ", subdomain)

(** Entry point for a subdomain owner to update the resolver address for a subdomain. Resolvers are full Tezos addresses registered as the destination of subdomains.
    @param (subdomain, resolver) A tuple containing a string representing the subdomain name and an address representing the updated resolver address, respectively.
    @param storage The storage of this smart contract. *)
let%entry updateResolver
    ((subdomain : string), (resolver : address))
    (storage : storage) =
  match Map.find subdomain storage.subdomainToRecord with
  | None -> failwith ("Subdomain does not exist: ", subdomain)
  | Some record -> 
      if Current.sender () = record.subdomainOwner then
        let newRecord = record.resolver <- resolver in
        let storage = storage.subdomainToRecord <- Map.add subdomain newRecord storage.subdomainToRecord in
        ([], storage)
      else
        failwith ("You do not own that subdomain: ", subdomain)
  
(** Entry point for the subdomain owner to update the manager address for a subdomain. Managers are smart contracts that manage a subdomain.
    @param (subdomain, manager) A tuple containing a string representing the subdomain name and an address representing the updated manager address, respectively.
    @param storage The storage of this smart contract. *)
let%entry updateManager
    ((subdomain : string), (manager : address))
    (storage : storage) =
  match Map.find subdomain storage.subdomainToRecord with
  | None -> failwith ("Subdomain does not exist: ", subdomain)
  | Some record -> 
      if Current.sender () = record.subdomainOwner then
        let newRecord = record.manager <- manager in
        let storage = storage.subdomainToRecord <- Map.add subdomain newRecord storage.subdomainToRecord in
        ([], storage)
      else
        failwith ("You do not own that subdomain: ", subdomain)

(** Entry point for the subdomain owner to update the TTL for a subdomain.
    @param (subdomain, ttlInSeconds) A tuple containing a string representing the subdomain name and an int representing the updated time to live in seconds, respectively.
    @param storage The storage of this smart contract. *)
let%entry updateTTL
    ((subdomain : string), (ttlInSeconds : int))
    (storage : storage) =
  match Map.find subdomain storage.subdomainToRecord with
  | None -> failwith ("Subdomain does not exist: ", subdomain)
  | Some record -> 
      if Current.sender () = record.subdomainOwner then
        let newRecord = record.ttlInSeconds <- ttlInSeconds in
        let storage = storage.subdomainToRecord <- Map.add subdomain newRecord storage.subdomainToRecord in
        ([], storage)
      else
        failwith ("You do not own that subdomain: ", subdomain)

(** Entry point for a controller to delete an existing subdomain.
    @param subdomain A string representing the subdomain name.
    @param storage The storage of this smart contract. *)
let%entry deleteSubdomain
    (subdomain : string)
    (storage : storage) =
  match Map.find subdomain storage.subdomainToRecord with
  | None -> failwith ("Subdomain does not exist: ", subdomain)
  | Some record ->
      if isController record storage then
        let storage = storage.subdomainToRecord <- Map.remove subdomain storage.subdomainToRecord in
        ([], storage)
      else
        failwith ("You do not have permission to delete that subdomain: ", subdomain) 

(** Verifies if a user has controller permissions. Users can only control subdomains of they are the domain owner or subdomain owner.
    @param record A record of subdomain information.
    @param storage The storage of this smart contract.
    @return A bool representing a user's permission to control a domain. *)
let isController
    (record : record)
    (storage : storage) =
  Current.sender () = storage.domainOwner or Current.sender () = record.subdomainOwner