require('dotenv').config();

const path = require('path');
const fs = require('fs')

const express = require('express');
const bodyParser = require('body-parser');


const mongoose = require('mongoose');


const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./util/cloudinary');

const User = require('./models/user.js');



const helmet = require('helmet');

const compression = require('compression');
const morgan = require('morgan');



const MONGODB_URI =  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@nodecoursecluster.ifg3pyi.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority&appName=nodeCourseCluster`;


const app = express();



//added b me 

app.use(helmet(
  {
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "https://js.stripe.com"],
        "frame-src": ["'self'", "https://js.stripe.com"],
        "img-src": [
          "'self'",
          "data:",
          "https://res.cloudinary.com"
        ],
      }
    },
  })
);
app.use(compression());
app.use(morgan('combined'));

console.log(process.env.NODE_ENV);
////


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'messages',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});


const feedRoutes = require('./routes/feed.js');
const authRoutes = require('./routes/auth.js');



// app.use(bodyyParser.urlencoded({extended: false})); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use(multer({storage:storage}).single('image'))

//app.use('/images', express.static(path.join(__dirname, 'images')));





// this to avoid CORS Errors 
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // (*) here means wildcard You could lock it down to specific domains though if you wanted to
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // we can use wildcard
    next();
})



app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);


app.use( (error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;

    const data = error.data;

    res.status(status).json({message: message, data: data});
});



mongoose.connect( MONGODB_URI )
        .then(result => {
          
          const PORT = process.env.PORT || 8080;

          app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
          });
          
        })
        .catch(err => console.log(err));
