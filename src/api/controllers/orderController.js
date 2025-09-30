const { v4: uuidv4 } = require("uuid");

const ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
});

const VALID_STATUSES = new Set(Object.values(ORDER_STATUS));

// In-memory data store
const orders = new Map();

// Utility: Error response
const errorResponse = (res, status, error, message, details = null) => {
  const response = { error, message };
  if (details) response.details = details;
  return res.status(status).json(response);
};

const validateCustomerId = (customerId) => {
  // Regex pattern: user- followed by 8 hexadecimal characters (first segment of UUID)
  const customerIdPattern = /^user-[0-9a-fA-F]{8}$/;
  return customerIdPattern.test(customerId);
};

// Create Order
const createOrder = (req, res) => {
  const { customerId } = req.body;

  if (!customerId) {
    return errorResponse(
      res,
      400,
      "VALIDATION_ERROR",
      "customerId is required"
    );
  }

  // Validate customerId format
  if (!validateCustomerId(customerId)) {
    return errorResponse(
      res,
      400,
      "VALIDATION_ERROR",
      "customerId must be in format user-XXXXXXXX (e.g., user-A1B2C3D4)",
      { providedId: customerId }
    );
  }
  const order = {
    orderId: `ORD-${uuidv4().split("-")[0].toUpperCase()}`,
    customerId,
    placementDate: new Date().toISOString(),
    status: ORDER_STATUS.PENDING,
  };

  orders.set(order.orderId, order);
  res.status(201).json(order);
};

// Search Orders
const searchOrders = (req, res) => {
  const { customerId, startDate, endDate } = req.query;

  if (!customerId) {
    return errorResponse(
      res,
      400,
      "VALIDATION_ERROR",
      "customerId is required"
    );
  }

  // Validate customerId format
  if (!validateCustomerId(customerId)) {
    return errorResponse(
      res,
      400,
      "VALIDATION_ERROR",
      "customerId must be in format user-XXXXXXXX (e.g., user-A1B2C3D4)",
      { providedId: customerId }
    );
  }

  let results = Array.from(orders.values()).filter(
    (order) => order.customerId === customerId
  );

  // Apply date filters if provided
  if (startDate) {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return errorResponse(
        res,
        400,
        "VALIDATION_ERROR",
        "Invalid startDate format"
      );
    }
    results = results.filter((order) => new Date(order.placementDate) >= start);
  }

  if (endDate) {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      return errorResponse(
        res,
        400,
        "VALIDATION_ERROR",
        "Invalid endDate format"
      );
    }
    results = results.filter((order) => new Date(order.placementDate) <= end);
  }

  res.json({ orders: results });
};

// Update Order Status
const updateOrderStatus = (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!status) {
    return errorResponse(res, 400, "VALIDATION_ERROR", "status is required");
  }

  if (!VALID_STATUSES.has(status)) {
    return errorResponse(res, 400, "VALIDATION_ERROR", "Invalid status", {
      validStatuses: VALID_STATUSES,
    });
  }

  const order = orders.get(orderId);
  if (!order) {
    return errorResponse(res, 404, "NOT_FOUND", `Order ${orderId} not found`);
  }

  const actionHandlers = {
    [ORDER_STATUS.PENDING]: (order) => {
      if (order.status !== ORDER_STATUS.PENDING) {
        return { error: "Cannot mark order as pending" };
      }
      order.status = status;
      return null;
    },

    [ORDER_STATUS.PAID]: (order) => {
      if (order.status !== ORDER_STATUS.PENDING) {
        return { error: "Cannot mark order as paid unless pending" };
      }
      if (order.status === ORDER_STATUS.PAID) return null; // already paid
      order.status = status;
      return null;
    },

    [ORDER_STATUS.SHIPPED]: (order) => {
      if (order.status !== ORDER_STATUS.PAID) {
        return { error: "Cannot ship order that isn't paid" };
      }
      if (order.status === ORDER_STATUS.SHIPPED) return null; // already shipped
      order.status = status;
      return null;
    },

    [ORDER_STATUS.CANCELLED]: (order) => {
      if (order.status === ORDER_STATUS.SHIPPED) {
        return { error: "Cannot cancel an order that is shipped" };
      }
      if (order.status === ORDER_STATUS.CANCELLED) return null; // already cancelled
      order.status = status;
      return null;
    },

    [ORDER_STATUS.DELIVERED]: (order) => {
      if (order.status !== ORDER_STATUS.SHIPPED) {
        return { error: "Cannot deliver order that isn't shipped" };
      }
      if (order.status === ORDER_STATUS.DELIVERED) return null; // already delivered
      order.status = status;
      return null;
    },
  };

  const handler = actionHandlers[status];
  const error = handler(order);
  if (error) return errorResponse(res, 400, "VALIDATION_ERROR", error.error);
  orders.set(orderId, order);
  res.json(order);
};

module.exports = {
  createOrder,
  searchOrders,
  updateOrderStatus,
};
