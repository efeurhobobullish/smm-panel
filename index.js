const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;
const SECRET_KEY = "smm-panel-987654321"; // Randomly generated secret key
const API_URL = "https://therealowlet.com/api/v2";
const API_KEY = "7485e97eea0d53dff12967d851c90000"; // Add your real API key here

app.use(cors());
app.use(bodyParser.json());

// Generate JWT Token
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Missing credentials" });
  }

  // Fake user validation (replace with database validation)
  if (username !== "admin" || password !== "password") {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "24h" });
  res.json({ success: true, token });
});

// Middleware to Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ success: false, message: "Token required" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

// ✅ Get Available Services
app.get("/api/services", verifyToken, async (req, res) => {
  try {
    const response = await axios.post(API_URL, {
      key: API_KEY,
      action: "services"
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch services" });
  }
});

// ✅ Get Account Balance
app.get("/api/balance", verifyToken, async (req, res) => {
  try {
    const response = await axios.post(API_URL, {
      key: API_KEY,
      action: "balance"
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch balance" });
  }
});

// ✅ Place an Order
app.post("/api/order", verifyToken, async (req, res) => {
  try {
    const { service, link, quantity } = req.body;
    if (!service || !link || !quantity) {
      return res.status(400).json({ success: false, message: "Missing order details" });
    }

    const response = await axios.post(API_URL, {
      key: API_KEY,
      action: "add",
      service,
      link,
      quantity
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
});

// ✅ Get Order Status
app.get("/api/status/:order_id", verifyToken, async (req, res) => {
  try {
    const { order_id } = req.params;

    const response = await axios.post(API_URL, {
      key: API_KEY,
      action: "status",
      order: order_id
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch order status" });
  }
});

// ✅ Start the Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
