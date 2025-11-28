/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './auth.css'; // Використовуємо спільний файл стилів

function RegisterPage() {
    // ВАША ЛОГІКА (БЕЗ ЗМІН)
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
                setMessage(data.message || 'Реєстрація успішна! Перенаправляємо на сторінку входу...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(data.message || 'Помилка реєстрації. Спробуйте ще раз.');
            }
        } catch (err) {
            setError('Помилка з\'єднання з сервером. Перевірте з\'єднання.');
        }
    };

    // ОНОВЛЕНИЙ ДИЗАЙН (HTML)
    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2 className="auth-title">Реєстрація</h2>
                
                {error && <p className="error-message">{error}</p>}
                {message && <p className="success-message">{message}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Ім'я користувача</label>
                        <input
                            type="text"
                            id="username"
                            className="auth-input" /* Новий клас */
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="auth-input" /* Новий клас */
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <input
                            type="password"
                            id="password"
                            className="auth-input" /* Новий клас */
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn">Зареєструватись</button> {/* Новий клас */}
                </form>
                
                <div className="auth-footer">
                    Вже маєте акаунт? <Link to="/login">Увійти</Link>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;