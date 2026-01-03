const mongoose = require('mongoose');
const dotenv = require('dotenv');
const HomeSection = require('./models/HomeSection');
const HeroBanner = require('./models/HeroBanner');
const ServiceItem = require('./models/ServiceItem');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        // Clear existing
        await HomeSection.deleteMany({});
        await HeroBanner.deleteMany({});
        await ServiceItem.deleteMany({});

        // Seed Hero
        await HeroBanner.create([
            {
                title: 'New Season Arrivals',
                description: 'Check out the latest trends for this summer.',
                image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
                ctaText: 'Shop Now',
                ctaLink: '#products', // Anchor or route
                order: 1
            },
            {
                title: 'Exclusive Deals',
                description: 'Up to 50% off on selected items.',
                image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1200&q=80',
                ctaText: 'View Deals',
                ctaLink: '#deals',
                order: 2
            }
        ]);

        // Seed Services
        await ServiceItem.create([
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
                title: 'Verified Quality',
                description: 'All products are 100% authentic.',
                order: 1
            },
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>',
                title: 'Fast Shipping',
                description: 'Delivery within 3-5 business days.',
                order: 2
            },
            {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>',
                title: 'Secure Payment',
                description: '100% secure payment gateway.',
                order: 3
            }
        ]);

        // Seed Sections
        await HomeSection.create([
            { type: 'category-strip', order: 0, isActive: true },
            { type: 'hero', order: 1, isActive: true },
            { type: 'services', order: 2, isActive: true },
            { type: 'featured-products', title: 'Featured Products', subtitle: 'Handpicked for you', order: 3, isActive: true },
            { 
                type: 'banner', 
                title: 'Summer Sale', 
                subtitle: 'Get ready for the heat!', 
                image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80', 
                ctaText: 'See Offers', 
                ctaLink: '#',
                order: 4, 
                isActive: true 
            },
            { type: 'newsletter', title: 'Join Our Community', subtitle: 'Subscribe for latest updates', order: 5, isActive: true }
        ]);

        console.log('Home Config Seeded');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
