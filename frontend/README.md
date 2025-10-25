# ባለሙያ Frontend

A modern React ecommerce platform built with Vite, TypeScript, and Tailwind CSS, designed specifically for empowering women entrepreneurs in Ethiopia.

## Features

- 🎨 **Ethiopian Tilet-inspired Design** - Subtle patterns and calming color scheme
- 🛍️ **Ecommerce Functionality** - Product browsing, cart, checkout, and order management
- 👥 **Multi-role Support** - Buyers, sellers, and admin dashboards
- 🔐 **Authentication** - Secure login, registration, and password reset
- 📱 **Responsive Design** - Mobile-first approach with beautiful UI
- 🚀 **Modern Stack** - React 18, TypeScript, Vite, Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with interceptors
- **Icons**: Heroicons
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Update environment variables in `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   ├── layout/         # Layout components (Navbar, Footer, etc.)
│   └── auth/           # Authentication components
├── contexts/           # React contexts (Auth, Theme, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and API client
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── buyer/          # Buyer-specific pages
│   ├── seller/         # Seller-specific pages
│   ├── admin/          # Admin pages
│   └── products/       # Product-related pages
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Design System

### Colors
- **Primary**: #76459b (Ethiopian-inspired purple)
- **Secondary**: Neutral grays and accent colors
- **Background**: Soft gradients with Tilet patterns

### Typography
- **Display**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- **Ethiopian**: Noto Sans Ethiopic

### Components
- Custom button variants (primary, secondary, outline)
- Card components with hover effects
- Form inputs with validation states
- Loading states and animations

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Features

### Authentication
- Login/Register with email and password
- Password reset functionality
- Role-based access control
- Protected routes

### Product Management
- Product listing with filters and search
- Product detail pages with reviews
- Shopping cart functionality
- Wishlist management

### User Management
- Profile management
- Order history
- Address book
- Notification preferences

### Seller Features
- Product listing management
- Order processing
- Analytics dashboard
- Store customization

### Admin Features
- User management
- Content moderation
- Analytics and reporting
- System settings

## API Integration

The frontend integrates with the backend API through:
- Axios HTTP client with interceptors
- Automatic token refresh
- Error handling and notifications
- Type-safe API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
