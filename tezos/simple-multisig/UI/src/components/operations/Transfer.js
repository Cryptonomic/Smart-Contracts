import { useEffect, useState } from "react";
import { addTransfer } from "../../utils/operation";


const Transfer = () => {

    const [to, setTo] = useState("");
    const [amount, setAmount] = useState(0);
    const [address, setAddress] = useState("");
    const [id, setID] = useState("");
    const [loading, setLoading] = useState(false);
   

    const handleSubmitAdd = async (event) => {

        

        event.preventDefault();

        try{

            setLoading(true);
            let transfer = {
                receiver: to,
                amount: amount,
                tokenAddress: address,
                tokenId: id
            };

            await addTransfer(transfer);

            alert("transaction confirmed!");
            

        }catch(error){
            alert(error.toString());
        }

        setLoading(false);
        

    }


    return (
        <div className="d-flex flex-column justify-content-center align-items-left t-100">
          <h1>A</h1>
           <h3>transfer</h3>
          <label>To:
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
              type="number"
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
       <span>{loading?"Loading...":""}</span>
        </div>
      )
    


};

export default Transfer;
