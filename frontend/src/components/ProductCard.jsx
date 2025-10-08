// src/components/ProductCard.jsx

import React from 'react';
import './ProductCard.css'; 

export default function ProductCard({ item, onViewDetails }) {
  
  const imageUrl = (item.images && item.images.length > 0) 
                   ? item.images[0] 
                   : 'https://via.placeholder.com/150'; // Тимчасова заглушка
  
  return (
    <div className={`product-card ${item.type.toLowerCase()}`}>
      <div className="product-image-container">
        <img 
          src={imageUrl} // ВИКОРИСТОВУЄМО ВИПРАВЛЕНЕ ЗОБРАЖЕННЯ
          alt={`${item.title} - ${item.artist}`} 
          width="150px" 
        />
      </div>
      
      <div className="product-info">
        <h3>{item.title}</h3>
        <p><strong>{item.type}</strong> від {item.artist}</p>
        <p className="short-desc">{item.description.substring(0, 70)}...</p>
        
        <button 
          className="view-btn"
          onClick={() => onViewDetails(item)}
        >
          Переглянути деталі
        </button>
      </div>
    </div>
  );
}