const jwt = require('jsonwebtoken');
// Middleware to authenticate JWT token
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')//.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(401).send('Unauthorized');
    }
};

module.exports = authenticate