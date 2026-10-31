const { Router } = require("express");

const route = Router();

route.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Auth service is healthy" });
});

module.exports = route;
