import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import orderController from "../controllers/orderController";

const router = Router();
// Create Order
router.post("/", authenticateToken, orderController.createOrder);

// Search Orders
router.get("/", authenticateToken, orderController.searchOrders);

// Update Order Status
router.post(
  "/:orderId/paid",
  authenticateToken,
  orderController.updateOrderStatus,
);
router.post(
  "/:orderId/shipped",
  authenticateToken,
  orderController.updateOrderStatus,
);
router.post(
  "/:orderId/delivered",
  authenticateToken,
  orderController.updateOrderStatus,
);
router.post(
  "/:orderId/cancelled",
  authenticateToken,
  orderController.updateOrderStatus,
);

export default router;
