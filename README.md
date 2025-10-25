# Balmuya - Empowering Women, One Skill at a Time

![Balmuya Logo](https://via.placeholder.com/150x150?text=Balmuya) Add your actual logo here

## 🌟 Project Overview

**Balmuya** is a secure, women-only e-commerce platform dedicated to empowering women of all backgrounds to monetize their skills and homemade products from the safety and comfort of their homes. We provide a dedicated marketplace free from the volatility of social media algorithms and societal pressures.

### 🎯 Vision
To become the leading digital marketplace for women entrepreneurs in our community, fostering financial independence and a supportive sisterhood.

### 🚀 Mission
To provide a secure, intuitive, and supportive platform that enables women to showcase, sell, and scale their homemade products — regardless of their age, social media savviness, or willingness to show their face.

## 📋 Table of Contents
- [Problem Statement](#problem-statement)
- [Our Solution](#our-solution)
- [Target Audience](#target-audience)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Problem Statement

Women, especially in certain communities and life stages, face significant barriers to entering traditional marketplaces:

- **Social Media Algorithm Dependence**: Unpredictable success on platforms like TikTok
- **Societal & Cultural Barriers**: Stigma against women in public commerce
- **Privacy Concerns**: Discomfort with showing faces online
- **Fear of Scams**: High risk of fraud on informal platforms
- **Logistical Hurdles**: Overwhelming payment, marketing, and delivery management

## 💡 Our Solution

Balmuya addresses these challenges through:

- **Dedicated Marketplace**: Commerce-focused platform without social media noise
- **Women-Only Community**: Safe, trusted environment for all users
- **Privacy-First Design**: Build brands without showing faces
- **Integrated Secure Payments**: Escrow-like payment system
- **Streamlined Logistics**: Optional delivery system creating job opportunities

## 👥 Target Audience

### User Personas

| Persona | Description | Needs |
|---------|-------------|--------|
| **The New Mother (Letay)** | Sells knitted baby clothes and organic spices from home | Flexible income, cannot leave home |
| **The Young Artisan (Hana)** | 17-year-old making handmade jewelry and candles | Confidence building, safe platform |
| **The Wise Elder (Ye'ityopya Emaye)** | Sells Berbere and Shiro blends | Simple platform, no social media complexity |
| **The Conscious Buyer (Selam)** | Supports women-led businesses | Authentic products, ethical shopping |

## ✨ Features

### 🛍️ For Sellers
- **Secure Onboarding & KYC** - Simple verification process
- **Product Management** - Create, edit, delete listings with images and videos
- **Storefront Customization** - Personalized seller pages
- **Sales Dashboard** - Order management and buyer communication
- **Integrated Delivery** - Flexible delivery options
- **Review System** - Build reputation through feedback

### 🛒 For Buyers
- **Smart Discovery** - Search and filter by category, price, location
- **Product Pages** - Detailed views with galleries and seller info
- **Secure Checkout** - Smooth purchasing flow
- **Wishlist** - Save favorite products
- **User Profiles** - Manage addresses and order history

### 🏗️ Platform Features
- **Secure Payment Gateway** - Chapa, CBE Birr, or Stripe integration
- **Admin Dashboard** - User management and dispute resolution
- **Premium Subscriptions** - Advanced features for growing sellers
- **Delivery Management** - Order tracking and driver assignment

## 🛠️ Tech Stack

### Frontend
- **Web**: React.js with TypeScript
- **Mobile**: Flutter (Cross-platform)

### Backend
- **Framework**: Node.js with Express.js & TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based secure auth
- **File Storage**: Supabase Storage

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway/Render/Heroku
- **Database**: Supabase PostgreSQL

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-username/balmuya-backend.git
cd balmuya-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
```
Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/balmuya"
JWT_SECRET="your-jwt-secret"
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
NODE_ENV="development"
```

4. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

5. **Start Development Server**
```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

### Frontend Setup

*Frontend repository coming soon!*

## 📚 API Documentation

Comprehensive API documentation is available in the `src/docs/api.md` file.

### Key Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/products` | Get all products | No |
| POST | `/api/products` | Create product | Yes |
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/kyc` | Submit KYC documents | Yes |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Status

This project is currently in **Phase 1: Core MVP** development for hackathon participation.

### Completed Features
- ✅ Backend API structure with Express.js & TypeScript
- ✅ User authentication system
- ✅ Product management endpoints
- ✅ Database models with Prisma
- ✅ File upload system with Supabase Storage

### In Progress
- 🔄 Frontend development with React
- 🔄 Mobile app with Flutter
- 🔄 Payment gateway integration
- 🔄 Advanced features (reviews, wishlist, etc.)

## 📞 Contact & Support

- **Email**: support@balmuya.com
- **Issues**: [GitHub Issues](https://github.com/your-username/balmuya-backend/issues)
- **Documentation**: [API Docs](src/docs/api.md)

## 🙏 Acknowledgments

- Inspired by the resilience and creativity of women entrepreneurs
- Built with ❤️ for the community
- Special thanks to our early testers and contributors

---

**Balmuya** - *Empowering Women, One Skill at a Time*