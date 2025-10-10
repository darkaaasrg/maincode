// backend/service/reviewService.js

// Імітація бази даних для відгуків (відв'язано від продуктів для простоти)
let reviews = [];
let nextReviewId = 1;

/**
 * Внутрішня функція для створення об'єкта ErrorResponse згідно зі схемою OpenAPI.
 */
const createValidationError = (field, message, code = "ValidationError") => ({
    error: code,
    code: code,
    details: [{ field, message }]
});

/**
 * Сервіс для управління відгуками
 */
export const reviewService = {
    // GET /reviews
    getAll() {
        // Усі відгуки відображаються без фільтрації (згідно з описом OpenAPI)
        return reviews;
    },

    // GET /reviews/{id}
    getById(id) {
        return reviews.find(r => r.id === id);
    },

    // POST /reviews
    create(reviewData) {
        const { text, user, productType, productId } = reviewData;

        // Валідація згідно з ReviewCreateRequest (required та minLength)
        if (!user || !productType || !productId || !text || text.length < 3) {
            // Кидаємо об'єкт помилки, який контролер перетворить на 400
            throw createValidationError(
                'text', 
                'Review text must be at least 3 characters and all required fields must be present.', 
                'EMPTY_REVIEW_OR_MISSING_FIELD'
            );
        }

        const newReview = {
            id: `r-${String(nextReviewId++).padStart(3, '0')}`,
            ...reviewData,
            rating: reviewData.rating || 5, // Дефолтне значення, якщо немає
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        reviews.push(newReview);
        return newReview;
    },

    // PUT /reviews/{id}
    update(id, updateData) {
        const reviewIndex = reviews.findIndex(r => r.id === id);
        if (reviewIndex === -1) {
            return null; // 404
        }

        // Валідація тексту при оновленні
        if (updateData.text && updateData.text.length < 3) {
            throw createValidationError(
                'text', 
                'Updated review text must be at least 3 characters.', 
                'INVALID_TEXT'
            );
        }

        const currentReview = reviews[reviewIndex];
        const updatedReview = {
            ...currentReview,
            ...updateData,
            updatedAt: new Date().toISOString(),
        };
        reviews[reviewIndex] = updatedReview;
        return updatedReview;
    },

    // DELETE /reviews/{id}
    deleteById(id) {
        const initialLength = reviews.length;
        reviews = reviews.filter(r => r.id !== id);
        return reviews.length !== initialLength; // true, якщо елемент був видалений
    }
};