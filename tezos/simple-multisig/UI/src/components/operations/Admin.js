import { useEffect, useState } from "react";
import { adminSwitch } from "../../utils/operation";


const Admin = () => {

    const [to, setTo] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
   

    const handleSubmitAdd = async (event) => {

        

        event.preventDefault();

        try{

            setLoading(true);

            let admin = {
                receiver: to,
                tokenAddress: address
            }

            await adminSwitch(admin);

            alert("transaction confirmed!");
            

        }catch(error){
            alert(error.toString());
        }

        setLoading(false);
        

    }


    return (
        <div className="d-flex flex-column justify-content-center align-items-left h-100">
           <h3>Admin Switch</h3>
          <label>New Admin:
            <input 
              style={{width: "370px"}}
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
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
          <button onClick={handleSubmitAdd}>
            Submit
          </button>
       <span>{loading?"Loading...": ""}</span>
        </div>
      )
    


};

export default Admin;
