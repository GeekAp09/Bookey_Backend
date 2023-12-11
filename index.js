// app.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes

const username = process.env.user;
const password = process.env.password;
const host = process.env.host;
const dbName = "Bookmarks";

const url = `mongodb+srv://${username}:${password}@${host}/${dbName}?retryWrites=true&w=majority`;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const bookmarkSchema = new mongoose.Schema({
  title: String,
  name: String,
  url: String,
  description: String,
  imageUrl: String,
});

const Bookmark = mongoose.model("linkData", bookmarkSchema, "linkData");

// Define a route to get all bookmarks
app.get('/', (req, res) => {
  res.send('Hello, Express is working!');
});

app.get("/api/bookmarks", async (req, res) => {
  try {
    const allBookmarks = await Bookmark.find();
    res.json(allBookmarks);
  } catch (error) {
    console.error("Error fetching bookmarks:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/addBookmark', async (req, res) => {
    try {
      const { url } = req.query;
  
      if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }
  
      // Fetch data from the link preview API
      const response = await axios.get(
        `https://link-previews.stephanbogner.de/api?url=${encodeURIComponent(url)}`
      );
      const linkPreviewData = response.data;
  
      // Add bookmark to the database using the provided function
      const newBookmark = new Bookmark({
        title: linkPreviewData.title,
        name: linkPreviewData.name,
        url: linkPreviewData.url,
        description: linkPreviewData.description,
        imageUrl: linkPreviewData.image,
      });
  
      const savedBookmark = await newBookmark.save();
  
      res.json({ success: true, message: 'Bookmark added successfully', bookmark: savedBookmark });
    } catch (error) {
      console.error('Error adding bookmark:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
