import React, { useState, useEffect } from "react";
import "./Cassettes.css";
import ReviewsContainer from "./components/ReviewsContainer";
import { useLocation } from "react-router-dom";

export default function Cassettes() {
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cassetteList, setCassetteList] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(""); 
  
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
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadCassettes();
  }, []);
  useEffect(() => {
    if (location.state?.openId && cassetteList.length > 0) {
      const targetCassette = cassetteList.find(c => c.ID === location.state.openId);
      
      if (targetCassette) {
        handleOpenDetailModal(targetCassette);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, cassetteList]);

  const loadCassettes = () => {
    fetch("http://localhost:5000/api/cassettes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCassetteList(data); 
        } else {
          console.error("Помилка формату даних", data);
          setCassetteList([]);
        }
      })
      .catch((err) => console.error("Помилка:", err));
  };

  const handleOpenEditModal = (cassette = null, e = null) => {
    if (e) e.stopPropagation();

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
      setEditId(cassette.ID);
    } else {
      setFormData({ Title: "", Artist: "", Genre: "", Country: "", Published: "", Price: "", Photo: "" });
      setEditId("");
    }
    setIsModalOpen(true);
    setSelectedFile(null);
  };

  const handleCloseEditModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const handleOpenDetailModal = (cassette) => {
    setSelectedCassette(cassette);
  };

  const handleCloseDetailModal = () => {
    setSelectedCassette(null);
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
      const method = editId ? "PUT" : "POST";
      const url = editId
        ? `http://localhost:5000/api/cassettes/${editId}`
        : "http://localhost:5000/api/cassettes";

      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'Photo') data.append(key, formData[key]);
      });
      if (selectedFile) {
        data.append('Photo', selectedFile);
      }

      const res = await fetch(url, {
        method,
        headers: { "Authorization": `Bearer ${token}` },
        body: data,
      });

      if (!res.ok) throw new Error("Помилка при збереженні");

      loadCassettes();
      handleCloseEditModal();
    } catch (err) {
      console.error(err);
      alert(`Помилка: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert("Помилка: Потрібно увійти як Адміністратор.");
      return;
    }
    if (!window.confirm("Видалити цю касету?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/cassettes/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Помилка при видаленні");
      
      setCassetteList((prev) => prev.filter((c) => c.ID !== id));
    } catch (err) {
      console.error(err);
      alert(`Помилка: ${err.message}`);
    }
  };

  const handleAddToCart = async (item) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert("Будь ласка, увійдіть в акаунт, щоб додавати товари в кошик.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: item.ID,
          productType: "cassette"
        })
      });

      if (res.ok) {
        alert(`Товар "${item.Title}" успішно додано до кошика!`);
      } else {
        const err = await res.json();
        alert(`Помилка: ${err.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("Не вдалося додати товар. Перевірте з'єднання.");
    }
  };

  return (
    <div className="catalog-page">
      <h1>Каталог Касет</h1>

      <div style={{textAlign: 'center', marginBottom: '30px'}}>
         <button className="add-vinyl-btn" onClick={(e) => handleOpenEditModal(null, e)}>
           + Додати нову касету
         </button>
      </div>

      <div className="catalog-list">
        {cassetteList.length > 0 ? (
          cassetteList.map((item) => (
            <div key={item.ID} className="catalog-item" onClick={() => handleOpenDetailModal(item)}>
              
              <div className="item-image-wrapper">
                <img 
                  src={item.Photo ? `http://localhost:5000/uploads/${item.Photo}` : 'https://via.placeholder.com/250'} 
                  alt={item.Title} 
                />
              </div>

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
                     {item.Genre ? `Жанр: ${item.Genre}` : ""}
                  </p>
                </div>

                <div className="item-footer">
                  <span className="item-price">
                    {Number(item.Price).toFixed(2)} ₴
                  </span>
                  
                  <div className="item-actions">
                    <button className="add-btn" onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}>
                      В кошик
                    </button>
                    <button className="edit-btn" onClick={(e) => handleOpenEditModal(item, e)}>✏️</button>
                    <button className="delete-mini-btn" onClick={(e) => handleDelete(item.ID, e)}>🗑️</button>
                  </div>
                </div>
              </div>

            </div>
          ))
        ) : (
          <p style={{textAlign: 'center'}}>Список порожній.</p>
        )}
      </div>

      {selectedCassette && (
        <div className="modal-overlay" onClick={handleCloseDetailModal}>
          <div 
            className="modal-content detail-modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ width: '1100px', maxWidth: '95%' }}
          >
            <button className="close-cross-btn" onClick={handleCloseDetailModal}>×</button>
            
            <div className="detail-layout">
              <div className="detail-image-block">
                <img 
                   src={selectedCassette.Photo ? `http://localhost:5000/uploads/${selectedCassette.Photo}` : 'https://via.placeholder.com/300'} 
                   alt={selectedCassette.Title} 
                />
              </div>
              
              <div className="detail-info-block">
                <h2>{selectedCassette.Title}</h2>
                <h3 style={{color: '#555', marginTop: '-10px'}}>{selectedCassette.Artist}</h3>
                
                <div className="detail-meta-grid">
                   <p><strong>Жанр:</strong> {selectedCassette.Genre}</p>
                   <p><strong>Країна:</strong> {selectedCassette.Country}</p>
                   <p><strong>Рік:</strong> {selectedCassette.Published}</p>
                </div>
                
                <p className="detail-price-large">{Number(selectedCassette.Price).toFixed(2)} ₴</p>
                
                <button 
                  className="add-btn large-add-btn" 
                  onClick={() => handleAddToCart(selectedCassette)}
                >
                  Додати в кошик
                </button>
              </div>
            </div>

            <div className="detail-reviews-section">
               <ReviewsContainer 
                  productId={selectedCassette.ID} 
                  productType="cassette"
               />
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editId ? "Редагувати касету" : "Створити нову касету"}</h3>
            
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

            {editId && formData.Photo && !selectedFile && (
               <div style={{ marginBottom: '15px' }}>
                 <p style={{fontSize: '12px', marginBottom: '5px'}}>Поточне фото:</p>
                 <img src={`http://localhost:5000/uploads/${formData.Photo}`} style={{width: '80px'}} alt="current"/>
               </div>
            )}

            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? "Збереження..." : "Зберегти"}
              </button>
              <button className="close-btn" onClick={handleCloseEditModal}>Скасувати</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}