const User = require('../models/user.js');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const { validationResult } = require('express-validator');


exports.signup = async (req, res, next) => {
    const errors = validationResult(req);

    
    console.log(errors);

    
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered signup data is not correct')
        error.statusCode = 422;
        error.data = errors.array(); // we didnt do that before but this would allow me to keep my errors which were retrieved by that validation package

        throw error;
    }
    console.log('just looking for bugs');

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const user = new User({
            email: email,
            name: name,
            password: hashedPassword
        });

        const result = await user.save();
    
        res.status(201).json({
            message: 'User created!',
            userId: result._id
        })
    }
    catch (err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }

};
















exports.login = async (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    try {
        const user = await User.findOne({email: email});

        if(!user){
            const error = new Error('A user with this email could not be found');
            error.statusCode = 401;
            throw error;
        }

        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
    
        if(!isEqual){
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error
        }

        const token = jwt.sign(
            {
                // dont store the raw password here because that would be returned to the frontend
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            'somesupersecretsecret',  // the second argument is the secret so that the private key which is used for the signing and its only knwon in the server
            {expiresIn: '1h'}
        );

        res.status(200).json({
            token: token,
            userId: loadedUser._id.toString()
        });

    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }

};














exports.getUserStatus = async (req, res, next) => {

    const userId = req.userId;

    try {
        const user = await User.findById(userId)

        if(!user){
            const error = new Error('USer not found!!');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            message: 'Fetched status successfully',
            status: user.status
        })
            
    }
    catch( err ) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }


};











exports.updateUserStatus = async (req, res, next) => {

    const newStatus = req.body.status;

    try{

        const user = await User.findById(req.userId);

        if(!user){
            const error = new Error('USer not found!!');
            error.statusCode = 404;
            throw error;
        }

        user.status = newStatus;
        await user.save();
            
        res.status(200).json({
            message:' Status updated!',
            // could i send something else ?? ( answer : max didnt)
        })
    }

    catch (err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

