const bcrypt = require("bcryptjs");

const data = {
  users: [
    {
      name: "Admin",
      email: `${process.env.ADMIN_ID}`,
      password: bcrypt.hashSync(`${process.env.ADMIN_PW}`),
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
