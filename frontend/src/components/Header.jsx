import React from "react";
import { Link } from "react-router-dom";
import './Header.css'; // якщо є css файл

export default function Header() {
  return (
    <header className="header">
      <h2>Music Catalog</h2>
      <nav className="header-nav">
        <Link to="/">Головна</Link>
        <Link to="/vinyls">Вініл</Link>
        <Link to="/cassettes">Касети</Link>
      </nav>
    </header>
  );
}
