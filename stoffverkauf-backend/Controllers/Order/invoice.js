const PDFDocument = require('pdfkit');
const Order = require('../../Modals/Order/order');

exports.generateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate('user', 'firstName lastName email');

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${order._id}.pdf`);
        doc.pipe(res);

        // Add invoice content
        doc.fontSize(20).text('OFFICIAL INVOICE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Order ID: ${order._id}`);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
        doc.text(`Customer: ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`);
        doc.text(`Email: ${order.shippingAddress.email}`);
        doc.text(`Status: ${order.status}`);
        doc.text(`Payment: ${order.paymentMethod} (${order.isPaid ? 'Paid' : 'Unpaid'})`);
        doc.moveDown();

        doc.text('Order Items:', { underline: true });
        order.items.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.name} - ${item.quantity} x ${item.price.toFixed(2)} € = ${(item.quantity * item.price).toFixed(2)} €`);
        });

        doc.moveDown();
        doc.fontSize(14).text(`TOTAL: ${order.total.toFixed(2)} €`, { align: 'right' });

        doc.end();
    } catch (error) {
        console.error("Invoice Generation Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
