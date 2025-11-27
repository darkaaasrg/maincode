import React, { useState, useEffect } from "react";
import "./Vinyls.css";

export default function Vinyls() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vinylList, setVinylList] = useState([]);
  
  // Стан для модального вікна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(""); // Якщо порожнє - це створення, якщо є ID - редагування
  
  // Стан форми
  const [formData, setFormData] = useState({
    Title: "",
    Artist: "",
    Genre: "",
    Country: "",
    Published: "",
    Price: "",
    Photo: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // --- ЛОГІКА ВІДГУКІВ (ЗАКОМЕНТОВАНА) ---
  /*
  const [reviews, setReviews] = useState([]);
  const loadReviews = (productId) => {
      // Тут буде запит до бекенду: GET /api/reviews?productId=...
      console.log("Завантаження відгуків для:", productId);
  };
  */
  // ---------------------------------------

  useEffect(() => {
    loadVinyls();
  }, []);

  const loadVinyls = () => {
    fetch("http://localhost:5000/api/vinyls")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVinylList(data); 
        } else {
          console.error("Помилка формату даних", data);
          setVinylList([]);
        }
      })
      .catch((err) => console.error("Помилка:", err));
  };

  // Відкриття модалки (для створення або редагування)
  const handleOpenModal = (vinyl = null) => {
    if (vinyl) {
      // РЕЖИМ РЕДАГУВАННЯ
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
      // РЕЖИМ СТВОРЕННЯ (очищаємо форму)
      setFormData({
        Title: "", Artist: "", Genre: "", Country: "", Published: "", Price: "", Photo: "",
      });
      setSelectedId("");
    }
    setIsModalOpen(true);
    setSelectedFile(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert("Помилка: Потрібно увійти як Адміністратор.");
      return;
    }

    setIsSubmitting(true);
    try {
      const method = selectedId ? "PUT" : "POST";
      const url = selectedId
        ? `http://localhost:5000/api/vinyls/${selectedId}`
        : "http://localhost:5000/api/vinyls";

      const data = new FormData();
      // Додаємо поля у FormData
      Object.keys(formData).forEach(key => {
        if (key !== 'Photo') data.append(key, formData[key]);
      });
      // Додаємо файл, якщо він обраний
      if (selectedFile) {
        data.append('Photo', selectedFile);
      }

      const res = await fetch(url, {
        method,
        headers: { "Authorization": `Bearer ${token}` },
        body: data,
      });

      if (!res.ok) throw new Error("Помилка при збереженні");

      loadVinyls(); // Оновлюємо список
      handleCloseModal(); // Закриваємо вікно
    } catch (err) {
      console.error(err);
      alert(`Помилка: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert("Помилка: Потрібно увійти як Адміністратор.");
      return;
    }
    if (!window.confirm("Видалити цей вініл?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/vinyls/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Помилка при видаленні");
      
      setVinylList((prev) => prev.filter((v) => v.ID !== id));
    } catch (err) {
      console.error(err);
      alert(`Помилка: ${err.message}`);
    }
  };

  const handleAddToCart = (item) => {
    alert(`Товар "${item.Title}" додано до кошика!`);
  };

  return (
    <div className="catalog-page">
      <h1>Каталог Вінілів</h1>

      {/* 🟢 ЛОГІКА СТВОРЕННЯ: Кнопка додавання зверху */}
      <div style={{textAlign: 'center', marginBottom: '30px'}}>
         <button className="add-vinyl-btn" onClick={() => handleOpenModal(null)}>
           + Додати новий вініл
         </button>
      </div>

      <div className="catalog-list">
        {vinylList.length > 0 ? (
          vinylList.map((item) => (
            <div key={item.ID} className="catalog-item">
              
              {/* ЗЛІВА: Картинка */}
              <div className="item-image-wrapper">
                <img 
                  src={item.Photo ? `http://localhost:5000/uploads/${item.Photo}` : 'https://via.placeholder.com/250'} 
                  alt={item.Title} 
                />
              </div>

              {/* СПРАВА: Інформація */}
              <div className="item-details">
                <div>
                  <div className="item-header">
                    <h2 className="item-title">{item.Title} — {item.Artist}</h2>
                    <div className="item-meta">
                      {item.Published && <span>Рік: {item.Published}</span>}
                      {item.Country && <span>Країна: {item.Country}</span>}
                      {item.Genre && <span>Жанр: {item.Genre}</span>}
                    </div>
                  </div>
                  <p className="item-description">
                     {item.Genre ? `Жанр: ${item.Genre}` : "Опис відсутній"}
                  </p>

                  {/* 🟢 ЗАКОМЕНТОВАНА ЛОГІКА ВІДГУКІВ */}
                  {/* <div className="item-reviews-section">
                    <h4>Відгуки:</h4>
                    <p style={{fontSize: '12px', color: '#888'}}>Поки що відгуків немає.</p>
                    <button className="write-review-btn">Написати відгук</button>
                  </div> 
                  */}

                </div>

                {/* НИЗ: Ціна та Кнопки */}
                <div className="item-footer">
                  <span className="item-price">
                    {Number(item.Price).toFixed(2)} ₴
                  </span>
                  
                  <div className="item-actions">
                    <button className="add-btn" onClick={() => handleAddToCart(item)}>
                      В кошик
                    </button>
                    
                    {/* Кнопка РЕДАГУВАННЯ відкриває те саме модальне вікно, але з даними */}
                    <button className="edit-btn" onClick={() => handleOpenModal(item)}>✏️</button>
                    <button className="delete-mini-btn" onClick={() => handleDelete(item.ID)}>🗑️</button>
                  </div>
                </div>
              </div>

            </div>
          ))
        ) : (
          <p style={{textAlign: 'center'}}>Список порожній.</p>
        )}
      </div>

      {/* 🟢 МОДАЛЬНЕ ВІКНО (POPUP) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedId ? "Редагувати вініл" : "Створити новий вініл"}</h3>
            
            <div className="form-group">
              <input name="Title" placeholder="Назва" value={formData.Title} onChange={handleChange} />
              <input name="Artist" placeholder="Виконавець" value={formData.Artist} onChange={handleChange} />
            </div>
            
            <div className="form-group">
              <input name="Genre" placeholder="Жанр" value={formData.Genre} onChange={handleChange} />
              <input name="Country" placeholder="Країна" value={formData.Country} onChange={handleChange} />
            </div>

            <div className="form-group">
              <input name="Published" placeholder="Рік" value={formData.Published} onChange={handleChange} />
              <input name="Price" placeholder="Ціна" value={formData.Price} onChange={handleChange} />
            </div>
            
            <div style={{margin: '15px 0'}}>
              <label>Фото обкладинки:</label>
              <input type="file" name="Photo" onChange={(e) => setSelectedFile(e.target.files[0])} />
            </div>

            {/* Попередній перегляд старого фото при редагуванні */}
            {selectedId && formData.Photo && !selectedFile && (
               <div style={{ marginBottom: '15px' }}>
                 <p style={{fontSize: '12px', marginBottom: '5px'}}>Поточне фото:</p>
                 <img src={`http://localhost:5000/uploads/${formData.Photo}`} style={{width: '80px'}} alt="current"/>
               </div>
            )}

            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? "Збереження..." : "Зберегти"}
              </button>
              <button className="close-btn" onClick={handleCloseModal}>Скасувати</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}