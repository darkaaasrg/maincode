import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// Припускаємо, що шляхи імпорту коректні
import Home from "./components/Home";
import Vinyls from "./Vinyls";
import Cassettes from "./Cassettes";
import Header from "./components/Header";
import Footer from "./components/Footer";
import './index.css'

function App() {
  return (
    <Router>
      <div className="app-layout-wrapper"> 
        
        <Header />
        <div className="main-content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vinyls" element={<Vinyls />} />
            <Route path="/cassettes" element={<Cassettes />} />
          </Routes>
        </div>
        <Footer className="footer" /> 
      </div>
    </Router>
  );
}

export default App;