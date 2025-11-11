const db = require("../database/database");

const getSale = async (req, res) => {
  try {
    const [result] = await db.query("select * from sales");
    res.status(200).json({
      success: true,
      data: result,
      message: "Sales Fetch Successfully",
    });
  } catch {
    console.error("Database Error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the sales",
    });
  }
};

const addSale = async (req, res) => {
  try {
    let { name, phoneNo, saleItems, saleTotal, payment, change } = req.body;
    const currentDate = new Date();

    if (!Array.isArray(saleItems) || saleItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, msg: "No sale items provided." });
    }

    for (const item of saleItems) {
      const { sku, saleQuantity } = item;

      const [stock] = await db.query(
        "SELECT sum(quantity) as quantity FROM transactions where sku = ? group by sku;",
        [sku]
      );
      const stockQuantity = parseInt(stock[0].quantity);
      if (stockQuantity === 0) {
        return res
          .status(400)
          .json({ success: false, msg: `No Stock Available for SKU: ${sku}` });
      }
      if (saleQuantity > stockQuantity) {
        return res.status(400).json({
          success: false,
          msg: `Not enough stock available for SKU: ${sku}`,
        });
      }
    }

    // Step 2: Begin transaction
    saleItems = JSON.stringify(saleItems);
    const pay = parseInt(payment);
    const [newSale] = await db.query(
      "Insert into sales (name, phoneNo, saleItems, saleTotal, saleDate, payment, changeBack) values (?,?,?,?,?,?,?)",
      [name, phoneNo, saleItems, saleTotal, currentDate, pay, change]
    );
    saleItems = JSON.parse(saleItems);
    for (const item of saleItems) {
      const { sku, saleQuantity, unitPrice, price } = item;
      const [newSaleItems] = await db.query(
        "Insert into sale_items (saleId, sku, unitPrice, quantity, total, createdAt) values (?,?,?,?,?,?)",
        [newSale.insertId, sku, unitPrice, saleQuantity, price, currentDate]
      );
      const newQuantity = -saleQuantity;
      const [newTransaction] = await db.query(
        "Insert into transactions (sku,tx_type, quantity,rate,total, tx_date, reference_id) values (?,?,?,?,?,?,?)",
        [
          sku,
          "sale",
          newQuantity,
          unitPrice,
          price,
          currentDate,
          newSale.insertId,
        ]
      );
    }

    res.status(200).json({ success: true, msg: "Sale Generated Successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteSale = async (req, res) => {
  const connection = await db.getConnection(); // Start DB connection for transaction

  try {
    const { saleId } = req.params;
    const currentDate = new Date();
    // Step 1: Fetch sale details before deleting
    const [rows] = await db.query(
      "SELECT saleItems FROM sales WHERE saleId = ?",
      [saleId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, msg: "Sale not found" });
    }

    const [updatedSaleItems] = await db.query(
      "Delete from sale_items where saleId = ?",
      [saleId]
    );

    // Begin transaction
    await connection.beginTransaction();
    let saleItems = rows[0].saleItems;

    // Step 2: Update stock for each sale item
    for (const saleItem of saleItems) {
      const { sku, saleQuantity, unitPrice, price } = saleItem;
      // Update stock by adding back the sold quantity
      const [updatedTransactions] = await db.query(
        "Insert into transactions (sku,tx_type, quantity,rate,total, tx_date, reference_id) values (?,?,?,?,?,?,?)",
        [sku, "sale", saleQuantity, unitPrice, price, currentDate, saleId]
      );
    }

    // Step 3: Delete sale entry
    await db.query("DELETE FROM sales WHERE saleId = ?", [saleId]);

    res.status(200).json({
      success: true,
      msg: "Sale Deleted Successfully",
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({
      success: false,
      msg: "Internal Server Error",
    });
  }
};

module.exports = { getSale, addSale, deleteSale };
