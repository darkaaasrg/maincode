import React, { useState, useEffect } from "react";
// ❌ ВИДАЛЕНО: import ReviewList, оскільки форма тепер тут
import "./Vinyls.css";
// Замінюємо window.alert та window.confirm на консольний вивід/вбудовані функції
const alert = (msg) => console.log('ALERT:', msg);
const confirm = window.confirm; 

export default function Vinyls() {
  const [vinylList, setVinylList] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedVinyl, setSelectedVinyl] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); 
  
  // 💡 СТАНИ ФОРМИ ВІДГУКУ (ЗАЛИШЕНО)
  const [postError, setPostError] = useState(""); 
  const [userId, setUserId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]); // Повертаємо стан відгуків сюди

  // 🔹 Для форми вінілу
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

  // 🔹 Модалка для редагування / видалення відгуків
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [modalRating, setModalRating] = useState(5);
  const [modalComment, setModalComment] = useState("");

  // --- Завантаження вінілів ---
  const loadVinyls = () => {
    fetch("http://localhost:5000/api/vinyls")
      .then((res) => res.json())
      .then((data) => setVinylList(data))
      .catch((err) => console.error("Помилка при завантаженні вінілів:", err));
  };
  
  // --- Завантаження відгуків (ПОВЕРНУТО) ---
  const loadReviews = (id) => {
    // 💡 ВИКОРИСТОВУЄМО УНІФІКОВАНИЙ МАРШРУТ GET /reviews ТА ФІЛЬТРУЄМО
    fetch("http://localhost:5000/api/reviews")
        .then((res) => res.json())
        .then((data) => {
            const productReviews = data
                .filter(r => 
                    String(r.productId || r.vinyl_id || r.cassette_id) === String(id)
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            setReviews(productReviews);
        })
        .catch((err) => console.error("Помилка завантаження відгуків:", err));
  };

  useEffect(() => {
    loadVinyls();
  }, []);

  useEffect(() => {
      // Перезавантажуємо відгуки при зміні selectedId або примусовому оновленні
      if (selectedId) {
          loadReviews(selectedId);
      }
  }, [selectedId, refreshKey]); // Додано refreshKey для оновлення

  // --- Вибір вінілу ---
  const handleSelectChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const found = vinylList.find((v) => v.ID.toString() === id);
    setSelectedVinyl(found);
    setRefreshKey(prev => prev + 1); // Викликає useEffect і loadReviews
  };

  // --- Модалка для вінілу (handleOpenModal, handleCloseModal, handleChange, handleSave, handleDelete) ---
  // ... (КОД ЗАЛИШАЄТЬСЯ НЕЗМІННИМ) ...

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
        ? `http://localhost:5000/api/vinyls/${selectedId}`
        : "http://localhost:5000/api/vinyls";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Помилка при збереженні вінілу");

      loadVinyls(); 
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert("Не вдалося зберегти вініл");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Видалити цей вініл?")) return; 
    try {
      const res = await fetch(`http://localhost:5000/api/vinyls/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Помилка при видаленні");
      setVinylList((prev) => prev.filter((v) => v.ID !== id));
      setSelectedVinyl(null);
      setSelectedId("");
    } catch (err) {
      console.error(err);
      alert("Не вдалося видалити вініл");
    }
  };
  
  // ----------------------------------------------------------------------------------
  // 💡 ПОВЕРНЕНО: handleAddReview (Для роботи вбудованої форми)
  // ----------------------------------------------------------------------------------
  const handleAddReview = async (e) => {
    e.preventDefault();
    setPostError("");

    if (!selectedVinyl) return setPostError("Оберіть вініл!");
    
    // ❌ КРИТИЧНЕ ВИПРАВЛЕННЯ: Ми дозволяємо пустим рядкам піти на сервер для 400!

    try {
      const res = await fetch(
        `http://localhost:5000/api/reviews`, 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            user: userId, 
            rating: rating, 
            comment: comment,
            productType: "vinyl",
            productId: selectedVinyl.ID 
          }),
        }
      );
      
      const responseData = await res.json();
      
      if (res.status === 201) {
        // Успіх
        setRefreshKey(prev => prev + 1); // Оновлюємо список через useEffect
        setUserId("");
        setComment("");
        setRating(5);
      } else if (res.status === 400) {
        // 400 Bad Request від сервера
        const validationMessage = responseData.details?.[0]?.message || "Помилка валідації на сервері.";
        setPostError(`Помилка 400: ${validationMessage}`);
      } else {
         throw new Error(responseData.message || `Помилка ${res.status} при додаванні відгуку.`);
      }
    } catch (err) {
      console.error(err);
      setPostError("Не вдалося додати відгук. Перевірте консоль.");
    }
  };


  // --- Модалка для редагування / видалення відгуків ---
  const openReviewModal = (review) => {
    setCurrentReview(review);
    setModalRating(review.rating);
    setModalComment(review.comment);
    setReviewModalOpen(true);
  };

  const saveReviewModal = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/reviews/${currentReview.ID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating: modalRating, comment: modalComment }), 
        }
      );

      if (res.status !== 200) throw new Error("Помилка при оновленні відгуку");
      setRefreshKey(prev => prev + 1);
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
      const res = await fetch(
        `http://localhost:5000/api/reviews/${currentReview.ID}`,
        { method: "DELETE" }
      );
      
      if (res.status !== 204) throw new Error("Помилка при видаленні відгуку");
      setRefreshKey(prev => prev + 1);
      setReviewModalOpen(false);
      setCurrentReview(null);
    } catch (err) {
      console.error(err);
      alert("Не вдалося видалити відгук.");
    }
  };

  return (
    <div className="catalog-section">
      <h2>Вініли</h2>

      <button className="add-vinyl-btn" onClick={() => handleOpenModal()}>Додати вініл</button>

      <select
        value={selectedId}
        onChange={handleSelectChange}
        className="select-item"
      >
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
            <button onClick={() => handleOpenModal(selectedVinyl)}>Редагувати</button>
            <button
              className="delete-btn"
              onClick={() => handleDelete(selectedVinyl.ID)}
            >
              Видалити
            </button>
          </div>
          
          {/* Додати відгук (ОДНА, РОБОЧА ФОРМА) */}
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

          {/* Відображення відгуків (ТЕПЕР БЕЗ ОБГОРТКИ, ПРОСТО СПИСОК) */}
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
                        </div>
                    </div>
                ))
            )}
          </div>
          
        </div>
      )}

      {/* Модалка вініл */}
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
              <button className="save-btn" onClick={handleSave}>Зберегти</button>
              <button className="close-btn" onClick={handleCloseModal}>Закрити</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка відгуків */}
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
