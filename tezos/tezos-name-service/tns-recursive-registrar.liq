(* Title: Tezos Name Service Recursive Registrar *)
(* Author: Teckhua Chiang *)
(* Company: Cryptonomic Inc. *)

[%%version 1.04]

type record = {
  owner : address;
  registrar : address;
  resolver: address;
  ttlInSeconds : int;
}

type storage = {
  domainToRecord : (string, record) map;
  registrarOwner : address;
  stamp : string;
}

let%init storage = {
  domainToRecord = Map [];
  registrarOwner = Current.sender ();
  stamp = "Author: Teckhua Chiang, Company: Cryptonomic Inc.";
}

(* Allows a permitted user to register a new domain *)
let%entry registerDomain
    ((domain : string), (registrar : address), (resolver : address), (ttlInSeconds : int))
    storage = 
  (* Check domain existence *)
  match Map.find domain storage.domainToRecord with
  | None -> 
      if Current.sender () = storage.registrarOwner then
        (* Create a new domain record *)
        let owner = Current.sender () in
        let record = { owner; registrar; resolver; ttlInSeconds } in
        let storage = storage.domainToRecord <- Map.add domain record storage.domainToRecord in
        ([], storage)
      else
        failwith ("You do not have permission to register that domain: ", domain)
  | Some _ ->
      failwith ("Domain is not available: ", domain)
  
(* Allows a domain owner to update the registrar for a domain *)
let%entry updateRegistrar
    ((domain : string), (registrar : address))
    storage = 
  (* Check domain existence *)
  match Map.find domain storage.domainToRecord with
  | None -> failwith ("Domain does not exist: ", domain)
  | Some record -> 
      if Current.sender () = storage.registrarOwner then 
        (* Update the resolver *)
        let newRecord = record.registrar <- registrar in
        let storage = storage.domainToRecord <- Map.add domain newRecord storage.domainToRecord in
        ([], storage)
      else
        failwith ("You do not own that domain: ", domain)
          
(* Allows a domain owner to update the resolver for a domain *)
let%entry updateResolver
    ((domain : string), (resolver : address))
    storage = 
  (* Check domain existence *)
  match Map.find domain storage.domainToRecord with
  | None -> failwith ("Domain does not exist: ", domain)
  | Some record -> 
      if Current.sender () = storage.registrarOwner then 
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
      if Current.sender () = storage.registrarOwner then 
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
      if Current.sender () = storage.registrarOwner then
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
  if Current.sender () = storage.registrarOwner then
    let storage = storage.domainToRecord <- Map.remove domain storage.domainToRecord in
    ([], storage)
  else
    failwith ("You do not have permission to delete that domain: ", domain)