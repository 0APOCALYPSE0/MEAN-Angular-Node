const Post = require('../models/post');

exports.createPost = (req, res, next) => {
  const url = req.protocol+'://'+req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url+'/images/'+req.file.filename,
    creator: req.userData.userId
  });
  console.log(post);
  post.save((err, post) => {
    if(err){
      res.status(500).json({ message: 'Failed to add post' });
    }else{
      res.status(201).json({
        message: 'Post added successfully',
        post: { id: post._id, title: post.title, content: post.content, imagePath: post.imagePath, creator: req.userData.userId }
      });
    }
  });
}

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if(req.file){
    const url = req.protocol+'://'+req.get('host');
    imagePath = url+'/images/'+req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then(result => {
    console.log(result);
    if(result.matchedCount > 0){
      res.status(200).json({ message: 'update successful!'});
    }else{
      res.status(401).json({ message: 'Not authorized' });
    }
  })
  .catch(error => {
    res.status(500).json({ message: "Couldn't update post!" });
  });
}

exports.getPosts = (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if(pageSize && currentPage){
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  // Post.find((err, posts) => {
  //   if(err){
  //     res.json({ message: "Failed to fectch posts" });
  //   }else{
  //     res.status(200).json({
  //       message: 'Posts fetched successfully',
  //       posts: posts
  //     });
  //   }
  // });
  //Promise way
  postQuery.then((posts) => {
    fetchedPosts = posts;
    return Post.count();
  })
  .then(count => {
    res.status(200).json({
      message: 'Posts fetched successfully',
      posts: fetchedPosts,
      totalPosts: count
    });
  })
  .catch(() => {
    res.status(500).json({ message: "Failed to fetch posts" });
  });
}

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if(post){
      res.status(200).json(post);
    }else{
      res.status(404).json({ message: 'Post not found!' });
    }
  })
  .catch(() => {
    res.status(500).json({ message: "Failed to fetch post" });
  });;
}

exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }, (err, result) => {
    if(err){
      res.json({ message: 'Failed to delete post' });
    }else{
      if(result.deletedCount > 0){
        res.status(200).json({ message: 'Post deleted successfully', result: result })
      }else{
        res.status(401).json({ message: 'Not authorized' });
      }
    }
  });
}