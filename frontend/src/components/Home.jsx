import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const navigate = useNavigate();

  const ITEMS_COUNT = 8; 

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/random?limit=${ITEMS_COUNT}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFeaturedItems(data);
        }
      })
      .catch((err) => console.error("Не вдалося завантажити товари:", err));
  }, []);

  const handleItemClick = (item) => {
    const path = item.type === 'vinyl' ? '/vinyls' : '/cassettes';
    
    navigate(path, { state: { openId: item.ID } });
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Ласкаво просимо до Music Catalog</h1>
        </div>
      </section>

      <section className="featured-section">
        <h2>Рекомендоване для вас</h2>
        
        <div className="featured-grid">
          {featuredItems.length > 0 ? (
            featuredItems.map((item) => (
              <div 
                key={`${item.type}-${item.ID}`} 
                className="featured-card"
                onClick={() => handleItemClick(item)}
              >
                <div className="card-image-wrapper">
                  <img 
                    src={item.Photo ? `http://localhost:5000/uploads/${item.Photo}` : 'https://via.placeholder.com/200'} 
                    alt={item.Title} 
                  />
                  <div className="card-overlay">
                    <span>Переглянути деталі</span>
                  </div>
                </div>
                <div className="card-info">
                  <h3>{item.Title}</h3>
                  <p className="card-artist">{item.Artist}</p>
                  <p className="card-price">{Number(item.Price).toFixed(2)} ₴</p>
                  <span className={`badge badge-${item.type}`}>
                    {item.type === 'vinyl' ? 'Вініл' : 'Касета'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="loading-text">Завантаження найкращих пропозицій...</p>
          )}
        </div>
      </section>
    </div>
  );
}