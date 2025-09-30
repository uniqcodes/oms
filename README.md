# Mock Backend Service

A lightweight mock backend for development and testing. This service provides mock APIs to simulate a simple order management service without needing a production backend.

---

## Features

- RESTful API endpoints for quick prototyping
- JWT authentication
- Easy setup with Node.js & npm
- In-memory recording of orders without any database.
- A yaml file exist in the contracts folder which is OpenApi standard to show current endpoints

---

## 📦 Tech Stack

- **Node.js** (v18+)
- **Express.js**
- **Docker** (optional) for compatibility

---

## 🔧 Installation and Execution

Clone the repo:

```bash
git clone https://github.com/uniqcode/oms.git
cd oms
npm i
npm start
```
Running with Docker (Recommended)

```
docker-compose up
```
---

# Considerations including tradeoffs

- In a more complete application using JWT authentication, we must ensure that order requests belong to the user making the request. In this application, given that it’s just a mock for developers, we accept any valid JWT token for any order.

- There is no Basic authentication, as this is a mock and assumes all requests come from valid users.

- Comprehensive JSON validation should be added later when the mock turns into a real backend. At this stage, this application only validates the format of customer IDs.

- This application could be extended to create new objects for each order status to fit the concept of an event log in event-driven applications. At present, it updates the order status without recording the previous status.

- Developers can be encouraged to save secrets (including jwt secret) in environment variables in order to harden the security of the mock backend instead of hard coded secret currently used in the application for simplicity.

- Since this is a simple mock backend, I did not implemented the following immutable pattern which is just a functional style alternative, often preferred in bigger applications where you want to avoid side effects entirely.
  Example:

```
[ORDER_STATUS.PAID]: (order) => {
      if (order.status !== ORDER_STATUS.PENDING) {
        return { error: "Cannot mark order as paid unless pending" };
      }
      return { ...order, status: ORDER_STATUS.PAID };
    }
```

- In order to update order status, I implemented action style endpoints that are using POST instead of PATCH method. I took into consideration the fact that POST isn't idempotent, thus I implemented idempotency logic in the handler. Below is an example from the Paid status handler function:

```
if (order.status === ORDER_STATUS.PAID) return null; // already paid
```
