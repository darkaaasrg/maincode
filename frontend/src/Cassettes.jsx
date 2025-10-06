import React, { useState, useEffect } from "react";
import "./Cassettes.css"; // Підключимо CSS для модалки

export default function Cassettes() {
  const [cassetteList, setCassetteList] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedCassette, setSelectedCassette] = useState(null);
  const [userId, setUserId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);

  // Для модального вікна
  const [modalOpen, setModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [modalRating, setModalRating] = useState(5);
  const [modalComment, setModalComment] = useState("");

  // 🔹 Завантаження касет
  useEffect(() => {
    fetch("http://localhost:5000/api/cassettes")
      .then(res => res.json())
      .then(data => setCassetteList(data))
      .catch(err => console.error(err));
  }, []);

  const handleSelectChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const found = cassetteList.find(c => c.ID.toString() === id);
    setSelectedCassette(found);

    if (found) {
      fetch(`http://localhost:5000/api/cassettes/${id}/reviews`)
        .then(res => res.json())
        .then(data => setReviews(data))
        .catch(err => console.error(err));
    } else {
      setReviews([]);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!selectedCassette) return alert("Оберіть касету!");
    if (!userId || !comment) return alert("Заповніть усі поля!");

    try {
      const res = await fetch(`http://localhost:5000/api/cassettes/${selectedId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, rating, comment }),
      });
      const updatedReviews = await res.json();
      setReviews(updatedReviews);
      setUserId("");
      setComment("");
      setRating(5);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Відкриття модалки
  const openModal = (review) => {
    setCurrentReview(review);
    setModalRating(review.rating);
    setModalComment(review.comment);
    setModalOpen(true);
  };

  // 🔹 Збереження редагованого відгуку
  const saveModal = async () => {
    try {
      await fetch(`http://localhost:5000/api/reviews/${currentReview.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: modalRating, comment: modalComment }),
      });
      setReviews(reviews.map(r => r.ID === currentReview.ID ? { ...r, rating: modalRating, comment: modalComment } : r));
      setModalOpen(false);
      setCurrentReview(null);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Видалення з модалки
  const deleteModal = async () => {
    if (!window.confirm("Видалити відгук?")) return;
    try {
      await fetch(`http://localhost:5000/api/reviews/${currentReview.ID}`, { method: "DELETE" });
      setReviews(reviews.filter(r => r.ID !== currentReview.ID));
      setModalOpen(false);
      setCurrentReview(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="catalog-section">
      <h2>Касети</h2>

      <select value={selectedId} onChange={handleSelectChange} className="select-item">
        <option value="">-- Оберіть касету --</option>
        {cassetteList.map(c => (
          <option key={c.ID} value={c.ID}>
            {c.Title} — {c.Artist}
          </option>
        ))}
      </select>

      {selectedCassette && (
        <div className="product-card">
          <h3>{selectedCassette.Title}</h3>
          <p>Виконавець: {selectedCassette.Artist}</p>
          <p>Жанр: {selectedCassette.Genre}</p>
          <p>Рік: {selectedCassette.Published}</p>
          <p>Ціна: {selectedCassette.Price} $</p>
          <p>Країна: {selectedCassette.Country}</p>
          {selectedCassette.Photo && (
            <img
              src={`http://localhost:5000/uploads/${selectedCassette.Photo}`}
              alt={selectedCassette.Title}
            />
          )}

          <form onSubmit={handleAddReview} className="review-form">
            <input placeholder="Ваш ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
            <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(+e.target.value)} />
            <input placeholder="Коментар" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button type="submit">Додати відгук</button>
          </form>

          <div className="reviews">
            <h4>Відгуки:</h4>
            {reviews.length === 0 ? (
              <p>Поки що немає відгуків.</p>
            ) : (
              reviews.map((r) => (
                <div key={r.ID} className="review-item">
                  <b>{r.userId}</b>: {r.rating}★ — {r.comment}
                  <br />
                  <small>{new Date(r.date).toLocaleString()}</small>
                  <button onClick={() => openModal(r)}>Редагувати / Видалити</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 🔹 Модальне вікно */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Редагування відгуку</h3>
            <input type="number" min="1" max="5" value={modalRating} onChange={(e) => setModalRating(+e.target.value)} />
            <textarea value={modalComment} onChange={(e) => setModalComment(e.target.value)} />
            <div className="modal-buttons">
              <button onClick={saveModal}>Зберегти</button>
              <button onClick={deleteModal}>Видалити</button>
              <button onClick={() => setModalOpen(false)}>Відмінити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
