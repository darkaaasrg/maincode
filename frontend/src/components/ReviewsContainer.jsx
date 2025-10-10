// frontend/src/components/ReviewsContainer.jsx
import React, { useState, useEffect } from 'react';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm'; // Припускаємо, що він знаходиться тут

const API_URL = "http://localhost:5000/api/reviews";

export default function ReviewsContainer({ productId, productType }) {
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
            
            // 💡 ФІЛЬТРУЄМО: Оскільки API повертає ВСІ відгуки, 
            // фільтруємо їх на клієнті за productId та productType, 
            // щоб відобразити тільки релевантні.
            const productReviews = data.filter(r => 
                r.productId === productId && r.productType === productType
            );

            // Сортуємо за датою (найновіші перші)
            productReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            setReviews(productReviews);
            setError(null);
        } catch (e) {
            console.error("Error fetching reviews:", e);
            setError("Не вдалося завантажити відгуки. Перевірте, чи запущено бекенд.");
        } finally {
            setLoading(false);
        }
    };

    // Виклик GET-запиту при першому завантаженні
    useEffect(() => {
        fetchReviews();
    }, [productId, productType]);

    // Обробник для додавання нового відгуку (з ReviewForm)
    const handleAddReview = (newReview) => {
        // Додаємо новий відгук на початок списку, якщо він відповідає поточному продукту
        if (newReview.productId === productId && newReview.productType === productType) {
             setReviews(prevReviews => [newReview, ...prevReviews]);
        }
    };


    if (loading) return <div>Завантаження відгуків...</div>;
    if (error) return <div className="text-red-600 p-4 border border-red-200">{error}</div>;

    return (
        <div className="p-4 border rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Відгуки</h2>
            
            {/* Форма для POST-запитів */}
            <ReviewForm 
                onAdd={handleAddReview} 
                productId={productId} 
                productType={productType}
            />
            
            {/* ReviewList отримує вже завантажені дані */}
            <ReviewList reviews={reviews} />
        </div>
    );
}