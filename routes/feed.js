const express = require('express');

const feedController = require('../controllers/feed.js');

const feedValidator= require('../validators/feed.js');

const isAuth = require('../middleware/is-auth.js')

const router = express.Router();


// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// POST /feed/post
router.post('/post', isAuth, feedValidator.postPostsValidator, feedController.postPosts);


router.get('/post/:postId', isAuth, feedController.getPost);


// image validating is done directly in the controller 
router.put('/post/:postId', isAuth, feedValidator.postPostsValidator, feedController.updatePost)


router.delete('/post/:postId', isAuth, feedController.deletePost)




module.exports = router;