const bcrypt = require("bcryptjs");

const data = {
  users: [
    {
      name: "Jeff",
      email: "cocacola158500@gmail.com",
      password: bcrypt.hashSync("2583147kjs"),
      isAdmin: true,
    },
    {
      name: "alice",
      email: "user1@gmail.com",
      password: bcrypt.hashSync("12345"),
      isAdmin: false,
    },
  ],
  products: [
    {
      // _id: "1",
      name: "포르쉐911",
      slug: "포르쉐911",
      category: "Shirts",
      image: "/images/p1.jpeg", // 679px × 829px
      price: 120,
      countInStock: 10,
      brand: "Nike",
      rating: 4.5,
      numReviews: 10,
      description: "포르쉐 911",
    },
    {
      // _id: "2",
      name: "포르쉐박스터",
      slug: "포르쉐박스터",
      category: "Shirts",
      image: "/images/p2.jpeg",
      price: 250,
      countInStock: 20,
      brand: "Adidas",
      rating: 4.0,
      numReviews: 10,
      description: "high quality product",
    },
    {
      // _id: "3",
      name: "포르쉐카이렌",
      slug: "포르쉐카이렌",
      category: "Pants",
      image: "/images/p3.jpeg",
      price: 25,
      countInStock: 15,
      brand: "Nike",
      rating: 4.5,
      numReviews: 14,
      description: "high quality product",
    },
    {
      // _id: "4",
      name: "포르쉐mos",
      slug: "포르쉐mos",
      category: "Pants",
      image: "/images/p4.jpeg",
      price: 1000,
      countInStock: 5,
      brand: "Puma",
      rating: 4.5,
      numReviews: 10,
      description: "high quality product",
    },
  ],
};
module.exports = data;
