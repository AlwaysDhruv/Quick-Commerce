export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  sellerId: string;
  dataAiHint: string;
};

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Luxury Chronograph Watch',
    description: 'A sophisticated timepiece for the modern gentleman. Features a stainless steel case, sapphire crystal glass, and a genuine leather strap.',
    price: 499.99,
    image: 'https://placehold.co/400x400.png',
    dataAiHint: 'luxury watch',
    category: 'Accessories',
    sellerId: 'mockSeller',
  },
  {
    id: '2',
    name: 'Handcrafted Leather Wallet',
    description: 'Made from full-grain Italian leather, this wallet combines style and functionality. Ages beautifully over time.',
    price: 89.99,
    image: 'https://placehold.co/400x400.png',
    dataAiHint: 'leather wallet',
    category: 'Accessories',
    sellerId: 'mockSeller',
  },
  {
    id: '3',
    name: 'Organic Beard Oil',
    description: 'Nourish and style your beard with our blend of natural oils. Promotes healthy growth and a soft, manageable beard.',
    price: 24.99,
    image: 'https://placehold.co/400x400.png',
    dataAiHint: 'beard oil',
    category: 'Grooming',
    sellerId: 'mockSeller',
  },
  {
    id: '4',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Immerse yourself in pure audio with these state-of-the-art headphones. Up to 30 hours of battery life.',
    price: 349.99,
    image: 'https://placehold.co/400x400.png',
    dataAiHint: 'headphones',
    category: 'Electronics',
    sellerId: 'mockSeller',
  },
  {
    id: '5',
    name: 'Classic French Fries',
    description: 'Crispy, golden-brown, and perfectly salted. A timeless favorite for all ages.',
    price: 5.99,
    image: 'https://placehold.co/400x400.png',
    dataAiHint: 'french fries',
    category: 'Food & Drink',
    sellerId: 'mockSeller',
  },
  {
    id: '6',
    name: 'Minimalist Desk Lamp',
    description: 'A sleek, modern LED desk lamp with adjustable brightness and color temperature. Perfect for any workspace.',
    price: 79.99,
    image: 'https://placehold.co/400x400.png',
    dataAiHint: 'desk lamp',
    category: 'Home Goods',
    sellerId: 'mockSeller',
  },
];
