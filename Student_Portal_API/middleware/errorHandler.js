function errorHandler(error, _req, res, _next) {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid input', details: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: 'Internal server error' });
}
module.exports = errorHandler;
