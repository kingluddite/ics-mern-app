// 3rd party dependencies
const express = require('express');
const { check, validationResult } = require('express-validator');

// authentication
const auth = require('../../../middleware/auth');

// Bring in our models
const User = require('../../../models/User');
const Profile = require('../../../models/Profile');
const Post = require('../../../models/Post');

const router = express.Router();

// @route    POST api/v1/posts
// @desc     Create a post
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Post content is required')
        .not()
        .isEmpty(),
    ],
  ],

  async (req, res) => {
    const { id } = req.user;
    const { text } = req.body;

    // error checking
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // find the user using the user token
      const { name, avatar } = await User.findById(id).select(
        '-hashed_password'
      );

      const newPost = new Post({
        text,
        name,
        avatar,
        user: id,
      });

      // save newly created post and store the post added in a variable
      const post = await newPost.save();

      // return the post to the client (react)
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route.    GET api/v1/posts
// @desc.     Get all posts
// @access.   Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ data: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route.    GET api/v1/posts/:post_id
// @desc.     Get a single post
// @access.   Private
router.get('/:post_id', auth, async (req, res) => {
  try {
    const { post_id: postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ msg: 'No post found' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);

    // if err.kind equals 'ObjectId' then it is not a valid object id
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No post found' });
    }

    res.status(500).send('Server Error');
  }
});

// @route.    DELETE api/posts/:post_id
// @desc.     Delete post by ID
// @access.   Private
router.delete('/:post_id', auth, async (req, res) => {
  try {
    // get the post id off of the URL
    const { post_id: postId } = req.params;
    // get the user id from the user object authentication gives us
    const { id: userId } = req.user;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ msg: 'No post found' });
    }

    // Check user is owner of post
    // post.user is an ObjectId type
    // req.user.id is a string
    if (post.user.toString() !== userId) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // we know it's the owner
    await post.remove();

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No post found' });
    }

    res.status(500).send('Server Error');
  }
});

// @route.    PUT api/posts/likes/:post_id
// @desc.     Like a post
// @access.   Private
router.put('/likes/:post_id', auth, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { post_id: postId } = req.params;
    const post = await Post.findById(postId);

    // check if the post has already been liked
    if (post.likes.filter(like => like.user.toString() === userId).length > 0) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: userId });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

// @route.    PUT api/v1/posts/unlikes/:post_id
// @desc.     Unlike a post
// @access.   Private
router.put('/unlikes/:post_id', auth, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { post_id: postId } = req.params;
    const post = await Post.findById(postId);

    // check if the post has already been liked
    if (
      post.likes.filter(like => like.user.toString() === userId).length === 0
    ) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    // get remove index
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(userId);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

// @route    POST api/v1/posts/comments/:post_id
// @desc     Comment on a post
// @access   Private
router.post(
  '/comments/:post_id',
  [
    auth,
    [
      check('text', 'Please add text')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const { post_id: postIdUrl } = req.params;
    const { id: userIdReq } = req.user;
    // error checking
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Get the user
      const user = await User.findById(userIdReq).select('-hashed_password');
      // Get a post (that we are commenting on)
      const post = await Post.findById(postIdUrl);

      // note: comments are not a new collection in the Database
      // so we don't need to create a new comment (like we did with post)
      // instead we just create a newComment object
      // destructure
      const { text } = req.body;
      const { name, avatar } = user;
      const newComment = {
        text,
        name,
        avatar,
        user: userIdReq,
      };

      // We need to add this new comment onto the post comments array
      // We wan to place the comment not at the end but at the beginning of the array
      // So we unshift() (rather than push())
      post.comments.unshift(newComment);

      // No need to save the post in a variable
      // but we do need to save it to our Database
      await post.save();

      // Send back all the comments to the client (react)
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route.    DELETE api/v1/posts/comments/:post_id/:comment_id
// @desc.     Delete a comment
// @access.   Private
router.delete('/comments/:post_id/:comment_id', auth, async (req, res) => {
  try {
    const { post_id: postIdUrl } = req.params;
    const { comment_id: commentIdUrl } = req.params;
    const { id: userIdReq } = req.user;
    // Get the post
    const post = await Post.findById(postIdUrl);

    // Pull out comment from post we found
    const comment = post.comments.find(item => item.id === commentIdUrl);

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    // Check user to see if they are the owner of comment
    // post.comments.user is a type of ObjectId
    // userIdReq is a string
    // as we did before to make this work we need to convert the ObjectId to a string
    // with post.user.toString()
    if (comment.user.toString() !== userIdReq) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Get remove index
    const removeIndex = post.comments
      .map(item => item.user.toString())
      .indexOf(userIdReq);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No post found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
