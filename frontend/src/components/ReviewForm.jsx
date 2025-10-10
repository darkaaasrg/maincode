import React, { useState } from "react";

// API_URL має відповідати серверу Express
const API_URL = "http://localhost:5000/api/reviews"; 

export default function ReviewForm({ onAdd, productId, productType }) {
    // Встановлюємо початковий стан для форми
    const [userId, setUserId] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        // Клієнтська валідація
        if (!userId || !comment || comment.length < 3) {
            setError("Будь ласка, вкажіть ID користувача та коментар (мінімум 3 символи).");
            return;
        }
        
        // Додаткова перевірка, щоб уникнути помилок 400 на бекенді
        if (!productId || !productType) {
             setError("Помилка: ID або тип продукту не визначені.");
            return;
        }

        // Формування тіла запиту (ReviewCreateRequest)
        const reviewData = {
            user: userId,
            productType: productType, 
            productId: productId,     
            text: comment,
            rating: rating,
        };

        try {
            // Виконання POST-запиту
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(reviewData),
            });

            // Обробка відповіді (201 успіх або 400 помилка)
            if (response.ok) {
                const newReview = await response.json();
                console.log("Відгук успішно створено (201):", newReview);
                
                // Викликаємо функцію, щоб оновити список відгуків на сторінці
                onAdd(newReview); 

                // Очищення форми
                setUserId("");
                setComment("");
            } else {
                const errorData = await response.json();
                console.error(`Помилка API (${response.status}):`, errorData);
                
                // Виведення повідомлення про помилку
                alert("Не вдалося додати відгук."); // Використовуємо alert, як у вашому скріншоті
                setError(errorData.details?.[0]?.message || `Помилка: ${errorData.code}`);
            }
        } catch (err) {
            // Мережеві помилки (якщо бекенд не відповідає)
            console.error("Мережева помилка:", err);
            alert("Не вдалося додати відгук.");
            setError("Не вдалося підключитися до API. Перевірте, чи запущено бекенд.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            {error && <div className="text-red-500 mb-2 p-2 border border-red-500 rounded">{error}</div>}
            
            <div className="flex items-center space-x-2">
                {/* Ці поля повинні бути згруповані і відформатовані для мобільного */}
                <input
                    className="border p-2 rounded flex-grow"
                    placeholder="Ваш ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                />
                <input
                    type="number"
                    min="1"
                    max="5"
                    className="border p-2 rounded w-16 text-center"
                    value={rating}
                    onChange={(e) => setRating(+e.target.value)}
                />
            </div>
            <div className="flex items-center mt-2">
                <input
                    className="border p-2 rounded flex-grow"
                    placeholder="Ваш коментар"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <button 
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition ml-2"
                    type="submit"
                >
                    Додати відгук
                </button>
            </div>
        </form>
    );
}
