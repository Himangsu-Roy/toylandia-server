const express = require("express");
const cors = require("cors")
const port = process.env.PORT || 5000;
const app = express();
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ys20m5d.mongodb.net/?retryWrites=true&w=majority`;
  


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      
      const toyCollection = client.db("toyLandia").collection("toy");


      app.get("/alltoys", async (req, res) => {
          const toys = await toyCollection.find().limit(20).sort({ price: 1 }).toArray();
        res.send(toys);
      });

      app.get("/toydetails/:id", async (req, res) => {
          const id = req.params.id;
          const query = {_id: new ObjectId(id)}
          const toy = await toyCollection.findOne(query);
          res.send(toy)
      })

      app.get("/mytoys/:email", async (req, res) => {
          const email = req.params.email;
          const mytoys = await toyCollection
            .find({ sellerEmail: email })
            .toArray();
          res.send(mytoys)
      })
      

      app.post("/addatoy", async (req, res) => {
          const toy = req.body;
          const result = await toyCollection.insertOne(toy);
          res.send(result)

      });


      app.get("/mytoy/:id", async (req, res) => {
          const id = req.params.id
          const query = { _id: new ObjectId(id) };
          const result = await toyCollection.findOne(query);
          res.send(result) 
      })


      app.put("/mytoy/:id", async (req, res) => {
          const id = req.params.id;
          const toy = req.body;
          const filter = { _id: new ObjectId(id) }
          const updateToy = {
            $set: {
              pictureURL: toy.pictureURL,
              name: toy.name,
              sellerName: toy.sellerName,
              sellerEmail: toy.sellerEmail,
              subCategory: toy.subCategory,
              price: toy.price,
              rating: toy.rating,
              quantity: toy.quantity,
              description: toy.description,
            },
          };
          const result = await toyCollection.updateOne(filter, updateToy);
          res.send(result)
      })


      app.delete("/toys/:id", async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await toyCollection.deleteOne(query);
          res.send(result)
      })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("ToyLandia Server is Running")
})

app.listen(port, () => {
    console.log(`Toylandia is running on port: ${port}`)
})
