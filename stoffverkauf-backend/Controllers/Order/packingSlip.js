const PDFDocument = require('pdfkit');
const Order = require('../../Modals/Order/order');
const Settings = require('../../Modals/Settings/settings');

exports.generatePackingSlip = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        const settings = (await Settings.findOne({ id: "global" })) || {
          general: {
            storeName: "Stoffverkauf Weber",
            address: "Musterstraße 1, 61440 Oberursel",
          }
        };

        if (!order) return res.status(404).send('Order not found');

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Packzettel_${order._id.toString().slice(-6)}.pdf`);
        doc.pipe(res);

        // Header
        doc.fillColor("#444444").fontSize(20).text("PACKZETTEL", 50, 50);
        doc.fontSize(10).text(settings.general.storeName, 200, 50, { align: 'right' });
        doc.text(settings.general.address, 200, 65, { align: 'right' });
        doc.moveDown();

        doc.strokeColor("#eeeeee").moveTo(50, 95).lineTo(550, 95).stroke();

        // Logistics Info
        doc.fillColor("#333333").fontSize(10).text(`Bestell-Nr: #${order._id.toString().slice(-6)}`, 50, 120);
        doc.text(`Datum: ${new Date(order.createdAt).toLocaleDateString("de-DE")}`, 50, 135);

        // Delivery Address
        doc.fontSize(12).text("LIEFERADRESSE", 50, 170, { bold: true });
        doc.fontSize(10).text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`, 50, 185);
        doc.text(order.shippingAddress.address, 50, 200);
        doc.text(`${order.shippingAddress.zip} ${order.shippingAddress.city}`, 50, 215);
        doc.text(order.shippingAddress.country, 50, 230);
        doc.text(`Tel: ${order.shippingAddress.phone || 'N/A'}`, 50, 245);

        // Items Table
        const tableTop = 300;
        doc.fontSize(10).text("POS", 50, tableTop);
        doc.text("ARTIKELBESCHREIBUNG", 100, tableTop);
        doc.text("MENGE", 450, tableTop, { width: 90, align: 'right' });

        doc.strokeColor("#000000").lineWidth(1).moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        let y = tableTop + 25;
        order.items.forEach((item, index) => {
            doc.fillColor("#444444").fontSize(10).text((index + 1).toString(), 50, y);
            doc.text(item.name, 100, y, { width: 330 });
            doc.text(item.quantity.toString(), 450, y, { width: 90, align: 'right' });
            y += 25;
        });

        doc.moveTo(50, y + 10).lineTo(550, y + 10).strokeColor("#eeeeee").stroke();

        // Notes
        doc.fontSize(9).fillColor("#888888").text("Bitte prüfen Sie die Ware unmittelbar nach Erhalt auf Vollständigkeit und Unversehrtheit.", 50, y + 30);

        doc.end();

    } catch (err) {
        console.error("Packing slip error:", err);
        res.status(500).send("Error generating packing slip");
    }
};
