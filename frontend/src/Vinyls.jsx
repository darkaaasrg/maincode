import { useEffect, useState } from "react";
import "./Vinyls.css";

export default function Vinyls() {
  const [vinyls, setVinyls] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/vinyls")
      .then(res => res.json())
      .then(data => setVinyls(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container">
      <h2>Вінілові платівки</h2>
      <div className="cards">
        {vinyls.map(vinyl => (
          <div className="card" key={vinyl.ID}>
            <img src={`http://localhost:5000/uploads/${vinyl.Photo}`} alt={vinyl.Title} />
            <h3>{vinyl.Title}</h3>
            <p>Автор: {vinyl.Artist}</p>
            <p>Рік: {vinyl.Published}</p>
            <p>Жанр: {vinyl.Genre}</p>
            <p>Ціна: ${vinyl.Price}</p>
            <p>Країна: {vinyl.Country}</p>
          </div>
        ))}
      </div>
    </div>
  );
}






/*import React, { useEffect, useState } from "react";
import "./Vinyls.css";

function Vinyls() {
  const [vinyls, setVinyls] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/vinyls")
      .then((res) => res.json())
      .then((data) => setVinyls(data))
      .catch((err) => console.error("Помилка завантаження вінілів:", err));
  }, []);

  return (
    <div>
      <h2>Вінілові платівки</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Назва</th>
            <th>Артист</th>
            <th>Рік</th>
            <th>Жанр</th>
            <th>Ціна</th>
            <th>Країна</th>
            <th>Фото</th>
          </tr>
        </thead>
        <tbody>
          {vinyls.map((vinyl) => (
            <tr key={vinyl.ID}>
              <td>{vinyl.ID}</td>
              <td>{vinyl.Title}</td>
              <td>{vinyl.Artist}</td>
              <td>{vinyl.Published}</td>
              <td>{vinyl.Genre}</td>
              <td>{vinyl.Price} $</td>
              <td>{vinyl.Country}</td>
              <td>
                {vinyl.Photo ? (
                  <img
                    src={`http://localhost:5000/uploads/${vinyl.Photo}`}
                    alt={vinyl.Title}
                    width="100"
                  />
                ) : (
                  "Немає фото"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Vinyls;*/
