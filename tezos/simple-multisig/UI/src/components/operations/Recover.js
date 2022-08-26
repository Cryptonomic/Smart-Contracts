import { useEffect, useState } from "react";
import { addRecover } from "../../utils/operation";

const Send = () => {

    const [to, setTo] = useState("");
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);
   

    const handleSubmitAdd = async (event) => {

        

        event.preventDefault();

        try{

            setLoading(true);
            let recover = {
                amount: amount,
                receiver: to
            };

            await addRecover(recover);

            alert("transaction confirmed!");
            

        }catch(error){
            alert(error.toString());
        }

        setLoading(false);
        

    }


    return (
        <div className="d-flex flex-column justify-content-center align-items-left h-100">
           <h3>Send</h3>
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
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <button onClick={handleSubmitAdd}>
            Submit
          </button>
       <span>{loading?"Loading...":""}</span>
        </div>
      )
    


};

export default Send;
