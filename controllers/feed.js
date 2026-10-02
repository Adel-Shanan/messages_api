const fs = require('fs');
const path = require('path');


const fileHelper = require('../util/file.js');
const { validationResult } = require('express-validator');

const io = require('../socket.js');

const Post = require('../models/post.js');
const User = require('../models/user.js');


exports.getPosts = async (req, res, next) => {

    const currentPage = req.query.page || 1;
    const perPage = 2;
    
    try{
        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find()
                            .populate('creator')
                            .sort({createdAt: -1})
                            .skip( (currentPage - 1) * perPage )
                            .limit(perPage);

            res.status(200).json({
                message: 'Fetched posts successfully',
                posts: posts,
                totalItems: totalItems
            });
    }

    catch ( err ) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    };

};

















exports.postPosts = async (req, res, next) => {

    const errors = validationResult(req);

    const image = req.file;
    const title = req.body.title;
    const content = req.body.content;

    console.log(errors);
    
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is not correct')
        error.statusCode = 422;

        throw error;
    }
    console.log('just looking for bugs');

    console.log(image);

    if(!image){
        const error = new Error('no image provided!!');
        error.statusCode = 422;
        throw error;
    }

    // here this didnt worked
    //const imageUrl = '\\' + image.path;
    //or i can use this chat chat gpt tell its better one  because of the diffrent between '/' and '\'
    const imageUrl = image.path;  

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    });

    try {
        const result = await post.save();
        console.log(result);

        const user = await User.findById(req.userId);

        user.posts.push(post);

        await user.save();


        // the parametores are all up to us ( th 1st is the channel name and 2nd os the data you want to share)
        io.getIO().emit('posts', {
            action: 'create',
            post: {
                ...post._doc,
                creator:{
                    _id: req.userId,
                    name: user.name
                }
            }
        })


        res.status(201).json({
            message:'a post has been created!',
            post: post,
            creator: {_id: user._id, name: user.name }
            }
        );

    }
    catch (err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }

};















exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;

    try { 
        const post = await Post.findById(postId);

        if(!post){
            const error = new Error('Could not find post.');
            error.statusCode = 404;

            throw error;
        }

        res.status(200).json({
            message: 'post Fetched',
            post: post
        })
    }

    catch (err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
};













exports.updatePost = async (req, res, next) => {
    const errors = validationResult(req);

    console.log(errors);
    

    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is not correct')
        error.statusCode = 422;

        throw error;
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;


    let imageUrl = req.body.image;
    if(req.file){
        imageUrl = req.file.path;
    }


    if(!imageUrl){
        const error = new Error('No file picked');
        error.statusCode = 422;
        throw error;
    }

    try {
        const post = await Post.findById(postId).populate('creator');
    
        if(!post){
        const error = new Error('Could not find post.');
            error.statusCode = 404;

            throw error;
        }

        // this is to only allow user who created the post to update it
        if(post.creator._id.toString() !== req.userId){
            const error = new Error(' Not authorized! to update');
            error.statusCode = 403;
            throw error;
        }

        if(imageUrl !== post.imageUrl){
            // remember this is from util folder
            await cloudinary.uploader.destroy(product.imagePublicId);
        }

        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
            
        // i stored the result because we are using it 
        const result = await post.save();

        io.getIO().emit('posts', {
            action: 'update',
            post: result
        })
            
        res.status(200).json({
            message:' Post updated!',
            post: result

        })
    }
    catch (err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
};
















exports.deletePost = async (req, res, next) => {

    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId);
        
        if(!post){
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            
            throw error;
        }

        // this is to only allow user who created the post to delete it
        if(post.creator.toString() !== req.userId){
            const error = new Error(' Not authorized to delete!');
            error.statusCode = 403;
            throw error;
        }

        cloudinary.uploader.destroy(product.imagePublicId);

        // here we dont use the result so we can just type await
        await Post.findByIdAndDelete(postId);
        
        const user = await User.findById(req.userId);
        
        user.posts.pull(postId);
        await user.save();

        io.getIO().emit('posts', {
            action: 'delete',
            post: postId
        })
        
        res.status(200).json({message: 'Deleted Post is done'})
    }
    catch (err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }

};