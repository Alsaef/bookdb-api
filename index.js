const express = require('express')
const cors = require('cors')

const jwt = require('jsonwebtoken')
const app = express()
const port = 3000

app.use(express.json())
app.use(cors())



const verifToken = async (req, res, next) => {
  const authHeader = req.headers?.authorization;
  console.log(authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'unauthorized access' })
  }


  const token = authHeader.split(' ')[1];

  try {
    const decoded =  jwt.verify(token,`0689be11d6dfdc71455635308d90d590315729da4549b1a91fa35093c760143bbd07f564d81ee929719dab0a0ddc58bae21a065adfdf1d3d9fd1
4928947eaff3`)
    req.decoded = decoded;
    next();
  } catch (error) {
    return res.status(401).send({ message: 'unauthorized access' })
  }

}


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



    const DB = client.db('bookDB')
    const categoryCollection = DB.collection('catagorys');
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


    app.get('/api/v1/users/admin/:email',verifToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = await usersCallections.findOne(query)
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




