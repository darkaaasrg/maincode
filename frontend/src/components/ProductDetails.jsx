import React from 'react'; 
import './ProductDetails.css'

export default function ProductDetails({ item, onBack }) {


if (!item) return null;

const currentImage = `http://localhost:5000/uploads/${item.Photo}`;

return (
<div className="product-details-page">
 <button onClick={onBack} className="back-btn">
 &larr; Назад до Головної
</button>

 <h1>{item.Title} ({item.type || 'Вініл'})</h1>

 <div className="details-content">
        
        <div className="image-slider-container">
          <img 
            src={currentImage} 
            alt={`${item.Title}`} 
            className="details-image" 
          />

 </div>

 <div className="info-block">

<h2>{item.Artist}</h2>
          <p><strong>Жанр:</strong> {item.Genre}</p>
          <p><strong>Рік випуску:</strong> {item.Published}</p>
          <p><strong>Країна:</strong> {item.Country}</p>
          <p className="price-tag"><strong>Ціна:</strong> {item.Price.toFixed(2)} $</p>
          
          <div className="full-description">
            <h4>Опис:</h4>
            <p>{item.description || 'Опис відсутній.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}