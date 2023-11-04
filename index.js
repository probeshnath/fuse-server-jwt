const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
const cors = require("cors")
const cookieParser = require("cookie-parser");
require("dotenv").config()
const port = process.env.Port || 5000;


// middleware
// app.use(cors(
//   {
//   origin: [
//     "http://localhost:5173/",
//     "http://localhost:5174/"
//   ],
//   credentials:true
// }
// ));
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials:true
}))
app.use(express.json())
app.use(cookieParser());


// mongoBD

const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.y8cef5u.mongodb.net/?retryWrites=true&w=majority`;
var uri = `mongodb://probeshn:${process.env.MONGODB_PASSWORD}@ac-iy6n83p-shard-00-00.y8cef5u.mongodb.net:27017,ac-iy6n83p-shard-00-01.y8cef5u.mongodb.net:27017,ac-iy6n83p-shard-00-02.y8cef5u.mongodb.net:27017/?ssl=true&replicaSet=atlas-y02b2q-shard-0&authSource=admin&retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const logger = async ( req,res, next) =>{
  console.log("logger called", req.host, req.originalUrl)
  next();
}

const verifyToken = async (req,res,next) =>{
  const token = req.cookies?.token;
  console.log("token from varify ", token)

  if(!token){
    return res.status(401).send({message:"not authriszed"})
  }

  jwt.verify(token, process.env.JWT_SECRET,(err,decoded)=>{
    if(err){
     
      return res.status(401).send({message:"not authriszed"})
    }

    console.log("vale of the decoded", decoded)

    req.user = decoded

    next();
  })

}


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
    app.get("/products", logger,verifyToken ,async(req,res)=>{
      // console.log("tok tok token", req.cookies.token)
      console.log("i love you user ", req.user)

      if(req.query?.email !==  req.user.email){
        return res.status(403).send({message: "forbidden access"})
      }
      const cursor =  productsDB.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    // jwt

    app.post("/jwt",logger, async(req,res)=>{ 
      const user = req.body;
      console.log("from jwt",user)
      const token = jwt.sign(user, process.env.JWT_SECRET,{expiresIn:"1h"})

      res
      .cookie("token", token,{
        httpOnly:true,
        secure: true,
        sameSite:"none"
      })
      .send({success:true})
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