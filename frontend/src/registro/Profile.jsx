/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const [isUploading, setIsUploading] = useState(false);


  const fetchProfile = async () => {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });


      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textError = await response.text();
        setError(textError || 'Помилка сервера (429 - Too Many Requests)');
      } else {
        const data = await response.json();

        if (response.ok) {
          setProfile(data);
          setNewUsername(data.username);
        } else {
          setError(data.message || 'Помилка завантаження профілю.');
          if (response.status === 401) {
            localStorage.removeItem("user");
            localStorage.removeItem("authToken");
            navigate('/login');
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Помилка з\'єднання з сервером.');
    }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProfile();
  }, []);


  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!profile || newUsername.trim() === profile.username) {
      return setMessage('Логін не змінено.');
    }

    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ username: newUsername }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setProfile(prev => ({ ...prev, username: newUsername }));
        const savedUser = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({...savedUser, username: newUsername}));
      } else {
        setError(data.message || 'Помилка оновлення профілю.');
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Помилка мережі при оновленні.');
    }
  };


  const handlePhotoChangeAndUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    setMessage('Завантаження фото...');
    setError('');

    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
      const response = await fetch('http://localhost:5000/api/profile/photo', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message); 
        setProfile(prev => ({ ...prev, profile_photo_url: data.profile_photo_url }));
      } else {
        setError(data.message || 'Помилка завантаження фото.');
      }
    } catch (err) {
      setError('Помилка мережі при завантаженні фото.');
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  // Показуємо повноекранне завантаження ТІЛЬКИ при першому запуску
  if (loading) {
    return <div className="profile-loading">Завантаження профілю...</div>;
  }

  // 4. РОЗМІТКА
  return (
    <div className="profile-container">
      <h2 className="profile-title">Мій кабінет</h2>

      {/* Повідомлення про помилки/успіх тепер ВБУДОВАНІ тут */}
      {message && <p className="profile-message success">{message}</p>}
      {error && <p className="profile-message error">{error}</p>}

      {/* Рендеримо контент, ТІЛЬКИ ЯКЩО профіль завантажився І НЕМАЄ КРИТИЧНОЇ ПОМИЛКИ */}
      {profile ? (
        <>
          <div className="profile-details">
            <div className="profile-photo-section">
              <img
                src={profile.profile_photo_url
                    ? `http://localhost:5000/uploads/${profile.profile_photo_url}`
                    : '/default-avatar.png'}
                alt="Фото профілю"
                className="profile-avatar"
              />
              <label htmlFor="photo-upload" className={`btn-small ${isUploading ? 'disabled-btn' : ''}`}>
                {isUploading ? 'Завантаження...' : 'Змінити фото'}
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/gif"
                onChange={handlePhotoChangeAndUpload}
                style={{ display: 'none' }}
                disabled={isUploading}
              />
            </div>

            <div className="profile-info-section">
              <h3>Основна інформація</h3>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>ID:</strong> {profile.user_id}</p>
              <p><strong>Роль:</strong> {profile.role}</p>

              <form onSubmit={handleUpdateUsername} className="profile-form">
                <label htmlFor="username">Логін / Ім'я:</label>
                <input
                  type="text"
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary">Зберегти логін</button>
              </form>
            </div>
          </div>

          <hr />

          <div className="profile-basket-idea">
            <h3>Історія замовлень / Кошик</h3>
            <p>Тут відображатиметься ваш поточний кошик та історія покупок. **ID вашого кошика:** [логіка кошика реалізується через окрему таблицю, пов'язану з <strong>{profile.user_id}</strong>]</p>
            <button className="btn-secondary" onClick={() => navigate('/cart')}>Перейти до кошика</button>
          </div>
        </>
      ) : (
        // Якщо сталася помилка 429 і profile === null,
        // ми покажемо помилку тут, АЛЕ хедер і футер залишаться на місці
        <div className="profile-error-inline">
          <p>Не вдалося завантажити профіль. Спробуйте оновити сторінку.</p>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;