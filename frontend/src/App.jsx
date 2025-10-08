import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import Vinyls from "./Vinyls";
import Cassettes from "./Cassettes";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <Header />
      

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vinyls" element={<Vinyls />} />
        <Route path="/cassettes" element={<Cassettes />} />
      </Routes>

      <Footer />
    </Router>

    
  );
}

export default App;
