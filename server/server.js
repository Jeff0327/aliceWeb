const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5001;
app.get("/api", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({
    users: ["userOne", "userTwo", "userThree", "userFour"],
  });
});
app.use(express.static(path.join(__dirname, "../client/build")));

app.listen(port, () => {
  console.log(`server stared on port ${port}`);
});
