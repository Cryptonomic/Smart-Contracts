import { useEffect, useState } from "react";
import { connectWallet, getAccount} from "../../utils/wallet";
import {addDelegate, removeDelegate} from "../../utils/operation";

const Delegate = ({contractAddress}) => {

    const [delegate, setDelegate] = useState("");
    const [unDelegate, unsetDelegate] = useState("");
    const [loading, setLoading] = useState(false);
    const [unloading, setUnloading] = useState(false);

    const handleSubmitAdd = async (event) => {

        

        event.preventDefault();

        try{

            setLoading(true);

            await addDelegate(delegate, contractAddress);

            alert("transaction confirmed!");
            

        }catch(error){
            alert("transaction error: ", error.toString());
        }

        setLoading(false);
        

    }

    const handleSubmitRemove = async (event) => {

        event.preventDefault();
        try{

          setUnloading(true);

          await removeDelegate(unDelegate, contractAddress);
          alert("transaction confirmed!");
          
        }catch(error){
          alert("transaction error: ", error.message);
        }

        setUnloading(false);
        

    }

    return (
        <div className="d-flex flex-column justify-content-center align-items-left h-100">
           <h3>Delegate</h3>
        <form onSubmit={handleSubmitAdd}>
          <label>Enter address of new delegate:
            <input 
              style={{width: "370px"}}
              type="text"
              value={delegate}
              onChange={(e) => setDelegate(e.target.value)}
            />
          </label>
        </form>
       <span>{loading? "Loading...": ""}</span>
        <form onSubmit={handleSubmitRemove}>
          <label>Enter address of delegate to be removed:
            <input 
              style={{width: "370px"}}
              type="text"
              value={unDelegate}
              onChange={(e) => unsetDelegate(e.target.value)}
            />
          </label>
        </form>
        <span>{unloading?"Loading...": ""}</span>
        </div>
      )
    


};

export default Delegate;
