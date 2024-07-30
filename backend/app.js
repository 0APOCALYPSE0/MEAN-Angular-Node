const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');
const passport = require('passport');
require('./middleware/passport-config');

//connect to mongodb
mongoose.connect('mongodb://localhost:27017/mean-course');

//on connaction
mongoose.connection.on('connected', () => {
  console.log('Connected to database mongodb @ 27017');
});

mongoose.connection.on('error', (err) => {
  if(err){
      console.log('Error in database connection: ', err);
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  next();
});

app.use(passport.initialize())

app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes);

module.exports = app;