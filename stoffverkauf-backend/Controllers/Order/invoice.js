const PDFDocument = require('pdfkit');
const Order = require('../../Modals/Order/order');
const Settings = require('../../Modals/Settings/settings');

exports.generateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate('user', 'firstName lastName email');
        
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

        const doc = new PDFDocument({ 
            margin: 50,
            size: 'A4',
            bufferPages: true 
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Rechnung_${order._id.toString().slice(-6)}.pdf`);
        doc.pipe(res);

        // --- DESIGN CONSTANTS ---
        const primaryColor = "#0f172a"; // Dark blue
        const accentColor = "#2563eb";  // Modern Blue
        const secondaryColor = "#64748b"; // Slate gray
        const borderColor = "#e2e8f0";

        // --- HEADER ---
        // Top accent line
        doc.rect(0, 0, 600, 15).fill(primaryColor);

        // Store Name & Logo placeholder
        doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text(settings.general.storeName, 50, 45);
        
        // Store Details (Right side)
        doc.fillColor(secondaryColor).fontSize(9).font('Helvetica');
        doc.text(settings.general.address, 300, 48, { align: 'right' });
        doc.text(`E-Mail: ${settings.general.email}`, 300, 60, { align: 'right' });
        doc.text(`Tel: ${settings.general.phone}`, 300, 72, { align: 'right' });
        doc.text(`USt-IdNr.: ${settings.general.vatNumber}`, 300, 84, { align: 'right' });

        doc.moveDown(2);
        doc.strokeColor(borderColor).lineWidth(1).moveTo(50, 110).lineTo(545, 110).stroke();

        // --- INVOICE INFO & CUSTOMER ---
        const infoTop = 135;
        
        // Invoice Header
        doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text("RECHNUNG", 50, infoTop);
        doc.fillColor(secondaryColor).fontSize(10).font('Helvetica').text(`Rechnungs-Nr:`, 50, infoTop + 30);
        doc.fillColor(primaryColor).font('Helvetica-Bold').text(`RE-${order._id.toString().toUpperCase().slice(-8)}`, 130, infoTop + 30);
        
        doc.fillColor(secondaryColor).font('Helvetica').text(`Datum:`, 50, infoTop + 45);
        doc.fillColor(primaryColor).font('Helvetica-Bold').text(new Date(order.createdAt).toLocaleDateString("de-DE"), 130, infoTop + 45);

        doc.fillColor(secondaryColor).font('Helvetica').text(`Zahlungsart:`, 50, infoTop + 60);
        doc.fillColor(primaryColor).font('Helvetica-Bold').text(order.paymentMethod.toUpperCase(), 130, infoTop + 60);

        // Billing Details (Right)
        doc.fillColor(secondaryColor).fontSize(10).font('Helvetica').text("RECHNUNG AN:", 350, infoTop + 5);
        doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`, 350, infoTop + 20);
        doc.fillColor(secondaryColor).fontSize(10).font('Helvetica');
        doc.text(order.shippingAddress.address, 350, infoTop + 38);
        doc.text(`${order.shippingAddress.zip} ${order.shippingAddress.city}`, 350, infoTop + 52);
        doc.text(order.shippingAddress.country, 350, infoTop + 66);

        // --- TABLE HEADER ---
        const tableTop = 260;
        doc.rect(50, tableTop, 495, 25).fill(primaryColor);
        doc.fillColor("#ffffff").fontSize(10).font('Helvetica-Bold');
        doc.text("ARTIKEL / BESCHREIBUNG", 60, tableTop + 8);
        doc.text("MENGE", 300, tableTop + 8, { width: 50, align: "center" });
        doc.text("EINZELPREIS", 360, tableTop + 8, { width: 80, align: "right" });
        doc.text("GESAMT", 450, tableTop + 8, { width: 80, align: "right" });

        // --- TABLE ITEMS ---
        let y = tableTop + 35;
        let subtotal = 0;

        doc.fillColor(primaryColor).font('Helvetica');
        order.items.forEach((item, index) => {
            const lineTotal = item.quantity * item.price;
            subtotal += lineTotal;

            // Zebra striping
            if (index % 2 !== 0) {
                doc.rect(50, y - 5, 495, 20).fill("#f8fafc");
            }
            doc.fillColor(primaryColor);

            doc.text(item.name, 60, y, { width: 230 });
            doc.text(item.quantity.toString(), 300, y, { width: 50, align: "center" });
            doc.text(`${item.price.toFixed(2)} €`, 360, y, { width: 80, align: "right" });
            doc.text(`${lineTotal.toFixed(2)} €`, 450, y, { width: 80, align: "right" });
            
            y += 20;

            // Check for page break
            if (y > 700) {
                doc.addPage();
                y = 50;
            }
        });

        // --- TOTALS ---
        const summaryTop = y + 20;
        doc.strokeColor(borderColor).lineWidth(1).moveTo(300, summaryTop).lineTo(545, summaryTop).stroke();

        const finalY = summaryTop + 15;
        doc.fillColor(secondaryColor).fontSize(10).font('Helvetica').text("ZWISCHENSUMME:", 300, finalY, { width: 140, align: "right" });
        doc.fillColor(primaryColor).font('Helvetica-Bold').text(`${subtotal.toFixed(2)} €`, 450, finalY, { width: 80, align: "right" });
        
        let currentY = finalY + 18;
        if (order.discount > 0) {
            doc.fillColor(secondaryColor).font('Helvetica').text(`RABATT (${order.appliedCoupon || 'Gutschein'}):`, 300, currentY, { width: 140, align: "right" });
            doc.fillColor("#ef4444").font('Helvetica-Bold').text(`-${order.discount.toFixed(2)} €`, 450, currentY, { width: 80, align: "right" });
            currentY += 18;
        }

        // Grand Total Box
        doc.rect(300, currentY + 5, 245, 35).fill(primaryColor);
        doc.fillColor("#ffffff").fontSize(14).font('Helvetica-Bold').text("GESAMTBETRAG:", 310, currentY + 15);
        doc.text(`${order.total.toFixed(2)} €`, 450, currentY + 15, { width: 85, align: "right" });

        // --- FOOTER ---
        const footerTop = 750;
        doc.strokeColor(borderColor).lineWidth(1).moveTo(50, footerTop - 10).lineTo(545, footerTop - 10).stroke();
        
        doc.fillColor(secondaryColor).fontSize(8).font('Helvetica');
        doc.text("Vielen Dank für Ihre Bestellung! Bei Fragen kontaktieren Sie uns gerne.", 50, footerTop, { align: "center" });
        doc.text("Stoffverkauf Weber | Inhaber: Max Weber | Steuer-Nr: 000/111/22222", 50, footerTop + 12, { align: "center" });

        doc.end();
    } catch (error) {
        console.error("Invoice Generation Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
