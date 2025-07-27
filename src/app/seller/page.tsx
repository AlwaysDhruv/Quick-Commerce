
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { getOrdersBySeller, getProductsBySeller, getBuyerCountFromFirestore, addProductToFirestore, getCategoriesBySeller, addCategory, type Order } from '@/lib/firestore';
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
        category: 'Watches',
        stock: 25,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'leather watch',
    },
    {
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Immerse yourself in sound with these over-ear headphones featuring active noise cancellation and 30-hour battery life.',
        price: 249.99,
        category: 'Audio & Home Theater',
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
        name: 'Smart LED Desk Lamp',
        description: 'A modern desk lamp with adjustable brightness, color temperature, and a built-in USB charging port.',
        price: 55.0,
        category: 'Lighting & Ceiling Fans',
        stock: 45,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'desk lamp',
    },
    {
        name: 'Portable Bluetooth Speaker',
        description: 'A compact and waterproof speaker with 12 hours of playtime, perfect for any adventure.',
        price: 45.99,
        category: 'Audio & Home Theater',
        stock: 70,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'bluetooth speaker',
    },
    {
        name: 'Men\'s Running Shoes',
        description: 'Lightweight and breathable running shoes with superior cushioning for maximum comfort.',
        price: 110.0,
        category: 'Shoes & Footwear',
        stock: 50,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'running shoes',
    },
    {
        name: 'Stainless Steel Water Bottle',
        description: 'A 32oz insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
        price: 22.5,
        category: 'Sports & Outdoors',
        stock: 150,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'water bottle',
    },
    {
        name: 'Plush Microfiber Throw Blanket',
        description: 'An ultra-soft and cozy 50"x60" throw blanket, perfect for snuggling on the couch.',
        price: 30.0,
        category: 'Bedding & Bath',
        stock: 90,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'plush blanket',
    },
    {
        name: 'Electric Kettle',
        description: 'A 1.7L fast-boil electric kettle with auto shut-off and boil-dry protection.',
        price: 39.99,
        category: 'Kitchenware',
        stock: 65,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'electric kettle',
    },
    {
        name: 'Scented Soy Candle',
        description: 'A hand-poured soy wax candle with a relaxing lavender and chamomile scent. 40-hour burn time.',
        price: 18.0,
        category: 'Home Decor',
        stock: 85,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'scented candle',
    },
    {
        name: 'Laptop Backpack',
        description: 'A durable and water-resistant backpack with a padded compartment for laptops up to 15.6 inches.',
        price: 60.0,
        category: 'Backpacks',
        stock: 55,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'laptop backpack',
    },
    {
        name: 'Digital Kitchen Scale',
        description: 'A high-precision food scale with a stainless steel platform and an easy-to-read LCD display.',
        price: 15.99,
        category: 'Kitchen & Dining',
        stock: 110,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'kitchen scale',
    },
    {
        name: 'Hardcover Ruled Notebook',
        description: 'A classic A5 hardcover notebook with 120 gsm thick paper, perfect for journaling or note-taking.',
        price: 14.0,
        category: 'Stationery & Office Supplies',
        stock: 200,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'hardcover notebook',
    },
    {
        name: 'Gaming Mouse',
        description: 'An ergonomic RGB gaming mouse with 8 programmable buttons and a 16,000 DPI optical sensor.',
        price: 50.0,
        category: 'Video Games',
        stock: 75,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'gaming mouse',
    },
    {
        name: '1080p Webcam with Microphone',
        description: 'A full HD webcam with a built-in noise-reducing microphone, ideal for video conferencing and streaming.',
        price: 40.0,
        category: 'Computers & Laptops',
        stock: 95,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'webcam',
    },
    {
        name: 'Organic Green Tea Bags',
        description: 'A box of 100 antioxidant-rich organic green tea bags for a healthy and refreshing beverage.',
        price: 12.0,
        category: 'Food & Grocery',
        stock: 180,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'green tea',
    },
    {
        name: 'Silicone Baking Mat Set',
        description: 'A set of three non-stick, food-grade silicone mats for baking sheets. Reusable and easy to clean.',
        price: 19.99,
        category: 'Kitchenware',
        stock: 130,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'baking mat',
    },
    {
        name: 'Resistance Bands Set',
        description: 'A set of 5 exercise bands with varying resistance levels, perfect for home workouts and physical therapy.',
        price: 16.5,
        category: 'Fitness & Exercise Equipment',
        stock: 140,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'resistance bands',
    },
    {
        name: 'Air Purifier for Home',
        description: 'A quiet HEPA air purifier that removes 99.97% of dust, pollen, smoke, and other airborne particles.',
        price: 89.99,
        category: 'Home Improvement & Tools',
        stock: 40,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'air purifier',
    },
    {
        name: 'Cordless Power Drill Set',
        description: 'A 20V cordless drill kit with two batteries, a charger, and a 30-piece drill bit set.',
        price: 99.0,
        category: 'Power & Hand Tools',
        stock: 35,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'power drill',
    },
    {
        name: 'Men\'s Classic Denim Jacket',
        description: 'A stylish and durable denim jacket with a comfortable fit, perfect for any casual occasion.',
        price: 75.0,
        category: 'Men\'s Fashion',
        stock: 60,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'denim jacket',
    },
    {
        name: 'Women\'s High-Waisted Leggings',
        description: 'Buttery-soft, opaque leggings with a comfortable high waistband for a flattering silhouette.',
        price: 28.0,
        category: 'Women\'s Fashion',
        stock: 150,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'leggings',
    },
    {
        name: 'Cast Iron Skillet',
        description: 'A pre-seasoned 12-inch cast iron skillet for superior heat retention and even cooking.',
        price: 32.0,
        category: 'Kitchenware',
        stock: 80,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'cast iron',
    },
    {
        name: 'Gardening Tool Set',
        description: 'A 10-piece heavy-duty gardening kit including a trowel, weeder, rake, and a durable carrying case.',
        price: 38.0,
        category: 'Garden & Outdoor Living',
        stock: 70,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'gardening tools',
    },
    {
        name: 'Acoustic Guitar Starter Pack',
        description: 'A full-size acoustic guitar with a gig bag, tuner, strings, picks, and a strap.',
        price: 130.0,
        category: 'Musical Instruments',
        stock: 25,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'acoustic guitar',
    },
    {
        name: 'Professional Watercolor Paint Set',
        description: 'A set of 48 vibrant watercolor paints in a portable metal case, including brushes.',
        price: 29.99,
        category: 'Art Supplies',
        stock: 90,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'watercolor paints',
    },
    {
        name: 'Baby Diaper Caddy Organizer',
        description: 'A stylish and portable felt caddy to keep all your baby essentials organized and accessible.',
        price: 21.0,
        category: 'Baby Products',
        stock: 110,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'diaper caddy',
    },
    {
        name: 'Smart WiFi Power Strip',
        description: 'A smart power strip with 4 outlets and 4 USB ports, compatible with Alexa and Google Home.',
        price: 26.99,
        category: 'Smart Home Devices',
        stock: 100,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'power strip',
    },
    {
        name: 'Dog Bed for Large Dogs',
        description: 'An orthopedic memory foam dog bed with a removable, washable cover for ultimate comfort.',
        price: 65.0,
        category: 'Dog Care Supplies',
        stock: 50,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'dog bed',
    },
    {
        name: 'Insulated Lunch Bag',
        description: 'A spacious and leakproof lunch tote for adults and kids, perfect for work or school.',
        price: 17.0,
        category: 'Luggage & Travel Gear',
        stock: 120,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'lunch bag',
    },
    {
        name: 'Polarized Sunglasses',
        description: 'Classic aviator sunglasses with polarized lenses for 100% UV protection and reduced glare.',
        price: 24.0,
        category: 'Sunglasses & Eyewear',
        stock: 160,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'sunglasses',
    },
    {
        name: 'Cat Tree with Scratching Posts',
        description: 'A multi-level cat tower with condos, perches, and sisal-covered scratching posts.',
        price: 85.0,
        category: 'Cat Care Supplies',
        stock: 45,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'cat tree',
    },
    {
        name: 'Electric Toothbrush with 8 Heads',
        description: 'A powerful sonic toothbrush with 5 cleaning modes and a 2-minute smart timer.',
        price: 36.99,
        category: 'Oral Care Products',
        stock: 85,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'electric toothbrush',
    },
    {
        name: '1000 Piece Jigsaw Puzzle',
        description: 'A challenging and beautifully illustrated jigsaw puzzle for adults featuring a vibrant landscape.',
        price: 19.0,
        category: 'Puzzles',
        stock: 110,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'jigsaw puzzle',
    },
    {
        name: 'Memory Foam Seat Cushion',
        description: 'An ergonomic seat cushion for office chairs to provide back and sciatica pain relief.',
        price: 33.0,
        category: 'Office Products',
        stock: 95,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'seat cushion',
    },
    {
        name: 'Digital Photo Frame',
        description: 'A 10-inch WiFi digital picture frame that allows you to share photos instantly from your phone.',
        price: 119.99,
        category: 'Electronics',
        stock: 30,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'photo frame',
    },
    {
        name: 'Vitamin C Serum for Face',
        description: 'A potent anti-aging serum with hyaluronic acid and vitamin E for a brighter, firmer complexion.',
        price: 22.0,
        category: 'Skin Care Products',
        stock: 150,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'face serum',
    },
    {
        name: 'Car Phone Mount',
        description: 'A universal air vent phone holder for cars, featuring a one-touch release mechanism.',
        price: 13.99,
        category: 'Automotive',
        stock: 250,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'phone mount',
    },
    {
        name: 'The Lord of the Rings Box Set',
        description: 'The complete three-volume paperback box set of J.R.R. Tolkien\'s epic fantasy masterpiece.',
        price: 35.0,
        category: 'Books',
        stock: 60,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'book set',
    },
    {
        name: 'Bamboo Cutting Board Set',
        description: 'A set of three organic bamboo cutting boards in various sizes, with juice grooves.',
        price: 25.0,
        category: 'Kitchenware',
        stock: 120,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'cutting boards',
    },
    {
        name: 'Dumbbell Set with Rack',
        description: 'A set of 5 pairs of neoprene-coated dumbbells (3-12 lbs) with a storage rack.',
        price: 140.0,
        category: 'Fitness & Exercise Equipment',
        stock: 20,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'dumbbell set',
    },
    {
        name: 'LEGO Classic Large Creative Brick Box',
        description: 'A 790-piece LEGO set with a wide range of colors and pieces for open-ended creative building.',
        price: 59.99,
        category: 'Building Toys',
        stock: 80,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'lego bricks',
    },
    {
        name: 'Robotic Vacuum Cleaner',
        description: 'A slim, quiet, self-charging robotic vacuum perfect for pet hair, carpets, and hard floors.',
        price: 229.99,
        category: 'Major Appliances',
        stock: 25,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'robotic vacuum',
    },
    {
        name: 'Sterling Silver Hoop Earrings',
        description: 'Classic and elegant polished 925 sterling silver hoop earrings for women.',
        price: 28.0,
        category: 'Jewelry',
        stock: 110,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'silver earrings',
    },
    {
        name: 'Cocktail Shaker Set',
        description: 'A 12-piece bartender kit with a stainless steel shaker, jigger, strainer, and stand.',
        price: 42.0,
        category: 'Kitchen & Dining',
        stock: 75,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'cocktail set',
    },
    {
        name: 'Outdoor String Lights',
        description: '48ft of weatherproof, shatterproof Edison bulb string lights for patios, porches, and backyards.',
        price: 39.99,
        category: 'Lighting & Ceiling Fans',
        stock: 90,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'string lights',
    },
    {
        name: 'Travel Neck Pillow',
        description: 'A 100% pure memory foam neck pillow with a breathable, washable cover for comfortable travel.',
        price: 24.5,
        category: 'Luggage & Travel Gear',
        stock: 130,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'neck pillow',
    },
    {
        name: 'Whey Protein Powder',
        description: '24g of high-quality whey protein per serving to support muscle growth and recovery. (5lb tub)',
        price: 55.0,
        category: 'Sports Nutrition',
        stock: 100,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'protein powder',
    },
    {
        name: 'First Aid Kit',
        description: 'A 299-piece comprehensive first aid kit for home, car, or travel emergencies.',
        price: 29.0,
        category: 'Medical Supplies & Equipment',
        stock: 150,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'first aid',
    },
    {
        name: 'Silk Pillowcase for Hair and Skin',
        description: 'A 100% Mulberry silk pillowcase to reduce hair frizz and sleep wrinkles.',
        price: 23.99,
        category: 'Bedding & Bath',
        stock: 120,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'silk pillowcase',
    },
    {
        name: 'Dune by Frank Herbert',
        description: 'The landmark science fiction epic of political intrigue, adventure, and mysticism on a desert planet.',
        price: 15.99,
        category: 'Books',
        stock: 90,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'sci-fi book',
    },
    {
        name: 'Glass Food Storage Containers',
        description: 'A set of 18 borosilicate glass containers with airtight locking lids. Microwave, oven, and freezer safe.',
        price: 45.0,
        category: 'Storage & Organization',
        stock: 85,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'food containers',
    },
    {
        name: 'Espresso Machine',
        description: 'A 15-bar pump espresso and cappuccino maker with a milk frother and steam wand.',
        price: 149.99,
        category: 'Kitchen Appliances',
        stock: 30,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'espresso machine',
    },
    {
        name: 'Camping Tent for 2 Person',
        description: 'A lightweight, waterproof dome tent with easy setup, perfect for backpacking and hiking.',
        price: 79.0,
        category: 'Camping & Hiking Gear',
        stock: 55,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'camping tent',
    },
    {
        name: 'Mini Projector',
        description: 'A portable 1080P supported movie projector with a 200" display, compatible with various devices.',
        price: 89.99,
        category: 'Audio & Home Theater',
        stock: 60,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'mini projector',
    },
    {
        name: 'Hair Dryer with Diffuser',
        description: 'A professional 1875W ionic hair dryer for fast drying and reduced frizz, includes concentrator and diffuser.',
        price: 42.0,
        category: 'Hair Care & Styling',
        stock: 70,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'hair dryer',
    },
    {
        name: 'Action Camera 4K',
        description: 'A waterproof underwater camera with EIS, touch screen, and a 170° wide-angle lens.',
        price: 109.99,
        category: 'Cameras & Photography',
        stock: 45,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'action camera',
    },
    {
        name: 'Beard Grooming Kit for Men',
        description: 'A complete beard care kit with shampoo, conditioner, oil, balm, brush, comb, and scissors.',
        price: 32.0,
        category: 'Shaving & Hair Removal',
        stock: 90,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'beard kit',
    },
    {
        name: 'Indoor Herb Garden Kit',
        description: 'A hydroponic growing system with an LED grow light for an indoor herb garden.',
        price: 65.0,
        category: 'Garden & Outdoor Living',
        stock: 65,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'herb garden',
    },
    {
        name: 'Air Fryer Oven',
        description: 'A 7-quart air fryer oven with 8 cooking presets, a non-stick basket, and a recipe book.',
        price: 99.99,
        category: 'Kitchen Appliances',
        stock: 50,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'air fryer',
    },
    {
        name: 'Mechanical Keyboard',
        description: 'A tenkeyless (TKL) mechanical keyboard with customizable RGB backlighting and tactile switches.',
        price: 75.0,
        category: 'Computers & Laptops',
        stock: 70,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'mechanical keyboard',
    },
    {
        name: 'Pickleball Paddle Set',
        description: 'A set of 2 lightweight graphite pickleball paddles, 4 balls, and a carrying case.',
        price: 69.99,
        category: 'Team Sports Equipment',
        stock: 80,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'pickleball set',
    },
    {
        name: 'Drone with 4K Camera for Adults',
        description: 'A foldable GPS drone with a 4K camera, follow-me mode, and a 30-minute flight time.',
        price: 259.99,
        category: 'Remote Control & Play Vehicles',
        stock: 25,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'camera drone',
    },
    {
        name: 'Electric Wine Opener Set',
        description: 'A rechargeable automatic corkscrew set with a foil cutter, aerator pourer, and vacuum stoppers.',
        price: 34.99,
        category: 'Kitchen & Dining',
        stock: 95,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'wine opener',
    },
    {
        name: 'Standing Desk Converter',
        description: 'An adjustable height sit-to-stand desk riser that fits on top of your existing desk.',
        price: 129.0,
        category: 'Office Products',
        stock: 40,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'standing desk',
    },
    {
        name: ' weighted blanket',
        description: 'A 15lb weighted blanket for adults, designed to provide calming pressure and improve sleep.',
        price: 79.99,
        category: 'Bedding & Bath',
        stock: 60,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'weighted blanket',
    },
    {
        name: 'Smartwatch for Men and Women',
        description: 'A fitness tracker smartwatch with heart rate and blood oxygen monitoring, compatible with iOS and Android.',
        price: 55.0,
        category: 'Electronics',
        stock: 120,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'smartwatch',
    },
    {
        name: 'Ring Light with Tripod Stand',
        description: 'A 10" selfie ring light with an adjustable tripod and phone holder for streaming and video recording.',
        price: 28.99,
        category: 'Cameras & Photography',
        stock: 140,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'ring light',
    },
    {
        name: 'Leather Crossbody Bag',
        description: 'A stylish and compact women\'s crossbody purse made from high-quality vegan leather.',
        price: 38.0,
        category: 'Handbags & Wallets',
        stock: 85,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'crossbody bag',
    },
    {
        name: 'Binoculars for Adults',
        description: '12x42 high-power binoculars for bird watching, hunting, and stargazing. Waterproof and fog-proof.',
        price: 52.0,
        category: 'Hunting & Fishing Supplies',
        stock: 75,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'binoculars',
    },
    {
        name: 'Blender for Shakes and Smoothies',
        description: 'A powerful personal blender with two 20oz travel cups and lids.',
        price: 49.99,
        category: 'Kitchen Appliances',
        stock: 90,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'personal blender',
    },
    {
        name: 'Essential Oil Diffuser',
        description: 'A 500ml aromatherapy diffuser with 7 ambient light settings and a remote control.',
        price: 31.99,
        category: 'Home Decor',
        stock: 110,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'oil diffuser',
    },
    {
        name: 'Electric Hand Mixer',
        description: 'A 5-speed electric hand mixer with a turbo boost function and easy-to-clean attachments.',
        price: 24.99,
        category: 'Kitchen Appliances',
        stock: 130,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'hand mixer',
    },
    {
        name: 'Turntable with Bluetooth',
        description: 'A vintage-style 3-speed record player with built-in stereo speakers and Bluetooth connectivity.',
        price: 69.99,
        category: 'Audio & Home Theater',
        stock: 55,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'record player',
    },
    {
        name: 'Golf Rangefinder',
        description: 'A laser rangefinder with slope and pin-lock vibration, accurate up to 650 yards.',
        price: 119.99,
        category: 'Team Sports Equipment',
        stock: 40,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'golf rangefinder',
    },
    {
        name: 'Trekking Poles',
        description: 'A pair of collapsible and lightweight aluminum trekking poles for hiking and trail running.',
        price: 38.0,
        category: 'Camping & Hiking Gear',
        stock: 95,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'trekking poles',
    },
    {
        name: 'Portable Power Bank',
        description: 'A slim 10000mAh portable charger with high-speed charging for phones and tablets.',
        price: 21.99,
        category: 'Mobile Phones & Communication',
        stock: 200,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'power bank',
    },
    {
        name: 'Vacuum Sealer Machine',
        description: 'An automatic food sealer for food preservation with starter bags and rolls included.',
        price: 59.99,
        category: 'Kitchen Appliances',
        stock: 65,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'vacuum sealer',
    },
    {
        name: 'Adjustable Dumbbells',
        description: 'A single adjustable dumbbell that replaces 5 sets of weights, adjustable from 5 to 25 lbs.',
        price: 110.0,
        category: 'Fitness & Exercise Equipment',
        stock: 30,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'adjustable dumbbell',
    },
    {
        name: '3D Printer for Beginners',
        description: 'An easy-to-use FDM 3D printer with a removable build surface and resume printing function.',
        price: 229.0,
        category: 'Industrial & Scientific',
        stock: 20,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: '3d printer',
    },
    {
        name: 'Hammock with Tree Straps',
        description: 'A double camping hammock that supports up to 500lbs, includes tree-friendly straps.',
        price: 32.99,
        category: 'Camping & Hiking Gear',
        stock: 100,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'camping hammock',
    },
    {
        name: 'LED Strip Lights',
        description: '65.6ft of smart RGB LED strip lights with app control and music sync.',
        price: 25.99,
        category: 'Lighting & Ceiling Fans',
        stock: 180,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'led strip',
    },
    {
        name: 'Digital Meat Thermometer',
        description: 'An instant-read food thermometer with a backlight and magnet for grilling and cooking.',
        price: 14.99,
        category: 'Kitchen & Dining',
        stock: 220,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'meat thermometer',
    },
    {
        name: 'Gel Nail Polish Kit',
        description: 'A complete starter kit with a UV LED nail lamp, 6 gel polish colors, and manicure tools.',
        price: 45.0,
        category: 'Makeup & Cosmetics',
        stock: 80,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'nail polish',
    },
    {
        name: 'Document Scanner',
        description: 'A portable document and image scanner with high-speed duplex scanning.',
        price: 279.0,
        category: 'Office Products',
        stock: 25,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'document scanner',
    },
    {
        name: 'Cold Brew Coffee Maker',
        description: 'A 1-quart cold brew coffee maker with a durable glass pitcher and a removable filter.',
        price: 27.99,
        category: 'Kitchenware',
        stock: 90,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'cold brew',
    },
    {
        name: 'Inflatable Stand Up Paddle Board',
        description: 'A 10\'6" inflatable SUP with all accessories, including a pump, paddle, and backpack.',
        price: 299.99,
        category: 'Water Sports Equipment',
        stock: 20,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'paddle board',
    },
    {
        name: 'Ergonomic Office Chair',
        description: 'A high-back mesh office chair with adjustable lumbar support, armrests, and headrest.',
        price: 189.0,
        category: 'Furniture',
        stock: 35,
        image: 'https://placehold.co/400x400.png',
        dataAiHint: 'office chair',
    }
];

const sampleCategories = [
    'Electronics',
    'Apparel',
    'Books',
    'Home Goods',
    'Sports & Outdoors',
    'Kitchenware',
    'Toys & Games',
    'Beauty & Personal Care',
    'Health & Wellness',
    'Accessories',
    'Furniture',
    'Jewelry',
    'Automotive',
    'Pet Supplies',
    'Office Products',
    'Musical Instruments',
    'Garden & Outdoor Living',
    'Arts, Crafts & Sewing',
    'Baby Products',
    'Food & Grocery',
    'Industrial & Scientific',
    'Movies & TV Shows',
    'Software',
    'Video Games',
    'Computers & Laptops',
    'Mobile Phones & Communication',
    'Cameras & Photography',
    'Audio & Home Theater',
    'Smart Home Devices',
    "Men's Fashion",
    "Women's Fashion",
    "Kids' & Baby Fashion",
    'Shoes & Footwear',
    'Handbags & Wallets',
    'Watches',
    'Sunglasses & Eyewear',
    'Luggage & Travel Gear',
    'Backpacks',
    'Fitness & Exercise Equipment',
    'Camping & Hiking Gear',
    'Cycling & Biking',
    'Water Sports Equipment',
    'Winter Sports Gear',
    'Team Sports Equipment',
    'Hunting & Fishing Supplies',
    'Fan Merchandise',
    'Home Decor',
    'Bedding & Bath',
    'Kitchen & Dining',
    'Storage & Organization',
    'Home Improvement & Tools',
    'Lighting & Ceiling Fans',
    'Power & Hand Tools',
    'Major Appliances',
    'Household Cleaning Supplies',
    'Patio & Garden Furniture',
    'Grills & Outdoor Cooking',
    'Farming & Ranching Supplies',
    'Pet Food & Treats',
    'Dog Care Supplies',
    'Cat Care Supplies',
    'Fish & Aquatic Pets Supplies',
    'Bird Supplies',
    'Reptile & Amphibian Supplies',
    'Small Animal Supplies',
    'Makeup & Cosmetics',
    'Skin Care Products',
    'Hair Care & Styling',
    'Fragrances',
    'Shaving & Hair Removal',
    'Oral Care Products',
    'Vision Care',
    'Vitamins & Dietary Supplements',
    'Medical Supplies & Equipment',
    'Sports Nutrition',
    'Personal Care Appliances',
    'Stationery & Office Supplies',
    'School Supplies',
    'Writing Instruments',
    'Art Supplies',
    'Party Decorations & Supplies',
    'Gift Wrapping Materials',
    'Action Figures & Statues',
    'Dolls & Accessories',
    'Building Toys',
    'Puzzles',
    'Board Games',
    'Card Games',
    'Educational Toys',
    'Remote Control & Play Vehicles',
    'Collectibles & Fine Art',
    'Antiques',
    'Stamps & Coins',
    'Sports Memorabilia',
    'Historical & Military Memorabilia',
    'Event Tickets',
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

  const handleSeedData = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
        let categoriesAdded = 0;
        let productsAdded = 0;

        // Seed Categories
        const existingCategories = await getCategoriesBySeller(user.uid);
        const existingCategoryNames = new Set(existingCategories.map(c => c.name));
        const categoriesToAdd = sampleCategories.filter(name => !existingCategoryNames.has(name));
        
        if (categoriesToAdd.length > 0) {
            await Promise.all(categoriesToAdd.map(name => addCategory({ name, sellerId: user.uid })));
            categoriesAdded = categoriesToAdd.length;
        }

        // Seed Products
        const existingProducts = await getProductsBySeller(user.uid);
        const existingProductNames = new Set(existingProducts.map(p => p.name));
        const productsToAdd = sampleProducts.filter(p => !existingProductNames.has(p.name));
      
        if (productsToAdd.length > 0) {
            await Promise.all(productsToAdd.map(p => addProductToFirestore({ ...p, sellerId: user.uid })));
            productsAdded = productsToAdd.length;
        }
      
        if (productsAdded === 0 && categoriesAdded === 0) {
            toast({
                title: "Data Already Seeded",
                description: "All sample products and categories already exist in your store.",
            });
        } else {
            toast({
                title: "Data Seeded!",
                description: `${productsAdded} products and ${categoriesAdded} categories have been added.`,
            });
            await fetchData(); // Refresh dashboard data
        }

    } catch (error) {
      console.error("Failed to seed data:", error);
       toast({
        title: "Seeding Failed",
        description: "Could not add sample data. Please try again.",
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
        <Button variant="outline" onClick={handleSeedData} disabled={isSeeding}>
            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Seed Data
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
