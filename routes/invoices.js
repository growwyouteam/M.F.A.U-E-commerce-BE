const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get Order Invoice PDF
// @route   GET /api/invoices/:id
// @access  Private/Admin
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).send('Order not found');
        }

        const doc = new PDFDocument({
            margin: 50,
            size: 'A4'
        });

        // Set Headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);

        doc.pipe(res);

        // Colors
        const primaryColor = '#1e40af';
        const lightGray = '#f3f4f6';
        const darkGray = '#374151';
        const borderColor = '#e5e7eb';

        // --- HEADER SECTION ---
        // Company Logo/Name (Left)
        doc.fontSize(14)
            .fillColor(primaryColor)
            .font('Helvetica-Bold')
            .text('M.F.A.U AYURVEDIC & UNANI PVT LTD', 50, 50);

        doc.fontSize(9)
            .fillColor(darkGray)
            .font('Helvetica')
            .text('Ayurvedic & Unani Medicine', 50, 68);

        // Invoice Title (Right)
        doc.fontSize(28)
            .fillColor(primaryColor)
            .font('Helvetica-Bold')
            .text('INVOICE', 400, 50, { align: 'right' });

        // Decorative line under header
        doc.moveTo(50, 88)
            .lineTo(545, 88)
            .lineWidth(2)
            .strokeColor(primaryColor)
            .stroke();

        // --- COMPANY & ORDER INFO SECTION ---
        let yPos = 108;

        // Left: Company Details
        doc.fontSize(8)
            .fillColor(darkGray)
            .font('Helvetica')
            .text('Kh. No. 349 JAGDISHPURA Agra', 50, yPos)
            .text('State: 09-Uttar Pradesh', 50, yPos + 11)
            .text('Contact: +918347298179', 50, yPos + 22)
            .text('GSTIN: 09AATCM2683D1Z2', 50, yPos + 33);

        // Right: Invoice Details Box
        const boxX = 350;
        const boxY = yPos - 5;
        const boxWidth = 195;
        const boxHeight = 70;

        // Draw box background
        doc.rect(boxX, boxY, boxWidth, boxHeight)
            .fillColor(lightGray)
            .fill();

        // Invoice details inside box
        doc.fillColor(darkGray)
            .fontSize(9)
            .font('Helvetica-Bold')
            .text('Invoice Number:', boxX + 10, boxY + 10)
            .font('Helvetica')
            .text(`#${order._id.toString().slice(-8).toUpperCase()}`, boxX + 100, boxY + 10);

        doc.font('Helvetica-Bold')
            .text('Date:', boxX + 10, boxY + 25)
            .font('Helvetica')
            .text(new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }), boxX + 100, boxY + 25);

        doc.font('Helvetica-Bold')
            .text('Status:', boxX + 10, boxY + 40)
            .font('Helvetica')
            .fillColor(order.status === 'Delivered' ? '#10b981' : '#f59e0b')
            .text(order.status.toUpperCase(), boxX + 100, boxY + 40);

        // --- BILL TO SECTION ---
        yPos = 220;

        doc.fillColor(primaryColor)
            .fontSize(11)
            .font('Helvetica-Bold')
            .text('BILL TO:', 50, yPos);

        doc.fillColor(darkGray)
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(order.customerName, 50, yPos + 20);

        doc.font('Helvetica')
            .fontSize(9)
            .text(order.address, 50, yPos + 35, { width: 250 })
            .text(`Phone: ${order.phone}`, 50, yPos + 60);

        // --- ITEMS TABLE ---
        const tableTop = 320;

        // Table Header Background
        doc.rect(50, tableTop, 495, 25)
            .fillColor(primaryColor)
            .fill();

        // Table Headers
        doc.fillColor('#ffffff')
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('ITEM', 60, tableTop + 8)
            .text('QTY', 320, tableTop + 8, { width: 50, align: 'center' })
            .text('PRICE', 390, tableTop + 8, { width: 70, align: 'right' })
            .text('TOTAL', 475, tableTop + 8, { width: 60, align: 'right' });

        // Table Items
        let currentY = tableTop + 35;
        let rowIndex = 0;

        order.items.forEach(item => {
            const total = item.price * item.quantity;

            // Alternate row background
            if (rowIndex % 2 === 0) {
                doc.rect(50, currentY - 5, 495, 25)
                    .fillColor('#fafafa')
                    .fill();
            }

            doc.fillColor(darkGray)
                .fontSize(9)
                .font('Helvetica')
                .text(item.productName, 60, currentY, { width: 240 })
                .text(item.quantity.toString(), 320, currentY, { width: 50, align: 'center' })
                .text(`Rs ${item.price.toFixed(2)}`, 390, currentY, { width: 70, align: 'right' })
                .text(`Rs ${total.toFixed(2)}`, 475, currentY, { width: 60, align: 'right' });

            currentY += 25;
            rowIndex++;
        });

        // Bottom border of table
        doc.moveTo(50, currentY)
            .lineTo(545, currentY)
            .lineWidth(1)
            .strokeColor(borderColor)
            .stroke();

        // --- TOTALS SECTION ---
        currentY += 20;

        // Subtotal
        doc.fontSize(9)
            .fillColor(darkGray)
            .font('Helvetica')
            .text('Subtotal:', 390, currentY, { width: 70, align: 'right' })
            .text(`Rs ${order.totalAmount.toFixed(2)}`, 475, currentY, { width: 60, align: 'right' });

        currentY += 20;

        // Grand Total Box
        doc.rect(350, currentY - 5, 195, 35)
            .fillColor(primaryColor)
            .fill();

        doc.fontSize(11)
            .fillColor('#ffffff')
            .font('Helvetica-Bold')
            .text('GRAND TOTAL:', 360, currentY + 8, { width: 90, align: 'left' })
            .fontSize(13)
            .text(`Rs ${order.totalAmount.toFixed(2)}`, 450, currentY + 8, { width: 85, align: 'right' });

        // --- TERMS & CONDITIONS SECTION ---
        currentY += 55;

        doc.fontSize(10)
            .fillColor(primaryColor)
            .font('Helvetica-Bold')
            .text('Terms And Conditions', 50, currentY);

        currentY += 18;

        doc.fontSize(8)
            .fillColor(darkGray)
            .font('Helvetica')
            .text('Thank you for doing business with us. aap Ghar Baithe order Karke Kisi. bhi Bimari Ki Dawa', 50, currentY, { width: 495 })
            .text('mangwa. sakte hain', 50, currentY + 10, { width: 495 });

        currentY += 28;

        doc.text('Hamare yahan se courier kezariye all India mein Dawa bheji. Jaati Hai.', 50, currentY, { width: 495 });

        // --- FOOTER SECTION ---
        currentY += 35;

        // Decorative line
        doc.moveTo(50, currentY)
            .lineTo(545, currentY)
            .lineWidth(1)
            .strokeColor(borderColor)
            .stroke();

        // Thank you message
        doc.fontSize(11)
            .fillColor(primaryColor)
            .font('Helvetica-Bold')
            .text('Thank you for your business!', 50, currentY + 15, {
                align: 'center',
                width: 495
            });

        doc.fontSize(8)
            .fillColor(darkGray)
            .font('Helvetica')
            .text('For any queries, please contact us at +91 9458492978', 50, currentY + 35, {
                align: 'center',
                width: 495
            });

        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
