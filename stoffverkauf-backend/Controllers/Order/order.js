const Order = require("../../Modals/Order/order");
const Product = require("../../Modals/AddProducts/add_products");
const axios = require("axios");
const crypto = require('crypto');

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const {
      user,
      items,
      total,
      shippingAddress,
      paymentMethod,
      discount,
      appliedCoupon,
    } = req.body;

    // Check if items array is empty
    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items in order" });
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
      status: "processing",
    });

    await order.save();

    // If coupon was used, increment usage
    if (appliedCoupon) {
      try {
        const Coupon = require("../../Modals/Marketing/coupon");
        await Coupon.findOneAndUpdate(
          { code: appliedCoupon.toUpperCase() },
          { $inc: { uses: 1 } },
        );
      } catch (couponErr) {
        console.error("Failed to increment coupon uses:", couponErr);
      }
    }

    // Send confirmation email
    try {
      const transporter = require("nodemailer").createTransport({
        service: "gmail",
        auth: {
          user: "bharatproperties570@gmail.com",
          pass: "thpf pvbb pwfn idvf",
        },
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
        </div>`,
      };
      await transporter.sendMail(mailOptions);
    } catch (mailErr) {
      console.error("Confirmation email failed:", mailErr);
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
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
        $inc: { stockQty: -item.quantity },
      });
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: "Order paid successfully",
      updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
      .populate("user", "firstName lastName email")
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
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert array → object
    const counts = {
      processing: 0,
      shipped: 0,
      delivered: 0,
    };

    statusCounts.forEach((item) => {
      counts[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      page,

      // ✅ send counts
      statusCounts: counts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
      page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "firstName lastName email",
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    if (status === "delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    const transporter = require("nodemailer").createTransport({
      service: "gmail",
      auth: {
        user: "bharatproperties570@gmail.com",
        pass: "thpf pvbb pwfn idvf",
      },
    });

    const mailOptions = {
      from: '"Stoffverkauf Weber" <bharatproperties570@gmail.com>',
      to: order.shippingAddress?.email || "test@example.com",
      subject: `Bestätigung Ihrer Bestellung #${order._id.toString().slice(-6)}`,
      html: `<h1>Bestellbestätigung</h1><p>Vielen Dank für Ihren Einkauf!</p>`,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email resent" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/order/order/:id/ship
exports.shipOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const { weight, length, width, height } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // prevent duplicate shipping
    if (order.status === "shipped") {
      return res.status(400).json({ success: false, message: "Order already shipped" });
    }

    try {
      const response = await axios.post(
        "https://panel.sendcloud.sc/api/v3/shipments",
        {
          from_address: {
            sender_address_id: 781140,
          },

          to_address: {
            name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
            address_line_1: order.shippingAddress.address,
            city: order.shippingAddress.city,
            postal_code: order.shippingAddress.zip,
            country_code: (order.shippingAddress.country?.toLowerCase() === 'germany' || order.shippingAddress.country?.toLowerCase() === 'deutschland') ? 'DE' : (order.shippingAddress.country?.length === 2 ? order.shippingAddress.country.toUpperCase() : 'DE'),
            email: order.shippingAddress.email,
            phone_number: order.shippingAddress.phone,
          },

          ship_with: {
            type: "shipping_option_code",
            properties: {
              shipping_option_code: "dhl_de:warenpost",
            },
          },

          parcels: [
            {
              weight: {
                value: weight || 1,
                unit: "kg",
              },
              dimensions: {
                length: length || 30,
                width: width || 20,
                height: height || 5,
                unit: "cm",
              },
              parcel_items: order.items.map((item) => ({
                description: item.name,
                quantity: item.quantity,
                weight: {
                  value: 0.01, // Minimal default weight as it's required by SendCloud
                  unit: "kg",
                },
                price: {
                  value: item.price.toFixed(2),
                  currency: "EUR",
                },
                sku: item.product.toString().slice(-8),
                origin_country: "DE",
              })),
            },
          ],
        },
        {
          auth: {
            username: process.env.SENDCLOUD_PUBLIC,
            password: process.env.SENDCLOUD_SECRET,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      const shipmentData = response.data;
      const shipment = shipmentData.data;

      // 🔹 Update order only on success
      order.status = "shipped";
      order.shippedAt = new Date();

      // extract tracking info from parcels array (Sendcloud V3)
      if (shipment?.parcels?.[0]?.tracking_number) {
        order.trackingNumber = shipment.parcels[0].tracking_number;
      }
      
      // Save Sendcloud Shipment ID for label retrieval
      if (shipment?.id) {
        order.sendcloudShipmentId = shipment.id;
      }

      await order.save();

      res.status(200).json({
        success: true,
        message: "Order imported to Sendcloud and status updated",
        trackingNumber: order.trackingNumber,
      });

    } catch (err) {
      console.error("Sendcloud error details:", JSON.stringify(err.response?.data, null, 2));
      
      return res.status(400).json({
        success: false,
        message: "Sendcloud API error: " + (err.response?.data?.errors?.[0]?.detail || err.message),
        errorDetails: err.response?.data
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET /api/order/order/:id/label
exports.getOrderLabel = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order || !order.sendcloudShipmentId) {
      return res.status(404).json({ success: false, message: "Label not found for this order. Make sure it was shipped correctly." });
    }

    try {
      // Fetch shipment details from Sendcloud V3
      console.log(`Fetching Sendcloud shipment: ${order.sendcloudShipmentId}`);
      const response = await axios.get(
        `https://panel.sendcloud.sc/api/v3/shipments/${order.sendcloudShipmentId}`,
        {
          auth: {
            username: process.env.SENDCLOUD_PUBLIC,
            password: process.env.SENDCLOUD_SECRET,
          }
        }
      );

      const shipment = response.data?.data || response.data;
      
      // 🔹 Auto-sync tracking number if missing
      const trackingNo = shipment?.parcels?.[0]?.tracking_number || shipment?.tracking_number;
      if (!order.trackingNumber && trackingNo) {
        order.trackingNumber = trackingNo;
        await order.save();
        console.log(`Synced tracking number for order ${order._id}: ${order.trackingNumber}`);
      }
      
      console.log("Sendcloud shipment status:", shipment?.status || shipment?.attributes?.status);

      // Check for label_url in multiple possible locations
      let labelUrl = shipment?.attributes?.label_url || shipment?.label_url;

      // Check inside parcels if not found in root
      if (!labelUrl && shipment?.parcels && shipment.parcels.length > 0) {
        const parcel = shipment.parcels[0];
        // Look in parcel documents
        if (parcel.documents && parcel.documents.length > 0) {
          const labelDoc = parcel.documents.find(doc => doc.type === 'label');
          if (labelDoc) labelUrl = labelDoc.link; // It's 'link' in V3
        }
      }

      console.log("Final detected Label URL:", labelUrl);

      if (labelUrl) {
        // Since the label link often requires authentication, we fetch it in backend and stream it
        const pdfResponse = await axios.get(labelUrl, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.SENDCLOUD_PUBLIC}:${process.env.SENDCLOUD_SECRET}`).toString('base64')}`,
            'Accept': 'application/pdf'
          },
          responseType: 'arraybuffer'
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=label-${order._id}.pdf`);
        return res.send(pdfResponse.data);
      } else {
        return res.status(404).json({ 
          success: false, 
          message: "Label URL not yet generated. Please wait a minute for Sendcloud to process it.",
          status: shipment?.status?.message || shipment?.attributes?.status || "Unknown"
        });
      }

    } catch (err) {
      // Decode buffer if error response is an arraybuffer
      let errorMessage = err.message;
      if (err.response?.data instanceof Buffer || err.response?.data instanceof ArrayBuffer) {
        try {
          const decoded = Buffer.from(err.response.data).toString();
          console.error("Decoded Sendcloud Error:", decoded);
          const errorJson = JSON.parse(decoded);
          errorMessage = errorJson.errors?.[0]?.detail || errorMessage;
        } catch (e) {
          errorMessage = Buffer.from(err.response.data).toString();
        }
      } else if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors[0].detail;
      }

      console.error("Sendcloud API Error:", errorMessage);
      return res.status(400).json({ 
        success: false, 
        message: "Failed to fetch label from Sendcloud API",
        error: errorMessage
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// const shipOrder = async () => {
//   try {
//     const fakeShipment = {
//       tracking_number: "TEST123456789",

//       tracking_url:
//         "https://tracking.sendcloud.com/TEST123456789",

//       label_url:
//         "https://example.com/test-label.pdf",

//       status: "shipped",
//     };

//     console.log("✅ MOCK SHIPMENT CREATED");

//     console.log(fakeShipment);

//   } catch (error) {
//     console.log(error.message);
//   }
// };


// shipOrder()



const getShipments = async () => {
  try {
    const response = await axios.get(
      "https://panel.sendcloud.sc/api/v3/shipments",
      {
        auth: {
          username: process.env.SENDCLOUD_PUBLIC,
          password: process.env.SENDCLOUD_SECRET,
        },
      }
    );

    console.log(
      JSON.stringify(response.data, null, 2)
    );

  } catch (err) {
    console.log(
      JSON.stringify(
        err.response?.data || err.message,
        null,
        2
      )
    );
  }
};

// getShipments();








const createShipment = async () => {
  try {
    const response = await axios.post(
      "https://panel.sendcloud.sc/api/v3/shipments",
      {
        from_address: {
          sender_address_id: 781140,
        },

        to_address: {
          name: "Test Customer",
          address_line_1: "Alexanderplatz 1",
          city: "Berlin",
          postal_code: "10178",
          country_code: "DE",
          email: "test@test.com",
          phone_number: "+49123456789",
        },

  ship_with: {
  type: "shipping_option_code",

  properties: {
    shipping_option_code: "dhl_de:warenpost",
  },
},

        parcels: [
          {
            weight: {
              value: 1,
              unit: "kg",
            },
          },
        ],
      },
      {
        auth: {
          username: process.env.SENDCLOUD_PUBLIC,
          password: process.env.SENDCLOUD_SECRET,
        },

        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ SHIPMENT CREATED");

    console.log(
      JSON.stringify(response.data, null, 2)
    );

  } catch (err) {
    console.log("❌ SHIPMENT ERROR");

    console.log(
      JSON.stringify(
        err.response?.data || err.message,
        null,
        2
      )
    );
  }
};

// POST /api/order/webhook/sendcloud
exports.handleSendcloudWebhook = async (req, res) => {
  try {
    console.log("--- WEBHOOK REQUEST ARRIVED ---");
    console.log("Headers:", req.headers);
    
    const signature = req.headers['sendcloud-signature'];
    const body = JSON.stringify(req.body);
    const secret = process.env.SENDCLOUD_SECRET;

    // 1. Verify Signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn("Potential Invalid Sendcloud Webhook Signature - Check if Secret is correct");
      // During initial setup, we don't block, but in production we should
    }

    const { action, parcel } = req.body;
    console.log(`Sendcloud Webhook Received: Action=${action}, Status=${parcel?.status?.message}`);

    if (action === 'parcel_status_changed' && parcel) {
      // V3 usually has shipment.id, fallback to parcel.id
      const shipmentId = parcel.shipment?.id || parcel.id.toString(); 
      const statusMessage = (parcel.status?.message || "").toLowerCase();
      
      // Find order by sendcloudShipmentId
      const order = await Order.findOne({ sendcloudShipmentId: shipmentId });
      
      if (order) {
        // Map Sendcloud status to our system status
        if (statusMessage.includes('delivered')) {
          order.status = 'delivered';
          order.deliveredAt = new Date();
          await order.save();
          console.log(`Order ${order._id} status updated to DELIVERED via Webhook`);
        } else if (statusMessage.includes('shipped') || statusMessage.includes('transit')) {
          if (order.status !== 'delivered') {
            order.status = 'shipped';
            await order.save();
          }
        }
      } else {
        console.warn(`No order found for Sendcloud shipment ID: ${shipmentId}`);
      }
    }

    res.status(200).send("Webhook processed");
  } catch (err) {
    console.error("Webhook Processing Error:", err);
    res.status(500).send("Internal Server Error");
  }
};




