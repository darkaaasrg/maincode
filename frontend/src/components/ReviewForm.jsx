import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/reviews"; 

export default function ReviewForm({ onAdd, onUpdate, onCancel, editingReview, productId, productType }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) { try { setUser(JSON.parse(userStr)); } catch (e) {} }
    }, []);

    useEffect(() => {
        if (editingReview) {
            setComment(editingReview.comment || editingReview.text || "");
            setRating(editingReview.rating || 5);
        } else {
            setComment("");
            setRating(5);
        }
    }, [editingReview]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        const token = localStorage.getItem('authToken');
        if (!token) return setError("Потрібна авторизація.");
        if (comment.trim().length < 3) return setError("Коментар надто короткий.");

        const method = editingReview ? "PUT" : "POST";
        const url = editingReview ? `${API_URL}/${editingReview.ID}` : API_URL;

        const bodyData = {
            productType, productId, 
            text: comment, comment: comment, rating
        };

        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(bodyData),
            });

            if (response.ok) {
                if (editingReview) {
                    onUpdate({ ...editingReview, comment, rating });
                } else {
                    const newReview = await response.json();
                    const displayName = user?.username || user?.email || "Я";
                    onAdd({ ...newReview, username: displayName });
                }
                setComment("");
                setError(null);
            } else {
                const errData = await response.json();
                setError(errData.message || "Помилка збереження.");
            }
        } catch (err) { setError("Помилка з'єднання."); }
    };

    if (!user) return <div style={{textAlign: 'center', color: '#666', marginTop: '20px'}}>Увійдіть, щоб писати відгуки.</div>;

    const displayUserName = user.username || user.email || "Користувач";

    return (
        <form 
            onSubmit={handleSubmit} 
            className={`review-form-container ${editingReview ? 'edit-mode' : ''}`}
        >
            {editingReview && <div style={{color: '#2563eb', fontWeight: 'bold', marginBottom: '10px'}}>✏️ Редагування відгуку:</div>}
            
            {error && <div className="error-msg">{error}</div>}
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <div className="form-header">
                    <span className="form-user-name">{displayUserName} <span style={{fontWeight:'normal', fontSize:'12px'}}>(Ви)</span></span>
                    <select 
                        className="rating-select"
                        value={rating}
                        onChange={(e) => setRating(+e.target.value)}
                    >
                        {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ⭐</option>)}
                    </select>
                </div>

                <div className="form-inputs">
                    <input
                        className="review-input"
                        placeholder="Напишіть ваш відгук..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <button className="submit-btn" type="submit">
                        {editingReview ? "Зберегти" : "Надіслати"}
                    </button>
                    
                    {editingReview && (
                        <button type="button" onClick={onCancel} className="cancel-btn">
                            Скасувати
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
}