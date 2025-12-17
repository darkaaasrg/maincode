import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import './Header.css';

import logoImage from "../icon.png";

function Header() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  return (
    <header className="header">
      <Link to="/" className="logo-container">
        <img src={logoImage} alt="Music Catalog Logo" className="logo-img" />
        <span className="logo-text">Music Catalog</span>
      </Link>
      
      <form onSubmit={handleSearchSubmit} className="search-bar">
        <input 
            type="text" 
            placeholder="Пошук альбомів..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        
      </form>
      
      <nav>
        <ul>
          <li><Link to="/">Головна</Link></li>
          {!user ? (
            <>
              <li><Link to="/login">Увійти</Link></li>
              <li><Link to="/register">Реєстрація</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/vinyls">Вініл</Link></li>
              <li><Link to="/cassettes">Касети</Link></li>
              <li><Link to="/profile">Мій кабінет</Link></li>
              <li><button onClick={handleLogout}>Вийти</button></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;