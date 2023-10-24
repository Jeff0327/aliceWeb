const bcrypt = require("bcryptjs");

const data = {
  users: [
    {
      name: "Admin",
      email: "cocacola158500@gmail.com",
      password: bcrypt.hashSync("2583147kjs"),
      isAdmin: true,
    },
  ],
  products: [
    {
      // _id: "1",
      name: "",
      slug: "",
      category: "",
      image: "", // 679px × 829px
      price: "",
      brand: "",
      rating: "",
      numReviews: "",
      description: "",
    },
  ],
};
module.exports = data;
