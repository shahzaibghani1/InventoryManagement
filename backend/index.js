const express = require("express");
const app = express();
require("dotenv").config();
require("./database/database");
const port = 3000;
const path = require("path");
const cors = require("cors");
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:80", "http://localhost"],
};
const dashboardRoutes = require("./routes/dashboardRoute");
const productRoutes = require("./routes/productRoutes");
const stockRoutes = require("./routes/stockRoutes");
const clientRoutes = require("./routes/clientRoute");
const reportRoutes = require("./routes/reportRoute");
const saleRoutesV2 = require("./routes/saleRouteV2");

app.use(cors(corsOptions));
app.use(express.json());

app.use(express.static(path.join(__dirname, "dist")));

app.use("/api", dashboardRoutes);
app.use("/api", productRoutes);
app.use("/api", stockRoutes);
app.use("/api", clientRoutes);
app.use("/api", reportRoutes);
app.use("/api/v2", saleRoutesV2);

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });

app.listen(port, "0.0.0.0", () => {
  console.log(`App is runnig on port ${port}`);
});
