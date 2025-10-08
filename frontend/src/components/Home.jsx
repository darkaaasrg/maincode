import React, { useState } from "react";
import './Home.css';
import ProductCard from "./ProductCard"; 
import ProductDetails from "./ProductDetails";

// Тестові дані для відображення на головній сторінці
const ITEMS_DATA = [
  {
    id: 'v1',
    type: 'Вініл',
    title: 'Dark Side of the Moon',
    artist: 'Pink Floyd',
    description: 'Легендарний альбом Pink Floyd, культовий саунд та неповторна атмосфера психоделічного року. Це видання має високу якість звуку та унікальний артворк.',
    price: 39.00,
    genre: 'Progressive Rock',
    year: '1973',
    country: 'UK',
    images: 'https://hardyvinyl.com/wp-content/uploads/2021/11/the-dark-side-of-the-moon.jpg',
  },
  {
    id: 'c1',
    type: 'Вініл',
    title: 'Сонь, ти спиш?',
    artist: 'Nikow',
    description: 'Класичний альбом Nikow, записаний у 2024 році. Цей реліз на касеті має особливе лоу-фай звучання, що цінується фанатами інді.',
    price: 15.50,
    genre: 'Indie',
    year: '2024',
    country: 'UA',
    images: 'https://vinyla.com/files/products/cd/180/219572/1.1280x1280.jpg?8183a7f03b60c137622f650f26c87a1f',
  },
  {
    id: 'v2',
    type: 'Вініл',
    title: 'Rumours',
    artist: 'Fleetwood Mac',
    description: 'Один із найбільш продаваних альбомів усіх часів. Класика поп-року 70-х, що розповідає про особисті стосунки учасників гурту.',
    price: 35.00,
    genre: 'Pop Rock',
    year: '1977',
    country: 'USA',
    images: ['https://lampala.com.ua/storage/tmp_media/5d/ea4/gallery_image-w420-h420-q100-resize_u-files-store-68-7-qwp100.webp', 
                'https://lampala.com.ua/storage/tmp_media/4c/968/image-w420-h420-q100-resize_u-files-store-68-8-qwp100.webp', 
                'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQ3i36qUHlICQyfBZjhAUH5TweIsAVs6D5MwJoV6UMYoXJDdPHPMyI3R6EosgXerkyFbi9TZfGEoWtebIICgIFFoa2YXBeH8m5Qvndb-4ETr0yytE-OZ6P88Wo'
    ],
  },
];

export default function Home() {
  // Зберігаємо об'єкт товару, який зараз переглядається
  const [selectedItem, setSelectedItem] = useState(null); 

  // Функція для переходу на сторінку деталей
  const handleViewDetails = (item) => {
    setSelectedItem(item);
  };

  // Функція для повернення до списку
  const handleBack = () => {
    setSelectedItem(null);
  };

  // Якщо обрано елемент, показуємо ProductDetails
  if (selectedItem) {
    return <ProductDetails item={selectedItem} onBack={handleBack} />;
  }

  // Інакше, показуємо список товарів
  return (
    <div className="home-container">
      <h1>Галерея наших продуктів</h1>
      

      <div className="posts">
        {ITEMS_DATA.map((item) => (
          <div key={item.id} className="post-wrapper">
            <ProductCard 
              item={item} 
              onViewDetails={handleViewDetails} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}