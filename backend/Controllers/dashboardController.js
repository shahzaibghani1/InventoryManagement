const db = require("../database/database");

const getDashboardData = async (req, res) => {
  try {
    const queries = {
      totalSalesToday: `
      SELECT COALESCE(SUM(saleTotal), 0) AS totalSaleToday,COALESCE(COUNT(*), 0) AS purchaseCountToday FROM inventory.sales WHERE saleDate >= CURDATE() AND saleDate < CURDATE() + INTERVAL 1 DAY;
      `,
      totalMonthlySales: `
        SELECT 
          COALESCE(SUM(saleTotal), 0) AS totalMonthlySales, 
          COALESCE(COUNT(*), 0) AS totalPurchaseCount 
        FROM inventory.sales 
        WHERE YEAR(saleDate) = YEAR(CURDATE()) 
          AND MONTH(saleDate) = MONTH(CURDATE())
      `,
      noOfProducts: `
        SELECT COUNT(*) AS noOfProducts FROM products
      `,
      noOfClients: `
        SELECT COUNT(*) AS sales FROM sales WHERE name IS NOT NULL;
      `,
      totalStockValue: `
        SELECT 
        ( 
        (SELECT SUM(purchasePrice) FROM stocks) - 
        (SELECT SUM(saleTotal) FROM sales)
        ) AS totalStockValue;
      `,
      zeroQuantityCount: `
        SELECT COUNT(*) AS zeroQuantityCount FROM (SELECT sku, SUM(quantity) AS totalQuantity FROM inventory.stocks GROUP BY sku HAVING SUM(quantity) = 0) AS subquery;`,
    };

    // Execute all queries
    const [
      [totalSalesTodayRows],
      [totalMonthlySalesRows],
      [noOfProductsRows],
      [noOfClientsRows],
      [totalStockValueRows],
      [zeroQuantityCountRows],
    ] = await Promise.all([
      db.query(queries.totalSalesToday).then(([rows]) => rows),
      db.query(queries.totalMonthlySales).then(([rows]) => rows),
      db.query(queries.noOfProducts),
      db.query(queries.noOfClients),
      db.query(queries.totalStockValue),
      db.query(queries.zeroQuantityCount),
    ]);

    // Debug logs for inspecting query results

    // Combine results into one response

    res.status(200).json({
      totalSalesToday: totalSalesTodayRows.totalSaleToday,
      purchaseCountToday: totalSalesTodayRows.purchaseCountToday,
      totalMonthlySales: totalMonthlySalesRows.totalMonthlySales,
      totalPurchaseCount: totalMonthlySalesRows.totalPurchaseCount,
      noOfProducts: noOfProductsRows[0].noOfProducts,
      noOfClients: noOfClientsRows[0].sales,
      totalStockValue: totalStockValueRows[0].totalStockValue,
      zeroQuantityCount: zeroQuantityCountRows[0].zeroQuantityCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching dashboard data", error: error.message });
  }
};

module.exports = { getDashboardData };
