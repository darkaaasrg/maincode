/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';

export default function ReviewList({ reviews, onEdit, onDelete }) {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try { setCurrentUser(JSON.parse(userStr)); } catch (e) { /* empty */ }
        }
    }, []);

    if (!reviews || reviews.length === 0) {
        return <div className="mt-6 text-center text-gray-500">Відгуків ще немає.</div>;
    }
    
    return (
        <div className="mt-6">
             <h4 style={{marginBottom: '15px', fontWeight: 'bold'}}>Останні відгуки ({reviews.length}):</h4>
             
             <div>
                {reviews.map((r) => {
                    const displayName = r.username || r.email || `Користувач ${r.userId || r.user}`;
                    const isOwner = currentUser && (String(currentUser.id) === String(r.userId));
                    const isAdmin = currentUser && currentUser.role === 'Admin';

                    return (
                      <div key={r.ID || r.id} className="review-item">
                        <div className="review-header">
                            <div>
                                <span className="review-author">{displayName}</span>
                                <span className="review-stars">{'★'.repeat(r.rating || 5)}</span>
                            </div>
                            <small className="review-date">
                                {r.date ? new Date(r.date).toLocaleDateString() : ''}
                            </small>
                        </div>

                        <p className="review-text">{r.comment || r.text}</p>
                        
                        {(isOwner || isAdmin) && (
                            <div className="review-actions">
                                {isOwner && (
                                    <button onClick={() => onEdit(r)} className="action-btn edit-action">
                                        Редагувати
                                    </button>
                                )}
                                <button onClick={() => onDelete(r.ID || r.id)} className="action-btn delete-action">
                                    Видалити
                                </button>
                            </div>
                        )}
                      </div>
                    );
                })}
            </div>
        </div>
    );
}