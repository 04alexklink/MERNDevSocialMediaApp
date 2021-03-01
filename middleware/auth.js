const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  const token = req.header('x-auth-token')
  if(!token) {
    res.status(401).json({msg: 'No token, authorisation denied'})
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret)
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({msg: 'Token is not valid'})
  }
}