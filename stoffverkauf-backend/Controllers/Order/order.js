const Order = require('../../Modals/Order/order');
const Product = require('../../Modals/AddProducts/add_products');

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { user, items, total, shippingAddress, paymentMethod, discount, appliedCoupon } = req.body;

    // Check if items array is empty
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in order" });
    }

    const order = new Order({
      user,
      items,
      total,
      shippingAddress,
      paymentMethod,
      discount: discount || 0,
      appliedCoupon: appliedCoupon || "",
      isPaid: false, // Default will wait for payment
      status: 'processing'
    });

    await order.save();

    // If coupon was used, increment usage
    if (appliedCoupon) {
      try {
        const Coupon = require('../../Modals/Marketing/coupon');
        await Coupon.findOneAndUpdate(
          { code: appliedCoupon.toUpperCase() },
          { $inc: { uses: 1 } }
        );
      } catch (couponErr) {
        console.error("Failed to increment coupon uses:", couponErr);
      }
    }

    // Send confirmation email
    try {
      const transporter = require('nodemailer').createTransport({
        service: 'gmail',
        auth: {
          user: 'bharatproperties570@gmail.com',
          pass: 'thpf pvbb pwfn idvf'
        }
      });

      const mailOptions = {
        from: '"Stoffverkauf Weber" <bharatproperties570@gmail.com>',
        to: order.shippingAddress.email,
        subject: `Bestätigung Ihrer Bestellung #${order._id.toString().slice(-6)}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
          <h1 style="color: #6d28d9; text-align: center;">Vielen Dank für Ihre Bestellung!</h1>
          <p>Hallo ${order.shippingAddress.firstName},</p>
          <p>Wir haben Ihre Bestellung erhalten und bearbeiten sie so schnell wie möglich.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Bestellnummer:</strong> ${order._id}</p>
            <p><strong>Gesamtsumme:</strong> ${order.total.toFixed(2)} €</p>
            <p><strong>Zahlungsart:</strong> ${order.paymentMethod}</p>
          </div>
          <p>Sie können Ihre Bestellung jederzeit in Ihrem Kundenkonto verfolgen.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888;">Stoffverkauf Weber • Ihre Experten für Textilien.</p>
        </div>`
      };
      await transporter.sendMail(mailOptions);
    } catch (mailErr) {
      console.error("Confirmation email failed:", mailErr);
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Confirm Payment (PayPal/Stripe etc.)
exports.updateOrderToPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentResult } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: paymentResult.id,
      status: paymentResult.status,
      update_time: paymentResult.update_time,
      email_address: paymentResult.email_address,
    };

    // Update product stock (simple version)
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQty: -item.quantity }
      });
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: "Order paid successfully",
      updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Get All Orders with Pagination
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // ✅ Orders list (same as before)
    const orders = await Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // ✅ Total count
    const totalOrders = await Order.countDocuments();

    // ✅ STATUS COUNTS (🔥 IMPORTANT)
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert array → object
    const counts = {
      processing: 0,
      shipped: 0,
      delivered: 0,
    };

    statusCounts.forEach(item => {
      counts[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      page,

      // ✅ send counts
      statusCounts: counts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// User: Get My Orders
exports.getMyOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments({ user: userId });
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Single Order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Order Status (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Mark as Viewed
exports.markAsViewed = async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndUpdate(id, { viewedByAdmin: true });
    res.status(200).json({ success: true, message: "Order marked as viewed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Resend Confirmation Email
exports.resendConfirmationEmail = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        const transporter = require('nodemailer').createTransport({
            service: 'gmail',
            auth: {
                user: 'bharatproperties570@gmail.com',
                pass: 'thpf pvbb pwfn idvf'
            }
        });

        const mailOptions = {
            from: '"Stoffverkauf Weber" <bharatproperties570@gmail.com>',
            to: order.shippingAddress?.email || 'test@example.com',
            subject: `Bestätigung Ihrer Bestellung #${order._id.toString().slice(-6)}`,
            html: `<h1>Bestellbestätigung</h1><p>Vielen Dank für Ihren Einkauf!</p>`
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Email resent" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
