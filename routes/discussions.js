const express = require('express');
const router = express.Router();
const authenticate = require('../middleware')
const { discussionController } = require('../controllers')
// CRUD operations for discussions

// Create a new discussion
router.post('/', authenticate, discussionController.create)

// Retrieve all discussions
router.get('/', discussionController.listAll)

// Update a discussion
router.put('/:id', authenticate, discussionController.update)

// Delete a discussion
router.delete('/:id', authenticate, discussionController.delete)

// Get discussions based on tags
router.get('/tags/:tagslist', discussionController.searchTags)

// Get discussions based on text field
router.post('/search', discussionController.searchText)

// Push comments on a discussion
router.post('/:id/comments', authenticate, discussionController.pushComment)

// Push likes on discussion
router.post('/:id/likes', authenticate, discussionController.likeDiscussion)

// Push likes on a comment
router.post('/comments/:id/likes', authenticate, discussionController.likeComment)

// Update a comment
router.put('/comments/:id', authenticate, discussionController.updateComment)

// Delete a comment
router.delete('/comments/:id', authenticate, discussionController.deleteComment)

// Get a Discussion and update view count
router.put('/views/:id', discussionController.viewsCounter)


module.exports = router