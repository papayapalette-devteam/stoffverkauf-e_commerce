const Order = require('../Modals/Order/order');
const mongoose = require('mongoose');
require('dotenv').config();

const checkOrder = async () => {
  try {
    await mongoose.connect(process.env.URL);
    const order = await Order.findById('69c626b41bdd17d4d082b903');
    if (!order) {
        console.log('Order not found');
    } else {
        console.log(JSON.stringify(order.shippingAddress, null, 2));
    }
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

checkOrder();
