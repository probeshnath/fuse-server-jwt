const express = require("express");
const app = express();
const cors = require("cors")
const port = process.env.Port || 5000;


// middleware
app.use(cors());
app.use(express.json())


// mongoBD

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://probeshn:ULftU6LeGFL6QBWq@cluster0.y8cef5u.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const userDB = client.db("userDB").collection("users");

    // register users ---->>

    // app.post("/users", async (req,res)=>{
    //     const user = req.body;
    //     // console.log(user)
    //     const result = await userDB.insertOne(user)
    //     res.send(result)
    // })
    const productsDB = client.db("userDB").collection("products");
      
    // add products
    app.post("/dashboard/products", async(req,res)=>{
      const product = req.body;
      const result = await productsDB.insertOne(product);
      // console.log(product)
      res.send(result)
    })

    // get all products
    app.get("/products",async(req,res)=>{
      const cursor = await productsDB.find();
      const result = await cursor.toArray();
      res.send(result)
    })






    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get("/",(req,res)=>{
    res.send("Hi Localhost home page")
})


app.listen(port , ()=>{
    console.log(`local host are running on ${port}`)
})