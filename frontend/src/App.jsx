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
      {/* 🟢 КРОК 1: Додаємо головний Flex-контейнер */}
      <div className="app-layout-wrapper"> 
        
        <Header />
        
        {/* 🟢 КРОК 2: Контейнер для основного вмісту, який має розтягуватися */}
        <div className="main-content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vinyls" element={<Vinyls />} />
            <Route path="/cassettes" element={<Cassettes />} />
          </Routes>
        </div>

        {/* КРОК 3: Використовуємо className, а не class */}
        <Footer className="footer" /> 
      </div>
    </Router>
  );
}

export default App;