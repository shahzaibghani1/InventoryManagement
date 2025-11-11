const db = require("../database/database");

const getClient = async (req, res) => {
  try {
    const [result] = await db.query(
      "select * from customers"
    );
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error("Database Error:", err);

    // Send a generic error message to the client
    res.status(500).json({
      success: false,
      message: "An error occurred while getting the clients",
    });
  }
};

const addClient = async (req, res) => {
  try {
    // Extracting sku and productName from req.body
    const {name, phoneNo} = req.body;
    // Execute the database query
    const [result] = await db.query(
      "INSERT ignore INTO customers (name, phoneNo) VALUES (?, ?)",
      [name, phoneNo]
    );

    // Send a success response
    res.status(200).json({
      success: true,
      msg: "Client Add Successfully",
      data: {
        id: result.insertId, // Assuming you're using an auto-increment primary key
      },
    });
  } catch (err) {
    console.error("Database Error:", err);

    // Send a generic error message to the client
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the client",
    });
  }
};

const updateClient = async (req, res) => {
  try {
    const {customerId, name, phoneNo} = req.body;
    const [result] = await db.query(
      "update customers set name = ?, phoneNo = ? where customerId = ?",
      [name, phoneNo, customerId]
    );
    res.status(200).json({
      success: true,
      msg: "Client Updated Successfully"
    });
  } catch (err) {
    console.error("Database Error:", err);

    // Send a generic error message to the client
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the client",
    });
  }
};

const deleteClient = async (req, res) => {
  try {
    const { customerId } = req.params; // Change this line
    const [result] = await db.query(
      "DELETE FROM customers WHERE customerId = ?",
      [customerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Client Deleted Successfully",
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the client",
    });
  }
};

module.exports = {getClient, addClient, updateClient, deleteClient};