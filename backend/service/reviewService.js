let reviews = [];
let nextReviewId = 1;
const createValidationError = (field, message, code = "ValidationError") => ({
    error: code,
    code: code,
    details: [{ field, message }]
});
export const reviewService = {
    getAll() {
        return reviews;
    },
    getById(id) {
        return reviews.find(r => r.id === id);
    },
    create(reviewData) {
        const { text, user, productType, productId } = reviewData;

        if (!user || !productType || !productId || !text || text.length < 3) {
            throw createValidationError(
                'text', 
                'Review text must be at least 3 characters and all required fields must be present.', 
                'EMPTY_REVIEW_OR_MISSING_FIELD'
            );
        }

        const newReview = {
            id: `r-${String(nextReviewId++).padStart(3, '0')}`,
            ...reviewData,
            rating: reviewData.rating || 5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        reviews.push(newReview);
        return newReview;
    },
    update(id, updateData) {
        const reviewIndex = reviews.findIndex(r => r.id === id);
        if (reviewIndex === -1) {
            return null;
        }

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
    deleteById(id) {
        const initialLength = reviews.length;
        reviews = reviews.filter(r => r.id !== id);
        return reviews.length !== initialLength;
    }
};
export const resetReviews = () => {
  reviews = [];
  nextReviewId = 1;
};