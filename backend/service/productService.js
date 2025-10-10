// backend/service/productService.js (Оновлений код, без логіки відгуків)
import { Product, Review } from "../domain/product.js";

let products = [
    // Додамо тестовий продукт для початку
    new Product(1, "Dark Side of the Moon", "Pink Floyd", "Prog Rock", 1973, 10, "vinyl", true),
]; 
let nextId = 2; // Починаємо з 2, бо 1 вже є

export const productService = {
    create(data) {
        const { title, artist, genre, year, tracks, format, inStock } = data;
        const product = new Product(nextId++, title, artist, genre, year, tracks, format, inStock);
        products.push(product);
        return product;
    },

    getAll() {
        return products;
    },

    getById(id) {
        const product = products.find(p => p.id === Number(id));
        if (!product) throw new Error("Product not found");
        return product;
    },

    update(id, data) {
        const product = this.getById(id);
        Object.assign(product, data);
        return product;
    },

    delete(id) {
        const index = products.findIndex(p => p.id === Number(id));
        if (index === -1) throw new Error("Product not found");
        products.splice(index, 1);
    },

    // *** ЛОГІКУ addReview ВИДАЛЕНО! ***
};