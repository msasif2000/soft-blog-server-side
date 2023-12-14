require('dotenv').config();
const express = require('express');
const cors = require('cors');
//const jwt = require('jsonwebtoken');
//const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// app.use(cors({
//   origin: ['http://127.0.0.1:5173', 'http://localhost:5173', 'https://soft-blogs.web.app', 'https://soft-blogs.firebaseapp.com'],
//   credentials: true
// }));
app.use(cors());
app.use(express.json());
//app.use(cookieParser());


//middleware
// const verifyToken = (req, res, next) => {
//   const token = req?.cookies?.token;
//   // console.log('token', token);
//   if (!token) {
//     return res.status(401).send({ message: 'unauthorized access ' })
//   }

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).send('unauthorized access')
//     }
//     req.user = decoded;
//     next();
//   })
// }

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
    //await client.connect();
    const categoryCollection = client.db("softBlogDB").collection("categories");
    const blogsCollection = client.db("softBlogDB").collection("blogs");
    const wishListCollection = client.db("softBlogDB").collection("wishLists");
    const commentsCollection = client.db("softBlogDB").collection("comments");
    const reactionCollection = client.db("softBlogDB").collection("reactions");




    //Auth api
    // app.post('/jwt', async (req, res) => {
    //   const user = req.body;
    //   //console.log('user for token', user);
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    //   res.cookie('token', token, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === 'production',
    //     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    //   })
    //     .send({ status: true })
    // })

    // app.post('/logout', async (req, res) => {
    //   const user = req.body;
    //   //console.log('logout', user);
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    //   res.clearCookie('token', { maxAge: 0, httpOnly: true, secure: true, sameSite: 'none' })
    //     .send({ success: true })
    // })


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
      const cursor = blogsCollection.find({}).sort({ currentDate: -1 });
      const blogs = await cursor.toArray();
      res.send(blogs);
    })

    // app.get('/featuredBlogs', async (req, res) => {
    //   const cursor = blogsCollection.find({}).sort({ "details.length": -1 }).limit(10);
    //   const featuredBlogs = await cursor.toArray();
    //   res.send(featuredBlogs);
    // })

    app.get('/featuredBlogs', async (req, res) => {
      const cursor = blogsCollection.aggregate([
          {
              $project: {
                  _id: 1,
                  title: 1,
                  category: 1,
                  postAdminMail: 1,
                  image: 1,
                  authorImg: 1,
                  shortDescription: 1,
                  details: 1,
                  currentDate: 1,
                  date: 1,
                  detailsLength: { $strLenCP: "$details" }
              }
          },
          { $sort: { detailsLength: -1 } },
          { $limit: 10 }
      ]);
  
      const featuredBlogs = await cursor.toArray();
      res.send(featuredBlogs);
  });

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
          currentDate: updatedBlog.currentDate,
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
      //console.log('cookies', req.cookies);
      // if(req.user.email !== email){
      //   return res.status(401).send({ message: 'unauthorized access ' })
      // }
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

    //reaction
    app.post('/addReaction', async (req, res) => {
      const reaction = req.body;
      const result = await reactionCollection.insertOne(reaction);
      res.send(result);
    })
    app.get('/reactions', async (req, res) => {
      const cursor = reactionCollection.find({});
      const reactions = await cursor.toArray();
      res.send(reactions);
    });
    app.get('/reactions/:id', async(req, res) => {
      const id = req.params.id;
      const query = { blogId: id };
      const reactions = await reactionCollection.find(query).toArray();
      res.send(reactions);
    })

    app.get('/reactionsState/:email', async (req, res) => {
      const email = req.params.email;
      const query = { currentEmail: email };
      const reactions = await reactionCollection.find(query).toArray();
      res.send(reactions);
    });
    

    app.delete('/reaction/:_id', async (req, res) => {
      const id = req.params._id;
      const query = { _id: new ObjectId(id) };
      const result = await reactionCollection.deleteOne(query);
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
      const profile = await blogsCollection.find(query).sort({ currentDate: -1 }).toArray();
      res.send(profile);
    })

    app.post('/addComment', async (req, res) => {
      const comment = req.body;
      const result = await commentsCollection.insertOne(comment);
      res.send(result);
    })

    app.get('/comments', async (req, res) => {
      const cursor = commentsCollection.find({});
      const comments = await cursor.toArray();
      res.send(comments);
    })

    app.get('/comments/:id', async (req, res) => {
      const id = req.params.id;
      const query = { blogId: id };
      const comments = await commentsCollection.find(query).toArray();
      res.send(comments);
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