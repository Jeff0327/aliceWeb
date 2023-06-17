const express = require("express");
const path = require("path");
require("dotenv").config();
const data = require("./data.js");
const app = express();

const port = process.env.PORT || 5001;

app.get("/api", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({
    users: ["userOne", "userTwo", "userThree", "userFour"],
  });
});

app.get("/name", (req, res) => {
  res.json({
    name: "niko",
  });
});

app.get("/api/products", (req, res) => {
  res.send(data.products);
});
app.use(express.static(path.join(__dirname, "../client/build")));

// Define the catch-all route at the end
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
