import React, { useState, useEffect } from "react";
import "./Cassettes.css";

const alert = (msg) => console.log("ALERT:", msg);
const confirm = window.confirm;

const ENTITY_TYPE = "cassette";
const API_REVIEWS_URL = "http://localhost:5000/api/reviews";

export default function Cassettes() {

  const [cassetteList, setCassetteList] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedCassette, setSelectedCassette] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [reviews, setReviews] = useState([]);
  const [postError, setPostError] = useState("");
  const [userId, setUserId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

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
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [modalRating, setModalRating] = useState(5);
  const [modalComment, setModalComment] = useState("");
  const loadCassettes = () => {
    fetch("http://localhost:5000/api/cassettes")
      .then((res) => res.json())
      .then((data) => setCassetteList(data))
      .catch((err) => console.error("Помилка при завантаженні:", err));
  };

  useEffect(() => {
    loadCassettes();
  }, []);
  const loadReviews = (id) => {
    // Створюємо правильний URL з параметрами для бекенда
    const url = `http://localhost:5000/api/reviews?productType=cassette&productId=${id}`;

    fetch(url) // <-- Робимо запит на вже відфільтровані дані!
        .then((res) => res.json())
        .then((filteredData) => {
            // Фільтрувати більше не потрібно, сервер все зробив за нас!
            const sortedReviews = filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
            setReviews(sortedReviews);
        })
        .catch((err) => console.error("Помилка завантаження відгуків:", err));
};
  useEffect(() => {
    if (selectedId) loadReviews(selectedId);
  }, [selectedId, refreshKey]);

  const handleSelectChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const found = cassetteList.find((c) => c.ID.toString() === id);
    setSelectedCassette(found);
    setRefreshKey((prev) => prev + 1);
  };

  const handleOpenModal = (cassette = null) => {
    if (cassette) {
      setFormData({ ...cassette });
      setSelectedId(cassette.ID);
    } else {
      setFormData({
        Title: "",
        Artist: "",
        Genre: "",
        Country: "",
        Published: "",
        Price: "",
        Photo: "",
      });
      setSelectedId("");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      Title: "",
      Artist: "",
      Genre: "",
      Country: "",
      Published: "",
      Price: "",
      Photo: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const method = selectedId ? "PUT" : "POST";
      const url = selectedId
        ? `http://localhost:5000/api/cassettes/${selectedId}`
        : "http://localhost:5000/api/cassettes";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Помилка при збереженні касети");
      loadCassettes();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert("Не вдалося зберегти касету");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Видалити цю касету?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/cassettes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Помилка при видаленні");
      setCassetteList((prev) => prev.filter((c) => c.ID !== id));
      setSelectedCassette(null);
      setSelectedId("");
    } catch (err) {
      console.error(err);
      alert("Не вдалося видалити касету");
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    setPostError("");
    if (!selectedCassette) return setPostError("Оберіть касету!");

    try {
      const res = await fetch(API_REVIEWS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userId,
          rating,
          comment,
          productType: ENTITY_TYPE,
          productId: selectedCassette.ID,
        }),
      });
      const data = await res.json();
      if (res.status === 201) {
        setRefreshKey((prev) => prev + 1);
        setUserId("");
        setComment("");
        setRating(5);
      } else if (res.status === 400) {
        const validationMessage = data.details?.[0]?.message || "Помилка валідації на сервері.";
        setPostError(`Помилка 400: ${validationMessage}`);
      } else {
        throw new Error(data.message || `Помилка ${res.status}`);
      }
    } catch (err) {
      console.error(err);
      setPostError("Не вдалося додати відгук. Перевірте консоль.");
    }
  };

  const openReviewModal = (review) => {
    setCurrentReview(review);
    setModalRating(review.rating);
    setModalComment(review.comment);
    setReviewModalOpen(true);
  };

  const saveReviewModal = async () => {
    try {
      const res = await fetch(`${API_REVIEWS_URL}/${currentReview.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: modalRating, comment: modalComment }),
      });
      if (res.status !== 200) throw new Error("Помилка при оновленні відгуку");
      setRefreshKey((prev) => prev + 1);
      setReviewModalOpen(false);
      setCurrentReview(null);
    } catch (err) {
      console.error(err);
      alert("Не вдалося оновити відгук.");
    }
  };

  const deleteReviewModal = async () => {
    if (!confirm("Видалити відгук?")) return;
    try {
      const res = await fetch(`${API_REVIEWS_URL}/${currentReview.ID}`, { method: "DELETE" });
      if (res.status !== 204) throw new Error("Помилка при видаленні відгуку");
      setRefreshKey((prev) => prev + 1);
      setReviewModalOpen(false);
      setCurrentReview(null);
    } catch (err) {
      console.error(err);
      alert("Не вдалося видалити відгук.");
    }
  };

  return (
    <div className="catalog-section">
      <h2>Касети</h2>
      <button className="add-vinyl-btn" onClick={() => handleOpenModal()}>
        Додати касету
      </button>

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
          <p>Країна: {selectedCassette.Country}</p>
          <p>Рік: {selectedCassette.Published}</p>
          <p>Ціна: {selectedCassette.Price} $</p>
          {selectedCassette.Photo && (
            <img
              src={`http://localhost:5000/uploads/${selectedCassette.Photo}`}
              alt={selectedCassette.Title}
            />
          )}

          <div className="vinyl-buttons">
            <button onClick={() => handleOpenModal(selectedCassette)}>Редагувати</button>
            <button onClick={() => handleDelete(selectedCassette.ID)}>Видалити</button>
          </div>

          <form onSubmit={handleAddReview} className="review-form">
            <h4>Додати відгук:</h4>
            {postError && <p className="text-red-500">{postError}</p>}
            <input
              placeholder="Ім'я користувача"
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
              placeholder="Коментар (мін. 3 символи)"
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
                  <div className="review-buttons">
                    <button onClick={() => openReviewModal(r)}>Редагувати</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{selectedId ? "Редагувати касету" : "Додати касету"}</h3>
            <input name="Title" placeholder="Назва" value={formData.Title} onChange={handleChange} />
            <input name="Artist" placeholder="Виконавець" value={formData.Artist} onChange={handleChange} />
            <input name="Genre" placeholder="Жанр" value={formData.Genre} onChange={handleChange} />
            <input name="Country" placeholder="Країна" value={formData.Country} onChange={handleChange} />
            <input name="Published" placeholder="Рік" value={formData.Published} onChange={handleChange} />
            <input name="Price" placeholder="Ціна" value={formData.Price} onChange={handleChange} />
            <input name="Photo" placeholder="Фото" value={formData.Photo} onChange={handleChange} />
            <div className="modal-actions">
              <button onClick={handleSave}>Зберегти</button>
              <button onClick={handleCloseModal}>Закрити</button>
            </div>
          </div>
        </div>
      )}

      {reviewModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Редагування відгуку</h3>
            <input type="number" min="1" max="5" value={modalRating} onChange={(e) => setModalRating(+e.target.value)} />
            <textarea value={modalComment} onChange={(e) => setModalComment(e.target.value)} />
            <div className="modal-buttons">
              <button onClick={saveReviewModal}>Зберегти</button>
              <button className="delete-btn" onClick={deleteReviewModal}>Видалити</button>
              <button onClick={() => setReviewModalOpen(false)}>Відмінити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
