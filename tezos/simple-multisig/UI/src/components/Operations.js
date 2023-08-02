import { useState } from "react";
import Transfer from "./operations/Transfer";
import Mint from "./operations/Mint";
import Recover from "./operations/Recover";
import Admin from "./operations/Admin";
import Approve from "./operations/Approve";

function Operations({contractAddress}){

    
    return( 
        <div className="d-flex flex-column justify-content-center align-items-left h-100">
            <Transfer
            contractAddress={contractAddress}/>
            <Mint
            contractAddress={contractAddress}/>
            <Recover
            contractAddress={contractAddress}/>
            <Admin contractAddress={contractAddress}/>
            <Approve contractAddress={contractAddress}/>


        


                    

        </div>

    )
}

export default Operations;