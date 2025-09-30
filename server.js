const express = require("express");
const { generateToken } = require("./src/api/middleware/auth");
const orderRoutes = require("./src/api/routes/orderRoutes");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

// Configuration
const PORT = 3000;

// Error response
const errorResponse = (res, status, error, message, details = null) => {
  const response = { error, message };
  if (details) response.details = details;
  return res.status(status).json(response);
};

// ============== Generat a valid customer id ==============
app.get("/v1/generate-uid", (req, res) => {
  const customerId = `user-${uuidv4().split("-")[0]}`;
  res.json({ customerId });
});

// ============== AUTH ENDPOINT (for testing) ==============
app.post("/auth/token", (req, res) => {
  const { customerId } = req.body;

  if (!customerId) {
    return errorResponse(
      res,
      400,
      "VALIDATION_ERROR",
      "customerId is required"
    );
  }

  const token = generateToken(customerId);
  res.json({ token, expiresIn: "24h" });
});

// ============== ORDER ROUTES ==============
app.use("/v1/orders", orderRoutes);

// ============== SERVER STARTUP ==============
app.listen(PORT, () => {
  console.log(`Mock Order API running on http://localhost:${PORT}`);
  console.log(`\n Sample requests:`);
  console.log(
    `0. Get a valid user id: curl -X GET http://localhost:${PORT}/dev/generate-uid -H "Content-Type: application/json"`
  );
  console.log(
    `1. Get a token: curl -X POST http://localhost:${PORT}/auth/token -H "Content-Type: application/json" -d '{"username":"test"}'`
  );
  console.log(
    `2. Create order: curl -X POST http://localhost:${PORT}/v1/orders -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"customerId":"CUST-123"}'`
  );
  console.log(
    `3. Search orders: curl "http://localhost:${PORT}/v1/orders?customerId=CUST-123" -H "Authorization: Bearer YOUR_TOKEN"`
  );
  console.log(
    `4. Update status: curl -X POST http://localhost:${PORT}/v1/orders/ORD-XXX/status -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"status":"confirmed"}'`
  );
});

module.exports = app;
