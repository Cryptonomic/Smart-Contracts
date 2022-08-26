import { useEffect, useState } from "react";
import { addApprove } from "../../utils/operation";


const Approve = ({contractAddress}) => {

    const [to, setTo] = useState("");
    const [amount, setAmount] = useState(0);
    const [address, setAddress] = useState("");
    const [id, setID] = useState("");
    const [loading, setLoading] = useState(false);
   

    const handleSubmitAdd = async (event) => {

        

        event.preventDefault();

        try{

            setLoading(true);

            let approve = {

                sender: to,
                amount: amount,
                tokenAddress: address,

            }

            await addApprove(approve, contractAddress);

            alert("transaction confirmed!");
            

        }catch(error){
            alert(error.toString());
        }

        setLoading(false);
        

    }


    return (
        <div className="d-flex flex-column justify-content-center align-items-left h-100">
           <h5>Approve</h5>
          <label>From:
            <input 
              style={{width: "370px"}}
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <label>Amount:
            <input 
              style={{width: "370px"}}
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <label>Token address:
            <input 
              style={{width: "370px"}}
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
          <label>Token id:
            <input 
              style={{width: "370px"}}
              type="text"
              value={id}
              onChange={(e) => setID(e.target.value)}
            />
          </label>
          <button onClick={handleSubmitAdd}>
            Submit
          </button>
       <span>{loading?"Loading...": ""}</span>
        </div>
      )
    


};

export default Approve;
