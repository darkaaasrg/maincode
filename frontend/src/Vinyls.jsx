import React, { useState, useEffect } from "react";

export default function Vinyls() {
  const [vinylList, setVinylList] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedVinyl, setSelectedVinyl] = useState(null);
  const [userId, setUserId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);

  // 🔹 Завантаження вінілів
  useEffect(() => {
    fetch("http://localhost:5000/api/vinyls")
      .then(res => res.json())
      .then(data => setVinylList(data))
      .catch(err => console.error(err));
  }, []);

  // 🔹 Вибір вінiлу
  const handleSelectChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const found = vinylList.find(v => v.ID.toString() === id);
    setSelectedVinyl(found);

    if (found) {
      fetch(`http://localhost:5000/api/vinyls/${id}/reviews`)
        .then(res => res.json())
        .then(data => setReviews(data))
        .catch(err => console.error(err));
    } else {
      setReviews([]);
    }
  };

  // 🔹 Додавання відгуку
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!selectedVinyl) return alert("Оберіть вініл!");
    if (!userId || !comment) return alert("Заповніть усі поля!");

    try {
      const res = await fetch(`http://localhost:5000/api/vinyls/${selectedId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, rating, comment }),
      });

      if (!res.ok) throw new Error("Помилка при додаванні відгуку");

      const updatedReviews = await res.json();
      setReviews(updatedReviews);
      setUserId("");
      setComment("");
      setRating(5);
    } catch (err) {
      console.error(err);
      alert("Не вдалося додати відгук");
    }
  };

  return (
    <div className="catalog-section">
      <h2>Вініли</h2>

      <select value={selectedId} onChange={handleSelectChange} className="select-item">
        <option value="">-- Оберіть вініл --</option>
        {vinylList.map(v => (
          <option key={v.ID} value={v.ID}>
            {v.Title} — {v.Artist}
          </option>
        ))}
      </select>

      {selectedVinyl && (
        <div className="product-card">
          <h3>{selectedVinyl.Title}</h3>
          <p>Виконавець: {selectedVinyl.Artist}</p>
          <p>Жанр: {selectedVinyl.Genre}</p>
          <p>Рік: {selectedVinyl.Published}</p>
          <p>Ціна: {selectedVinyl.Price} $</p>
          <p>Країна: {selectedVinyl.Country}</p>
          {selectedVinyl.Photo && (
            <img
              src={`http://localhost:5000/uploads/${selectedVinyl.Photo}`}
              alt={selectedVinyl.Title}
            />
          )}

          {/* Форма відгуку */}
          <form onSubmit={handleAddReview} className="review-form">
            <input
              placeholder="Ваш ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(+e.target.value)}
            />
            <input
              placeholder="Коментар"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit">Додати відгук</button>
          </form>

          {/* Відгуки */}
          <div className="reviews">
            <h4>Відгуки:</h4>
            {reviews.length === 0 ? (
              <p>Поки що немає відгуків.</p>
            ) : (
              reviews.map((r, i) => (
                <div key={i} className="review-item">
                  <b>{r.userId}</b>: {r.rating}★ — {r.comment}
                  <br />
                  <small>{new Date(r.date).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
