import React, { useState } from "react";
import { Review } from "../data/models";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";

export default function ProductCard({ product }) {
  const [reviews, setReviews] = useState(product.reviews);

  const addNewReview = (userId, rating, comment) => {
    const newReview = new Review(userId, rating, comment);
    product.addReview(newReview);
    setReviews([...product.reviews]);
  };

  return (
    <div className="border p-4 rounded-xl shadow-lg bg-white">
      <h2 className="text-xl font-bold mb-2">{product.title}</h2>
      <p className="text-gray-600">{product.artist}</p>
      <p><b>Жанр:</b> {product.genre}</p>
      <p><b>Рік:</b> {product.year}</p>
      <p><b>Формат:</b> {product.format}</p>
      <p><b>В наявності:</b> {product.inStock}</p>

      <ReviewForm onAdd={addNewReview} />
      <ReviewList reviews={reviews} />
    </div>
  );
}
