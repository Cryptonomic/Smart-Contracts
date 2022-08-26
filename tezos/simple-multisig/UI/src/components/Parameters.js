import Signer from "./parameters/Signer";
import Threshold from "./parameters/Threshold";
import Delegate from "./parameters/Delegate";
import Navbar from "./Navbar";


function Parameters() {
    return (
        <div className="d-flex flex-column justify-content-center align-items-left h-100">
            <Threshold/>
            <Signer/>
            <Delegate/>
        </div>
    )
}

export default Parameters;