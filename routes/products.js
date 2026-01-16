const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
    try {
        let query = {};
        if (req.query.admin !== 'true') {
            query.status = 'active';
        }

        if (req.query.category) {
            query.categoryId = req.query.category;
        }
        const products = await Product.find(query).populate('categoryId', 'name');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('categoryId', 'name');
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST api/products
// @desc    Create a product
// @access  Private/Admin
router.post('/', protect, async (req, res) => {
    const {
        name, description, price, stock, categoryId, images, status,
        mrp, shippingCharge, videoUrl, size, showOnLanding,
        shortDescription, fullDescription, ingredients, usages,
        metaTitle, metaKeywords, metaDescription, priceTiers
    } = req.body;
    try {
        const product = new Product({
            name, description, price, stock, categoryId, images, status,
            mrp, shippingCharge, videoUrl, size, showOnLanding,
            shortDescription, fullDescription, ingredients, usages,
            metaTitle, metaKeywords, metaDescription, priceTiers
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.name = req.body.name || product.name;
            product.description = req.body.description || product.description;
            product.price = req.body.price || product.price;
            product.stock = req.body.stock || product.stock;
            product.categoryId = req.body.categoryId || product.categoryId;
            product.images = req.body.images || product.images;
            product.status = req.body.status || product.status;

            // New Fields
            product.mrp = req.body.mrp !== undefined ? req.body.mrp : product.mrp;
            product.shippingCharge = req.body.shippingCharge !== undefined ? req.body.shippingCharge : product.shippingCharge;
            product.videoUrl = req.body.videoUrl || product.videoUrl;
            product.size = req.body.size || product.size;
            product.showOnLanding = req.body.showOnLanding !== undefined ? req.body.showOnLanding : product.showOnLanding;
            product.shortDescription = req.body.shortDescription || product.shortDescription;
            product.fullDescription = req.body.fullDescription || product.fullDescription;
            product.ingredients = req.body.ingredients || product.ingredients;
            product.usages = req.body.usages || product.usages;
            product.metaTitle = req.body.metaTitle || product.metaTitle;
            product.metaKeywords = req.body.metaKeywords || product.metaKeywords;
            product.metaDescription = req.body.metaDescription || product.metaDescription;

            // Price Tiers
            if (req.body.priceTiers !== undefined) {
                product.priceTiers = req.body.priceTiers;
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
