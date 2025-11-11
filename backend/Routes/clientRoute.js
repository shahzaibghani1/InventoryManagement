const express = require("express");
const {getClient, addClient, updateClient, deleteClient} = require('../Controllers/clientController')
const router = express.Router();

router.get("/getClient", getClient);
router.post("/addClient", addClient);
router.put("/updateClient", updateClient);
router.delete("/deleteClient/:customerId", deleteClient);

module.exports = router;
