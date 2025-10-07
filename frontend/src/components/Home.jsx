import React from "react";
import './Home.css';

export default function Home() {
  return (
    <div>
      <h1>Головна сторінка</h1>
      <div className="posts">
        <img src ="https://vinyla.com/files/products/cd/180/219572/1.1280x1280.jpg?8183a7f03b60c137622f650f26c87a1f" width= "150px" />
        <h3>Огляд платівки: Сонь, ти спиш?</h3>
        <p>Класичний альбом Nikow, записаний у 2024 році. Незабутня музика для будь-якого колекціонера.</p>

        <img src ="https://hardyvinyl.com/wp-content/uploads/2021/11/the-dark-side-of-the-moon.jpg" width= "150px" />
        <h3>Огляд платівки: Dark Side of the Moon</h3>
        <p>Легендарний альбом Pink Floyd, культовий саунд та неповторна атмосфера психоделічного року.</p>
      </div>
    </div>
  );
}
