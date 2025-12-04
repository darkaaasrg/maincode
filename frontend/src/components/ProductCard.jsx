import React from 'react';
import './ProductCard.css'; 

const API_BASE_URL = 'http://localhost:5000';

export default function ProductCard({ item, onViewDetails }) {
  
  let imageUrl = 'https://via.placeholder.com/150';

  if (item.images && item.images.length > 0) {
      imageUrl = item.images[0];
  } else if (item.Photo) {
      imageUrl = `${API_BASE_URL}/uploads/${item.Photo}`; 
  }

  const itemType = item.type || 'unknown';
  const title = item.Title || item.title || "Без назви";
  const artist = item.Artist || item.artist || "Невідомий виконавець";
  const price = item.Price || item.price;

  return (
    <div 
      className={`product-card ${itemType.toLowerCase()}`}
      onClick={() => onViewDetails(item)} 
      style={{ cursor: 'pointer' }} 
    >
      <div className="product-image-container">
        <img 
          src={imageUrl} 
          alt={`${title} - ${artist}`} 
          width="150px" 
          onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150"; }}
        />
      </div>
      
      <div className="product-info">
        <h3>{title}</h3>
        <p><strong>{itemType === 'vinyl' ? 'Вініл' : itemType === 'cassette' ? 'Касета' : itemType}</strong> від {artist}</p>
        
        {price && (
            <p className="price">{Number(price).toFixed(2)} ₴</p>
        )}
        
        <button className="view-btn">
          Переглянути деталі
        </button>
      </div>
    </div>
  );
}