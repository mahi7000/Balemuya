# Balmuya Backend API

A comprehensive Node.js backend API for Balmuya - a marketplace platform empowering women entrepreneurs in Ethiopia.

## 🚀 Features

- **User Management**: Registration, authentication, profile management
- **Product Management**: CRUD operations for products with categories
- **Order Management**: Complete order lifecycle with status tracking
- **Payment Integration**: Multiple payment gateways (Chapa, CBE Birr, Stripe)
- **Review System**: Product and seller reviews with ratings
- **Wishlist**: Save favorite products
- **Chat System**: Real-time messaging between buyers and sellers
- **Admin Panel**: Comprehensive admin dashboard
- **File Upload**: Image and video upload with Supabase Storage
- **KYC Verification**: Know Your Customer verification for sellers

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: JWT + Supabase Auth
- **File Storage**: Supabase Storage
- **Payment**: Chapa API, CBE Birr, Stripe
- **Email**: Nodemailer
- **Logging**: Winston

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Supabase account
- Email service (SMTP)

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the environment example file:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/balmuya_db"

# Supabase
SUPABASE_URL="your_supabase_url"
SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# JWT
JWT_SECRET="your_jwt_secret_key"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"

# Payment Gateways
CHAPA_SECRET_KEY="your_chapa_secret_key"
CBE_BIRR_API_KEY="your_cbe_birr_api_key"
STRIPE_SECRET_KEY="your_stripe_secret_key"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 4. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| POST   | `/auth/register`        | Register new user      |
| POST   | `/auth/login`           | Login user             |
| POST   | `/auth/verify-email`    | Verify email           |
| POST   | `/auth/forgot-password` | Request password reset |
| POST   | `/auth/reset-password`  | Reset password         |
| POST   | `/auth/refresh-token`   | Refresh access token   |
| POST   | `/auth/logout`          | Logout user            |

### User Management

| Method | Endpoint                  | Access  | Description           |
| ------ | ------------------------- | ------- | --------------------- |
| GET    | `/users/profile`          | Private | Get user profile      |
| PUT    | `/users/profile`          | Private | Update profile        |
| GET    | `/users/seller-stats`     | Seller  | Get seller statistics |
| POST   | `/users/kyc-verification` | Seller  | Submit KYC documents  |
| GET    | `/users/:id/storefront`   | Public  | Get seller storefront |

### Product Management

| Method | Endpoint                       | Access | Description              |
| ------ | ------------------------------ | ------ | ------------------------ |
| GET    | `/products`                    | Public | Get all products         |
| GET    | `/products/:id`                | Public | Get single product       |
| POST   | `/products`                    | Seller | Create product           |
| PUT    | `/products/:id`                | Seller | Update product           |
| DELETE | `/products/:id`                | Seller | Delete product           |
| GET    | `/products/seller/my-products` | Seller | Get seller's products    |
| GET    | `/categories`                  | Public | Get categories           |
| GET    | `/categories/:id/products`     | Public | Get products by category |

### Order Management

| Method | Endpoint                   | Access       | Description         |
| ------ | -------------------------- | ------------ | ------------------- |
| POST   | `/orders`                  | Buyer        | Create order        |
| GET    | `/orders`                  | Private      | Get user orders     |
| GET    | `/orders/:id`              | Private      | Get order details   |
| PUT    | `/orders/:id/status`       | Seller/Admin | Update order status |
| GET    | `/orders/seller/my-orders` | Seller       | Get seller orders   |
| POST   | `/orders/:id/cancel`       | Buyer        | Cancel order        |

### Payment Integration

| Method | Endpoint                          | Description           |
| ------ | --------------------------------- | --------------------- |
| POST   | `/payments/initialize`            | Initialize payment    |
| POST   | `/payments/verify/:transactionId` | Verify transaction    |
| GET    | `/payments/order/:orderId`        | Get payment for order |
| POST   | `/payments/webhook/chapa`         | Chapa webhook         |
| POST   | `/payments/webhook/cbe-birr`      | CBE Birr webhook      |

### Review System

| Method | Endpoint                      | Description         |
| ------ | ----------------------------- | ------------------- |
| POST   | `/reviews`                    | Submit review       |
| GET    | `/reviews/product/:productId` | Get product reviews |
| GET    | `/reviews/seller/:sellerId`   | Get seller reviews  |
| PUT    | `/reviews/:id`                | Update review       |
| DELETE | `/reviews/:id`                | Delete review       |

### Wishlist

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| GET    | `/wishlist`            | Get wishlist         |
| POST   | `/wishlist`            | Add to wishlist      |
| DELETE | `/wishlist/:productId` | Remove from wishlist |

### Chat System

| Method | Endpoint              | Description    |
| ------ | --------------------- | -------------- |
| GET    | `/chats`              | Get user chats |
| POST   | `/chats`              | Create chat    |
| GET    | `/chats/:id/messages` | Get messages   |
| POST   | `/chats/:id/messages` | Send message   |
| POST   | `/chats/:id/read`     | Mark as read   |

### Admin Endpoints

| Method | Endpoint                  | Access | Description           |
| ------ | ------------------------- | ------ | --------------------- |
| GET    | `/admin/users`            | Admin  | List users            |
| PUT    | `/admin/users/:id/status` | Admin  | Suspend/Activate user |
| GET    | `/admin/kyc-applications` | Admin  | View KYC submissions  |
| PUT    | `/admin/kyc/:id/status`   | Admin  | Approve/Reject KYC    |
| GET    | `/admin/orders`           | Admin  | View all orders       |
| GET    | `/admin/dashboard`        | Admin  | Platform analytics    |

### File Upload

| Method | Endpoint            | Description           |
| ------ | ------------------- | --------------------- |
| POST   | `/upload/image`     | Upload image          |
| POST   | `/upload/video`     | Upload video          |
| POST   | `/upload/multiple`  | Upload multiple files |
| DELETE | `/upload/:filename` | Delete file           |

## 🔐 Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📝 Request/Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 🧪 Testing

### Test Accounts (after seeding)

- **Admin**: admin@balmuya.com / admin123
- **Seller**: seller@balmuya.com / seller123
- **Buyer**: buyer@balmuya.com / buyer123

### Sample API Calls

#### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "BUYER"
  }'
```

#### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Get Products

```bash
curl -X GET "http://localhost:5000/api/products?page=1&limit=10"
```

## 🚀 Deployment

### Environment Variables

Ensure all required environment variables are set:

- Database connection string
- Supabase credentials
- JWT secrets
- Email configuration
- Payment gateway credentials

### Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Push schema to production database
npm run db:push
```

### Production Start

```bash
npm start
```

## 📊 Monitoring

The API includes comprehensive logging with Winston:

- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Console output in development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the API documentation

---

**Balmuya** - Empowering women entrepreneurs through technology 🌍✨
