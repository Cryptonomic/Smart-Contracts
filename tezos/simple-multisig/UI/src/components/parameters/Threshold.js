import { useEffect, useState } from "react";
import {addThreshold, removeThreshold} from "../../utils/operation";
import { getThreshold } from "../../utils/specific";

const Threshold = () => {

    const [threshold, setThreshold] = useState(3);
    const [newThreshold, setNew] = useState();
    const [oldThreshold, setOld] = useState();
    const [newLoading, setNewLoad] = useState(false);
    const [oldLoading, setOldLoad] = useState(false);
     // Set players and tickets remaining

    const gettingThreshold = async () => {

      try{

        const t = await getThreshold();
        setThreshold(t);

      }catch(e){

      }

      

    }

    
    useEffect(() => {

      gettingThreshold();
      
        
    }, []);

    const handleSubmitNew = async (event) => {

        event.preventDefault();;
        try{

          setNewLoad(true);

          await addThreshold(newThreshold);
          await gettingThreshold();
          alert("transaction confirmed!");
          
        }catch(error){
          alert("transaction error: ", error.message);
        }

        setNewLoad(false);
        

    };

    const handleSubmitOld = async (event) => {

        event.preventDefault();;
        try{

          setOldLoad(true);

          await removeThreshold(oldThreshold);
          await gettingThreshold();

          alert("transaction confirmed!");
          
        }catch(error){
          alert("transaction error: ", error.message);
        }

        setOldLoad(false);
        

    };

    return (
        <div className="d-flex flex-column justify-content-center align-items-left h-100">
            <h3>Threshold</h3>
            <h3>{"Current threshold: " + threshold}</h3>
            <form onSubmit={handleSubmitNew}>
          <label>Enter new threshold:
            <input 
              style={{width: "370px"}}
              type="text"
              value={newThreshold}
              onChange={(e) => setNew(e.target.value)}
            />
          </label>
        </form>
        <span>{newLoading? "Loading...": ""}</span>
            <form onSubmit={handleSubmitOld}>
          <label>Enter threshold to remove:
            <input 
              style={{width: "370px"}}
              type="text"
              value={oldThreshold}
              onChange={(e) => setOld(e.target.value)}
            />
          </label>
        </form>
        <span>{oldLoading? "Loading...": ""}</span>
        </div>
    );

};

export default Threshold;