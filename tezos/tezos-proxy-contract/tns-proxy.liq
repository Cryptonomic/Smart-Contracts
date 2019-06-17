(* Title: Tezos Proxy Contract *)
(* Author: Teckhua Chiang *)
(* Company: Cryptonomic Inc. *)

[%%version 1.04] 

type storage = {
  owner : address;
  redirect : address;
  stamp : string;
}

let%init storage = {
  owner = Current.sender ();
  redirect = Current.sender ();
  stamp = "Author: Teckhua Chiang, Company: Cryptonomic Inc.";
} 
  
(* Allows the owner to set the redirect address *)
let%entry setRedirect
    ((redirect : address))
    storage =
  if Current.sender () = storage.owner then
    let storage = storage.redirect <- redirect in
    ([], storage)
  else 
    failwith ("You do not own this proxy contract")