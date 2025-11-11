const db = require("../database/database");

const getProduct = async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT p.productId, p.sku, p.productName, p.purchasePrice, p.sellingPrice FROM products as p;"
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
      message: "An error occurred while fetching the product",
    });
  }
};

const addProduct = async (req, res) => {
  try {
    const { sku, productName } = req.body;

    // 1️⃣ Validate required fields
    if (!sku || !productName) {
      return res.status(400).json({
        success: false,
        message: "Both SKU and product name are required.",
      });
    }

    // 2️⃣ Check if the SKU already exists
    const [existingProduct] = await db.query(
      "SELECT productId FROM products WHERE sku = ? LIMIT 1",
      [sku]
    );

    if (existingProduct.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Product with SKU '${sku}' already exists.`,
      });
    }

    // 3️⃣ Insert new product
    const currentDate = new Date();

    const [result] = await db.query(
      "INSERT INTO products (sku, productName, productAdded) VALUES (?, ?, ?)",
      [sku, productName, currentDate]
    );

    // 4️⃣ Success response
    res.status(201).json({
      success: true,
      message: "Product Added Successfully.",
      data: {
        id: result.insertId,
        sku,
        productName,
        productAdded: currentDate,
      },
    });
  } catch (err) {
    console.error("Error in addProduct:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productName, sellingPrice, purchasePrice, productId } = req.body;

    // 3️⃣ Perform update
    const [result] = await db.query(
      "UPDATE products SET productName = ?, sellingPrice = ?, purchasePrice = ? WHERE productId = ?",
      [productName, sellingPrice, purchasePrice, productId]
    );

    // 5️⃣ Send success response
    res.status(200).json({
      success: true,
      message: "Product Updated Successfully.",
      data: {
        productId,
        productName,
        sellingPrice,
        purchasePrice,
      },
    });
  } catch (err) {
    console.error("Error in updateProduct:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1️⃣ Validate productId
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required to delete a product.",
      });
    }

    // 2️⃣ Perform delete query
    const [result] = await db.query(
      "DELETE FROM products WHERE productId = ?",
      [productId]
    );

    // 3️⃣ Check if a product was actually deleted
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found or already deleted.",
      });
    }

    // 4️⃣ Success response
    res.status(200).json({
      success: true,
      message: "Product Deleted Successfully.",
    });
  } catch (err) {
    console.error("Error in deleteProduct:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const getSKU = async (req, res) => {
  try {
    const [result] = await db.query(
      "select sku, productName, sellingPrice from products"
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
      message: "An error occurred while deleting the product",
    });
  }
};

module.exports = {
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  getSKU,
};
