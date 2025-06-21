const express = require('express')
const cors = require('cors')

const jwt = require('jsonwebtoken')
const app = express()
const port = 3000

app.use(express.json())

app.use(
  cors({
    origin: [
      "http://localhost:5173", // ✅ Localhost
      "https://bangla-varsity.netlify.app" // ✅ Netlify Live URL
    ],
    credentials: true
  })
);




// const verifToken = async (req, res, next) => {
//   const authHeader = req.headers?.authorization;
//   console.log(authHeader);
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).send({ message: 'unauthorized access' })
//   }


//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded =  jwt.verify(token,`0689be11d6dfdc71455635308d90d590315729da4549b1a91fa35093c760143bbd07f564d81ee929719dab0a0ddc58bae21a065adfdf1d3d9fd1
// 4928947eaff3`)
//     req.decoded = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).send({ message: 'unauthorized access' })
//   }

// }


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");



    const DB = client.db('bookDB')
    const categoryCollection = DB.collection('catagorys');
    const contentCollection = DB.collection('content');
    const usersCallections = DB.collection('user');



    app.post('/api/v1/users', async (req, res) => {
      const { name, photoUrl, email } = req.body;
      const existingUser = await usersCallections.findOne({ email });
      if (existingUser) {
        return res.status(409).send({ message: 'User already exists' });
      }
      const newUser = { name, photoUrl, email, role: 'user' };
      const result = await usersCallections.insertOne(newUser);
      res.send(result);
    });



    // private api
    app.get('/api/v1/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = await usersCallections.findOne(query)
      console.log(user?.role);
      const result = { admin: user?.role === 'admin' }
      res.send(result)
    })


    app.get('/api/v1/users', async (req, res) => {
      const result = await usersCallections.find({}).toArray()
      res.status(200).send(result)
    })


    app.post('/api/v1/jwt', async (req, res) => {
      const { email } = req.body
      const token = jwt.sign({ email: email }, `0689be11d6dfdc71455635308d90d590315729da4549b1a91fa35093c760143bbd07f564d81ee929719dab0a0ddc58bae21a065adfdf1d3d9fd1
4928947eaff3`, { expiresIn: '7d' })

      res.status(200).send(token)

    })


    // categor

    // private api
    app.post('/api/v1/categories', async (req, res) => {
      try {
        const categoryData = req.body

        const result = await categoryCollection.insertOne(categoryData)

        res.status(200).send(result)
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Server Error 500' });
      }
    })

    // public api
    app.get('/api/v1/categories', async (req, res) => {
      try {
        const result = await categoryCollection.find({}).toArray()


        res.status(200).send(result)
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Server Error 500' });
      }
    })

    // public api
    app.get('/api/v1/categories/:category', async (req, res) => {
      try {

        const category = req.params.category
        const result = await categoryCollection.find({ category }).toArray()


        res.status(200).send(result)
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Server Error 500' });
      }
    })

    app.post('/api/v1/content', async (req, res) => {
      try {
        const content = req.body

        const result = await contentCollection.insertOne(content)

        res.status(200).send(result)
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Server Error 500' });
      }
    })


    app.get('/api/v1/content', async (req, res) => {
      try {
        const result = await contentCollection.find({}).toArray()
        res.status(200).send(result)
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Server Error 500' });
      }
    })

    app.get('/api/v1/content/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updatedContent = await contentCollection.findOneAndUpdate({ _id: new ObjectId(id) }, { $inc: { view: 1 } }, { returnDocument: "after" })

        const result = await contentCollection.findOne({ _id: new ObjectId(id) })

        res.status(200).json({
          success: true,
          message: "Content found and view counted",
          content: result
        });

      } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Server Error 500' });
      }
    })

app.post('/api/v1/content/like/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body; 

    const result = await contentCollection.updateOne(
      { _id: new ObjectId(id) },
      { $addToSet: { likes: email } } 
    );

    res.status(200).json({
      success: true,
      message: "Liked successfully",
      result
    });

  } catch (error) {
    console.error("Like Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


app.delete('/api/v1/content/like/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const result = await contentCollection.updateOne(
      { _id: new ObjectId(id) },
      { $pull: { likes: email } } 
    );

    res.status(200).json({
      success: true,
      message: "Unliked successfully",
      result
    });

  } catch (error) {
    console.error("Unlike Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get('/api/v1/tranding', async (req, res) => {
  try {
    const result = await contentCollection.find({})
      .sort({ view: -1 })
      .toArray();
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Server Error 500' });
  }
})

app.patch('/api/categories/subcategories', async (req, res) => {
  try {
    const { categoryId, subcategories } = req.body;

    if (!categoryId || !Array.isArray(subcategories)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const result = await categoryCollection.updateOne(
      { _id: new ObjectId(categoryId) },
      { $addToSet: { subcategories: { $each: subcategories } } } // prevent duplicates
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Category not found or subcategories already exist" });
    }

    res.status(200).json({
      success: true,
      message: "Subcategories added successfully",
      result,
    });
  } catch (error) {
    console.error("Subcategory Update Error:", error);
    res.status(500).json({ message: "Server Error 500" });
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




