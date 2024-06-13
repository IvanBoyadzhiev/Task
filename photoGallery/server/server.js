import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { uploadFile, deleteFile, getObjectSignedUrl } from "./services/s3.js";
import dotenv from 'dotenv';
dotenv.config();


const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

let posts = [];
let postId = 1;

app.get("/api/posts", async (req, res) => {
  const allPosts = await Promise.all(
    posts.map(async (post) => {
      post.imageUrl = await getObjectSignedUrl(post.imageName);
      return post;
    })
  );
  res.send(allPosts);
});

app.post("/api/posts", upload.single("image"), async (req, res) => {
  const file = req.file;
  const caption = req.body.caption;
  const imageName = generateFileName();

  const fileBuffer = file.buffer;

  await uploadFile(fileBuffer, imageName, file.mimetype);

  const post = {
    id: postId++,
    imageName,
    caption,
    created: new Date(),
  };

  posts.push(post);

  res.status(200).send(post);
});

app.delete("/api/posts/:id", async (req, res) => {
  const id = +req.params.id;
  const postIndex = posts.findIndex((post) => post.id === id);

  if (postIndex === -1) {
    return res.status(400).send({ error: "Post not found" });
  }

  const post = posts[postIndex];

  await deleteFile(post.imageName);
  posts.splice(postIndex, 1);

  res.send(post);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("connected to db and listening on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
