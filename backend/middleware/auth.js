const jwt = require('jsonwebtoken');
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization');     

     const authHeader = req.header('Authorization');


     if (!authHeader) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }  
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }    
    try {

      // Extract token from 'Bearer <token>'
    const actualToken = authHeader.split(' ')[1];
    if (!actualToken) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
      const decoded = jwt.verify(actualToken, process.env.JWT_SECRET || 'fallback_secret');
      req.user = decoded;
      console.log('User authenticated:', decoded); // Add this for debugging
      return next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ error: 'Token is not valid' });
    }
  } catch (error) {     
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Server error in authentication' });
  }
};
module.exports = auth;