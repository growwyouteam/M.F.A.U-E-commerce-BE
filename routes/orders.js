const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product'); // To update stats if needed
const { protect, protectCustomer } = require('../middleware/authMiddleware');

// @route   POST api/orders
// @desc    Create new order
// @access  Private (Customer)
router.post('/', protectCustomer, async (req, res) => {
    const { address, items, totalAmount } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        const order = new Order({
            customerId: req.customer._id,
            email: req.customer.email,
            customerName: req.customer.name,
            phone: req.customer.phone,
            address,
            items,
            totalAmount
        });

        const createdOrder = await order.save();

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   GET api/orders/my-orders
// @desc    Get orders for authenticated customer
// @access  Private (Customer)
router.get('/my-orders', protectCustomer, async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.customer._id })
            .sort({ createdAt: -1 })
            .populate('items.productId', 'name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET api/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET api/orders/stats
// @desc    Get dashboard stats
// @access  Private/Admin
router.get('/stats', protect, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });
        const totalProducts = await Product.countDocuments(); // Need Product model
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

        res.json({
            totalOrders,
            pendingOrders,
            totalProducts,
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = req.body.status || order.status;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
