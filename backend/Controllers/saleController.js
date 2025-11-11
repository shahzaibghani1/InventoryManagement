const db = require("../database/database");

const getSale = async (req, res) => {
  try {
    const [result] = await db.query(
      "select s.saleId, p.productName, p.sellingPrice, s.saleQuantity, s.salePrice, s.saleDate from sales as s left join products as p on s.sku = p.sku;"
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch {
    console.error("Database Error:");
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the sales",
    });
  }
};

const addSale = async (req, res) => {
  try {
    let { sku, saleQuantity, salePrice, name, phoneNo } = req.body;
    // Get the current date in ISO format (compatible with most databases)
    const currentDate = new Date().toISOString().split("T")[0];
    console.log(currentDate); // Outputs date in MM/DD/YYYY or DD/MM/YYYY format based on locale
    // YYYY-MM-DD
    // Execute the database query
    const [stock] = await db.query(
      "select s.quantity from stocksd as s where s.sku = ?",
      [sku]
    );
    const stockQuantity = parseInt(stock[0].quantity);
    saleQuantity = parseInt(saleQuantity);
    if (saleQuantity > stockQuantity) {
      res.status(400).json({
        success: false,
        msg: `Not Enough Stock Quantity Present for this sale. Stock Quantity ${stockQuantity}`,
      });
    }
    if (saleQuantity <= stockQuantity) {
      const [result] = await db.query(
        "INSERT INTO sales (sku, saleQuantity, salePrice, saleDate) VALUES (?, ?, ?, ?)",
        [sku, saleQuantity, parseInt(salePrice), currentDate]
      );
      const newStockQuantity = stockQuantity - saleQuantity;
      const [stockUpdate] = await db.query(
        "update stocksd set quantity = ? where sku = ?",
        [newStockQuantity, sku]
      );
      console.log("Name" + name + "\nPhone" + phoneNo);

      if (name || phoneNo) {
        const [contactAdd] = await db.query(
          "insert ignore into customers (name, phoneNo) values (?,?)",
          [name, phoneNo]
        );
      }
      res.status(200).json({
        success: true,
        msg: `Sale Generated Successfully`,
      });
    }
  } catch (err) {
    console.error("Database Error:", err);
    // Send a generic error message to the client
    res.status(500).json({
      success: false,
      message: "An error occurred while generating the sale",
    });
  }
};

const deleteSale = async (req, res) => {
  try {
    const { saleId } = req.params;
    const [saleDetail] = await db.query(
      "select sku, saleQuantity from sales where saleId = ?",
      [saleId]
    );
    const newStockQuantity = saleDetail[0].saleQuantity;
    const [stockUpdate] = await db.query(
      "update stocksd set quantity = ((select quantity where sku = ?) + ?) where sku = ?",
      [saleDetail[0].sku, newStockQuantity, saleDetail[0].sku]
    );
    const result = await db.query("delete from sales where saleId = ?", [
      saleId,
    ]);
    res.status(200).json({
      success: true,
      msg: "Sale Deleted",
    });
  } catch (err) {
    console.error("Database Error:", err);
    // Send a generic error message to the client
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the stock",
    });
  }
};

module.exports = { getSale, addSale, deleteSale };
