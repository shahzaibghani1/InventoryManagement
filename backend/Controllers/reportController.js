const db = require("../database/database");

const getSalesReport = async (req, res) => {
  try {
    const { start, end } = req.query;
    // Convert to Date objects for comparison
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Check that end date is not before start date
    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be earlier than start date.",
      });
    }
    const [result] = await db.query(
      "select p.productName as product, sum(s.quantity) as sale, SUM(s.total) as amount from sale_items s Join products p on s.sku = p.sku where Date(s.createdAt) between ? and ? group by s.sku;",
      [start, end]
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
      message: "Internal Server Error",
    });
  }
};

const getStockReport = async (req, res) => {
  try {
    const { start, end } = req.query;
    // Convert to Date objects for comparison
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Check that end date is not before start date
    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be earlier than start date.",
      });
    }
    const [result] = await db.query(
      "SELECT p.productName as Product, SUM(case when Date(tx_date) < ? then t.quantity else 0 end) as Opn, SUM(case when Date(t.tx_date) between ? and ? and t.tx_type='receive' then t.quantity else 0 end) as Rec, abs(SUM(case when Date(t.tx_date) between ? and ? and t.tx_type='sale' then t.quantity else 0 end)) as Sale, sum(t.quantity) as Bal FROM inventory.transactions t JOIN inventory.products p on p.sku = t.sku group by t.sku;",
      [start, start, end, start, end]
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
      message: "Internal Server Error",
    });
  }
};

module.exports = { getSalesReport, getStockReport };
