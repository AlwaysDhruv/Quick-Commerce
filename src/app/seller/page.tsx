
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { getOrdersBySeller, getProductsBySeller, getBuyerCountFromFirestore, addProductToFirestore, type Order } from '@/lib/firestore';
import { DollarSign, Package, ShoppingCart, Users, Loader2, Database, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';

const sampleProducts = [
    {
        name: 'Classic Leather Watch',
        description: 'A timeless watch with a genuine leather strap and a stainless steel case. Water-resistant up to 50m.',
        price: 150.0,
        category: 'Accessories',
        stock: 25,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'leather watch',
    },
    {
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Immerse yourself in sound with these over-ear headphones featuring active noise cancellation and 30-hour battery life.',
        price: 249.99,
        category: 'Electronics',
        stock: 15,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'headphones',
    },
    {
        name: 'Organic Cotton T-Shirt',
        description: 'A soft, breathable t-shirt made from 100% organic cotton. Ethically sourced and produced.',
        price: 25.0,
        category: 'Apparel',
        stock: 100,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'cotton t-shirt',
    },
    {
        name: 'French Press Coffee Maker',
        description: 'Brew rich, flavorful coffee with this classic 8-cup French press. Features a durable borosilicate glass carafe.',
        price: 35.0,
        category: 'Kitchenware',
        stock: 40,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'french press',
    },
    {
        name: 'Yoga Mat with Carrying Strap',
        description: 'A non-slip, eco-friendly yoga mat perfect for all types of practice. Includes a convenient carrying strap.',
        price: 40.0,
        category: 'Sports & Outdoors',
        stock: 60,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'yoga mat',
    },
    {
        name: 'The Great Gatsby by F. Scott Fitzgerald',
        description: 'A classic novel exploring themes of decadence, idealism, and social upheaval in the Jazz Age.',
        price: 12.99,
        category: 'Books',
        stock: 80,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'classic book',
    },
    {
        name: 'Handmade Ceramic Mug',
        description: 'A unique, hand-thrown ceramic mug with a beautiful speckled glaze. Dishwasher and microwave safe.',
        price: 28.0,
        category: 'Home Goods',
        stock: 50,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'ceramic mug',
    },
    {
        name: 'Natural Bar Soap - Lavender',
        description: 'A calming and moisturizing bar soap made with natural ingredients and scented with pure lavender essential oil.',
        price: 8.0,
        category: 'Beauty & Personal Care',
        stock: 120,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'lavender soap',
    },
    {
        name: 'Wooden Chess Set',
        description: 'A beautiful, handcrafted wooden chess set with weighted pieces and a foldable board for easy storage.',
        price: 75.0,
        category: 'Toys & Games',
        stock: 30,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'chess set',
    },
    {
        name: 'Gourmet Dark Chocolate Bar',
        description: 'A rich and intense 72% cacao dark chocolate bar, ethically sourced from single-origin beans.',
        price: 6.0,
        category: 'Food & Grocery',
        stock: 200,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'dark chocolate',
    },
    {
        name: 'Plush Dog Bed',
        description: 'A comfortable and supportive orthopedic dog bed with a removable, washable cover.',
        price: 55.0,
        category: 'Pet Supplies',
        stock: 45,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'dog bed',
    },
    {
        name: 'Succulent Plant Assortment',
        description: 'A set of 5 live succulent plants in 2-inch pots. Perfect for home decor or as a gift.',
        price: 20.0,
        category: 'Garden & Outdoor',
        stock: 70,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'succulent plants',
    },
    {
        name: 'Cordless Power Drill',
        description: 'A powerful 20V cordless drill with two batteries, a charger, and a 10-piece drill bit set.',
        price: 99.0,
        category: 'Tools & Home Improvement',
        stock: 35,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'power drill',
    },
    {
        name: 'Baby Onesie - 3 Pack',
        description: 'A set of three soft, 100% cotton onesies for your little one. Available in various sizes.',
        price: 18.0,
        category: 'Baby',
        stock: 90,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'baby onesie',
    },
    {
        name: 'Vintage Style Film Camera',
        description: 'Capture memories with this reusable 35mm film camera, featuring a built-in flash.',
        price: 45.0,
        category: 'Camera & Photo',
        stock: 20,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'film camera',
    },
    {
        name: 'Electric Toothbrush',
        description: 'An advanced electric toothbrush with 5 cleaning modes and a pressure sensor to protect your gums.',
        price: 80.0,
        category: 'Health & Household',
        stock: 50,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'electric toothbrush',
    },
    {
        name: 'Acoustic Guitar',
        description: 'A full-size dreadnought acoustic guitar with a spruce top, perfect for beginners and intermediate players.',
        price: 199.0,
        category: 'Musical Instruments',
        stock: 18,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'acoustic guitar',
    },
    {
        name: 'Modern Office Desk',
        description: 'A sleek and minimalist desk with a spacious work surface and sturdy metal legs.',
        price: 250.0,
        category: 'Office Products',
        stock: 22,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'office desk',
    },
    {
        name: 'Leather Duffel Bag',
        description: 'A stylish and durable leather duffel bag, perfect for weekend getaways. Features a spacious main compartment.',
        price: 180.0,
        category: 'Luggage & Travel Gear',
        stock: 28,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'duffel bag',
    },
    {
        name: 'Sketchbook and Pencil Set',
        description: 'A professional artist-quality sketchbook with 100 sheets and a 12-piece set of graphite pencils.',
        price: 22.0,
        category: 'Arts, Crafts & Sewing',
        stock: 65,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'sketchbook set',
    },
    {
        name: 'Smart LED Light Bulb',
        description: 'A Wi-Fi enabled, color-changing LED light bulb that works with Alexa and Google Assistant.',
        price: 15.0,
        category: 'Smart Home',
        stock: 150,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'smart bulb',
    },
    {
        name: 'Running Shoes',
        description: 'Lightweight and breathable running shoes with cushioned soles for maximum comfort and performance.',
        price: 120.0,
        category: 'Shoes',
        stock: 75,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'running shoes',
    },
    {
        name: 'Porcelain Dinnerware Set',
        description: 'A 16-piece dinnerware set for 4, including dinner plates, salad plates, bowls, and mugs.',
        price: 90.0,
        category: 'Dining',
        stock: 30,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'dinnerware set',
    },
    {
        name: 'Vitamin C Serum',
        description: 'A potent antioxidant serum that brightens skin, reduces fine lines, and evens out skin tone.',
        price: 25.0,
        category: 'Skincare',
        stock: 85,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'face serum',
    },
    {
        name: 'Board Game - Settlers of Catan',
        description: 'A classic strategy board game where players collect resources and build settlements to dominate the island of Catan.',
        price: 49.0,
        category: 'Board Games',
        stock: 40,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'board game',
    },
    {
        name: 'Camping Tent - 2 Person',
        description: 'A lightweight and waterproof 2-person tent, easy to set up and perfect for backpacking.',
        price: 110.0,
        category: 'Camping & Hiking',
        stock: 33,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'camping tent',
    },
    {
        name: 'Electric Kettle',
        description: 'A fast-boiling 1.7L electric kettle with an auto shut-off feature and a sleek stainless steel design.',
        price: 40.0,
        category: 'Small Appliances',
        stock: 55,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'electric kettle',
    },
    {
        name: 'Men\'s Denim Jacket',
        description: 'A classic trucker-style denim jacket with a comfortable fit and timeless appeal.',
        price: 85.0,
        category: 'Men\'s Fashion',
        stock: 48,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'denim jacket',
    },
    {
        name: 'Women\'s High-Waisted Leggings',
        description: 'Buttery soft, high-waisted leggings that are perfect for workouts or lounging. Opaque and squat-proof.',
        price: 50.0,
        category: 'Women\'s Fashion',
        stock: 95,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'black leggings',
    },
    {
        name: 'Silver Pendant Necklace',
        description: 'A delicate sterling silver necklace with a minimalist pendant. Perfect for everyday wear.',
        price: 60.0,
        category: 'Jewelry',
        stock: 60,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'silver necklace',
    },
    {
        name: 'Action Figure - Superhero',
        description: 'A detailed 6-inch collectible action figure of a popular superhero with multiple points of articulation.',
        price: 22.99,
        category: 'Collectibles',
        stock: 70,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'action figure',
    },
    {
        name: 'Portable Bluetooth Speaker',
        description: 'A compact and waterproof Bluetooth speaker with rich sound and 12 hours of playtime.',
        price: 50.0,
        category: 'Portable Audio',
        stock: 80,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'bluetooth speaker',
    },
    {
        name: 'Hard-shell Suitcase',
        description: 'A durable and lightweight hard-shell spinner suitcase with a built-in TSA lock. Carry-on size.',
        price: 130.0,
        category: 'Travel',
        stock: 38,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'suitcase',
    },
    {
        name: 'Drone with 4K Camera',
        description: 'A foldable GPS drone with a 4K camera, 30-minute flight time, and intelligent flight modes.',
        price: 399.0,
        category: 'Drones & Quadcopters',
        stock: 12,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'camera drone',
    },
    {
        name: 'Air Fryer',
        description: 'A 5.8-quart large capacity air fryer that lets you cook your favorite foods with little to no oil.',
        price: 119.99,
        category: 'Kitchen Appliances',
        stock: 42,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'air fryer',
    },
    {
        name: 'Insulated Water Bottle',
        description: 'A 32oz stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
        price: 32.0,
        category: 'Drinkware',
        stock: 110,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'water bottle',
    },
    {
        name: 'Silk Pillowcase',
        description: 'A 100% pure mulberry silk pillowcase that helps prevent wrinkles and hair breakage.',
        price: 45.0,
        category: 'Bedding',
        stock: 65,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'silk pillowcase',
    },
    {
        name: 'Resistance Bands Set',
        description: 'A set of 5 loop resistance bands for home workouts, physical therapy, and strength training.',
        price: 15.99,
        category: 'Exercise & Fitness',
        stock: 130,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'resistance bands',
    },
    {
        name: 'Fountain Pen',
        description: 'An elegant fountain pen with a medium nib for a smooth writing experience. Includes an ink converter.',
        price: 55.0,
        category: 'Writing Instruments',
        stock: 50,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'fountain pen',
    },
    {
        name: 'Cast Iron Skillet',
        description: 'A pre-seasoned 12-inch cast iron skillet that provides even heat distribution for perfect searing.',
        price: 48.0,
        category: 'Cookware',
        stock: 35,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'cast iron skillet',
    },
    {
        name: 'Gaming Mouse',
        description: 'A high-precision gaming mouse with customizable RGB lighting and programmable buttons.',
        price: 65.0,
        category: 'PC Gaming',
        stock: 58,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'gaming mouse',
    },
    {
        name: 'Sunglasses - Aviator Style',
        description: 'Classic aviator sunglasses with polarized lenses that provide 100% UV protection.',
        price: 70.0,
        category: 'Eyewear',
        stock: 88,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'aviator sunglasses',
    },
    {
        name: 'Jigsaw Puzzle - 1000 Pieces',
        description: 'A challenging and beautifully illustrated 1000-piece jigsaw puzzle for adults.',
        price: 18.99,
        category: 'Puzzles',
        stock: 90,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'jigsaw puzzle',
    },
    {
        name: 'Wall Art - Abstract Canvas',
        description: 'A modern abstract canvas print to add a touch of elegance to any room. Size: 24x36 inches.',
        price: 110.0,
        category: 'Wall Art',
        stock: 25,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'abstract art',
    },
    {
        name: 'Herbal Tea Sampler',
        description: 'A collection of 12 different organic herbal teas, including chamomile, peppermint, and ginger.',
        price: 16.0,
        category: 'Beverages',
        stock: 140,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'herbal tea',
    },
    {
        name: 'LEGO Architecture Set',
        description: 'Recreate a famous landmark with this detailed LEGO Architecture set. For ages 12 and up.',
        price: 99.99,
        category: 'Building Toys',
        stock: 32,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'lego set',
    },
    {
        name: 'Scented Candle - Vanilla',
        description: 'A long-lasting scented candle with the warm and comforting aroma of vanilla bean.',
        price: 20.0,
        category: 'Home Fragrance',
        stock: 100,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'vanilla candle',
    },
    {
        name: 'Hiking Boots',
        description: 'Waterproof and durable hiking boots with excellent ankle support and traction for all terrains.',
        price: 160.0,
        category: 'Outdoor Footwear',
        stock: 45,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'hiking boots',
    },
    {
        name: 'Digital Kitchen Scale',
        description: 'A precise digital kitchen scale for baking and cooking, with a stainless steel platform.',
        price: 19.99,
        category: 'Utensils & Gadgets',
        stock: 77,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'kitchen scale',
    },
    {
        name: 'Makeup Brush Set',
        description: 'A professional 14-piece makeup brush set with soft, synthetic bristles and a travel case.',
        price: 30.0,
        category: 'Cosmetics',
        stock: 98,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'makeup brushes',
    },
    {
        name: 'Pickleball Paddles Set',
        description: 'A set of two lightweight pickleball paddles with a graphite face and a honeycomb core.',
        price: 70.0,
        category: 'Team Sports',
        stock: 53,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'pickleball paddles',
    },
    {
        name: 'Robot Vacuum Cleaner',
        description: 'A smart robot vacuum with Wi-Fi connectivity, self-charging, and compatibility with voice assistants.',
        price: 280.0,
        category: 'Vacuums & Floor Care',
        stock: 21,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'robot vacuum',
    },
    {
        name: 'Vinyl Record - "Rumours" by Fleetwood Mac',
        description: 'The timeless album on 180-gram vinyl, featuring classic hits.',
        price: 24.99,
        category: 'Vinyl Records',
        stock: 66,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'vinyl record',
    },
    {
        name: 'Gardening Gloves',
        description: 'Durable and flexible gardening gloves with a breathable design and a protective coating.',
        price: 14.0,
        category: 'Gardening Tools',
        stock: 150,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'gardening gloves',
    },
    {
        name: 'Cocktail Shaker Set',
        description: 'A complete bartender kit with a cocktail shaker, jigger, strainer, and mixing spoon.',
        price: 42.0,
        category: 'Barware',
        stock: 48,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'cocktail set',
    },
    {
        name: 'External Hard Drive - 2TB',
        description: 'A portable 2TB external hard drive for easy file backup and storage. USB 3.0 compatible.',
        price: 75.0,
        category: 'Computer Accessories',
        stock: 55,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'hard drive',
    },
    {
        name: 'Sunscreen SPF 50',
        description: 'A broad-spectrum SPF 50 sunscreen that is lightweight, non-greasy, and water-resistant.',
        price: 15.0,
        category: 'Sun Care',
        stock: 200,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'sunscreen',
    },
    {
        name: 'Throw Blanket',
        description: 'A soft and cozy fleece throw blanket, perfect for cuddling up on the couch. 50x60 inches.',
        price: 29.99,
        category: 'Home Textiles',
        stock: 80,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'throw blanket',
    },
    {
        name: 'Essential Oil Diffuser',
        description: 'An ultrasonic aromatherapy diffuser with a 400ml capacity and 7 ambient light settings.',
        price: 38.0,
        category: 'Aromatherapy',
        stock: 63,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'oil diffuser',
    },
    {
        name: 'Dumbbell Set with Rack',
        description: 'A set of neoprene dumbbells (5, 8, 12 lbs) with a convenient storage rack.',
        price: 150.0,
        category: 'Strength Training',
        stock: 28,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'dumbbell set',
    },
    {
        name: 'Cat Tree Tower',
        description: 'A multi-level cat tree with scratching posts, a condo, and perches for your feline friend.',
        price: 95.0,
        category: 'Cat Supplies',
        stock: 31,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'cat tree',
    },
    {
        name: 'Wireless Keyboard and Mouse Combo',
        description: 'A sleek and quiet wireless keyboard and mouse combo with a long battery life.',
        price: 45.0,
        category: 'Computer Peripherals',
        stock: 72,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'keyboard mouse',
    },
    {
        name: 'Picture Frame Set',
        description: 'A set of 7 gallery wall picture frames in various sizes to display your favorite photos.',
        price: 50.0,
        category: 'Home Decor',
        stock: 68,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'picture frames',
    },
    {
        name: 'Lip Balm - 3 Pack',
        description: 'A pack of three moisturizing lip balms made with natural beeswax and vitamin E.',
        price: 9.0,
        category: 'Lip Care',
        stock: 300,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'lip balm',
    },
    {
        name: 'Kids\' Building Blocks',
        description: 'A set of 100 large, colorful building blocks for creative and imaginative play.',
        price: 30.0,
        category: 'Preschool Toys',
        stock: 85,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'building blocks',
    },
    {
        name: 'Air Purifier',
        description: 'A HEPA air purifier that captures 99.97% of dust, pollen, smoke, and other allergens.',
        price: 125.0,
        category: 'Heating, Cooling & Air Quality',
        stock: 36,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'air purifier',
    },
    {
        name: 'Blender for Shakes and Smoothies',
        description: 'A powerful personal blender with two portable 20oz blending cups.',
        price: 60.0,
        category: 'Blenders',
        stock: 51,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'smoothie blender',
    },
    {
        name: 'First Aid Kit',
        description: 'A comprehensive 299-piece first aid kit for home, car, or travel emergencies.',
        price: 28.0,
        category: 'Medical Supplies',
        stock: 94,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'first aid',
    },
    {
        name: 'Fishing Rod and Reel Combo',
        description: 'A telescopic fishing rod and reel combo, perfect for beginners and easy to transport.',
        price: 65.0,
        category: 'Fishing',
        stock: 44,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'fishing rod',
    },
    {
        name: 'Backpack for Laptops',
        description: 'A stylish and functional backpack with a padded compartment for up to a 15.6-inch laptop.',
        price: 55.0,
        category: 'Bags & Briefcases',
        stock: 78,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'laptop backpack',
    },
    {
        name: 'Electric Shaver for Men',
        description: 'A wet and dry electric shaver with precision blades for a close, comfortable shave.',
        price: 90.0,
        category: 'Shaving & Hair Removal',
        stock: 49,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'electric shaver',
    },
    {
        name: 'Car Phone Mount',
        description: 'A universal car phone mount that securely attaches to your dashboard or windshield.',
        price: 16.99,
        category: 'Automotive',
        stock: 180,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'phone mount',
    },
    {
        name: 'Dog Leash - Reflective',
        description: 'A durable 6-foot dog leash with reflective stitching for visibility during night walks.',
        price: 18.0,
        category: 'Dog Training & Behavior',
        stock: 115,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'dog leash',
    },
    {
        name: 'Watercolor Paint Set',
        description: 'A set of 24 vibrant watercolor paints in a portable case, including a water brush.',
        price: 25.0,
        category: 'Painting Supplies',
        stock: 73,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'watercolor paints',
    },
    {
        name: 'Tire Inflator Portable Air Compressor',
        description: 'A 12V DC portable air compressor for inflating car tires, bikes, and sports equipment.',
        price: 40.0,
        category: 'Tires & Wheels',
        stock: 61,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'tire inflator',
    },
    {
        name: 'Baby Monitor with Camera and Audio',
        description: 'A reliable baby monitor with a 5-inch screen, night vision, and two-way talk.',
        price: 130.0,
        category: 'Baby Safety',
        stock: 37,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'baby monitor',
    },
    {
        name: 'Digital Camera',
        description: 'A compact point-and-shoot digital camera with 20MP resolution and 8x optical zoom.',
        price: 220.0,
        category: 'Digital Cameras',
        stock: 23,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'digital camera',
    },
    {
        name: 'Standing Desk Converter',
        description: 'An adjustable height standing desk converter that sits on top of your existing desk.',
        price: 180.0,
        category: 'Office Furniture',
        stock: 29,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'standing desk',
    },
    {
        name: 'Hair Dryer',
        description: 'A professional salon-grade hair dryer with ionic technology to reduce frizz and dry hair faster.',
        price: 60.0,
        category: 'Hair Care',
        stock: 57,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'hair dryer',
    },
    {
        name: 'Bird Feeder',
        description: 'A squirrel-proof hanging bird feeder with a large seed capacity to attract various wild birds.',
        price: 35.0,
        category: 'Birdwatching',
        stock: 69,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'bird feeder',
    },
    {
        name: 'Golf Balls - 12 Pack',
        description: 'A dozen high-performance golf balls designed for distance and a soft feel around the green.',
        price: 29.99,
        category: 'Golf',
        stock: 111,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'golf balls',
    },
    {
        name: 'Mechanical Keyboard',
        description: 'A compact tenkeyless (TKL) mechanical keyboard with tactile brown switches and white backlighting.',
        price: 95.0,
        category: 'Keyboards',
        stock: 52,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'mechanical keyboard',
    },
    {
        name: 'Smartwatch with Heart Rate Monitor',
        description: 'A feature-packed smartwatch that tracks your steps, heart rate, sleep, and phone notifications.',
        price: 150.0,
        category: 'Wearable Technology',
        stock: 46,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'smartwatch',
    },
    {
        name: 'Weighted Blanket',
        description: 'A 15 lb weighted blanket designed to provide calming pressure and improve sleep quality.',
        price: 85.0,
        category: 'Wellness',
        stock: 39,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'weighted blanket',
    },
    {
        name: 'Espresso Machine',
        description: 'A semi-automatic espresso machine with a powerful 15-bar pump and a milk frother.',
        price: 299.0,
        category: 'Coffee & Tea Makers',
        stock: 19,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'espresso machine',
    },
    {
        name: 'Children\'s Picture Book',
        description: 'A beautifully illustrated hardcover picture book with a heartwarming story for children ages 3-5.',
        price: 15.99,
        category: 'Children\'s Books',
        stock: 125,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'kids book',
    },
    {
        name: 'Indoor Plant Pot',
        description: 'A stylish 8-inch ceramic plant pot with a drainage hole and a matching saucer.',
        price: 24.0,
        category: 'Planters',
        stock: 83,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'plant pot',
    },
    {
        name: 'Sewing Machine',
        description: 'A user-friendly sewing machine with 27 built-in stitches, perfect for beginners.',
        price: 180.0,
        category: 'Sewing',
        stock: 27,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'sewing machine',
    },
    {
        name: 'Electric Guitar',
        description: 'A classic S-style electric guitar with three single-coil pickups and a comfortable maple neck.',
        price: 250.0,
        category: 'Guitars',
        stock: 24,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'electric guitar',
    },
    {
        name: 'Women\'s Raincoat',
        description: 'A waterproof and breathable raincoat with a hood and sealed seams to keep you dry.',
        price: 95.0,
        category: 'Outerwear',
        stock: 54,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'raincoat',
    },
    {
        name: 'Home Security Camera',
        description: 'An indoor 1080p Wi-Fi security camera with night vision and two-way audio.',
        price: 40.0,
        category: 'Surveillance',
        stock: 96,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'security camera',
    },
    {
        name: 'Bath Towel Set',
        description: 'A set of four plush and absorbent 100% cotton bath towels.',
        price: 50.0,
        category: 'Bath',
        stock: 76,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'towel set',
    },
    {
        name: 'Cookbook - "The Joy of Cooking"',
        description: 'The definitive cookbook with over 4,000 recipes and essential cooking techniques.',
        price: 25.99,
        category: 'Cookbooks',
        stock: 81,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'cookbook',
    },
    {
        name: 'Bicycle Helmet',
        description: 'An adjustable and ventilated bicycle helmet for adults, certified for safety.',
        price: 45.0,
        category: 'Cycling',
        stock: 89,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'bicycle helmet',
    },
    {
        name: 'Digital Photo Frame',
        description: 'A 10-inch Wi-Fi digital photo frame that lets you share photos and videos from your phone.',
        price: 110.0,
        category: 'Frames',
        stock: 41,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'photo frame',
    },
    {
        name: 'Projector',
        description: 'A mini portable projector that supports 1080p resolution, perfect for home movie nights.',
        price: 99.0,
        category: 'Video Projectors',
        stock: 34,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'mini projector',
    },
];

function SalesChart({ orders }: { orders: Order[] }) {
  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    // Aggregate sales by month
    const monthlySales = orders.reduce((acc, order) => {
      const month = format(order.createdAt.toDate(), 'MMM yyyy');
      acc[month] = (acc[month] || 0) + order.total;
      return acc;
    }, {} as Record<string, number>);

    // Get the last 6 months including the current one
    const sortedMonths = Object.keys(monthlySales).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    return sortedMonths.slice(-6).map(month => ({
      name: month,
      total: monthlySales[month],
    }));
  }, [orders]);

  if (chartData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="text-accent" /> Sales Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] flex items-center justify-center">
                <p className="text-muted-foreground">No sales data yet. Once you get orders, your sales chart will appear here.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><TrendingUp className="text-accent" /> Sales Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
            config={{ total: { label: 'Sales', color: 'hsl(var(--primary))' } }}
            className="h-[300px] w-full"
        >
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
             />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default function SellerDashboard() {
  const { user } = useAuth();
  const [productCount, setProductCount] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [buyerCount, setBuyerCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    if (user) {
      setLoading(true);
      try {
        const [products, fetchedOrders, buyers] = await Promise.all([
          getProductsBySeller(user.uid),
          getOrdersBySeller(user.uid),
          getBuyerCountFromFirestore(),
        ]);

        setProductCount(products.length);
        setOrders(fetchedOrders);
        setTotalRevenue(fetchedOrders.reduce((sum, order) => sum + order.total, 0));
        setBuyerCount(buyers);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSeedProducts = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      const existingProducts = await getProductsBySeller(user.uid);
      const existingProductNames = new Set(existingProducts.map(p => p.name));
      const productsToAdd = sampleProducts.filter(p => !existingProductNames.has(p.name));
      
      if (productsToAdd.length === 0) {
         toast({
          title: "Products Already Seeded",
          description: "All sample products already exist in your store.",
        });
        setIsSeeding(false);
        return;
      }

      await Promise.all(productsToAdd.map(p => addProductToFirestore({ ...p, sellerId: user.uid })));
      
      toast({
        title: "Products Seeded!",
        description: `${productsToAdd.length} new sample products have been added.`,
      });

      await fetchData();

    } catch (error) {
      console.error("Failed to seed products:", error);
       toast({
        title: "Seeding Failed",
        description: "Could not add sample products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  }

  const renderStatCard = (title: string, value: string | number | null, icon: React.ReactNode, subtext?: string) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">Welcome, {user?.name}!</h1>
            <p className="text-muted-foreground">Here&apos;s a summary of your shop&apos;s performance.</p>
        </div>
        <Button variant="outline" onClick={handleSeedProducts} disabled={isSeeding}>
            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Seed Products
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderStatCard('Total Revenue', totalRevenue !== null ? `$${totalRevenue.toLocaleString()}` : 'N/A', <DollarSign className="h-4 w-4 text-muted-foreground" />)}
        {renderStatCard('Orders', orders ? `+${orders.length}` : 'N/A', <ShoppingCart className="h-4 w-4 text-muted-foreground" />)}
        {renderStatCard('Products', productCount !== null ? productCount : 'N/A', <Package className="h-4 w-4 text-muted-foreground" />, 'Total products listed')}
        {renderStatCard('Total Buyers', buyerCount !== null ? buyerCount : 'N/A', <Users className="h-4 w-4 text-muted-foreground" />, 'Total registered buyers')}
      </div>

      <div>
        <SalesChart orders={orders} />
      </div>
    </div>
  );
}
