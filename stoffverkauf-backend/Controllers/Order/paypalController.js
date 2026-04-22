const paypal = require('@paypal/checkout-server-sdk');
const { getPaypalClient } = require('./paypalHelper');
const Order = require('../../Modals/Order/order');
const Product = require('../../Modals/AddProducts/add_products');

exports.createPaypalOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        console.log("Starting PayPal Order Creation for OrderId:", orderId);
        const client = await getPaypalClient();
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'EUR',
                    value: order.total.toFixed(2)
                },
                reference_id: order._id.toString(),
                shipping: {
                    name: {
                        full_name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                    },
                    address: {
                        address_line_1: order.shippingAddress.address,
                        admin_area_2: order.shippingAddress.city,
                        postal_code: order.shippingAddress.zip,
                        country_code: 'DE' // The store seems to be German
                    }
                }
            }]
        });

        console.log("Executing PayPal Request...");
        const response = await client.execute(request);
        console.log("PayPal Response Success:", response.result.id);
        res.status(201).json({
            success: true,
            paypalOrderId: response.result.id
        });
    } catch (error) {
        console.error("PayPal Create Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.capturePaypalOrder = async (req, res) => {
    try {
        const { paypalOrderId, orderId } = req.body;
        const client = await getPaypalClient();
        const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
        request.requestBody({});

        const response = await client.execute(request);
        const status = response.result.status;
        const capture = response.result.purchase_units[0].payments.captures[0];

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Internal order not found" });
        }

        // Update payment result metadata
        order.paymentResult = {
            id: capture.id,
            status: status,
            update_time: capture.update_time,
            email_address: response.result.payer.email_address
        };

        if (status === 'COMPLETED') {
            order.isPaid = true;
            order.paidAt = new Date();
            
            // Deduct stock
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stockQty: -item.quantity }
                });
            }

            await order.save();
            res.status(200).json({ success: true, message: "Payment successful", status: 'COMPLETED' });
        } else if (status === 'PENDING') {
            order.isPaid = false;
            // Payment is pending (e.g. eCheck), don't deduct stock yet but save status
            await order.save();
            res.status(200).json({ success: true, message: "Payment is pending", status: 'PENDING' });
        } else {
            res.status(400).json({ success: false, message: `Payment status: ${status}`, status: status });
        }
    } catch (error) {
        console.error("PayPal Capture Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.syncPaypalOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order || !order.paymentResult || !order.paymentResult.id) {
            return res.status(404).json({ success: false, message: "Order or payment ID not found" });
        }

        const client = await getPaypalClient();
        const request = new paypal.payments.CapturesGetRequest(order.paymentResult.id);
        const response = await client.execute(request);
        
        const status = response.result.status;
        
        if (status === 'COMPLETED' && !order.isPaid) {
            order.isPaid = true;
            order.paidAt = new Date();
            order.paymentResult.status = status;

            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stockQty: -item.quantity }
                });
            }
            await order.save();
            return res.status(200).json({ success: true, message: "Order status synchronized: PAID", status });
        }

        if (order.paymentResult.status !== status) {
            order.paymentResult.status = status;
            await order.save();
        }

        res.status(200).json({ success: true, message: "Status sync complete", status });
    } catch (error) {
        console.error("PayPal Sync Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Webhook listener for PayPal events (e.g. payment completion)
exports.handlePaypalWebhook = async (req, res) => {
    try {
        const event = req.body;
        console.log("PayPal Webhook Received:", event.event_type);

        // 1. PAYMENT.CAPTURE.COMPLETED: Triggered when a payment is finished
        if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
            const resource = event.resource;
            const captureId = resource.id;
            const status = resource.status;

            // Find the order that has this capture ID
            const order = await Order.findOne({ "paymentResult.id": captureId });
            
            if (order && !order.isPaid) {
                console.log(`Webhook: Updating Order ${order._id} to PAID`);
                order.isPaid = true;
                order.paidAt = new Date();
                order.paymentResult.status = 'COMPLETED';

                // Deduct stock
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: { stockQty: -item.quantity }
                    });
                }
                await order.save();
            }
        }

        // 2. PAYMENT.CAPTURE.DENIED: Triggered if a payment is refused
        if (event.event_type === 'PAYMENT.CAPTURE.DENIED') {
            const captureId = event.resource.id;
            const order = await Order.findOne({ "paymentResult.id": captureId });
            if (order) {
                order.paymentResult.status = 'DENIED';
                await order.save();
            }
        }

        // Always return 200 to PayPal to acknowledge receipt
        res.status(200).send("Event received");
    } catch (error) {
        console.error("PayPal Webhook Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
