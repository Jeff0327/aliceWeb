const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const {
  isAuth,
  isSocialAuth,
  isAdmin,
  mailgun,
  payOrderEmailTemplate,
} = require("../utils.js");
const Order = require("../models/orderModel.js");
const { User } = require("../models/userModel.js");
const Product = require("../models/productModel.js");
const orderRouter = express.Router();
orderRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate("user", "name");
    res.send(orders);
  })
);

orderRouter.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const newOrder = new Order({
        orderItems: req.body.orderItems.map((x) => ({
          ...x,
          product: x._id,
        })),
        shippingAddress: req.body.shippingAddress,
        detailAddress: req.body.detailAddress,
        paymentMethod: req.body.paymentMethod,
        itemsPrice: req.body.itemsPrice,
        shippingPrice: req.body.shippingPrice,
        totalPrice: req.body.totalPrice,
        user: req.user,
      });
      const order = await newOrder.save();

      res.status(201).send({ message: "주문되었습니다.", order });
    } catch (err) {
      console.log(err);
    }
  })
);
orderRouter.post(
  "/socialOrder",
  isSocialAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const newOrder = new Order({
        orderItems: req.body.orderItems.map((x) => ({
          ...x,
          product: x._id,
        })),
        shippingAddress: req.body.shippingAddress,
        detailAddress: req.body.detailAddress,
        paymentMethod: req.body.paymentMethod,
        itemsPrice: req.body.itemsPrice,
        shippingPrice: req.body.shippingPrice,
        totalPrice: req.body.totalPrice,
        kakaoUser: req.kakaoUser,
      });
      const order = await newOrder.save();

      res.status(201).send({ message: "주문되었습니다.", order });
    } catch (err) {
      console.log(err);
    }
  })
);

orderRouter.get(
  "/summary",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          sales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);
    res.send({ users, orders, dailyOrders, productCategories });
  })
);
orderRouter.get(
  "/mine",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

orderRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: "주문을 찾을 수 없습니다." });
    }
  })
);
orderRouter.get(
  "/:id",
  isSocialAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: "주문을 찾을 수 없습니다." });
    }
  })
);
orderRouter.put(
  "/:id/deliver",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();
      res.send({ message: "주문한 상품이 배송되었습니다." });
    } else {
      res.status(404).send({ message: "주문을 찾을 수 없습니다." });
    }
  })
);

orderRouter.put(
  "/:id/bootpay",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    const payId = await req.body;

    if (order && payId) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };
      const updatedOrder = await order.save();
      mailgun()
        .messages()
        .send(
          {
            from: `RoseMarry <cocacola158500@gmail.com>`,
            to: `${order.user.name} <${order.user.email}>`,
            subject: `구매해주셔서 감사합니다.  주문번호:[${order._id}]`,
            html: payOrderEmailTemplate(order),
          },
          (error, body) => {
            if (error) {
              console.log(error);
            } else {
              console.log(body);
            }
          }
        );
      res.send({ message: "주문 완료", order: updatedOrder });
    } else {
      res.status(404).send({ message: "주문을 찾을 수 없습니다." });
    }
  })
);
orderRouter.put(
  "/:id/pay",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "email name"
    );
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      mailgun()
        .messages()
        .send(
          {
            from: `RoseMarry <cocacola158500@gmail.com>`,
            to: `${order.user.name} <${order.user.email}>`,
            subject: `구매해주셔서 감사합니다.  주문번호:[${order._id}]`,
            html: payOrderEmailTemplate(order),
          },
          (error, body) => {
            if (error) {
              console.log(error);
            } else {
              console.log(body);
            }
          }
        );

      res.send({ message: "주문 완료", order: updatedOrder });
    } else {
      res.status(404).send({ message: "주문을 찾을 수 없습니다." });
    }
  })
);

orderRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.send({ message: "주문이 삭제되었습니다." });
    } else {
      res.status(404).send({ message: "주문을 찾을 수 없습니다." });
    }
  })
);
module.exports = orderRouter;
