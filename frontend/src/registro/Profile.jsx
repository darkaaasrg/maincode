import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
const API_URL = "http://localhost:5000"; // Адреса вашого бекенду

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Стан для полів форми
  const [formData, setFormData] = useState({
    username: "",
    email: ""
  });

  // --- 1. ЗАВАНТАЖЕННЯ ДАНИХ (GET) ---
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${API_URL}/api/profile`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}` 
      }
    })
    .then(res => {
      if (res.status === 401 || res.status === 403) {
        throw new Error("Неавторизовано");
      }
      if (!res.ok) throw new Error("Помилка завантаження");
      return res.json();
    })
    .then(data => {
      console.log("Отримані дані профілю:", data); // Для налагодження
      setUser(data);
      setFormData({
        username: data.username || "",
        email: data.email || ""
      });
      // Оновлюємо localStorage про всяк випадок
      localStorage.setItem("user", JSON.stringify(data));
    })
    .catch(err => {
      console.error(err);
      // Якщо токен недійсний - виходимо
      if (err.message === "Неавторизовано") {
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        navigate("/login");
      }
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const handleEditToggle = () => {
    if (isEditing && user) {
      // Скидаємо зміни при скасуванні
      setFormData({ username: user.username, email: user.email });
      setPreview(null);
      setSelectedFile(null);
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // --- 2. ЗБЕРЕЖЕННЯ (PUT) ---
  const handleSaveProfile = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      // А) Якщо вибрано нове фото -> завантажуємо його
      if (selectedFile) {
        const photoData = new FormData();
        // ВАЖЛИВО: Ім'я поля має співпадати з тим, що в upload.single('profilePhoto') на бекенді
        photoData.append("profilePhoto", selectedFile); 

        const photoRes = await fetch(`${API_URL}/api/profile/photo`, {
          method: "PUT",
          headers: { "Authorization": `Bearer ${token}` },
          body: photoData // FormData сама ставить правильний Content-Type
        });

        if (!photoRes.ok) {
            const errData = await photoRes.json();
            throw new Error(errData.message || "Помилка при завантаженні фото");
        }
      }

      // Б) Оновлюємо текстові дані (username, email)
      // Перевіряємо, чи змінився текст, щоб не слати зайвий запит
      if (formData.username !== user.username || formData.email !== user.email) {
          const textRes = await fetch(`${API_URL}/api/profile`, {
            method: "PUT",
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                username: formData.username,
                email: formData.email 
            })
          });

          if (!textRes.ok) {
             const errData = await textRes.json();
             throw new Error(errData.message || "Помилка при оновленні даних");
          }
      }

      alert("Профіль успішно оновлено!");
      
      // В) Перезавантажуємо сторінку або повторно викликаємо GET, щоб побачити зміни
      window.location.reload(); 

    } catch (err) {
      console.error(err);
      alert(`Не вдалося оновити профіль: ${err.message}`);
    }
  };

  if (!user) return <div className="profile-page"><p style={{textAlign:"center", marginTop: "50px"}}>Завантаження профілю...</p></div>;

  // ЛОГІКА ВІДОБРАЖЕННЯ КАРТИНКИ
  // 1. Якщо є прев'ю (користувач щойно вибрав файл) -> показуємо його
  // 2. Якщо в базі є посилання (profile_photo_url) -> додаємо URL сервера
  // 3. Інакше -> показуємо дефолтну картинку
  let avatarSrc = DEFAULT_AVATAR;
  
  if (preview) {
    avatarSrc = preview;
  } else if (user.profile_photo_url) {
    // Якщо шлях в базі вже повний (починається з http), використовуємо його
    // Якщо відносний (наприклад, "image.jpg"), додаємо адресу сервера
    if (user.profile_photo_url.startsWith("http")) {
        avatarSrc = user.profile_photo_url;
    } else {
        avatarSrc = `${API_URL}/uploads/${user.profile_photo_url}`;
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Мій Кабінет</h1>
      </div>

      <div className="profile-container">
        
        {/* ЛІВА ЧАСТИНА: Дані */}
        <div className="profile-card">
          
          <div className="profile-avatar-container">
            <div className="avatar-wrapper">
              <img 
                src={avatarSrc} 
                alt="Avatar" 
                className="profile-avatar" 
                onError={(e) => { e.target.src = DEFAULT_AVATAR; }} // Якщо картинка не знайдена, ставимо дефолтну
              />
            </div>
            
            {isEditing && (
              <div className="avatar-upload">
                <label htmlFor="avatarInput" className="change-photo-btn">
                  Змінити фото
                </label>
                <input 
                  id="avatarInput" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  style={{display: 'none'}}
                />
              </div>
            )}
          </div>

          <h2>Особисті дані</h2>
          
          <div className="profile-info-group">
            <label>Ім'я користувача</label>
            {isEditing ? (
              <input 
                type="text" 
                name="username"
                className="profile-input"
                value={formData.username} 
                onChange={handleChange}
              />
            ) : (
              <p>{user.username}</p>
            )}
          </div>

          <div className="profile-info-group">
            <label>Email адреса</label>
            {isEditing ? (
              <input 
                type="email" 
                name="email"
                className="profile-input"
                value={formData.email} 
                onChange={handleChange}
              />
            ) : (
              // Враховуємо, що в базі поле може бути порожнім
              <p>{user.email || "Email не вказано"}</p>
            )}
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button className="btn-black" onClick={handleSaveProfile}>Зберегти зміни</button>
                <button className="btn-outline" onClick={handleEditToggle}>Скасувати</button>
              </>
            ) : (
              <button className="btn-black" onClick={handleEditToggle}>Редагувати профіль</button>
            )}
            
            <button className="btn-outline btn-logout" onClick={handleLogout}>
              Вийти з акаунту
            </button>
          </div>
        </div>

        {/* ПРАВА ЧАСТИНА: Історія */}
        <div className="orders-section">
          <h2>Історія замовлень</h2>
          <div className="empty-orders">
            <p>У вас поки немає активних замовлень.</p>
            <button className="btn-outline" onClick={() => navigate("/")} style={{marginTop: '20px', width: 'auto'}}>
              Перейти до каталогу
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}