import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Home from "./components/Home";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
        </Route>
        <Route path="home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
