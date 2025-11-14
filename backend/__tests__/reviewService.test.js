import supertest from 'supertest';
import app, { db } from '../index.js'; 
const request = supertest(app);

const API_PATH = '/api/reviews';
const jwt = (await import('jsonwebtoken')).default; 

describe('Review API Integration Tests (Real Controller)', () => {

  const correctReviewData = {
    productType: "vinyl", 
    productId: 1,
    text: "Це чудовий продукт для тестування!", 
    rating: 5
  };
  
  const invalidDataEmptyText = {
    productType: "vinyl",
    productId: 1,
    text: "a", 
    rating: 1
  };

  const TEST_USER_ID = 123; 
  
  const TEST_USER_TOKEN = jwt.sign(
    { id: TEST_USER_ID, username: 'test_user', role: 'User' },
    process.env.JWT_SECRET || 'test_secret_key', 
    { expiresIn: '1h' }
  );

  beforeAll(async () => {
    try {
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS Users (
          user_id INT PRIMARY KEY AUTO_INCREMENT,
          username VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          role ENUM('User', 'Admin') DEFAULT 'User',
          profile_photo_url VARCHAR(255)
        );
      `);
      
      await db.promise().query(
        'INSERT IGNORE INTO Users (user_id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [TEST_USER_ID, 'test_user', 'test@example.com', 'dummy_password_hash', 'User']
      );

      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS ReviewsVinyls (
          ID INT AUTO_INCREMENT PRIMARY KEY,
          vinyl_id INT,
          userId INT,
          rating INT,
          comment TEXT,
          date DATETIME,
          productType VARCHAR(50)
        );
      `);
      
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS ReviewsCassettes (
          ID INT AUTO_INCREMENT PRIMARY KEY,
          cassette_id INT,
          userId INT,
          rating INT,
          comment TEXT,
          date DATETIME,
          productType VARCHAR(50)
        );
      `);
      
    } catch (e) {
      console.error(`!!!! FAILED TO SETUP DB !!!! Error: ${e.message}`);
      throw e;
    }
  });

  test("should successfully create a review with valid data", async () => {
    const response = await request.post(API_PATH)
      .set('Authorization', `Bearer ${TEST_USER_TOKEN}`) 
      .send(correctReviewData); 
      
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('ID');
    expect(response.body.comment).toBe(correctReviewData.text);
    expect(String(response.body.userId)).toBe(String(TEST_USER_ID)); 
  });

  test("should return 400 for review text < 3 chars", async () => {
    const response = await request.post(API_PATH)
      .set('Authorization', `Bearer ${TEST_USER_TOKEN}`)
      .send(invalidDataEmptyText); 

    expect(response.status).toBe(400); 
  });
  
  test("should return 401 for missing auth token", async () => {
    const response = await request.post(API_PATH)
      .send(correctReviewData); 

    expect(response.status).toBe(401);
  });

  test("should return a list of reviews (from both tables)", async () => {
    const response = await request.get(API_PATH);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1); 
  });

  afterAll(async () => {
    await db.promise().end();
  });
});