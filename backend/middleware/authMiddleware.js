const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ success: false, message: 'Authentication required.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    const userId = decoded.id || decoded.userId || decoded.user_id || decoded.sub;
    if (!userId) return res.status(401).json({ success: false, message: 'Authenticated user id is missing.' });
    req.user = { ...decoded, id: userId, userId };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

module.exports = authMiddleware;
