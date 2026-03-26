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
                reference_id: order._id.toString()
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
        const capture = response.result.purchase_units[0].payments.captures[0];

        if (response.result.status === 'COMPLETED') {
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ success: false, message: "Internal order not found" });
            }

            order.isPaid = true;
            order.paidAt = new Date();
            order.paymentResult = {
                id: capture.id,
                status: response.result.status,
                update_time: capture.update_time,
                email_address: response.result.payer.email_address
            };

            // Deduct stock
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stockQty: -item.quantity }
                });
            }

            await order.save();
            res.status(200).json({ success: true, message: "Payment successful" });
        } else {
            res.status(400).json({ success: false, message: "Payment not completed" });
        }
    } catch (error) {
        console.error("PayPal Capture Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
