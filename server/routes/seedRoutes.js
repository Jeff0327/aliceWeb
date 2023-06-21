const express = require("express");
const Product = require("../models/productModel.js");
const data = require("../data.js");
const seedRouter = express.Router();

seedRouter.get("/", async (req, res) => {
  await Product.remove({});
  const createdProducts = await Product.insertMany(data.products);
  res.send({ createdProducts });
});
module.exports = seedRouter;
