const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User, Discussion } = require('../models')

module.exports = {
    userController: {

        signup: async (req, res) => {
            const { name, mobile, email, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ name, mobile, email, password: hashedPassword });
            await newUser.save().then(() => {
                res.status(201).send('User created successfully');
            }, (err) => {
                res.status(405).send(`Not Allowed! User with same ${Object.keys(err.keyPattern).join(', ')} already exists!`)
            });
        },

        login: async (req, res) => {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(404).send('User not found');
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return res.status(401).send('Invalid credentials');
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ token });
        },

        update: async (req, res) => {
            const { name, mobile, email, password } = req.body;
            const hashedPassword = password && await bcrypt.hash(password, 10);
            const modUser = await User.findByIdAndUpdate(req.userId, { name, mobile, email, password: hashedPassword })
            await modUser.save();
            res.status(200).send('User Details modified succesfully')
        },

        delete: async (req, res) => {
            await User.findByIdAndDelete(req.userId).then(() => {
                res.status(200).send('User Deleted')
            }, (err) => {
                res.status(404).send("User not found")
            })
        },

        listAll: async (req, res) => {
            const result = await User.find({}, ["name", "email"])
            res.status(200).json(result)
        },

        search: async (req, res) => {
            const { searchword } = req.params;
            const result = await User.find({ "name": { "$regex": `^${searchword}`, "$options": "i" } }, ["name", "email"])
            res.status(200).json(result)
        },

        follow: async (req, res) => {
            const user = await User.findById(req.userId);
            const followUser = await User.findOne({ "email": req.params.email });
            if (!user.following.includes(followUser._id)) {
                user.following.push(followUser._id);
                followUser.followers.push(user._id);
                await user.save();
                await followUser.save();
            }
            res.send('Followed user successfully');
        }

    },
    discussionController: {

        create: async (req, res) => {
            const { text, image, hashtags } = req.body;
            const newDiscussion = new Discussion({
                text,
                image,
                hashtags,
                createdBy: req.userId
            });
            await newDiscussion.save().then(() => {
                res.status(201).send('Discussion created successfully');
            });
        },

        listAll: async (req, res) => {
            const allDiscussions = await Discussion.find({})
            res.status(200).json(allDiscussions)
        },

        update: async (req, res) => {
            await Discussion.findByIdAndUpdate(req.params.id, req.body).then(() => {
                res.status(201).send('Discussion updated successfully');
            }, (err) => {
                res.status(400).json(err)
            })
        },

        delete: async (req, res) => {
            await Discussion.findByIdAndDelete(req.params.id, req.body).then(() => {
                res.status(201).send('Discussion deleted successfully');
            }, () => {
                res.status(400).send("Some error encountered during deletion of this Discussion")
            })
        },

        searchTags: async (req, res) => {
            const { tagslist } = req.params
            const tagsArray = tagslist.split('+')
            await Discussion.find({ "hashtags": { $in: tagsArray } })
                .then((results) => {
                    res.status(200).json(results);
                }, () => {
                    res.status(200).send("Error encountered")
                })
        },

        searchText: async (req, res) => {
            const { searchStr } = req.body
            await Discussion.find({ "text": { "$regex": `^${searchStr}`, "$options": "i" } })
                .then((results) => {
                    res.status(200).json(results);
                }, () => {
                    res.status(200).send("Error encountered")
                })
        },

        pushComment: async (req, res) => {
            const discussion = await Discussion.findById(req.params.id);
            const { text } = req.body;
            discussion.comments.push({ text, createdBy: req.userId });
            await discussion.save();
            res.status(200).send('Comment added successfully');
        },

        likeDiscussion: async (req, res) => {
            const discussion = await Discussion.findById(req.params.id);
            if (!discussion.likes.includes(req.userId)) {
                discussion.likes.push(req.userId);
                await discussion.save();
            }
            res.send('Liked discussion successfully');
        },

        likeComment: async (req, res) => {
            const discussion = await Discussion.findOne({ "comments._id": req.params.id });
            const comment = discussion.comments.id(req.params.id);
            if (!comment.likes.includes(req.userId)) {
                comment.likes.push(req.userId);
                await discussion.save();
            }
            res.send('Liked comment successfully');
        },

        updateComment: async (req, res) => {
            const discussion = await Discussion.findOne({ "comments._id": req.params.id });
            const comment = discussion.comments.id(req.params.id);
            comment.text = req.body.text;
            await discussion.save();
            res.send('Comment updated successfully');
        },

        deleteComment: async (req, res) => {
            const discussion = await Discussion.findOne({ "comments._id": req.params.id });
            discussion.comments.id(req.params.id).deleteOne();
            await discussion.save();
            res.send('Comment deleted successfully');
        },

        viewsCounter: async (req, res) => {
            const discussion = await Discussion.findById(req.params.id);
            discussion.views += 1;
            await discussion.save();
            res.status(200).json(discussion);
        },

    }
}