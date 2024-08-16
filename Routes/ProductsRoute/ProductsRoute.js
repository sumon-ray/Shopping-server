
const express = require("express");
const router = express.Router();

// Middleware to set database collection in request
router.use((req, res, next) => {
  req.databaseCollection = req.app.get('databaseCollection');
  next();
});

// POST route for adding a product
router.post("/addProduct", async (req, res) => {
  const databaseCollection = req.databaseCollection;
  const query = req.body;
  console.log(query);
  const result = await databaseCollection.insertOne(query);
  res.send(result);
});

// GET route for retrieving products
router.get("/books", async (req, res) => {
  const databaseCollection = req.databaseCollection;
  const result = await databaseCollection.find().toArray();
  res.send(result);
});

module.exports = router;
