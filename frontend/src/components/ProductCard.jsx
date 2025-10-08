import React from 'react';
import './ProductCard.css'; 

export default function ProductCard({ item, onViewDetails }) {
  return (
    <div className={`product-card ${item.type.toLowerCase()}`}>
      <div className="product-image-container">
        <img 
          src={item.imageUrl} 
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
          onClick={() => onViewDetails(item)} // Передаємо об'єкт для перегляду
        >
          Переглянути деталі
        </button>
      </div>
    </div>
  );
}