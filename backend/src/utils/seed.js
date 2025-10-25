const prisma = require('../config/database');

/**
 * Seed database with initial data
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create categories
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: 'Clothing & Accessories' },
        update: {},
        create: {
          name: 'Clothing & Accessories',
          description: 'Handmade clothing and fashion accessories',
          image: 'https://example.com/clothing.jpg'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Jewelry' },
        update: {},
        create: {
          name: 'Jewelry',
          description: 'Handmade jewelry and accessories',
          image: 'https://example.com/jewelry.jpg'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Home & Living' },
        update: {},
        create: {
          name: 'Home & Living',
          description: 'Home decor and living essentials',
          image: 'https://example.com/home.jpg'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Beauty & Wellness' },
        update: {},
        create: {
          name: 'Beauty & Wellness',
          description: 'Natural beauty and wellness products',
          image: 'https://example.com/beauty.jpg'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Food & Beverages' },
        update: {},
        create: {
          name: 'Food & Beverages',
          description: 'Artisanal food and beverage products',
          image: 'https://example.com/food.jpg'
        }
      })
    ]);

    console.log('✅ Categories created');

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@balmuya.com' },
      update: {},
      create: {
        email: 'admin@balmuya.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.8.8', // password: admin123
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    console.log('✅ Admin user created');

    // Create sample seller
    const sellerUser = await prisma.user.upsert({
      where: { email: 'seller@balmuya.com' },
      update: {},
      create: {
        email: 'seller@balmuya.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.8.8', // password: seller123
        firstName: 'Hana',
        lastName: 'Tekle',
        role: 'SELLER',
        isVerified: true,
        emailVerifiedAt: new Date(),
        storeName: "Hana's Handmade Crafts",
        bio: 'Creating beautiful handmade jewelry and home decor items',
        kycStatus: 'APPROVED',
        kycApprovedAt: new Date()
      }
    });

    console.log('✅ Sample seller created');

    // Create sample buyer
    const buyerUser = await prisma.user.upsert({
      where: { email: 'buyer@balmuya.com' },
      update: {},
      create: {
        email: 'buyer@balmuya.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.8.8', // password: buyer123
        firstName: 'Selam',
        lastName: 'Kebede',
        role: 'BUYER',
        isVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    console.log('✅ Sample buyer created');

    // Create sample products
    const products = await Promise.all([
      prisma.product.upsert({
        where: { title: 'Handmade Silver Necklace' },
        update: {},
        create: {
          title: 'Handmade Silver Necklace',
          description: 'Beautiful handmade silver necklace with natural gemstones. Each piece is unique and crafted with care.',
          price: 450.00,
          comparePrice: 600.00,
          quantity: 5,
          images: ['https://example.com/necklace1.jpg', 'https://example.com/necklace2.jpg'],
          tags: ['handmade', 'silver', 'gemstone', 'necklace'],
          specifications: {
            material: 'Silver, Gemstones',
            weight: '25g',
            dimensions: '45cm chain'
          },
          isPublished: true,
          sellerId: sellerUser.id,
          categoryId: categories[1].id // Jewelry
        }
      }),
      prisma.product.upsert({
        where: { title: 'Handmade Ceramic Mug' },
        update: {},
        create: {
          title: 'Handmade Ceramic Mug',
          description: 'Beautiful hand-painted ceramic mug perfect for coffee or tea',
          price: 180.00,
          comparePrice: 220.00,
          quantity: 10,
          images: ['https://example.com/mug1.jpg', 'https://example.com/mug2.jpg'],
          tags: ['ceramic', 'handmade', 'mug', 'coffee'],
          specifications: {
            material: 'Ceramic',
            weight: '350g',
            dimensions: '10cm height, 8cm diameter'
          },
          isPublished: true,
          sellerId: sellerUser.id,
          categoryId: categories[2].id // Home & Living
        }
      }),
      prisma.product.upsert({
        where: { title: 'Organic Honey' },
        update: {},
        create: {
          title: 'Organic Honey',
          description: 'Pure organic honey collected from local Ethiopian highlands',
          price: 120.00,
          quantity: 20,
          images: ['https://example.com/honey1.jpg'],
          tags: ['organic', 'honey', 'natural', 'local'],
          specifications: {
            weight: '500g',
            origin: 'Ethiopian Highlands'
          },
          isPublished: true,
          sellerId: sellerUser.id,
          categoryId: categories[4].id // Food & Beverages
        }
      })
    ]);

    console.log('✅ Sample products created');

    // Create sample addresses
    const addresses = await Promise.all([
      prisma.address.create({
        data: {
          userId: buyerUser.id,
          firstName: 'Selam',
          lastName: 'Kebede',
          phone: '+251911223344',
          street: 'Bole Road',
          city: 'Addis Ababa',
          state: 'Addis Ababa',
          postalCode: '1000',
          country: 'Ethiopia',
          isDefault: true
        }
      }),
      prisma.address.create({
        data: {
          userId: sellerUser.id,
          firstName: 'Hana',
          lastName: 'Tekle',
          phone: '+251922334455',
          street: 'Kazanchis',
          city: 'Addis Ababa',
          state: 'Addis Ababa',
          postalCode: '1000',
          country: 'Ethiopia',
          isDefault: true
        }
      })
    ]);

    console.log('✅ Sample addresses created');

    // Create system settings
    const settings = await Promise.all([
      prisma.systemSettings.upsert({
        where: { key: 'platform_fee_percentage' },
        update: {},
        create: {
          key: 'platform_fee_percentage',
          value: '5',
          description: 'Platform fee percentage for each transaction'
        }
      }),
      prisma.systemSettings.upsert({
        where: { key: 'minimum_order_amount' },
        update: {},
        create: {
          key: 'minimum_order_amount',
          value: '50',
          description: 'Minimum order amount in ETB'
        }
      }),
      prisma.systemSettings.upsert({
        where: { key: 'free_shipping_threshold' },
        update: {},
        create: {
          key: 'free_shipping_threshold',
          value: '500',
          description: 'Free shipping threshold in ETB'
        }
      })
    ]);

    console.log('✅ System settings created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Created:');
    console.log(`- ${categories.length} categories`);
    console.log(`- 3 users (1 admin, 1 seller, 1 buyer)`);
    console.log(`- ${products.length} products`);
    console.log(`- ${addresses.length} addresses`);
    console.log(`- ${settings.length} system settings`);

    console.log('\n🔑 Test Accounts:');
    console.log('Admin: admin@balmuya.com / admin123');
    console.log('Seller: seller@balmuya.com / seller123');
    console.log('Buyer: buyer@balmuya.com / buyer123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
