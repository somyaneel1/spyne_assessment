const express = require('express');
const router = express.Router();
const authenticate = require('../middleware')
const { userController } = require('../controllers')

// User signup
router.post('/signup', userController.signup)

// User login
router.post('/login', userController.login)

// Update user
router.put('/update', authenticate, userController.update)

// Delete user
router.delete('/delete', authenticate, userController.delete)

// Get List of all users 
router.get('/', userController.listAll)

// Search user based on name
router.get('/search/:searchword', userController.search)

// Follow Another user based on email
router.post('/follow/:email', authenticate, userController.follow);

module.exports = router;
