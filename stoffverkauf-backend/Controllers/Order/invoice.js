const PDFDocument = require('pdfkit');
const Order = require('../../Modals/Order/order');
const Settings = require('../../Modals/Settings/settings');

exports.generateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate('user', 'firstName lastName email');
        console.log("Generating Invoice for Order ID:", id);

        const settings = (await Settings.findOne({ id: "global" })) || {
          general: {
            storeName: "Stoffverkauf Weber",
            email: "info@stoffverkauf-weber.de",
            phone: "06171/53159",
            address: "Musterstraße 1, 61440 Oberursel",
            vatNumber: "DE123456789"
          }
        };

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Rechnung_${order._id.toString().slice(-6)}.pdf`);
        doc.pipe(res);

        // Header and Store info
        doc.fillColor("#444444").fontSize(20).text(settings.general.storeName, 50, 50);
        doc.fontSize(10).text(settings.general.address, 200, 50, { align: 'right' });
        doc.text(`E-Mail: ${settings.general.email}`, 200, 65, { align: 'right' });
        doc.text(`Tel: ${settings.general.phone}`, 200, 80, { align: 'right' });
        doc.text(`USt-IdNr.: ${settings.general.vatNumber}`, 200, 95, { align: 'right' });
        doc.moveDown();

        doc.strokeColor("#eeeeee").moveTo(50, 115).lineTo(550, 115).stroke();

        // Invoice Title
        doc.fillColor("#333333").fontSize(18).text("RECHNUNG", 50, 150);
        doc.fontSize(10).text(`Rechnungsnr.: RE-${order._id.toString().slice(-6)}`, 50, 175);
        doc.text(`Bestelldatum: ${new Date(order.createdAt).toLocaleDateString("de-DE")}`, 50, 190);
        doc.text(`Zahlungsart: ${order.paymentMethod.toUpperCase()}`, 50, 205);

        // Customer Info (Right side)
        doc.text("RECHNUNGSADRESSE", 350, 150, { bold: true });
        doc.text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`, 350, 165);
        doc.text(order.shippingAddress.address, 350, 180);
        doc.text(`${order.shippingAddress.zip} ${order.shippingAddress.city}`, 350, 195);
        doc.text(order.shippingAddress.country, 350, 210);

        doc.moveDown();

        // Line Items Table Header
        const tableTop = 260;
        doc.fontSize(10).text("ARTIKEL", 50, tableTop);
        doc.text("MENGE", 280, tableTop, { width: 90, align: "right" });
        doc.text("EINZEL PREIS", 370, tableTop, { width: 90, align: "right" });
        doc.text("GESAMT", 460, tableTop, { width: 90, align: "right" });

        doc.strokeColor("#000000").lineWidth(1).moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        let subtotal = 0;
        let y = tableTop + 25;
        order.items.forEach((item, index) => {
            const lineTotal = item.quantity * item.price;
            subtotal += lineTotal;
            doc.fillColor("#444444").fontSize(10).text(item.name, 50, y, { width: 220 });
            doc.text(item.quantity.toString(), 280, y, { width: 90, align: "right" });
            doc.text(`${item.price.toFixed(2)} €`, 370, y, { width: 90, align: "right" });
            doc.text(`${lineTotal.toFixed(2)} €`, 460, y, { width: 90, align: "right" });
            y += 20;
        });

        const summaryTop = y + 20;
        doc.strokeColor("#eeeeee").moveTo(300, summaryTop).lineTo(550, summaryTop).stroke();

        // Totals
        const finalY = summaryTop + 10;
        doc.fontSize(10).text("ZWISCHENSUMME:", 350, finalY, { width: 100, align: "right" });
        doc.text(`${subtotal.toFixed(2)} €`, 460, finalY, { width: 90, align: "right" });
        
        let currentY = finalY + 15;
        if (order.discount > 0) {
            doc.text(`RABATT (${order.appliedCoupon || 'Code'}):`, 350, currentY, { width: 100, align: "right" });
            doc.text(`-${order.discount.toFixed(2)} €`, 460, currentY, { width: 90, align: "right" });
            currentY += 15;
        }

        doc.fillColor("#000000").fontSize(12).text("GESAMTBETRAG:", 350, currentY + 5, { width: 100, align: "right", bold: true });
        doc.text(`${order.total.toFixed(2)} €`, 460, currentY + 5, { width: 90, align: "right", bold: true });

        // Footer
        doc.fontSize(8).fillColor("#888888").text("Vielen Dank für Ihre Bestellung! Wir freuen uns auf Ihren nächsten Einkauf.", 50, 750, { align: "center" });

        doc.end();
    } catch (error) {
        console.error("Invoice Generation Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
