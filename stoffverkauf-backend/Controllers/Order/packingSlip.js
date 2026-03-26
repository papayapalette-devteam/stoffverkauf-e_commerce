const PDFDocument = require('pdfkit');
const Order = require('../../Modals/Order/order');

exports.generatePackingSlip = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).send('Order not found');

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=packzettel_${order._id}.pdf`);
        doc.pipe(res);

        // Header
        doc.fontSize(25).text('PACKZETTEL', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Stoffverkauf Weber`, { align: 'right' });
        doc.text(`Bestell-Nr: ${order._id}`, { align: 'right' });
        doc.text(`Datum: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();

        // Customer Info
        doc.fontSize(14).text('Lieferadresse:', { underline: true });
        doc.fontSize(10).text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`);
        doc.text(order.shippingAddress.address);
        doc.text(`${order.shippingAddress.zip} ${order.shippingAddress.city}`);
        doc.text(order.shippingAddress.country);
        doc.moveDown();

        // Items Table
        doc.fontSize(14).text('Artikelübersicht:', { underline: true });
        doc.moveDown(0.5);

        const tableTop = 270;
        doc.fontSize(10).text('Pos', 50, tableTop);
        doc.text('Artikelbeschreibung', 100, tableTop);
        doc.text('Menge', 450, tableTop, { width: 90, align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        let i = 0;
        order.items.forEach((item, index) => {
            const y = tableTop + 25 + (i * 25);
            doc.text(index + 1, 50, y);
            doc.text(item.name, 100, y);
            doc.text(item.quantity, 450, y, { width: 90, align: 'right' });
            i++;
        });

        doc.moveDown(2);
        doc.fontSize(12).text('Vielen Dank für Ihre Bestellung!', { align: 'center' });
        doc.end();

    } catch (err) {
        console.error("Packing slip error:", err);
        res.status(500).send("Error generating packing slip");
    }
};
