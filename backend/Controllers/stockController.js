const db = require("../database/database");

const getStockDetailed = async (req, res) => {
  try {
    const [result] = await db.query(
      "select s.stockId, s.sku, p.productName, s.quantity, s.purchasePrice, s.dateAdded from stocks as s left join products as p on s.sku = p.sku order by s.dateAdded DESC"
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Database Error:", err);
    // Send a generic error message to the client
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the stocks",
    });
  }
};
const getStock = async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT p.productName, t.sku, SUM(t.quantity) AS quantity FROM transactions t JOIN products p ON p.sku = t.sku GROUP BY t.sku, p.productName ORDER BY t.sku;"
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Database Error:", err);
    // Send a generic error message to the client
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the stocks",
    });
  }
};

const addStock = async (req, res) => {
  try {
    const { sku, quantity, purchasePrice, pricePerKg } = req.body;

    // ✅ 1. Basic validation
    if (
      !sku ||
      quantity == null ||
      purchasePrice == null ||
      pricePerKg == null
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing Required Fields",
      });
    }

    // ✅ 2. Numeric validation
    if (quantity <= 0 || purchasePrice <= 0 || pricePerKg <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity and Prices must be greater than 0",
      });
    }

    // ✅ 3. Add stock to `stocks` table
    const currentDate = new Date();
    const [stockResult] = await db.query(
      `INSERT INTO stocks (sku, quantity, purchasePrice, pricePerKg, dateAdded)
       VALUES (?, ?, ?, ?, ?)`,
      [sku, quantity, purchasePrice, pricePerKg, currentDate]
    );
    await db.query(
      `INSERT INTO transactions
        (sku, tx_type, quantity, tx_date, reference_id)
       VALUES (?, ?, ?, ?, ?)`,
      [sku, "receive", quantity, currentDate, stockResult.insertId]
    );

    // ✅ 5. Respond
    res.status(200).json({
      success: true,
      message: "Stock Added Successfully",
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
const updateStock = async (req, res) => {
  try {
    const { quantity, purchasePrice, pricePerKg, date, stockId } = req.body;
    const [result] = await db.query(
      "updates stocks set quantity = ?, purchasePrice = ?, pricePerKg = ? , dateAdded = ? where stockId = ?",
      [quantity, purchasePrice, pricePerKg, date, stockId]
    );
    res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.error("Database Error:", err);

    // Send a generic error message to the client
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the stock",
    });
  }
};
const deleteStock = async (req, res) => {
  try {
    const { stockId } = req.params;
    // Validate input
    if (!stockId || isNaN(stockId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock ID",
      });
    }
    const [result] = await db.query("delete from stocks where stockId = ?", [
      stockId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Stock not found or already deleted",
      });
    }

    const [result2] = await db.query(
      "delete from transactions where reference_id = ?",
      [stockId]
    );
    res.status(200).json({
      success: true,
      message: "Stock Deleted Successfully",
    });
  } catch (err) {
    console.error("Database Error:", err);
    // Send a generic error message to the client
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getStock,
  getStockDetailed,
  addStock,
  updateStock,
  deleteStock,
};
