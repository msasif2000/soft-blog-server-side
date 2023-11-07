const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to Soft Blog');
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.alzohbu.mongodb.net/?retryWrites=true&w=majority`;

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
    const categoryCollection = client.db("softBlogDB").collection("categories");
    const blogsCollection = client.db("softBlogDB").collection("blogs");
    const wishListCollection = client.db("softBlogDB").collection("wishLists");

    app.post('/addCategory', async (req, res) => {
      const category = req.body;
      const result = await categoryCollection.insertOne(category);
      // console.log(result);
      res.send(result);
    })
    app.get('/category', async (req, res) => {
      const cursor = categoryCollection.find({});
      const categories = await cursor.toArray();
      res.send(categories);
    })

    app.post('/blogs', async (req, res) => {
      const blog = req.body;
      const result = await blogsCollection.insertOne(blog);
      res.send(result);
    })

    app.get('/allBlogs', async (req, res) => {
      const cursor = blogsCollection.find({}).sort({ date: -1 });
      const blogs = await cursor.toArray();
      res.send(blogs);
    })

    app.get('/featuredBlogs', async (req, res) => {
      const cursor = blogsCollection.find({}).sort({ details: 1 }).limit(4);
      const featuredBlogs = await cursor.toArray();
      res.send(featuredBlogs);
    })

  app.get('/allBlogs/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const blog = await blogsCollection.findOne(query);
    res.send(blog);

  })

  app.delete('/blogs/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await blogsCollection.deleteOne(query);
    res.send(result);
  })

  app.put('/allBlogs/:id', async (req, res) => {
    const id = req.params.id;
    const updatedBlog = req.body;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const blog = {
      $set: {
        title: updatedBlog.title,
        category: updatedBlog.category,
        image: updatedBlog.image,
        authorImg: updatedBlog.authorImg,
        shortDescription: updatedBlog.shortDescription,
        details: updatedBlog.details,
        date: updatedBlog.date,
      },
    };
    const result = await blogsCollection.updateOne(filter, blog, options);
    res.send(result);
  })

  app.post('/addWishList', async (req, res) => {
    const wishList = req.body;
    const result = await wishListCollection.insertOne(wishList);
    res.send(result);
  })

  app.get('/wishLists', async (req, res) => {
    const cursor = wishListCollection.find({});
    const wishLists = await cursor.toArray();
    res.send(wishLists);
  });

  app.get('/wishLists/:email', async (req, res) => {
    const email = req.params.email;
    //console.log(email);
    const query = { currentEmail: email };
    const wishList = await wishListCollection.find(query).toArray();
    res.send(wishList);
  })

  app.delete('/wishList/:_id', async (req, res) => {
    const id = req.params._id;
    const query = { _id: new ObjectId(id) };
    const result = await wishListCollection.deleteOne(query);
    res.send(result);
  })

  app.get('/profile', async (req, res) => {
    const cursor = blogsCollection.find({});
    const blogs = await cursor.toArray();
    res.send(blogs);
  })

  app.get('/profile/:email', async (req, res) => {
    const email = req.params.email;
    const query = { postAdminMail: email };
    const profile = await blogsCollection.find(query).toArray();
    res.send(profile);
  })
  // Send a ping to confirm a successful connection
  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
} finally {
  // Ensures that the client will close when you finish/error
  //await client.close();
}
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})