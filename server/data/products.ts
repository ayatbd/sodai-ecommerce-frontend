export interface ServerProduct {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand?: string;
  images: string[];
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  colors?: { name: string; hex: string }[];
}

export const SERVER_PRODUCTS: ServerProduct[] = [
  {
    id: 'prod-1',
    name: 'AURA Pulse Wireless Headphones',
    slug: 'aura-pulse-wireless-headphones',
    tagline: 'Precision engineered planar magnetic headphones with active acoustic canceling.',
    description: 'Immerse yourself in pristine studio acoustic clarity.',
    price: 349.0,
    originalPrice: 399.0,
    category: 'audio',
    brand: 'AURA Studio',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=900&auto=format&fit=crop&q=80',
    ],
    inStock: true,
    stockCount: 18,
    rating: 4.9,
    reviewCount: 42,
    tags: ['Wireless', 'Audiophile'],
    colors: [
      { name: 'Obsidian Black', hex: '#18181b' },
      { name: 'Lunar Silver', hex: '#e4e4e7' },
    ],
  },
  {
    id: 'prod-2',
    name: 'Nomad Anodized Desk Lamp',
    slug: 'nomad-anodized-desk-lamp',
    tagline: 'Minimalist brass and sandblasted aluminum architectural task lighting.',
    description: 'Machined from aircraft-grade 6061-T6 aluminum with precision knurled dimmer wheel.',
    price: 185.0,
    category: 'lighting',
    brand: 'Nomad Atelier',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=900&auto=format&fit=crop&q=80',
    ],
    inStock: true,
    stockCount: 12,
    rating: 4.8,
    reviewCount: 29,
    tags: ['Lighting', 'Minimalist'],
    colors: [
      { name: 'Matte Charcoal', hex: '#27272a' },
      { name: 'Brushed Brass', hex: '#d97706' },
    ],
  },
  {
    id: 'prod-3',
    name: 'Kanso Minimalist Ceramic Vessel',
    slug: 'kanso-minimalist-ceramic-vessel',
    tagline: 'Hand-thrown volcanic reactive glazed decorative stoneware vase.',
    description: 'Rooted in minimalist wabi-sabi philosophy, wheel-thrown in small batches.',
    price: 95.0,
    category: 'living',
    brand: 'Kanso Craft',
    images: [
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=900&auto=format&fit=crop&q=80',
    ],
    inStock: true,
    stockCount: 9,
    rating: 4.7,
    reviewCount: 16,
    tags: ['Handmade', 'Ceramics'],
    colors: [
      { name: 'Warm Pumice', hex: '#d6d3d1' },
      { name: 'Terracotta Soil', hex: '#9a3412' },
    ],
  },
  {
    id: 'prod-4',
    name: 'Vanguard Technical Roll-Top Backpack',
    slug: 'vanguard-technical-roll-top-backpack',
    tagline: 'Cordura 500D weatherproof commuter pack with Fidlock magnet closures.',
    description: 'Designed for the urban cyclist and remote creative.',
    price: 220.0,
    originalPrice: 260.0,
    category: 'carry',
    brand: 'Vanguard Goods',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=900&auto=format&fit=crop&q=80',
    ],
    inStock: true,
    stockCount: 15,
    rating: 4.9,
    reviewCount: 54,
    tags: ['Weatherproof', 'Commuter'],
    colors: [
      { name: 'Matte Stealth Black', hex: '#0f172a' },
      { name: 'Deep Forest', hex: '#14532d' },
    ],
  },
  {
    id: 'prod-5',
    name: 'Acoustic Sound Bar Horizon',
    slug: 'acoustic-sound-bar-horizon',
    tagline: 'Solid walnut wooden acoustic soundbar with AirPlay 2 and Spotify Connect.',
    description: 'Combines Scandinavian organic aesthetics with cutting-edge DSP amplification.',
    price: 495.0,
    category: 'audio',
    brand: 'Horizon Sound',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=900&auto=format&fit=crop&q=80',
    ],
    inStock: true,
    stockCount: 6,
    rating: 4.9,
    reviewCount: 38,
    tags: ['Audiophile', 'Smart Home'],
    colors: [
      { name: 'Natural Walnut', hex: '#5c4033' },
    ],
  },
  {
    id: 'prod-6',
    name: 'MagStand CNC Solid MagSafe Dock',
    slug: 'magstand-cnc-solid-magsafe-dock',
    tagline: 'Precision weighted charging stand milled from a single brass billet.',
    description: 'Weighing over 1.2 lbs, the MagStand stays grounded when you lift your phone.',
    price: 78.0,
    category: 'workspace',
    brand: 'Nomad Atelier',
    images: [
      'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=900&auto=format&fit=crop&q=80',
    ],
    inStock: true,
    stockCount: 25,
    rating: 4.6,
    reviewCount: 19,
    tags: ['Workspace', 'MagSafe'],
    colors: [
      { name: 'Space Gray', hex: '#475569' },
      { name: 'Raw Brass', hex: '#ca8a04' },
    ],
  },
];
