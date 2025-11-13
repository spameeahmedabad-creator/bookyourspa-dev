const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/bookyourspa';

const sampleSpas = [
  {
    title: 'Serenity Wellness Spa',
    logo: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
    services: ['Swedish Massage', 'Deep Tissue Massage', 'Hot Stone Massage'],
    location: {
      address: 'C.G. Road, Ahmedabad',
      region: 'Ahmedabad',
      longitude: 72.5714,
      latitude: 23.0225
    },
    gallery: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'
    ],
    description: 'Experience ultimate relaxation at Serenity Wellness Spa. Our expert therapists provide world-class massage and wellness treatments in a peaceful, luxurious environment.',
    contact: {
      phone: '+91 79 1234 5678',
      email: 'info@serenityspa.com',
      website: 'https://serenityspa.com',
      instagram: 'https://instagram.com/serenityspa'
    },
    pricing: [
      {
        title: 'Swedish Massage',
        description: '60 minutes of pure relaxation',
        price: 2500,
        multiplier: 'per session'
      },
      {
        title: 'Deep Tissue Massage',
        description: 'Targeted deep muscle therapy',
        price: 3000,
        multiplier: 'per session'
      }
    ]
  },
  {
    title: 'Royal Retreat Spa & Wellness',
    logo: 'https://images.unsplash.com/photo-1596178060810-1de39b4e6c39?w=400',
    services: ['Couple Massage', 'Jacuzzi Massage', 'Shirodhara Massage'],
    location: {
      address: 'Satellite Road, Ahmedabad',
      region: 'Ahmedabad',
      longitude: 72.5074,
      latitude: 23.0317
    },
    gallery: [
      'https://images.unsplash.com/photo-1596178060810-1de39b4e6c39?w=800'
    ],
    description: 'Royal Retreat offers premium spa experiences with traditional and modern treatments. Perfect for couples and individuals seeking rejuvenation.',
    contact: {
      phone: '+91 79 9876 5432',
      email: 'contact@royalretreat.com'
    },
    pricing: [
      {
        title: 'Couple Massage',
        description: 'Romantic spa experience for two',
        price: 5000,
        multiplier: 'per session'
      }
    ]
  },
  {
    title: 'Bliss Spa Gandhinagar',
    logo: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400',
    services: ['Oil Massage', 'Potli Massage', 'Four Hand Massage'],
    location: {
      address: 'Sector 21, Gandhinagar',
      region: 'Gandhinagar',
      longitude: 72.6369,
      latitude: 23.2156
    },
    gallery: [
      'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800'
    ],
    description: 'Discover tranquility at Bliss Spa in Gandhinagar. We offer authentic Ayurvedic treatments and modern wellness therapies.',
    contact: {
      phone: '+91 79 5555 6666',
      email: 'hello@blissspa.com',
      facebook: 'https://facebook.com/blissspa'
    },
    pricing: [
      {
        title: 'Ayurvedic Oil Massage',
        description: 'Traditional healing therapy',
        price: 2000,
        multiplier: 'per session'
      }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      phone: String,
      role: String,
      bookmarks: [mongoose.Schema.Types.ObjectId],
      createdAt: { type: Date, default: Date.now }
    }));

    const Spa = mongoose.model('Spa', new mongoose.Schema({
      title: String,
      logo: String,
      services: [String],
      location: {
        address: String,
        region: String,
        longitude: Number,
        latitude: Number
      },
      gallery: [String],
      description: String,
      contact: {
        phone: String,
        email: String,
        website: String,
        facebook: String,
        twitter: String,
        instagram: String,
        skype: String
      },
      pricing: [{
        image: String,
        title: String,
        description: String,
        price: Number,
        multiplier: String,
        quantity: Number
      }],
      ownerId: mongoose.Schema.Types.ObjectId,
      createdAt: { type: Date, default: Date.now }
    }));

    // Create admin user
    let adminUser = await User.findOne({ phone: '+919999999999' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Dipak Parmar',
        phone: '+919999999999',
        role: 'admin'
      });
      console.log('Admin user created');
    }

    // Clear existing spas and create new ones
    await Spa.deleteMany({});
    
    for (const spaData of sampleSpas) {
      await Spa.create({
        ...spaData,
        ownerId: adminUser._id
      });
    }

    console.log(`✓ Seeded ${sampleSpas.length} spas`);
    console.log('✓ Seeding completed successfully!');
    console.log('\nTest credentials:');
    console.log('Admin: +919999999999 (role: admin)');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
