// api/productController.js
import express from "express";
import { productService } from "../service/productService.js";

const router = express.Router();

// GET /health
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// POST /products
router.post("/products", (req, res) => {
  try {
    const product = productService.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /products
router.get("/products", (req, res) => {
  res.json(productService.getAll());
});

// GET /products/:id
router.get("/products/:id", (req, res) => {
  try {
    const product = productService.getById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// PUT /products/:id
router.put("/products/:id", (req, res) => {
  try {
    const updated = productService.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// DELETE /products/:id
router.delete("/products/:id", (req, res) => {
  try {
    productService.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// POST /products/:id/reviews
router.post("/products/:id/reviews", (req, res) => {
  try {
    const { userId, rating, comment } = req.body;
    const review = productService.addReview(req.params.id, userId, rating, comment);
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
