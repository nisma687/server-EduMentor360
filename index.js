const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();



app.use(cors());
app.use(express.json());
console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.231nuf3.mongodb.net/?retryWrites=true&w=majority`;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
    const userCollection = client.db("eduMentor360").collection("users");

    const sponsorCollection=client.db("eduMentor360").collection("sponsors");

    const teacherRequestCollection=client.db("eduMentor360").collection("teacherRequest");

    const courseRequestCollection=client.db
    ("eduMentor360").collection("courseRequest");

    const paymentCollection=client.db("eduMentor360").collection("payments");

    // sponsors
    app.get('/sponsors',async(req,res)=>{
      const cursor = sponsorCollection.find();
      const sponsors = await cursor.toArray();
      res.send(sponsors);
    });
    // users 
    app.get('/users',async(req,res)=>{
      const cursor = userCollection.find();
      const users = await cursor.toArray();
      res.send(users);
    });
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existUser = await userCollection.findOne(query);
      if (existUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.patch('/users/:email',async(req,res)=>{
      const email=req.params.email;
      const query={email:email};
      const updatedUser=req.body;
      const updateDoc={
        $set:{
          role:updatedUser.role
        }
      }
      const result=await userCollection.updateOne(query,updateDoc);
      res.send(result);
    
    })
    // teacher request
    app.post('/teacherRequest', async (req, res) => {
      const teacherRequest = req.body;
      const query = { email: teacherRequest.email }
      const existUser = await teacherRequestCollection.findOne(query);
      if (existUser) {
        return res.send({ message: 'already have requested once', insertedId: null });
      }
      const result = await teacherRequestCollection.insertOne(teacherRequest);
      res.send(result);
    });
    app.get('/teacherRequest',async(req,res)=>{
      const cursor = teacherRequestCollection.find();
      const teacherRequests = await cursor.toArray();
      res.send(teacherRequests);
    });
    app.patch('/teacherRequest/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)};
      const updatedTeacherRequest=req.body;
      const updateDoc={
        $set:{
          status:updatedTeacherRequest.status,
          role:"teacher"
        }
      }
      const result=await teacherRequestCollection.updateOne(query,updateDoc);
      res.send(result);
    });
    app.delete('/teacherRequest/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)};
      const result=await teacherRequestCollection.deleteOne(query);
      res.send(result);
    });
    app.get('/teacherRequest/:email',async(req,res)=>{
      const email=req.params.email;
      const query={email:email};
      const result=await teacherRequestCollection.findOne(query);
      res.send(result);
    
    });
    //add course request
    app.post('/addCourseRequest', async (req, res) => {
      const courseRequest = req.body;
      const result = await courseRequestCollection.insertOne(courseRequest);
      res.send(result);
    });
    app.get('/addCourseRequest',async(req,res)=>{
      const cursor = courseRequestCollection.find();
      const courseRequests = await cursor.toArray();
      res.send(courseRequests);
    });
    app.patch('/addCourseRequest/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)};
      const updatedCourseRequest=req.body;
      const updateDoc={
        $set:{
          status:updatedCourseRequest.status
        }
      }
      const result=await courseRequestCollection.updateOne(query,updateDoc);
      res.send(result);
    });
    app.get('/addCourseRequest/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)};
      const result=await courseRequestCollection.findOne(query);
      res.send(result);
    });
    // payment-intent
    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      console.log(amount, 'amount inside the intent');

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret
      })
    });

    app.post('/payments', async (req, res) => {
      const payment = req.body;
      const result = await paymentCollection.insertOne(payment);
      res.send(result);
    });
    app.get('/payments',async(req,res)=>{
      const cursor = paymentCollection.find();
      const payments = await cursor.toArray();
      res.send(payments);
    });
    app.get('/payments/:email',async(req,res)=>{
      const email=req.params.email;
      const query={email:email};
      const result=await paymentCollection.findOne(query);
      res.send(result);
    });
    // app.get('/payments/:id',async(req,res)=>{
    //   const id=req.params.id;
    //   console.log(id);
    //   const query={_id:new ObjectId(id)};
    //   const result=await paymentCollection.findOne(query);
    //   res.send(result);
    // });






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('EduMentor-360 server is running');
})


app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})