import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './auth.css'; // Підключаємо новий CSS

function LoginPage() {
    // ВАША ЛОГІКА (БЕЗ ЗМІН)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user)); 
                navigate('/'); 
            } else {
                setError(data.message || 'Помилка входу. Перевірте email та пароль.');
            }
        } catch (err) {
            setError('Помилка з\'єднання з сервером. Спробуйте пізніше.');
        }
    };

    // ОНОВЛЕНИЙ ДИЗАЙН (HTML)
    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2 className="auth-title">Увійти</h2>
                
                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit}>
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

                    <button type="submit" className="auth-btn">Увійти</button> {/* Новий клас */}
                </form>
                
                <div className="auth-footer">
                    Не маєте акаунта? <Link to="/register">Зареєструватись</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;