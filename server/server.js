const express = require("express");
require("dotenv").config();
const data = require("./data.js");
const app = express();

const port = process.env.PORT || 5001;

app.get("/api/products", (req, res) => {
  res.send(data.products);
});

app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
