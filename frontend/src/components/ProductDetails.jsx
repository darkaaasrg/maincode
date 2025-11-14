import React from 'react'; // Видаляємо useState
import './ProductDetails.css'

export default function ProductDetails({ item, onBack }) {

  // Видаляємо логіку useState, goToNext, goToPrev

  if (!item) return null;

  // === ЗМІНА: Отримуємо одне зображення з `item.Photo` ===
  // (Переконайтеся, що ви передаєте сюди повний об'єкт item,
  // і що порт 5000 - це ваш бекенд)
  const currentImage = `http://localhost:5000/uploads/${item.Photo}`;

  return (
    <div className="product-details-page">
      <button onClick={onBack} className="back-btn">
        &larr; Назад до Головної
      </button>
      
      {/* Я припускаю, що "type" (Вініл/Касета) 
        та "description" ви додасте до даних у vinylList
      */}
      <h1>{item.Title} ({item.type || 'Вініл'})</h1>
      
      <div className="details-content">
        
        <div className="image-slider-container">
          <img 
            src={currentImage} 
            alt={`${item.Title}`} 
            className="details-image" 
          />
          
          {/* === Видаляємо блок слайдера === */}
          {/* {item.images.length > 1 && ( ... )} */}
        </div>
        
        <div className="info-block">
          {/* === Оновлюємо імена полів === */}
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