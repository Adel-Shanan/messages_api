const { check, body } = require('express-validator');

const User = require('../models/user.js');

exports.signupValidator = [

    body('email').isEmail().withMessage('Please enter a valid email.')
    .custom( (value, { req }) => {

        return User.findOne({email: value})
        .then(userDoc => {
            if(userDoc){
                return Promise.reject('E-mail address already exists!');
            }
        })
    })
    .normalizeEmail(),

    body('password').trim().isLength({min: 5}),

    
    body('name').trim().not().isEmpty()

];



exports.statusValidator = [

    body('status').trim().not().isEmpty()

];

