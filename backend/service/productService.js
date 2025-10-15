import { Product, Review } from "../domain/product.js";

let products = []; // Тимчасове "сховище" (імітація БД)
let nextId = 1;

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

  addReview(productId, userId, rating, comment) {
    const product = this.getById(productId);
    const review = new Review(userId, rating, comment); //викорстовує клас
    product.addReview(review);
    return review;
  }
};
