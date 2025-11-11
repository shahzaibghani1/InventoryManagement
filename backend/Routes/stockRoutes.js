const express = require("express");
const {getStock, getStockDetailed, addStock, updateStock, deleteStock} = require('../Controllers/stockController')
const router = express.Router();

router.get("/getStock", getStock);
router.get("/getStockDetailed", getStockDetailed);
router.post("/addStock", addStock);
router.put("/updateStock", updateStock);
router.delete("/deleteStock/:stockId", deleteStock);

module.exports = router;
