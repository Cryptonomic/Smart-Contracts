(* Title: Tezos Name Service Domain Manager *)
(* Author: Teckhua Chiang *)
(* Company: Cryptonomic Inc. *)

[%%version 1.04] 

type record = {
  subdomainOwner : address;
  subdomainManager : address;
}

type storage = {
  owner : address;
  resolver: address;
  ttlInSeconds : int;
  subdomainToRecord : (string, record) map;
  stamp : string;
}

let%init storage = {
  owner = KT1BEqzn5Wx8uJrZNvuS9DVHmLvG9td3fDLi;
  resolver = KT1BEqzn5Wx8uJrZNvuS9DVHmLvG9td3fDLi;
  ttlInSeconds = 0;
  subdomainToRecord = Map [];
  stamp = "Author: Teckhua Chiang, Company: Cryptonomic Inc.";
}
  
(* <!-- Resolver Logic --> *)

(* Allows the domain owner to change the owner *)
let%entry changeOwner
    (newOwner: address) 
    storage = 
  if Current.sender () = storage.owner then 
    let storage = storage.owner <- newOwner in
    ([], storage)
  else
    failwith ("You do not have permission to change the owner")

(* Allows the domain owner to change the resolver *)
let%entry changeResolver
    (newResolver : address)
    storage = 
  if Current.sender () = storage.owner then 
    let storage = storage.resolver <- newResolver in
    ([], storage)
  else
    failwith ("You do not have permission to change the resolver") 
  
(* Allows the domain owner to change the TTL *)
let%entry changeTTL
    (newTTLInSeconds : int)
    storage = 
  if Current.sender () = storage.owner then 
    let storage = storage.ttlInSeconds <- newTTLInSeconds in
    ([], storage)
  else
    failwith ("You do not have permission to change the TTL") 
  
(* <!-- Registrar Logic --> *)      

(* Default subdomain registration logic - Modify for your own purposes *)
let%entry registerSubdomain
    ((subdomain : string), (subdomainOwner : address), (subdomainManager : address))
    storage = 
  if Current.sender () = storage.owner then
    let record = { subdomainOwner; subdomainManager } in
    let storage = storage.subdomainToRecord <- Map.add subdomain record storage.subdomainToRecord in
    ([], storage)
  else
    failwith ("You do not have permission to register subdomains")

(* Allows the subdomain owner to change their manager address *)
let%entry updateSubdomain
    ((subdomain : string), (subdomainManager : address))
    storage =
  (* Check subdomain existence *)
  match Map.find subdomain storage.subdomainToRecord with
  | None -> failwith ("Subdomain does not exist: ", subdomain)
  | Some record -> 
      if Current.sender () = record.subdomainOwner then 
        (* Update the resolver *)
        let newRecord = record.subdomainManager <- subdomainManager in
        let storage = storage.subdomainToRecord <- Map.add subdomain newRecord storage.subdomainToRecord in
        ([], storage)
      else
        failwith ("You do not own that subdomain: ", subdomain)
  
(* Allows the owner to delete a subdomain *)
let%entry deleteSubdomain
    (subdomain : string)
    storage =
  if Current.sender () = storage.owner then
    let storage = storage.subdomainToRecord <- Map.remove subdomain storage.subdomainToRecord in
    ([], storage)
  else
    failwith ("You do not have permission to delete subdomains")