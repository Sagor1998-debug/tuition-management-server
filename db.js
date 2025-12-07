// db.js inside your server folder

// 1. Load environment variables first
require('dotenv').config(); 

const { MongoClient, ServerApiVersion } = require('mongodb');

// Get the connection string from the .env file
const uri = process.env.MONGODB_URI; 

// Create a MongoClient with a Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToDatabase() {
  try {
    // 2. Connect the client to the server
    await client.connect();
    
    // 3. Ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("🥳 Successfully connected to MongoDB Atlas!");
    
    // Return the database instance for use in other files
    return client.db("tuitionDB"); 

  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    // Exit the process if the connection fails critically
    process.exit(1); 
  }
}

// Export the client and the connection function
module.exports = {
  client,
  connectToDatabase
};