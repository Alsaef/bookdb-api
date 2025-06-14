const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000

app.use(express.json())
app.use(cors())



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://BookDB:fXQ0gfSwZhMFjzDC@cluster0.wycxuko.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");



    const DB=client.db('bookDB')
    const categoryCollection = DB.collection('catagorys');
    const subCtegoryCollection = DB.collection('subcategorys');
    



    app.post('/api/post', async (req, res) => {
      try {
        const category = req.body;
        const result = await subCtegoryCollection.insertMany(category);
        res.status(201).json(result);
        console.log(result);
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to add category' });
      }
    });


    app.get('/api/category', async (req, res) => {
      try {
        const categories = await categoryCollection.find({}).toArray();
        res.status(200).json(categories);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
      }
    });

    app.get('/subcategory/:category', async (req, res) => {
      try {
        const category = req.params.category;
        const subcategories = await subCtegoryCollection.find({ category }).toArray();
        res.status(200).json(subcategories);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subcategories' });
      }
    });



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})




