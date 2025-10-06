import React from "react";

export default function ReviewList({ reviews }) {
  if (reviews.length === 0) return <p className="text-gray-500">Поки що немає відгуків.</p>;

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Відгуки:</h3>
      <ul className="space-y-2">
        {reviews.map((r, i) => (
          <li key={i} className="border p-2 rounded bg-gray-50">
            <b>{r.userId}</b>: {r.rating}★ — {r.comment} <br />
            <small className="text-gray-400">{r.date.toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
