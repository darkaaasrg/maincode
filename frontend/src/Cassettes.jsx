import React, { useState, useEffect } from "react";
import "./Cassettes.css"; 
import { fetchWithResilience } from "./lib/http";
import { getOrReuseKey } from "./lib/idempotency";

const alert = (msg) => console.log('ALERT:', msg);
const confirm = window.confirm; 

const ENTITY_TYPE = "cassette";
const API_URL = "http://localhost:5000/api/cassettes";
const API_REVIEWS_URL = "http://localhost:5000/api/reviews";
const API_UPLOADS_URL = "http://localhost:5000/uploads";

const getToken = () => localStorage.getItem('authToken');

export default function Cassettes() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failureCount, setFailureCount] = useState(0);
  const [isDegraded, setIsDegraded] = useState(false);
  const [cassetteList, setCassetteList] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedCassette, setSelectedCassette] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalError, setModalError] = useState("");

  const [postError, setPostError] = useState(""); 
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);

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

  // === ЗМІНА 1: Додаємо стан для обраного файлу ===
  const [selectedFile, setSelectedFile] = useState(null);

  const loadCassettes = () => { 
    fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setCassetteList(data); 
      } else {
        console.error("Отримано невірний формат даних для касет:", data);
        setCassetteList([]); 
      }
    })
    .catch((err) => {
      console.error("Помилка при завантаженні касет:", err);
      setCassetteList([]); 
    });
  };

  const loadReviews = (id) => {
    // ... (без змін) ...
    const url = `${API_REVIEWS_URL}?productType=${ENTITY_TYPE}&productId=${id}`;
    fetch(url)
    .then((res) => res.json())
    .then((filteredData) => {
      const sortedReviews = filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setReviews(sortedReviews);
    })
    .catch((err) => console.error("Помилка завантаження відгуків:", err));
  };

  useEffect(() => {
    loadCassettes(); 
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadReviews(selectedId);
    }
  }, [selectedId, refreshKey]); 

  useEffect(() => {
    // ... (без змін) ...
    if (failureCount >= 3) {
      setIsDegraded(true);
      const timer = setTimeout(() => {
        setIsDegraded(false);
        setFailureCount(0);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [failureCount]);

  const handleSelectChange = (e) => {
    // ... (без змін) ...
    const id = e.target.value;
    setSelectedId(id);
    const found = cassetteList.find((c) => c.ID.toString() === id);
    setSelectedCassette(found);
    setRefreshKey(prev => prev + 1);
  };

  const handleOpenModal = (cassette = null) => { 
    if (cassette) { 
      setFormData({
        Title: cassette.Title,
        Artist: cassette.Artist,
        Genre: cassette.Genre,
        Country: cassette.Country,
        Published: cassette.Published,
        Price: cassette.Price,
        Photo: cassette.Photo,
      });
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
    // === ЗМІНА 2: Скидаємо файл при відкритті ===
    setSelectedFile(null); 
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
    // === ЗМІНА 3: Скидаємо файл при закритті ===
    setSelectedFile(null); 
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ==========================================================
  // CRUD (АДМІН)
  // ==========================================================
  const handleSave = async () => {
    const token = getToken();
    if (!token) {
        alert("Помилка: Щоб додавати або редагувати товари, потрібно увійти як Адміністратор.");
        return; 
    }

    // === ЗМІНА 4: Блокуємо кнопку ===
    setIsSubmitting(true); 

    try {
      const method = selectedId ? "PUT" : "POST";
      const url = selectedId
        ? `${API_URL}/${selectedId}`
        : API_URL;

      // === ЗМІНА 5: Створюємо FormData ===
      const data = new FormData();
      data.append('Title', formData.Title);
      data.append('Artist', formData.Artist);
      data.append('Genre', formData.Genre);
      data.append('Country', formData.Country);
      data.append('Published', formData.Published);
      data.append('Price', formData.Price);

      // Додаємо файл, ТІЛЬКИ ЯКЩО він був обраний
      if (selectedFile) {
        data.append('Photo', selectedFile);
      }
      
      const res = await fetch(url, {
        method,
        headers: { 
          // ❗️ "Content-Type" ВИДАЛЕНО (браузер встановить сам)
          "Authorization": `Bearer ${token}` 
        },
        body: data, // <-- Передаємо FormData
      });

      if (!res.ok) {
        if (res.status === 403) {
            throw new Error("Недостатньо прав. Додавання/редагування доступне лише Адміністратору.");
        }
        throw new Error("Помилка при збереженні касети");
      }

      loadCassettes(); 
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert(`Не вдалося зберегти касету. ${err.message}`);
    } finally {
      // === ЗМІНА 6: Розблокуємо кнопку у будь-якому випадку ===
      setIsSubmitting(false); 
    }
  };

  const handleDelete = async (id) => {
    // ... (без змін) ...
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert("Помилка: Щоб видалити товар, потрібно увійти як Адміністратор.");
        return; 
    }

    if (!confirm("Видалити цю касету?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 403) {
            throw new Error("Недостатньо прав. Видалення доступне лише Адміністратору.");
        }
        throw new Error("Помилка при видаленні");
      }
        
      setCassetteList((prev) => prev.filter((c) => c.ID !== id));
      setSelectedCassette(null);
      setSelectedId("");
    } catch (err) {
      console.error(err);
      alert(`Не вдалося видалити касету. ${err.message}`);
    }
  };

  // ==========================================================
  // ВІДГУКИ (Логіка без змін)
  // ==========================================================
  const handleAddReview = async (e) => {
    // ... (без змін) ...
    e.preventDefault();
    setPostError("");

    const token = getToken();
    if (!token) {
        setPostError("Помилка: Щоб залишити відгук, потрібно увійти в систему.");
        return;
    }

    setIsSubmitting(true);
    setPostError("");
    
    if (!comment || comment.length < 3) {
        setPostError("Коментар не може бути порожнім або коротким.");
        setIsSubmitting(false);
        return;
    }

    const payload = {
        rating,
        comment,
        productType: ENTITY_TYPE,
        productId: selectedCassette.ID,
    };

    try {
        const idemKey = getOrReuseKey(payload);
        
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, 
        };

        const res = await fetchWithResilience(API_REVIEWS_URL, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: headers, 
            idempotencyKey: idemKey,
            retry: { retries: 3, baseDelayMs: 300, timeoutMs: 3500 },
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Невідома помилка сервера");
        }

        setFailureCount(0);
        setRefreshKey(k => k + 1);
        setComment("");
    } catch (error) {
        console.error("Final error after retries:", error);
        setPostError(`Помилка: ${error.message}`);
        setFailureCount(c => c + 1); 
    }
    finally {
      setIsSubmitting(false);
    }
  };
    
  const openReviewModal = (review) => {
    // ... (без змін) ...
    setCurrentReview(review);
    setModalRating(review.rating);
    setModalComment(review.comment);
    setReviewModalOpen(true);
    setModalError("");
  };

  const saveReviewModal = async () => {
    // ... (без змін) ...
    const token = getToken();
    if (!token) {
        setModalError("Помилка: Увійдіть, щоб редагувати відгук.");
        return;
    }

    if (modalComment.trim().length < 3) {
        setModalError("Коментар повинен містити щонайменше 3 символи."); 
        return;
    }

    try {
        const res = await fetch(
            `${API_REVIEWS_URL}/${currentReview.ID}`,
            {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ rating: modalRating, comment: modalComment }),
            }
        );
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Помилка при оновленні відгуку");
        }
        
        alert("Відгук успішно оновлено!");

        setRefreshKey(prev => prev + 1);
        setReviewModalOpen(false);
        setCurrentReview(null);
    } catch (err) {
        console.error(err);
        alert(`Не вдалося оновити відгук. ${err.message}`);
    }
  };

  const deleteReviewModal = async () => {
    // ... (без змін) ...
    const token = getToken();
    if (!token) {
        alert("Помилка: Увійдіть, щоб видалити відгук.");
        return;
    }

    if (!confirm("Видалити відгук?")) return;
    
    try {
        const res = await fetch(
            `${API_REVIEWS_URL}/${currentReview.ID}`,
            { 
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            }
        );
        
        if (res.status !== 204) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Помилка при видаленні відгуку");
        }
        
        alert("Відгук успішно видалено!"); 

        setRefreshKey(prev => prev + 1);
        setReviewModalOpen(false);
        setCurrentReview(null);
    } catch (err) {
        console.error(err);
        alert(`Не вдалося видалити відгук. ${err.message}`);
    }
  };

  return (
    <div className="catalog-section">
      <h2>Касети</h2>
      {isDegraded && (
        <div style={{ color: "white", backgroundColor: "red", padding: "10px", textAlign: "center", margin: "1rem 0" }}>
          Увага! Сервіс перевантажено. Спробуйте пізніше.
        </div>
      )}

      <button className="add-vinyl-btn" onClick={() => handleOpenModal()}>Додати касету</button>

      <select
        value={selectedId}
        onChange={handleSelectChange}
        className="select-item"
      >
        <option value="">-- Оберіть касету --</option>
        {cassetteList.map((c) => (
          <option key={c.ID} value={c.ID}>
            {c.Title} — {c.Artist}
          </option>
        ))}
      </select>

      {selectedCassette && (
        <div className="product-card">
          {/* ... (блок з інформацією про касету без змін) ... */}
          <h3>{selectedCassette.Title}</h3>
          <p>Виконавець: {selectedCassette.Artist}</p>
          <p>Жанр: {selectedCassette.Genre}</p>
          <p>Країна: {selectedCassette.Country}</p>
          <p>Рік: {selectedCassette.Published}</p>
          <p>Ціна: {selectedCassette.Price} $</p>
          {selectedCassette.Photo && (
            <img
              src={`${API_UPLOADS_URL}/${selectedCassette.Photo}`}
              alt={selectedCassette.Title}
            />
          )}

          <div className="vinyl-buttons">
            <button onClick={() => handleOpenModal(selectedCassette)}>Редагувати</button>
            <button
              className="delete-btn"
              onClick={() => handleDelete(selectedCassette.ID)} 
            >
              Видалити
            </button>
          </div>
          
          {/* ... (форма відгуків та список відгуків без змін) ... */}
          <form onSubmit={handleAddReview} className="review-form">
          {/* ... */}
          </form>
          <div className="reviews">
          {/* ... */}
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

            {/* === ЗМІНА 7: Замінюємо текстове поле "Photo" на input type="file" === */}
            <input
              type="file"
              name="Photo"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            {/* Опціонально: показуємо поточне фото під час редагування */}
            {selectedId && formData.Photo && !selectedFile && (
              <div style={{ marginTop: '10px' }}>
                <p>Поточне фото:</p>
                <img
                  src={`${API_UPLOADS_URL}/${formData.Photo}`}
                  alt="Поточне"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
              </div>
            )}
            
            <div className="modal-actions">
              {/* === ЗМІНА 8: Блокуємо кнопки під час відправки === */}
              <button 
                className="save-btn" 
                onClick={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Збереження..." : "Зберегти"}
              </button>
              <button 
                className="close-btn" 
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewModalOpen && (
        // ... (модалка відгуків без змін) ...
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
              <button className="first-child" onClick={saveReviewModal}>Зберегти</button>
              <button className= "delete-btn"onClick={deleteReviewModal}>Видалити</button>
              <button className = "last-child"onClick={() => setReviewModalOpen(false)}>Відмінити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}