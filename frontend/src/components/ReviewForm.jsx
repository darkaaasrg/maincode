import React, { useState } from "react";

export default function ReviewForm({ onAdd }) {
  const [userId, setUserId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId || !comment) return;
    onAdd(userId, rating, comment);
    setUserId("");
    setComment("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input
        className="border p-2 mr-2 rounded"
        placeholder="Ваш ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <input
        type="number"
        min="1"
        max="5"
        className="border p-2 mr-2 rounded w-16"
        value={rating}
        onChange={(e) => setRating(+e.target.value)}
      />
      <input
        className="border p-2 mr-2 rounded w-64"
        placeholder="Ваш коментар"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button className="bg-blue-500 text-white p-2 rounded">Додати</button>
    </form>
  );
}
