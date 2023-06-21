const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const data = require("./data.js");
const seedRouter = require("./routes/seedRoutes.js");
const app = express();
const productRouter = require("./routes/productRoutes.js");
const port = process.env.PORT || 5001;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/api/seed", seedRouter);
app.use("/api/products", productRouter);

app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
