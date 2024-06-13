const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);

// Schemas and Models
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const discussionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    image: { type: String },
    hashtags: [{ type: String }],
    createdOn: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [{
        text: String,
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);
const Discussion = mongoose.model('Discussion', discussionSchema);

module.exports = { User, Discussion }