import { useState, useEffect } from "react";
// 1. Додаємо імпорт useLocation
import { Link, useNavigate, useLocation } from "react-router-dom";
import './Header.css';

import logoImage from "../icon.png";

function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  // 2. Ініціалізуємо хук, щоб відслідковувати URL
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    } else {
      // Якщо даних немає, гарантовано виходимо з системи
      setUser(null);
    }
  // 3. Додаємо location.pathname в залежності.
  // Тепер цей код буде виконуватись при кожній зміні маршруту!
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="header">
      <Link to="/" className="logo-container">
        <img src={logoImage} alt="Music Catalog Logo" className="logo-img" />
        <span className="logo-text">Music Catalog</span>
      </Link>
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