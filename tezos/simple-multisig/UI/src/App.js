import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";



import AppRouter from "./components/AppRouter";



const App = () => {
  return (
    <div className="h-100">
      <AppRouter/>
    </div>
  );
};

export default App;
