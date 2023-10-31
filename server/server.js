const express = require("express");
const path = require("path");
require("dotenv").config();
const mongoose = require("mongoose");
const seedRouter = require("./routes/seedRoutes.js");
const productRouter = require("./routes/productRoutes.js");
const userRouter = require("./routes/userRoutes.js");
const orderRouter = require("./routes/orderRoutes.js");
const uploadRouter = require("./routes/uploadRoutes.js");
const port = process.env.PORT || 4000;
// const cors = require("cors");

// const options = {
//   allowedHeaders: [
//     "X-ACCESS_TOKEN",
//     "Authorization",
//     "Origin",
//     "X-Requested-With",
//     "Content-Type",
//     "Content-Range",
//     "Content-Disposition",
//     "Content-Description",
//   ],
//   credentials: true,
//   methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
//   origin: [
//     "http://rosemarry.kr", // Add your new domain here
//     "http://localhost:3000", // Add localhost:3000
//   ],
//   preflightContinue: false,
// };
// app.use(cors(options));

mongoose
  .connect(process.env.MONGODB_URL_ATLAS)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err.message);
  });
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.headers.host !== "rosemarry.kr") {
    res.message(req.headers.host);
    return res.redirect(301, "http://rosemarry.kr" + req.originalUrl);
  }
  return next();
});
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
