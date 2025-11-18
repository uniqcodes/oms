import jwt from "jsonwebtoken";

// Middleware: JWT Authentication
export const JWT_SECRET = process.env.JWT_SECRET;
export const authenticateToken = (req, res, next) => {
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
export const generateToken = (customerId) => {
  return jwt.sign(
    {
      customerId,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};
