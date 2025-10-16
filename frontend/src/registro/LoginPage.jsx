import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './auth.css'; 


function LoginPage() {
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
                // 1. Зберігаємо токен та дані користувача у Local Storage
                localStorage.setItem('authToken', data.token);
                // Зберігаємо також дані користувача, які потрібні Хедеру
                localStorage.setItem('user', JSON.stringify(data.user)); 

                // 2. Перенаправляємо на головну сторінку або в кабінет
                navigate('/'); // Перенаправимо одразу в "Мій кабінет"
                // Оскільки Header.jsx використовує useEffect для читання localStorage.getItem("user"),
                // він автоматично оновиться.
                
                // Після цього кроку, Header.jsx повинен відображати "Вініл", "Касети", "Мій кабінет".

            } else {
                setError(data.message || 'Помилка входу. Перевірте email та пароль.');
            }
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError('Помилка з\'єднання з сервером. Спробуйте пізніше.');
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">Увійти</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                
                {error && <p className="error-message">{error}</p>}

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

                <button type="submit" className="auth-button">Увійти</button>
            </form>
            <p className="auth-footer">
                Не маєте акаунта? <Link to="/register">Зареєструватись</Link>
            </p>
        </div>
    );
}

export default LoginPage;