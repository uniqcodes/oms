const jwt = require("jsonwebtoken");

const JWT_SECRET = "your-secret-key-change-in-production";

// Middleware: JWT Authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "UNAUTHORIZED",
      message: "No token provided",
    });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Invalid or expired token",
      });
    }
    req.user = user;
    next();
  });
};

// Generate JWT token
const generateToken = (customerId) => {
  return jwt.sign(
    {
      customerId,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

module.exports = {
  authenticateToken,
  generateToken,
  JWT_SECRET,
};
