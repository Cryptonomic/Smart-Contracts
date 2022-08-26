import { BrowserRouter, Routes, Route } from "react-router-dom";

// components
import Parameters from "./Parameters";
import Operations from "./Operations";
import Homepage from "./Homepage";
import Navbar from "./Navbar";
import Storage from "./Storage";


function AppRouter() {
    return (

        <BrowserRouter>
            <div className="h-100">
                <Navbar/>
                <Routes>
                    <Route path = "/home" element={
                        <Homepage/>
                    }>
                    </Route>
                    <Route path = "/parameters" element={
                        <Parameters/>
                    }>
                    </Route>
                    <Route path = "/operations" element={
                        <Operations/>
                    }>
                    </Route>
                    <Route path = "/storage" element={
                        <Storage/>
                    }>
                    </Route>
                </Routes>
            </div>
        </BrowserRouter>


    );
};

export default AppRouter;