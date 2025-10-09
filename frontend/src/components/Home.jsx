import React, { useState } from "react";
import './Home.css';
import ProductCard from "./ProductCard"; 
import ProductDetails from "./ProductDetails";

const ITEMS_DATA = [
  // 🟢 ВІНІЛИ
  {
    id: 'v1',
    type: 'Вініл',
    title: 'Dark Side of the Moon',
    artist: 'Pink Floyd',
    description: 'Легендарний альбом Pink Floyd, культовий саунд та неповторна атмосфера психоделічного року.',
    price: 39.00,
    genre: 'Progressive Rock',
    year: '1973',
    country: 'UK',
    images: ['https://hardyvinyl.com/wp-content/uploads/2021/11/the-dark-side-of-the-moon.jpg',
             'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRyn4bHn70NZJNFrDR2q0EPHt3Stq0oh-giakmojUej0sJVLmoiTkklU4aB3NOqK05LIelh3bL-cDaBcImFXJKrHxtSZjkdl5GkaYHR6guQgVmHqeCfNoOF', 
             'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRgQa-qLCNkSEbK5EqOSVrjZQV6qxaI1d3_GjlutzeChCbJNkzWgoBeYLN2jy3ChJ8StvdR1lusuOHb04yKm3QOwt1lV-i00V4MpqeWXT8'
    ] 
  },
  {
    id: 'v2', // 🟢 ВИПРАВЛЕНО ID
    type: 'Вініл',
    title: 'Сонь, ти спиш?',
    artist: 'Nikow',
    description: 'Класичний альбом Nikow, записаний у 2024 році. Цей реліз на касеті має особливе лоу-фай звучання, що цінується фанатами інді.',
    price: 15.50,
    genre: 'Indie',
    year: '2024',
    country: 'UA',
    images: ['https://vinyla.com/files/products/cd/180/219572/4.1280x1280.jpg?79d090d6d5e91f0e8543994a22192d5d', 
             'https://vinyla.com/files/products/cd/180/219572/1.1280x1280.jpg?8183a7f03b60c137622f650f26c87a1f',
             'https://vinyla.com/files/products/cd/180/219572/2.1280x1280.jpg?adb3ea0a657252ff4dd1145c5969e98f'
    ]
  },
  {
    id: 'v3',
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

  // 🟢 КАСЕТИ
  {
    id: 'c1',
    type: 'Касета',
    title: 'Meteora',
    artist: 'Linkin Park',
    description: 'Другий студійний альбом гурту, що містить хіти "Numb" та "Faint". Класика ню-металу та альтернативного року початку 2000-х.',
    price: 23.55,
    genre: 'Alternative Metal',
    year: '2003',
    country: 'USA',
    images: ['https://i.etsystatic.com/22941025/r/il/8119ab/4016053492/il_fullxfull.4016053492_khet.jpg', 
             'https://7.allegroimg.com/s1024/0cd8bb/cacc692e4057818e47e2bc4f2f97'
    ],
  },

  {
    id: 'c2',
    type: 'Касета',
    title: 'Sehnsucht',
    artist: 'Rammstein',
    description: 'Другий студійний альбом гурту, що приніс їм світову славу завдяки таким трекам, як "Du Hast" та "Engel". Класика індастріал-металу кінця 90-х із характерним німецьким звучанням..',
    price: 29.05,
    genre: 'Industrial Metal',
    year: '1997',
    country: 'Germany',
    images: ['https://lenoise.ca/cdn/shop/files/515yadpLNgL._UF1000_1000_QL80.jpg?v=1688141683', 
             'https://7.allegroimg.com/s1024/0c9270/12c94a5745b3a1f3c7dec13d51a7', 
             'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgAElTgg-VRpOPeRHBr7YOK1VTv3NqokMiJ-xambq7o5eudoNmNBarEdkkADJm9oHIgGVEoY15H-2FAuuP9bD7uQn1nm4R7F_1_MaacHmXFKaM2aNT29j19dL9URcw2OPkADYwdi0EC1vE/s1600/rammstein_sehnsucht_turkish_cassette_1.jpg'
    ],
  },

  {
    id: 'c3',
    type: 'Касета',
    title: 'A Night at the Opera',
    artist: 'Queen',
    description: 'Один із найвизначніших альбомів в історії року, що включає легендарну композицію "Bohemian Rhapsody". Альбом відзначається еклектичним поєднанням опери, балади та хард-року.',
    price: 38.50,
    genre: 'Glam Rock / Progressive Rock',
    year: '1975',
    country: 'UK',
    images: ['https://i.discogs.com/Ow0TwNa-eMFPlXLjM9tWp6o93_8N-VSSqNSbmGghuhc/rs:fit/g:sm/q:40/h:300/w:300/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTc3ODQ4/OTQtMTQ0ODcyMjMz/NS03NjMxLmpwZWc.jpeg', 
             'https://i.ebayimg.com/images/g/tOUAAOSwZLRoUj1t/s-l1600.webp', 
             'https://i.ebayimg.com/images/g/lmMAAOSwEvZoUj1x/s-l1600.webp'
    ],
  },
];

export default function Home() {
  const [selectedItem, setSelectedItem] = useState(null); 

  const handleViewDetails = (item) => {
    setSelectedItem(item);
  };

  const handleBack = () => {
    setSelectedItem(null);
  };

  // 🟢 КРОК 1: ФІЛЬТРУЄМО ТОВАРИ
  const vinyls = ITEMS_DATA.filter(item => item.type === 'Вініл');
  const cassettes = ITEMS_DATA.filter(item => item.type === 'Касета');

  if (selectedItem) {
    return <ProductDetails item={selectedItem} onBack={handleBack} />;
  }

  return (
    <div className="home-container">
      <h1>Галерея наших продуктів</h1>
      

      <div className="posts">
        {vinyls.map((item) => (
          <div key={item.id} className="post-wrapper">
            <ProductCard 
              item={item} 
              onViewDetails={handleViewDetails} 
            />
          </div>
        ))}
      </div>
      
      <div className="posts">
        {cassettes.map((item) => (
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