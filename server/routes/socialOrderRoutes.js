const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const {
  isSocialAuth,
  mailgun,
  payOrderEmailTemplate,
  isAuth,
} = require("../utils.js");
const Order = require("../models/orderModel.js");
const socialOrderRouter = express.Router();
const Product = require("../models/productModel.js");
socialOrderRouter.post(
  "/",
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
        socialUser: { _id: req.kakaoUser._id, email: req.kakaoUser.email },
      });
      const order = await newOrder.save();

      res.status(201).send({ message: "주문되었습니다.", order });
    } catch (err) {
      console.log(err);
    }
  })
);

socialOrderRouter.get(
  "/mine",
  isSocialAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ socialUser: req.kakaoUser._id });
    res.send(orders);
  })
);

socialOrderRouter.get(
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

socialOrderRouter.put(
  "/:id/deliver",
  isSocialAuth,
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
socialOrderRouter.put(
  "/:id/pay",
  isSocialAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      "socialUser",
      "email"
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

      res.send({ message: "주문 완료", order: updatedOrder });
    } else {
      res.status(404).send({ message: "주문을 찾을 수 없습니다." });
    }
  })
);
socialOrderRouter.put(
  "/:id/bootpay",
  isSocialAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    const payId = await req.body;

    if (order && payId) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        update_time: req.body.update_time,
        email: req.body.email,
      };
      const updatedOrder = await order.save();

      res.send({ message: "주문 완료", order: updatedOrder });
      mailgun()
        .messages()
        .send(
          {
            from: `RoseMarry`,
            to: `${process.env.ADMIN_EMAIL}`,
            subject: `결제된 상품이있습니다.  
            주문번호:[${order._id}]
            주문자:[${order.shippingAddress.fullName}] 
            주소:[${order.shippingAddress.address}] 
            상세주소:[${order.shippingAddress.detailAddress}]
            연락처:[${order.shippingAddress.phoneNumber}] 
            우편번호:[${order.shippingAddress.postalCode}]`,
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
    } else {
      res.status(404).send({ message: "주문을 찾을 수 없습니다." });
    }
  })
);
socialOrderRouter.put(
  "/:id/pay",
  isSocialAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      "socialUser",
      "email"
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

      res.send({ message: "주문 완료", order: updatedOrder });
    } else {
      res.status(404).send({ message: "주문을 찾을 수 없습니다." });
    }
  })
);

module.exports = socialOrderRouter;
