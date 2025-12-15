const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  let token = null;

  // 1️⃣ Read x-auth-token (your current frontend)
  if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  // 2️⃣ Also support Authorization: Bearer TOKEN (future-proof)
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ msg: 'No token, access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};
