import React, { useState, useEffect } from "react";
import "./Vinyls.css";
import ReviewsContainer from "./components/ReviewsContainer";

export default function Vinyls() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vinylList, setVinylList] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState("");
  
  const [selectedVinyl, setSelectedVinyl] = useState(null);

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

  const handleOpenEditModal = (vinyl = null, e = null) => {
    if (e) e.stopPropagation();

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
      setEditId(vinyl.ID);
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

  const handleOpenDetailModal = (vinyl) => {
    setSelectedVinyl(vinyl);
  };

  const handleCloseDetailModal = () => {
    setSelectedVinyl(null);
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
        ? `http://localhost:5000/api/vinyls/${editId}`
        : "http://localhost:5000/api/vinyls";

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

      loadVinyls();
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

      <div style={{textAlign: 'center', marginBottom: '30px'}}>
         <button className="add-vinyl-btn" onClick={(e) => handleOpenEditModal(null, e)}>
           + Додати новий вініл
         </button>
      </div>

      <div className="catalog-list">
        {vinylList.length > 0 ? (
          vinylList.map((item) => (
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

      {selectedVinyl && (
        <div className="modal-overlay" onClick={handleCloseDetailModal}>
          <div className="modal-content detail-modal-content" style={{ width: '1000px', maxWidth: '95%' }} onClick={(e) => e.stopPropagation()}>
            <button className="close-cross-btn" onClick={handleCloseDetailModal}>×</button>
            
            <div className="detail-layout">
              <div className="detail-image-block">
                <img 
                   src={selectedVinyl.Photo ? `http://localhost:5000/uploads/${selectedVinyl.Photo}` : 'https://via.placeholder.com/300'} 
                   alt={selectedVinyl.Title}
                />
              </div>
              
              <div className="detail-info-block">
                <h2>{selectedVinyl.Title}</h2>
                <h3 style={{color: '#555', marginTop: '-10px'}}>{selectedVinyl.Artist}</h3>
                
                <div className="detail-meta-grid">
                   <p><strong>Жанр:</strong> {selectedVinyl.Genre}</p>
                   <p><strong>Країна:</strong> {selectedVinyl.Country}</p>
                   <p><strong>Рік:</strong> {selectedVinyl.Published}</p>
                </div>
                
                <p className="detail-price-large">{Number(selectedVinyl.Price).toFixed(2)} ₴</p>
                
                <button 
                  className="add-btn large-add-btn" 
                  onClick={() => handleAddToCart(selectedVinyl)}
                >
                  Додати в кошик
                </button>
              </div>
            </div>

            <div className="detail-reviews-section">
               <ReviewsContainer 
                  productId={selectedVinyl.ID} 
                  productType="vinyl" 
               />
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editId ? "Редагувати вініл" : "Створити новий вініл"}</h3>
            
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