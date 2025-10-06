import { useEffect, useState } from "react";
import "./Cassettes.css";

export default function Cassettes() {
  const [cassettes, setCassettes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/cassettes")
      .then(res => res.json())
      .then(data => setCassettes(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container">
      <h2>Касети</h2>
      <div className="cards">
        {cassettes.map(cassette => (
          <div className="card" key={cassette.ID}>
            <img 
            src={`http://localhost:5000/uploads/${cassette.Photo}`} alt={cassette.Title}
            />
            <h3>{cassette.Title}</h3>
            <p>Автор: {cassette.Artist}</p>
            <p>Рік: {cassette.Published}</p>
            <p>Жанр: {cassette.Genre}</p>
            <p>Ціна: ${cassette.Price}</p>
            <p>Країна: {cassette.Country}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
