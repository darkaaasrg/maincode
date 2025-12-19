import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
const API_URL = "http://localhost:5000"; 

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]); 
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    email: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${API_URL}/api/profile`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) throw new Error("Неавторизовано");
      return res.json();
    })
    .then(data => {
      setUser(data);
      setFormData({ username: data.username || "", email: data.email || "" });
    })
    .catch(() => navigate("/login"));

    fetchCart(token);

  }, [navigate]);

  const fetchCart = (token) => {
    fetch(`${API_URL}/api/cart`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setCartItems(data);
    })
    .catch(err => console.error("Помилка кошика:", err));
  };

  const removeFromCart = async (cartId) => {
    const token = localStorage.getItem("authToken");
    try {
        await fetch(`${API_URL}/api/cart/${cartId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
       
        setCartItems(prev => prev.filter(item => item.cart_id !== cartId));
    } catch (err) {
        alert("Помилка при видаленні товару");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      if (selectedFile) {
        const photoData = new FormData();
        photoData.append("profilePhoto", selectedFile); 
        await fetch(`${API_URL}/api/profile/photo`, {
          method: "PUT",
          headers: { "Authorization": `Bearer ${token}` },
          body: photoData 
        });
      }

      if (formData.username !== user.username || formData.email !== user.email) {
          await fetch(`${API_URL}/api/profile`, {
            method: "PUT",
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
          });
      }
      window.location.reload(); 
    } catch (err) {
      alert(`Не вдалося оновити профіль: ${err.message}`);
    }
  };

  if (!user) return <div className="profile-page"><p style={{textAlign:"center", marginTop:"50px"}}>Завантаження...</p></div>;

  let avatarSrc = preview || (user.profile_photo_url ? (user.profile_photo_url.startsWith("http") ? user.profile_photo_url : `${API_URL}/uploads/${user.profile_photo_url}`) : DEFAULT_AVATAR);

  const totalPrice = cartItems.reduce((sum, item) => sum + (Number(item.Price) * item.quantity), 0);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Мій Кабінет</h1>
      </div>

      <div className="profile-container">
        
        {/* ЛІВА КОЛОНКА: Профіль */}
        <div className="profile-card">
          <div className="profile-avatar-container">
            <img src={avatarSrc} alt="Avatar" className="profile-avatar" onError={(e) => { e.target.src = DEFAULT_AVATAR; }} />
            {isEditing && <input type="file" onChange={handleFileChange} style={{marginTop: 10}} />}
          </div>

          <h2>{isEditing ? <input name="username" value={formData.username} onChange={handleChange} className="profile-input"/> : user.username}</h2>
          <p>{isEditing ? <input name="email" value={formData.email} onChange={handleChange} className="profile-input"/> : user.email}</p>

          <div className="profile-actions">
            {isEditing ? (
              <button className="btn-black" onClick={handleSaveProfile}>Зберегти</button>
            ) : (
              <button className="btn-black" onClick={handleEditToggle}>Редагувати</button>
            )}
            <button className="btn-outline btn-logout" onClick={handleLogout}>Вийти</button>
          </div>
        </div>

        <div className="orders-section">
          <h2>Мій Кошик ({cartItems.length})</h2>
          
          {cartItems.length === 0 ? (
            <div className="empty-orders">
              <p>Кошик порожній.</p>
              <button className="btn-outline" onClick={() => navigate("/")}>До каталогу</button>
            </div>
          ) : (
            <div className="cart-list">
                {cartItems.map(item => (
                    <div key={item.cart_id} className="cart-item" style={{display:'flex', gap:'15px', marginBottom:'15px', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
                        <img 
                            src={item.Photo ? `${API_URL}/uploads/${item.Photo}` : 'https://via.placeholder.com/80'} 
                            alt={item.Title} 
                            style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius:'8px'}}
                        />
                        <div style={{flex: 1}}>
                            <h4 style={{margin: '0 0 5px 0'}}>{item.Title}</h4>
                            <p style={{margin: '0', color: '#666', fontSize:'14px'}}>{item.Artist}</p>
                            <p style={{margin: '5px 0 0 0', fontWeight:'bold'}}>
                                {item.quantity} x {Number(item.Price).toFixed(2)} ₴
                            </p>
                        </div>
                        <button 
                            onClick={() => removeFromCart(item.cart_id)}
                            style={{background:'none', border:'none', cursor:'pointer', color:'red', fontSize:'20px'}}
                        >
                            ×
                        </button>
                    </div>
                ))}
                
                <div style={{marginTop: '20px', borderTop: '2px solid #000', paddingTop: '15px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h3>Всього:</h3>
                    <h3 style={{fontSize: '24px'}}>{totalPrice.toFixed(2)} ₴</h3>
                </div>
                <button className="btn-black" style={{width: '100%', marginTop: '15px'}}>Оформити замовлення</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}