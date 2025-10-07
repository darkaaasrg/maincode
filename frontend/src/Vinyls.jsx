import React, { useState, useEffect } from "react";
// Припустімо, що у вас є файл стилів, якщо ви його використовуєте
// import "./Vinyls.css"; 

export default function Vinyls() {
  const [vinylList, setVinylList] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedVinyl, setSelectedVinyl] = useState(null);
  
  // 🔹 CRUD для вінілів (використовуємо formData та isModalOpen, як у вашому Vinyls.jsx)
  const [formData, setFormData] = useState({
    Title: "",
    Artist: "",
    Genre: "",
    Country: "",
    Published: "",
    Price: "",
    Photo: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔹 CRUD для відгуків (НОВЕ)
  const [userId, setUserId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);

  const [reviewModalOpen, setReviewModalOpen] = useState(false); // Для модалки відгуків
  const [currentReview, setCurrentReview] = useState(null);
  const [modalRating, setModalRating] = useState(5);
  const [modalComment, setModalComment] = useState("");

  // 🔹 Завантаження вінілів
  const loadVinyls = () => {
    fetch("http://localhost:5000/api/vinyls")
      .then((res) => res.json())
      .then((data) => setVinylList(data))
      .catch((err) => console.error("Помилка при завантаженні:", err));
  };

  useEffect(() => {
    loadVinyls();
  }, []);

  // 🔹 Завантаження відгуків (НОВЕ)
  const loadReviews = (id) => {
    fetch(`http://localhost:5000/api/vinyls/${id}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error(err));
  };

  // 🔹 Вибір вінілу
  const handleSelectChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const found = vinylList.find((v) => v.ID.toString() === id);
    setSelectedVinyl(found);

    if (found) {
        loadReviews(id); // Завантажуємо відгуки для вибраного вінілу
    } else {
        setReviews([]);
    }
  };

  // 🔹 Відкриття модалки для створення / редагування вінілу
  const handleOpenModal = (vinyl = null) => {
    if (vinyl) {
      setFormData({
        Title: vinyl.Title,
        Artist: vinyl.Artist,
        Genre: vinyl.Genre,
        Country: vinyl.Country,
        Published: vinyl.Published,
        Price: vinyl.Price,
        Photo: vinyl.Photo,
      });
      setSelectedId(vinyl.ID);
    } else {
      setFormData({
        Title: "", Artist: "", Genre: "", Country: "",
        Published: "", Price: "", Photo: "",
      });
      setSelectedId("");
    }
    setIsModalOpen(true);
  };

  // 🔹 Закриття модалки вінілу
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      Title: "", Artist: "", Genre: "", Country: "",
      Published: "", Price: "", Photo: "",
    });
  };

  // 🔹 Обробка введення для форми вінілу
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Додавання або оновлення вінілу
  const handleSave = async () => {
    try {
      const method = selectedId ? "PUT" : "POST";
      const url = selectedId
        ? `http://localhost:5000/api/vinyls/${selectedId}`
        : "http://localhost:5000/api/vinyls";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Помилка при збереженні вінілу");

      const updated = await res.json();

      if (selectedId) {
        setVinylList((prev) =>
          prev.map((v) => (v.ID === updated.ID ? updated : v))
        );
        setSelectedVinyl(updated); 
      } else {
        setVinylList((prev) => [...prev, updated]);
      }

      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert("Не вдалося зберегти вініл");
    }
  };

  // 🔹 Видалення вінілу
  const handleDelete = async (id) => {
    if (!window.confirm("Видалити цей вініл?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/vinyls/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Помилка при видаленні");
      setVinylList((prev) => prev.filter((v) => v.ID !== id));
      setSelectedVinyl(null);
      setSelectedId("");
      setReviews([]); // Скидаємо відгуки
    } catch (err) {
      console.error(err);
      alert("Не вдалося видалити вініл");
    }
  };

  // --- ЛОГІКА ВІДГУКІВ (НОВЕ) ---

  // 🔹 Додавання відгуку
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!selectedVinyl) return alert("Оберіть вініл!");
    if (!userId || !comment) return alert("Заповніть усі поля!");

    try {
      const res = await fetch(
        `http://localhost:5000/api/vinyls/${selectedId}/reviews`,
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
      alert("Не вдалося додати відгук.");
    }
  };

  // 🔹 Модалка для редагування відгуків: Відкриття
  const openReviewModal = (review) => {
    setCurrentReview(review);
    setModalRating(review.rating);
    setModalComment(review.comment);
    setReviewModalOpen(true);
  };

  // 🔹 Модалка для редагування відгуків: Збереження
  const saveReviewModal = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${currentReview.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: modalRating, comment: modalComment }),
      });
      
      if (!res.ok) throw new Error("Помилка при оновленні відгуку");

      setReviews(
        reviews.map((r) =>
          r.ID === currentReview.ID
            ? { ...r, rating: modalRating, comment: modalComment }
            : r
        )
      );
      setReviewModalOpen(false);
      setCurrentReview(null);
    } catch (err) {
      console.error(err);
      alert("Не вдалося оновити відгук.");
    }
  };

  // 🔹 Модалка для редагування відгуків: Видалення
  const deleteReviewModal = async () => {
    if (!window.confirm("Видалити відгук?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${currentReview.ID}`, {
        method: "DELETE",
      });
      
      if (!res.ok) throw new Error("Помилка при видаленні відгуку");

      setReviews(reviews.filter((r) => r.ID !== currentReview.ID));
      setReviewModalOpen(false);
      setCurrentReview(null);
    } catch (err) {
      console.error(err);
      alert("Не вдалося видалити відгук.");
    }
  };

  return (
    <div className="catalog-section">
      <h2>Вініли 🎶</h2>

      <button onClick={() => handleOpenModal()}>➕ Додати вініл</button>

      <select value={selectedId} onChange={handleSelectChange} className="select-item">
        <option value="">-- Оберіть вініл --</option>
        {vinylList.map((v) => (
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
          <p>Країна: {selectedVinyl.Country}</p>
          <p>Рік: {selectedVinyl.Published}</p>
          <p>Ціна: {selectedVinyl.Price} $</p>
          {selectedVinyl.Photo && (
            <img
              src={`http://localhost:5000/uploads/${selectedVinyl.Photo}`}
              alt={selectedVinyl.Title}
            />
          )}

          <div className="vinyl-buttons">
            <button onClick={() => handleOpenModal(selectedVinyl)}>✏️ Редагувати</button>
            <button onClick={() => handleDelete(selectedVinyl.ID)}>🗑️ Видалити</button>
          </div>
          
          {/* ФОРМА ДОДАВАННЯ ВІДГУКУ (НОВЕ) */}
          <form onSubmit={handleAddReview} className="review-form">
            <h4>Додати відгук:</h4>
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

          {/* СПИСОК ВІДГУКІВ (НОВЕ) */}
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
                  <button onClick={() => openReviewModal(r)}>
                    Редагувати / Видалити
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 🔹 Модалка вінілу */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{selectedId ? "Редагувати вініл" : "Додати вініл"}</h3>
            <input
              name="Title"
              placeholder="Назва"
              value={formData.Title}
              onChange={handleChange}
            />
            <input
              name="Artist"
              placeholder="Виконавець"
              value={formData.Artist}
              onChange={handleChange}
            />
            <input
              name="Genre"
              placeholder="Жанр"
              value={formData.Genre}
              onChange={handleChange}
            />
            <input
              name="Country"
              placeholder="Країна"
              value={formData.Country}
              onChange={handleChange}
            />
            <input
              name="Published"
              placeholder="Рік"
              value={formData.Published}
              onChange={handleChange}
            />
            <input
              name="Price"
              placeholder="Ціна"
              value={formData.Price}
              onChange={handleChange}
            />
            <input
              name="Photo"
              placeholder="Назва фото (файл у /uploads)"
              value={formData.Photo}
              onChange={handleChange}
            />

            <div className="modal-actions">
              <button onClick={handleSave}>💾 Зберегти</button>
              <button onClick={handleCloseModal}>❌ Закрити</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Модальне вікно відгуків (НОВЕ) */}
      {reviewModalOpen && (
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
              <button onClick={saveReviewModal}>Зберегти</button>
              <button onClick={deleteReviewModal}>Видалити</button>
              <button onClick={() => setReviewModalOpen(false)}>Відмінити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}