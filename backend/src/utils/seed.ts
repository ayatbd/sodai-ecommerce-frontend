import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.model.js';
import { Product } from '../models/Product.model.js';
import { Category } from '../models/Category.model.js';
import { Coupon } from '../models/Coupon.model.js';
import { Review } from '../models/Review.model.js';
import { Order } from '../models/Order.model.js';
import { logger } from './logger.js';

async function seed() {
  logger.info('Connecting to MongoDB for database seeding...');
  const conn = await connectDB();
  if (!conn) {
    logger.error('Database connection failed. Seeding aborted.');
    process.exit(1);
  }

  try {
    logger.info('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Coupon.deleteMany({}),
      Review.deleteMany({}),
      Order.deleteMany({}),
    ]);

    // 1. Seed Users
    logger.info('Seeding users...');
    const admin = new User({
      name: 'Elena Vance',
      firstName: 'Elena',
      lastName: 'Vance',
      email: 'admin@aura-studio.com',
      password: 'AdminPassword123!',
      role: 'admin',
      phone: '+1 (415) 555-0199',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      isEmailVerified: true,
    });
    await admin.save();

    const customer = new User({
      name: 'Alex Rivera',
      firstName: 'Alex',
      lastName: 'Rivera',
      email: 'alex.rivera@aura-studio.com',
      password: 'CustomerPassword123!',
      role: 'customer',
      phone: '+1 (415) 882-9011',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isEmailVerified: true,
      addresses: [
        {
          fullName: 'Alex Rivera',
          addressLine1: '742 Evergreen Terrace',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94107',
          country: 'United States',
          isDefault: true,
        },
      ],
    });
    await customer.save();

    // 2. Seed Categories
    logger.info('Seeding categories...');
    const categoriesData = [
      {
        name: 'Acoustics & Sound',
        slug: 'audio',
        description: 'Minimalist studio-grade audio crafted for discerning listeners.',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        sortOrder: 1,
      },
      {
        name: 'Workspace & Tech',
        slug: 'workspace',
        description: 'Ergonomic architectural instruments built for daily desk flow.',
        imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
        sortOrder: 2,
      },
      {
        name: 'Everyday Carry',
        slug: 'carry',
        description: 'Tuscan vegetable-tanned leather and unibody aluminum accessories.',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
        sortOrder: 3,
      },
      {
        name: 'Atmospheric Lighting',
        slug: 'lighting',
        description: 'Warm, tactile lighting designed to sculpt calm and focused spaces.',
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
        sortOrder: 4,
      },
      {
        name: 'Ceramic & Living',
        slug: 'living',
        description: 'Handcrafted stoneware vessels and architectural objects from Gifu.',
        imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop&q=80',
        sortOrder: 5,
      },
    ];

    const categories = await Category.insertMany(categoriesData);

    // 3. Seed Products
    logger.info('Seeding products...');
    const productsData = [
      {
        name: 'Halo Anodized Task Lamp',
        slug: 'halo-anodized-task-lamp',
        tagline: 'Warm dimming architectural task light in unibody aluminum.',
        description:
          'Precision CNC-machined from aerospace-grade aluminum with 97+ CRI warm dimming LEDs. Built for calm workspaces and studio focus.',
        price: 280,
        originalPrice: 320,
        category: 'lighting',
        stockCount: 14,
        inStock: true,
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80',
        ],
        tags: ['lighting', 'aluminum', 'desk', 'minimalist'],
        features: ['Precision 0.05mm CNC chamfers', 'Warm dimming 2200K - 3500K', '10-Year Repair Pledge'],
        specifications: {
          Material: '6000-Series Anodized Aluminum',
          Power: '18W High CRI LED Engine',
          Finish: 'Matte Bead-Blast Texture 04',
          Weight: '1.4 kg Weighted Base',
        },
        variants: [
          {
            id: 'finish',
            name: 'Anodized Finish',
            type: 'finish',
            options: [
              { id: 'space-gray', name: 'Space Gray', priceModifier: 0, inStock: true },
              { id: 'matte-black', name: 'Matte Black', priceModifier: 0, inStock: true },
              { id: 'champagne', name: 'Nordic Silver', priceModifier: 20, inStock: true },
            ],
          },
        ],
        rating: 4.9,
        reviewCount: 38,
        isFeatured: true,
        isNewProduct: true,
        published: true,
      },
      {
        name: 'Acoustic Studio Over-Ear Headphones',
        slug: 'acoustic-studio-over-ear-headphones',
        tagline: 'Planar magnetic clarity wrapped in Swedish full-grain leather.',
        description:
          'Zero fatigue listening. Planar magnetic drivers coupled with PORON acoustic damping pads and replaceable hardware modules.',
        price: 490,
        originalPrice: 550,
        category: 'audio',
        stockCount: 8,
        inStock: true,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
        ],
        tags: ['audio', 'headphones', 'planar', 'leather'],
        features: ['Bespoke 50mm planar transducers', 'Detachable braided silver cable', 'Memory foam ear cushions'],
        specifications: {
          Frequency: '10Hz - 42,000Hz',
          Impedance: '32 Ohms',
          Cable: '3.5mm and 6.35mm Gold Plated',
        },
        rating: 4.95,
        reviewCount: 52,
        isFeatured: true,
        isNewProduct: false,
        published: true,
      },
      {
        name: 'Unibody Desk Valet & Pad',
        slug: 'unibody-desk-valet-and-pad',
        tagline: 'Italian vegetable-tanned leather with milled magnetic tray.',
        description:
          'A sanctuary for your daily essentials. Features hidden MagSafe coils and an integrated pen trough carved from solid aluminum.',
        price: 145,
        category: 'workspace',
        stockCount: 22,
        inStock: true,
        images: [
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
        ],
        tags: ['workspace', 'valet', 'leather', 'desk'],
        features: ['Natural vegetable patina over years', 'Magnetic device alignment', 'Non-slip micro-suction base'],
        specifications: {
          Dimensions: '320mm x 220mm x 14mm',
          Leather: 'Tuscan Full-Grain Vachetta',
        },
        rating: 4.8,
        reviewCount: 29,
        isFeatured: true,
        isNewProduct: false,
        published: true,
      },
      {
        name: 'Gifu Stoneware Aroma Vessel',
        slug: 'gifu-stoneware-aroma-vessel',
        tagline: 'Hand-thrown unglazed ceramic diffuser for essential oils.',
        description:
          'Created by master potters in Gifu Prefecture. Uses natural capillary absorption to gently scent spaces without electricity or heat.',
        price: 75,
        category: 'living',
        stockCount: 30,
        inStock: true,
        images: [
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800&auto=format&fit=crop&q=80',
        ],
        tags: ['ceramic', 'living', 'stoneware', 'calm'],
        features: ['100% natural organic clay', 'Zero heat or electricity required', 'Refillable indefinitely'],
        specifications: {
          Origin: 'Gifu, Japan',
          Diameter: '110mm',
          Height: '85mm',
        },
        rating: 4.9,
        reviewCount: 19,
        isFeatured: false,
        isNewProduct: true,
        published: true,
      },
    ];

    const products = await Product.insertMany(productsData);

    // Update Category counts
    for (const cat of categories) {
      const count = await Product.countDocuments({ category: cat.slug });
      cat.productCount = count;
      await cat.save();
    }

    // 4. Seed Coupons
    logger.info('Seeding coupons...');
    await Coupon.insertMany([
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 50,
        isActive: true,
        usedCount: 14,
      },
      {
        code: 'SODAI20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 200,
        maxDiscountAmount: 100,
        isActive: true,
        usedCount: 6,
      },
      {
        code: 'FREESHIP',
        discountType: 'fixed',
        discountValue: 15,
        minOrderValue: 75,
        isActive: true,
        usedCount: 42,
      },
    ]);

    // 5. Seed Reviews
    logger.info('Seeding reviews...');
    await Review.insertMany([
      {
        productId: products[0].id,
        userId: customer.id,
        userName: 'Alex Rivera',
        rating: 5,
        title: 'Transformative for evening studio work',
        comment:
          'The warm dimming curve on this lamp is sublime. The solid weighted aluminum feels like a permanent architectural monument on my desk.',
        isVerifiedPurchase: true,
        isApproved: true,
      },
      {
        productId: products[1].id,
        userId: customer.id,
        userName: 'Marcus Lin',
        rating: 5,
        title: 'Enduring acoustic neutrality',
        comment: 'Zero fatigue across 8-hour mixing sessions. The leather smells divine and the comfort is unrivaled.',
        isVerifiedPurchase: true,
        isApproved: true,
      },
    ]);

    // 6. Seed Sample Order
    logger.info('Seeding sample orders...');
    const sampleOrder = new Order({
      orderNumber: 'ORD-2026-F93B8',
      userId: customer.id,
      items: [
        {
          productId: products[0].id,
          name: products[0].name,
          price: products[0].price,
          quantity: 1,
          image: products[0].images[0],
        },
      ],
      shippingAddress: {
        fullName: 'Alex Rivera',
        addressLine1: '742 Evergreen Terrace',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94107',
        country: 'United States',
      },
      shippingMethod: {
        id: 'standard',
        name: 'Standard Carbon Neutral Ground',
        price: 0,
        estimatedDays: '3-5 business days',
      },
      paymentMethod: 'card',
      paymentStatus: 'paid',
      subtotal: 280,
      shippingFee: 0,
      tax: 22.4,
      discount: 28,
      couponCode: 'WELCOME10',
      total: 274.4,
      status: 'shipped',
      trackingNumber: 'DHL-8849-9201-US',
      carrier: 'DHL Express GoGreen',
    });
    await sampleOrder.save();

    logger.info('Database seeding completed successfully!');
    logger.info('Admin credentials: admin@aura-studio.com / AdminPassword123!');
    logger.info('Customer credentials: alex.rivera@aura-studio.com / CustomerPassword123!');
  } catch (error) {
    logger.error('Seeding error:', error);
  } finally {
    await disconnectDB();
  }
}

seed();
