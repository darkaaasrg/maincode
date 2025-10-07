import React, { useState, useEffect } from "react";
import "./Cassettes.css";

export default function Cassettes() {
  const [cassetteList, setCassetteList] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedCassette, setSelectedCassette] = useState(null);

  // CRUD для касет
  const [newCassette, setNewCassette] = useState({
    Title: "",
    Artist: "",
    Genre: "",
    Published: "",
    Price: "",
    Country: "",
    Photo: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // CRUD для відгуків
  const [userId, setUserId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [modalRating, setModalRating] = useState(5);
  const [modalComment, setModalComment] = useState("");

  // 🔹 Завантаження касет
  const loadCassettes = () => {
    fetch("http://localhost:5000/api/cassettes")
      .then((res) => res.json())
      .then((data) => setCassetteList(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadCassettes();
  }, []);

  // 🔹 Вибір касети
  const handleSelectChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const found = cassetteList.find((c) => c.ID.toString() === id);
    setSelectedCassette(found);

    if (found) {
      fetch(`http://localhost:5000/api/cassettes/${id}/reviews`)
        .then((res) => res.json())
        .then((data) => setReviews(data))
        .catch((err) => console.error(err));
    } else {
      setReviews([]);
    }
  };

  // 🔹 Додавання або редагування касети
  const handleCassetteSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `http://localhost:5000/api/cassettes/${selectedCassette.ID}`
      : "http://localhost:5000/api/cassettes";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCassette),
      });
      setNewCassette({
        Title: "",
        Artist: "",
        Genre: "",
        Published: "",
        Price: "",
        Country: "",
        Photo: "",
      });
      setIsEditing(false);
      loadCassettes();
      alert(isEditing ? "✅ Касету оновлено" : "✅ Касету додано");
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Видалення касети
  const handleDeleteCassette = async (id) => {
    if (!window.confirm("Видалити цю касету?")) return;
    try {
      await fetch(`http://localhost:5000/api/cassettes/${id}`, {
        method: "DELETE",
      });
      setSelectedCassette(null);
      setSelectedId("");
      loadCassettes();
      alert("🗑️ Касету видалено");
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Заповнення форми для редагування
  const startEditCassette = () => {
    if (!selectedCassette) return alert("Оберіть касету для редагування!");
    setNewCassette(selectedCassette);
    setIsEditing(true);
  };

  // 🔹 Додавання відгуку
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!selectedCassette) return alert("Оберіть касету!");
    if (!userId || !comment) return alert("Заповніть усі поля!");

    try {
      const res = await fetch(
        `http://localhost:5000/api/cassettes/${selectedId}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, rating, comment }),
        }
      );
      const updatedReviews = await res.json();
      setReviews(updatedReviews);
      setUserId("");
      setComment("");
      setRating(5);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Модалка для редагування відгуків
  const openModal = (review) => {
    setCurrentReview(review);
    setModalRating(review.rating);
    setModalComment(review.comment);
    setModalOpen(true);
  };

  const saveModal = async () => {
    try {
      await fetch(`http://localhost:5000/api/reviews/${currentReview.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: modalRating, comment: modalComment }),
      });
      setReviews(
        reviews.map((r) =>
          r.ID === currentReview.ID
            ? { ...r, rating: modalRating, comment: modalComment }
            : r
        )
      );
      setModalOpen(false);
      setCurrentReview(null);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteModal = async () => {
    if (!window.confirm("Видалити відгук?")) return;
    try {
      await fetch(`http://localhost:5000/api/reviews/${currentReview.ID}`, {
        method: "DELETE",
      });
      setReviews(reviews.filter((r) => r.ID !== currentReview.ID));
      setModalOpen(false);
      setCurrentReview(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="catalog-section">
      <h2>🎵 Касети</h2>

      <select value={selectedId} onChange={handleSelectChange} className="select-item">
        <option value="">-- Оберіть касету --</option>
        {cassetteList.map((c) => (
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
          <div className="cassette-buttons">
            <button onClick={startEditCassette}>✏️ Редагувати</button>
            <button onClick={() => handleDeleteCassette(selectedCassette.ID)}>
              🗑️ Видалити
            </button>
          </div>

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
                  <button onClick={() => openModal(r)}>
                    Редагувати / Видалити
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 🔹 Форма для додавання/редагування касети */}
      <div className="cassette-form">
        <h3>{isEditing ? "✏️ Редагувати касету" : "➕ Додати касету"}</h3>
        <form onSubmit={handleCassetteSubmit}>
          <input
            placeholder="Назва"
            value={newCassette.Title}
            onChange={(e) =>
              setNewCassette({ ...newCassette, Title: e.target.value })
            }
          />
          <input
            placeholder="Виконавець"
            value={newCassette.Artist}
            onChange={(e) =>
              setNewCassette({ ...newCassette, Artist: e.target.value })
            }
          />
          <input
            placeholder="Жанр"
            value={newCassette.Genre}
            onChange={(e) =>
              setNewCassette({ ...newCassette, Genre: e.target.value })
            }
          />
          <input
            placeholder="Рік"
            value={newCassette.Published}
            onChange={(e) =>
              setNewCassette({ ...newCassette, Published: e.target.value })
            }
          />
          <input
            placeholder="Ціна"
            value={newCassette.Price}
            onChange={(e) =>
              setNewCassette({ ...newCassette, Price: e.target.value })
            }
          />
          <input
            placeholder="Країна"
            value={newCassette.Country}
            onChange={(e) =>
              setNewCassette({ ...newCassette, Country: e.target.value })
            }
          />
          <input
            placeholder="Фото (назва файлу)"
            value={newCassette.Photo}
            onChange={(e) =>
              setNewCassette({ ...newCassette, Photo: e.target.value })
            }
          />
          <button type="submit">
            {isEditing ? "💾 Зберегти зміни" : "Додати касету"}
          </button>
          {isEditing && (
            <button onClick={() => setIsEditing(false)}>Скасувати</button>
          )}
        </form>
      </div>

      {/* 🔹 Модальне вікно відгуків */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Редагування відгуку</h3>
            <input
              type="number"
              min="1"
              max="5"
              value={modalRating}
              onChange={(e) => setModalRating(+e.target.value)}
            />
            <textarea
              value={modalComment}
              onChange={(e) => setModalComment(e.target.value)}
            />
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
