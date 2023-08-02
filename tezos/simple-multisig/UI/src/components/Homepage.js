import { useEffect, useState } from "react";
import { originateMultisig12, originateMultisig2 } from "../utils/operation";


const Homepage = ({updateAddress}) => {

    const [address12, setAddress12] = useState("");
    const [address2, setAddress2] = useState("");
    const [loading, setLoading] = useState(false);
    const [mySigs, setMySigs] = useState([]);
    const [current, setCurrent] = useState("");

    const parseMySigs = async () => {


        // getting your multisigs from database



    }

   

    const handleSubmitAdd12 = async (event) => {

        

        event.preventDefault();

        try{

            setLoading(true);


            const a = await originateMultisig12();
            setAddress12(a);
            setCurrent(a);

            alert("transaction confirmed!");
            

        }catch(error){
            alert(error.toString());
        }

        setLoading(false);
        

    }

    const handleSubmitAdd2 = async (event) => {

        

        event.preventDefault();

        try{

            setLoading(true);


            const a = await originateMultisig2();
            setAddress2(a);

            alert("transaction confirmed!");
            

        }catch(error){
            alert(error.toString());
        }

        setLoading(false);
        

    }


    return (
        <div className="d-flex flex-column justify-content-center align-items-left h-100">
            <h3>My multisigs</h3>
            <label>Current:
            <input 
              style={{width: "370px"}}
              type="text"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
            <button onClick={() => {updateAddress(current)}}>
            Use this multisig
          </button>
          </label>
           <h3>New Multisig</h3>
          <button onClick={handleSubmitAdd12}>
            Create new FA1.2 multisig
          </button>
          <span>{loading?"Loading...": address12}</span>
          <button onClick={handleSubmitAdd2}>
            Create new FA2 multisig
          </button>
          <span>{loading?"Loading...": address2}</span>
        </div>
      )
    


};

export default Homepage;
