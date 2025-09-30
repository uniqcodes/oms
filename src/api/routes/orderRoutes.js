const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const orderController = require("../controllers/orderController");

// Create Order
router.post("/", authenticateToken, orderController.createOrder);

// Search Orders
router.get("/", authenticateToken, orderController.searchOrders);

// Update Order Status
router.post(
  "/:orderId/paid",
  authenticateToken,
  orderController.updateOrderStatus
);
router.post(
  "/:orderId/shipped",
  authenticateToken,
  orderController.updateOrderStatus
);
router.post(
  "/:orderId/delivered",
  authenticateToken,
  orderController.updateOrderStatus
);
router.post(
  "/:orderId/cancelled",
  authenticateToken,
  orderController.updateOrderStatus
);

module.exports = router;
