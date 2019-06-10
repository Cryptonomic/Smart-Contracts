(* Title: Tezos Name Service Proxy *)
(* Author: Teckhua Chiang *)
(* Company: Cryptonomic *)

[%%version 1.04] 

type storage = {
  owner : address;
  redirect : address;
  stamp : string;
}

let%init storage = {
  owner = Current.sender ();
  redirect = Current.sender ();
  stamp = "Author: Teckhua Chiang, Company: Cryptonomic";
} 
  
(* Allows owner to set subnode owner *)
let%entry setRedirect
    ((redirect : address))
    storage = 
  (* Check if sender is the owner *)
  if Current.sender () = storage.owner then
    let storage = storage.redirect <- redirect in
    ([], storage)
  else 
    failwith ("You do not own the Tezos Name Service proxy")