const { User } = require("../models/user");
const { Post, validatePost } = require("../models/post");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const express = require("express");
const router = express.Router();

//* Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    return res.send(users);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* DELETE a single user from the database
router.delete("/:userId", [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user)
      return res
        .status(400)
        .send(`User with id ${req.params.userId} does not exist!`);
    await user.remove();
    return res.send(user);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* POST a single post to a user's posts sub-document
//! Need to create the post in posts.js first, query for user.name
//! Then use response with post.id to make this request
router.post("/:userId/posts/:postId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user)
      return res
        .status(400)
        .send(`User with id ${req.params.userId} does not exist!`);

    const post = await Post.findById(req.params.postId);
    if (!post)
      return res
        .status(400)
        .send(`The post with id ${req.params.postId} does not exist!`);

    user.posts.push(post);
    await user.save();
    return res.send(user.posts);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* PUT a single post in a user's posts sub-document
//! Will need to make a request to this route when updating a post in posts.js
router.put("/:userId/posts/:postId", auth, async (req, res) => {
  try {
    const { error } = validatePost(req.body);
    if (error) return res.status(400).send(error);

    const user = await User.findById(req.params.userId);
    if (!user)
      return res
        .status(400)
        .send(`User with id ${req.params.userId} does not exist!`);

    const postToUpdate = await user.posts.id(req.params.postId);
    if (!postToUpdate)
      return res
        .status(400)
        .send(`Post with id ${req.params.id} does not exist!`);

    postToUpdate.title = req.body.title;
    postToUpdate.content = req.body.content;
    postToUpdate.image = req.body.image;
    (postToUpdate.createdBy = req.body.createdBy), await user.save();
    return res.send(postToUpdate);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* DELETE a single post from a user's posts sub-document
//! This will need to trigger when a post is deleted in posts
router.delete("/:userId/posts/:postId", auth, async (req, res) => {
  try {
    let user = await User.findById(req.params.userId);
    console.log(user);
    if (!user)
      return res
        .status(400)
        .send(`User with id ${req.params.userId} does not exist!`);

    let postToDelete = await user.posts.id(req.params.postId);
    if (!postToDelete)
      return res
        .status(400)
        .send(`Post with id ${req.params.postId} does not exist!`);

    postToDelete = await postToDelete.remove();
    user.save();
    return res.send(postToDelete);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

module.exports = router;