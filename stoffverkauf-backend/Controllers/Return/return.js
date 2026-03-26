const Return = require('../../Modals/Order/return');
const Order = require('../../Modals/Order/order');

exports.processRefund = async (req, res) => {
    try {
        const { orderId, amount, reason } = req.body;
        const order = await Order.findById(orderId);
        
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        // Add to return collection
        const returnData = new Return({
            order: orderId,
            user: order.user,
            amount,
            reason,
            items: order.items,
            status: 'completed'
        });

        await returnData.save();

        // Optional: Call PayPal Refund API here
        // For now, just mark in DB

        res.status(200).json({
            success: true,
            message: "Refund processed successfully and recorded in returns",
            returnData
        });
    } catch (err) {
        console.error("Refund error:", err);
        res.status(500).json({ success: false, message: "Refund processing failed" });
    }
};

exports.getAllReturns = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalReturns = await Return.countDocuments();
        const returns = await Return.find()
            .populate('order', '_id total createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            returns,
            total: totalReturns,
            totalPages: Math.ceil(totalReturns / limit),
            page
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
