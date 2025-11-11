const express = require("express");
const app = express();
require("dotenv").config();
require("./database/database");
const port = 3000;
const path = require("path");
const cors = require("cors");
const corsOptions = {
  origin: "http://localhost:5173",
};
const dashboardRoutes = require("./Routes/dashboardRoute");
const productRoutes = require("./Routes/productRoutes");
const stockRoutes = require("./Routes/stockRoutes");
const clientRoutes = require("./Routes/clientRoute");
const reportRoutes = require("./Routes/reportRoute");
const saleRoutesV2 = require("./Routes/saleRouteV2");

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

app.listen(port, () => {
  console.log(`App is runnig on port ${port}`);
});
