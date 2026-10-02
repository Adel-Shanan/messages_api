const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    imageUrl:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    creator:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, {timestamps: true})   //this is an option we pass to the schema and in that object we are passing as a second argument to the schema constructor, and bu passing it mongoose will automatically add timestamps when a new object is added to the database  so we automaticall get createdAt and updatedAt timestamps out of the box


module.exports = mongoose.model('Post', postSchema);