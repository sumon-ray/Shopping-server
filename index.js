const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://heartfelt-stardust-641aa3.netlify.app"
  ]
}));

// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@cluster0.tostkkh.mongodb.net/realEstateDB?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Database connection and setup
async function run() {
  try {
    await client.connect();
    const databaseCollection = client.db('realEstateDB').collection('realEstate');
    app.set('databaseCollection', databaseCollection);

    // Test database connection
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");

    // Routes
    app.get("/", (req, res) => {
      res.send("Server running");
    });

    // GET route for retrieving products with pagination
    app.get("/products", async (req, res) => {
      const databaseCollection = req.app.get('databaseCollection');
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.size) || 10;
      const searchQuery = req.query.q || ""; // Get the search query from the request
  
      try {
          // Search products by name (case-insensitive)
          const query = { product_name: { $regex: new RegExp(searchQuery, "i") } };
          const totalProducts = await databaseCollection.countDocuments(query);
          const products = await databaseCollection
              .find(query)
              .skip(page * limit)
              .limit(limit)
              .toArray();
  
          if (products.length === 0) {
              return res.status(404).json({ message: "The product cannot be found" });
          }
  
          res.send({
              products: products,
              totalPages: Math.ceil(totalProducts / limit)
          });
      } catch (error) {
          res.status(500).send("Error retrieving products: " + error.message);
      }
  });
  

    
    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}



run().catch(console.dir);
