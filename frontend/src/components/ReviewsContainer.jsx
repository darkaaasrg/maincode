import React, { useState, useEffect } from 'react';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import './Reviews.css';

const API_URL = "http://localhost:5000/api/reviews";

export default function ReviewsContainer({ productId, productType }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [editingReview, setEditingReview] = useState(null);

    const fetchReviews = async () => {
        try {
            const url = `${API_URL}?productId=${productId}&productType=${productType}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Помилка завантаження");
            
            const data = await response.json();
            data.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
            setReviews(data);
        } catch (e) {
            console.error(e);
            setError("Не вдалося завантажити відгуки.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId && productType) {
            fetchReviews();
            setEditingReview(null);
        }
    }, [productId, productType]);

    const handleAddReview = (newReview) => {
        const typeInReview = newReview.product_type || newReview.productType;
        if (String(newReview.productId) === String(productId) && typeInReview === productType) {
             setReviews(prev => [newReview, ...prev]);
        } else {
             fetchReviews();
        }
    };

    const handleUpdateReview = (updatedReview) => {
        setReviews(prevReviews => prevReviews.map(r => 
            r.ID === updatedReview.ID ? { ...r, ...updatedReview } : r
        ));
        setEditingReview(null);
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Ви точно хочете видалити цей відгук?")) return;

        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch(`${API_URL}/${reviewId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                setReviews(prev => prev.filter(r => r.ID !== reviewId));
            } else {
                const errData = await res.json();
                alert(errData.message || "Помилка при видаленні");
            }
        } catch (e) {
            console.error(e);
            alert("Помилка з'єднання");
        }
    };

    const startEditing = (review) => {
        setEditingReview(review);
        document.querySelector('.review-form-anchor')?.scrollIntoView({ behavior: 'smooth' });
    };

    const cancelEditing = () => {
        setEditingReview(null);
    };

    if (loading) return <div className="p-4 text-gray-500">Завантаження...</div>;

    return (
        <div className="p-4 border rounded-lg shadow bg-white mt-4">
            <h2 className="text-xl font-bold mb-4">Відгуки</h2>
            
            <div className="review-form-anchor"></div>

            <ReviewForm 
                onAdd={handleAddReview} 
                onUpdate={handleUpdateReview} 
                onCancel={cancelEditing}      
                editingReview={editingReview} 
                productId={productId} 
                productType={productType}
            />
            
            <ReviewList 
                reviews={reviews} 
                onEdit={startEditing}       
                onDelete={handleDeleteReview} 
            />
        </div>
    );
}