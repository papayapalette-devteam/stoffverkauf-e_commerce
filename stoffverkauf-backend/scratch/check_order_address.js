const Order = require('./Modals/Order/order');
const mongoose = require('mongoose');
require('dotenv').config();

const checkOrder = async () => {
  await mongoose.connect(process.env.DB_URL);
  const order = await Order.findById('69c626b41bdd17d4d082b903');
  console.log(JSON.stringify(order.shippingAddress, null, 2));
  process.exit();
};

checkOrder();
