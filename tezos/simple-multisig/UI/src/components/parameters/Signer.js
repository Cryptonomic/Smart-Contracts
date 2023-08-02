import { useEffect, useState } from "react";
import { connectWallet, getAccount} from "../../utils/wallet";
import {addSignerOperation, removeSignerOperation} from "../../utils/operation";

const Signer = ({contractAddress}) => {

    const [signer, setSigner] = useState("");
    const [unsigner, unsetSigner] = useState("");
    const [loading, setLoading] = useState(false);
    const [unloading, setUnloading] = useState(false);

    const handleSubmitAdd = async (event) => {

        

        event.preventDefault();

        try{

            setLoading(true);

            await addSignerOperation(signer, contractAddress);

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

          await removeSignerOperation(unsigner, contractAddress);
          alert("transaction confirmed!");
          
        }catch(error){
          alert("transaction error: ", error.message);
        }

        setUnloading(false);
        

    }

    return (
        <div className="d-flex flex-column justify-content-center align-items-left h-100">
        <h3>Signers</h3>
        <form onSubmit={handleSubmitAdd}>
          <label>Enter address to add new signer:
            <input 
              style={{width: "370px"}}
              type="text"
              value={signer}
              onChange={(e) => setSigner(e.target.value)}
            />
          </label>
        </form>
       <span>{loading?"Loading...": ""}</span>
        <form onSubmit={handleSubmitRemove}>
          <label>Enter address to remove signer:
            <input 
              style={{width: "370px"}}
              type="text"
              value={unsigner}
              onChange={(e) => unsetSigner(e.target.value)}
            />
          </label>
        </form>
        <span>{unloading?"Loading...": ""}</span>
        </div>
      )
    


};

export default Signer;
