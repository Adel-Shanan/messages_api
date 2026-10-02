const { check, body } = require('express-validator');

exports.postPostsValidator = [

    body('title').trim().isLength({min:5}),
    body('content').trim().isLength({min:5}),    
];
