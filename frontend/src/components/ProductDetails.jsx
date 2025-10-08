import React, { useState } from 'react';

export default function ProductDetails({ item, onBack }) {

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!item) return null;

  // Функція переходу до наступного зображення
  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % item.images.length
    );
  };

  // Функція переходу до попереднього зображення
  const goToPrev = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex - 1 + item.images.length) % item.images.length
    );
  };
  
  // Вибираємо зображення для відображення
  const currentImage = item.images[currentImageIndex];

  return (
    <div className="product-details-page">
      <button onClick={onBack} className="back-btn">
        &larr; Назад до Головної
      </button>
      
      <h1>{item.title} ({item.type})</h1>
      
      <div className="details-content">
        
        {/* ======================================= */}
        {/* 🆕 БЛОК СЛАЙДЕРА */}
        <div className="image-slider-container">
          <img 
            src={currentImage} 
            alt={`${item.title} - Фото ${currentImageIndex + 1}`} 
            className="details-image" 
          />
          
          {/* Кнопки навігації, якщо фотографій більше однієї */}
          {item.images.length > 1 && (
            <div className="slider-controls">
              <button onClick={goToPrev}>&lt; Попередня</button>
              <span>{currentImageIndex + 1} / {item.images.length}</span>
              <button onClick={goToNext}>Наступна &gt;</button>
            </div>
          )}
        </div>
        {/* ======================================= */}
        
        <div className="info-block">
          <h2>{item.artist}</h2>
          <p><strong>Жанр:</strong> {item.genre}</p>
          <p><strong>Рік випуску:</strong> {item.year}</p>
          <p><strong>Країна:</strong> {item.country}</p>
          <p className="price-tag"><strong>Ціна:</strong> {item.price.toFixed(2)} $</p>
          
          <div className="full-description">
            <h4>Опис:</h4>
            <p>{item.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}