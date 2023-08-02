import Signer from "./parameters/Signer";
import Threshold from "./parameters/Threshold";
import Delegate from "./parameters/Delegate";
import Navbar from "./Navbar";


function Parameters({contractAddress}) {
    return (
        <div className="d-flex flex-column justify-content-center align-items-left h-100">
            <Threshold contractAddress={contractAddress}/>
            <Signer contractAddress={contractAddress}/>
            <Delegate contractAddress={contractAddress}/>
        </div>
    )
}

export default Parameters;