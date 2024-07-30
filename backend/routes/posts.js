const express = require('express');
const router = express.Router();
const { normalAuth, passportAuth } = require('../middleware/check-auth');
const extractFile = require('../middleware/file');
const PostsController = require('../controllers/posts');
const passport = require('passport');

router.post('', passportAuth, extractFile, PostsController.createPost);

router.put('/:id', passportAuth, extractFile, PostsController.updatePost);

router.get('', PostsController.getPosts);

router.get('/:id', PostsController.getPost);

router.delete('/:id', normalAuth, PostsController.deletePost);

module.exports = router;