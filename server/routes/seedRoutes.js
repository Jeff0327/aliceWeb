const express = require("express");
const Product = require("../models/productModel.js");
const data = require("../data.js");

const seedRouter = express.Router();

const User = require("../models/userModel.js");

seedRouter.get("/", async (req, res) => {
  await Product.deleteMany({});
  const createdProducts = await Product.insertMany(data.products);
  await User.deleteMany({});
  const createdUser = await User.insertMany(data.users);

  res.send({ createdProducts, createdUser });
});
module.exports = seedRouter;
