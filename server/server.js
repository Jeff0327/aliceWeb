const express = require("express");
const path = require("path");
require("dotenv").config();
const mongoose = require("mongoose");
const seedRouter = require("./routes/seedRoutes.js");
const productRouter = require("./routes/productRoutes.js");
const userRouter = require("./routes/userRoutes.js");
const orderRouter = require("./routes/orderRoutes.js");
const uploadRouter = require("./routes/uploadRoutes.js");

const port = process.env.PORT || 3000;
const cors = require("cors");

mongoose
  .connect(process.env.MONGODB_URL_ATLAS)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err.message);
  });
const app = express();

// app.use(
//   cors({
//     origin: "*",
//     methods: "*",
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

app.use((req, res, next) => {
  const allowedOrigins = ["http://localhost:3000", "https://rosemarry.kr"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Origin"
  );

  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Credentials", true);

  res.header("Cross-Origin-Opener-Policy", [
    "same-origin",
    "same-origin-allow-popups",
  ]);

  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/keys/paypal", (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || "sb");
});

app.use("/api/upload", uploadRouter);
app.use("/api/seed", seedRouter);
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"))
);

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});
app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
