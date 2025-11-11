const express = require("express");
const {
  getSalesReport,
  getStockReport,
} = require("../Controllers/reportController");
const router = express.Router();

router.get("/getSaleReport", getSalesReport);
router.get("/getStockReport", getStockReport);

module.exports = router;
