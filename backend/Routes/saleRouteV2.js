const express = require("express");
const {
  addSale,
  getSale,
  deleteSale,
} = require("../Controllers/saleControllerV2");
const router = express.Router();

router.get("/getSale", getSale);
router.post("/addSale", addSale);
router.delete("/deleteSale/:saleId", deleteSale);

module.exports = router;
