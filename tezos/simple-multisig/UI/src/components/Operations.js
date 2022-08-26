import { useState } from "react";
import Transfer from "./operations/Transfer";
import Mint from "./operations/Mint";
import Recover from "./operations/Recover";
import Admin from "./operations/Admin";

function Operations(){

    
    return( 
        <div className="d-flex flex-column justify-content-center align-items-left h-100">
            <Transfer/>
            <Mint/>
            <Recover/>
            <Admin/>


        


                    

        </div>

    )
}

export default Operations;