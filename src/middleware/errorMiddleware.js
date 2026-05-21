const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === 'ValidationError') {
    statusCode = 400;
  }

  if (err.code === 'P2002') {
    statusCode = 400;
    message = 'Cette valeur existe déjà';
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Enregistrement non trouvé';
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
