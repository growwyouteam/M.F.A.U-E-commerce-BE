const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    // Replaced original 'description' with 'shortDescription' and 'fullDescription'
    shortDescription: { type: String },
    fullDescription: { type: String },
    price: { type: Number, required: true }, // This is the Sale Price
    mrp: { type: Number }, // Maximum Retail Price
    shippingCharge: { type: Number, default: 0 },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }], // Array of image URLs/paths (assuming this was the intent for 'images: image: [String]')
    videoUrl: { type: String },
    size: { type: String }, // Can be comma separated or JSON if needed later
    showOnLanding: { type: Boolean, default: false },
    usages: { type: String },
    ingredients: { type: String },
    metaTitle: { type: String },
    metaKeywords: { type: String },
    metaDescription: { type: String },
    priceTiers: [{
        quantity: { type: String, required: true }, // e.g., "1kg", "150g", "2x150g"
        price: { type: Number, required: true },
        unit: { type: String } // optional, e.g., "pack", "bottle"
    }],
    stock: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);

