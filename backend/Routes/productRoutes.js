const express = require("express");
const { addProduct, getProduct, updateProduct, deleteProduct, getSKU } = require("../Controllers/productController");
const router = express.Router();

router.get("/getProduct", getProduct);
router.post("/addProduct", addProduct);
router.put("/updateProduct", updateProduct);
router.delete("/deleteProduct/:productId", deleteProduct);

router.get("/getSKU", getSKU);
module.exports = router;
