/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AuthForm.css'; // Будемо використовувати цей файл для CSS

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Реєстрація успішна
                setMessage(data.message || 'Реєстрація успішна! Перенаправляємо на сторінку входу...');
                // Автоматичне перенаправлення на сторінку входу через 2 секунди
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                // Помилка реєстрації (наприклад, 409 Conflict або 400 Bad Request)
                setError(data.message || 'Помилка реєстрації. Спробуйте ще раз.');
            }
        } catch (err) {
            // Помилка мережі
            setError('Помилка з\'єднання з сервером. Перевірте з\'єднання.');
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">Реєстрація</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                
                {/* Повідомлення про помилку або успіх */}
                {error && <p className="error-message">{error}</p>}
                {message && <p className="success-message">{message}</p>}

                <div className="form-group">
                    <label htmlFor="username">Ім'я користувача:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Пароль:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="auth-button">Зареєструватись</button>
            </form>
            <p className="auth-footer">
                Вже маєте акаунт? <Link to="/login">Увійти</Link>
            </p>
        </div>
    );
}

export default RegisterPage;