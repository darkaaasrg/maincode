import React, { useState, useEffect } from "react";
import "./Cassettes.css"; 

export default function Cassettes() {
  const [cassetteList, setCassetteList] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedCassette, setSelectedCassette] = useState(null);
  
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

  const [userId, setUserId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false); // Змінена назва, щоб не конфліктувати з isModalOpen
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
    fetch(`http://localhost:5000/api/cassettes/${id}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error(err));
  };

  // 🔹 Вибір касети
  const handleSelectChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const found = cassetteList.find((c) => c.ID.toString() === id);
    setSelectedCassette(found);
    
    // Завантаження відгуків
    if (found) {
        loadReviews(id);
    } else {
        setReviews([]);
    }
  };

  // 🔹 Відкриття модалки для створення / редагування (як у Vinyls.jsx)
  const handleOpenModal = (cassette = null) => {
    if (cassette) {
      setFormData(cassette); // Використовуємо об'єкт касети
      setSelectedId(cassette.ID);
    } else {
      setFormData({
        Title: "", Artist: "", Genre: "", Country: "",
        Published: "", Price: "", Photo: "",
      });
      setSelectedId("");
    }
    setIsModalOpen(true);
  };

  // 🔹 Закриття модалки
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      Title: "", Artist: "", Genre: "", Country: "",
      Published: "", Price: "", Photo: "",
    });
    // Не скидаємо selectedId, щоб картка товару не зникала одразу після закриття
  };

  // 🔹 Обробка введення (як у Vinyls.jsx)
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

      const updated = await res.json();

      if (selectedId) {
        setCassetteList((prev) =>
          prev.map((c) => (c.ID === updated.ID ? updated : c))
        );
        setSelectedCassette(updated); 
      } else {
        setCassetteList((prev) => [...prev, updated]);
      }

      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert("Не вдалося зберегти касету");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Видалити цю касету?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/cassettes/${id}`, {
        method: "DELETE",
      });
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
      // Оскільки API повертає оновлений список відгуків
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

      // Оновлення списку відгуків локально після успішного PUT
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
      <h2>Касети</h2>

      <button className="add-vinyl-btn" onClick={() => handleOpenModal()}>Додати касету</button>

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

          <div className="cassette-buttons">
            <button onClick={() => handleOpenModal(selectedCassette)}>Редагувати</button>
            <button className="delete-btn" onClick={() => handleDelete(selectedCassette.ID)}>Видалити</button>
          </div>
          
          <form onSubmit={handleAddReview} className="review-form">
            <h4>Додати відгук:</h4>
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
              placeholder="Коментар"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit">Додати відгук</button>
          </form>

          {/* СПИСОК ВІДГУКІВ */}
          <div className="reviews">
            <h4>Відгуки:</h4>
            {reviews.length === 0 ? (
              <p>Поки що немає відгуків.</p>
            ) : (
              reviews.map((r) => (
                <div key={r.ID} className="review-item">
                  <b className="v">{r.userId}</b>: {r.rating}★ — {r.comment}
                  <br />
                  <small className="v" >{new Date(r.date).toLocaleString()}</small>
                  <div className="review-buttons">
                    <button onClick={() => openReviewModal(r)}>Редагувати</button>
                    <button
                      className="delete-btn"
                      onClick={() => openReviewModal(r)}
                    >
                      Видалити
                    </button>
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
              <button onClick={handleSave}>Зберегти</button>
              <button onClick={handleCloseModal}>Закрити</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Модальне вікно відгуків (як у першому зразку Cassettes.jsx) */}
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
              <button className="delete-btn" onClick={deleteReviewModal}>Видалити</button>
              <button onClick={() => setReviewModalOpen(false)}>Відмінити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}