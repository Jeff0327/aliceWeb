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

app.use(
  cors({
    origin: ["http://localhost:3000", "https://rosemarry.kr"],
    methods: "*",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", [
    "http://localhost:3000",
    "https://rosemarry.kr",
  ]);
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header({
    web: {
      client_id:
        "258796595331-i3a9759p2fjajsg80gr3fsuavbdko1ld.apps.googleusercontent.com",
      project_id: "rosemarry-403217",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_secret: "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",
      redirect_uris: ["https://rosemarry.kr", "http://localhost:3000"],
      javascript_origins: ["https://roseamrry.kr", "http://localhost:3000"],
    },
  });
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
