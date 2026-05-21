const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ message: 'Accès refusé. Réservé aux administrateurs.' });
  }
};

module.exports = { admin };
