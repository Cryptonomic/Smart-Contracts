import { BrowserRouter, Routes, Route } from "react-router-dom";

// components
import Parameters from "./Parameters";
import Operations from "./Operations";
import Homepage from "./Homepage";
import Navbar from "./Navbar";
import Storage from "./Storage";
import { useState } from "react";


function AppRouter() {

    const [contractAddress, setAddress] = useState("KT1BCLaBA6M3UAUBUpj9FjYknRiiZRMA5LVn");
    const updateAddress = (a) => {
        setAddress(a);
    }
    return (

        <BrowserRouter>
            <div className="h-100">
                <Navbar contractAddress={contractAddress}/>
                <Routes>
                    <Route path = "/home" element={
                        <Homepage
                        updateAddress={updateAddress}
                        />
                    }>
                    </Route>
                    <Route path = "/parameters" element={
                        <Parameters
                        contractAddress={contractAddress}/>
                    }>
                    </Route>
                    <Route path = "/operations" element={
                        <Operations contractAddress={contractAddress}/>
                    }>
                    </Route>
                    <Route path = "/storage" element={
                        <Storage contractAddress={contractAddress}/>
                    }>
                    </Route>
                </Routes>
            </div>
        </BrowserRouter>


    );
};

export default AppRouter;