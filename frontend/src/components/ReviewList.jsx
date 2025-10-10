import React, { useState, useEffect } from 'react';
import ReviewForm from './ReviewForm';

const API_URL = "http://localhost:5000/api/reviews"; 

// Приймаємо productId та productType через пропси
export default function ReviewList({ productId, productType, onEditReview }) { // Додано onEditReview
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Функція для отримання відгуків (GET-запит до /api/reviews)
    const fetchReviews = async () => {
        try {
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 2. ФІЛЬТРУЄМО ТА АДАПТУЄМО КЛЮЧІ:
            const productReviews = data
                // Фільтрація за релевантними продуктами
                .filter(r => 
                    String(r.productId || r.vinyl_id || r.cassette_id) === String(productId) && r.product_type === productType
                )
                // Адаптація імен полів з бази даних до очікуваної структури
                .map(r => ({
                    ID: r.ID || r.id, // ID
                    userId: r.userId, // Користувач
                    rating: r.rating, // Рейтинг
                    comment: r.comment || r.text, // Коментар
                    date: r.date || r.createdAt, // Дата
                    productType: r.product_type,
                    productId: r.productId || r.vinyl_id || r.cassette_id
                }))
                // Сортуємо за датою (найновіші перші)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            
            setReviews(productReviews);
            setError(null);
        } catch (e) {
            console.error("Error fetching reviews:", e);
            setError("Не вдалося завантажити відгуки. Перевірте з'єднання з API або налаштування бекенду.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId && productType) {
             fetchReviews();
        } else {
             setReviews([]);
             setLoading(false);
        }
    }, [productId, productType]);

    // Обробник для додавання нового відгуку (з ReviewForm)
    const handleAddReview = (newReview) => {
        // newReview надходить зі структурою OpenAPI (id, user, text, createdAt), тому адаптуємо її до ключів MySQL
        const adaptedReview = {
            ID: newReview.id, 
            userId: newReview.user, 
            rating: newReview.rating, 
            comment: newReview.text, 
            date: newReview.createdAt,
            productType: newReview.productType,
            productId: newReview.productId
        };

        if (String(adaptedReview.productId) === String(productId) && adaptedReview.productType === productType) {
             setReviews(prevReviews => [adaptedReview, ...prevReviews]);
        }
    };
    
    // --- Відображення ---

    if (loading) return <div>Завантаження відгуків...</div>;
    if (error) return <div className="text-red-600 p-4 border border-red-200">{error}</div>;
    
    return (
        <div className="reviews-container">
            {/* Форма для POST-запитів */}
            {/* onAdd буде викликаний після успішного POST і оновить стан */}
            <ReviewForm 
                onAdd={handleAddReview} 
                productId={productId} 
                productType={productType}
            />
            
            <div className="mt-6 space-y-2">
                 <h4 className="font-bold">Відгуки:</h4>
                 {reviews.length === 0 ? (
                    <p className="text-gray-500">Поки що немає відгуків.</p>
                 ) : (
                    <ul className="space-y-2">
                        {reviews.map((r) => (
                          // Використовуємо адаптовані ключі: ID, userId, comment, date
                          <li key={r.ID} className="border p-2 rounded bg-gray-50">
                            <b className="v">{r.userId}</b>: {r.rating}★ — {r.comment}
                            <br />
                            <small className="text-gray-400">
                                {r.date ? new Date(r.date).toLocaleString() : 'Дата невідома'}
                            </small>
                            <div className="review-buttons">
                                <button onClick={() => onEditReview(r)}>Редагувати</button>
                            </div>
                          </li>
                        ))}
                    </ul>
                 )}
            </div>
        </div>
    );
}
