// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: string;
  status: string;
  isVerified: boolean;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Seller specific fields
  storeName?: string;
  bio?: string;
  kycStatus: string;
  kycSubmittedAt?: string;
  kycApprovedAt?: string;
  isPremiumSeller: boolean;
  premiumExpiresAt?: string;
}

// Product types
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  quantity: number;
  trackQuantity: boolean;
  allowBackorder: boolean;
  lowStockThreshold: number;
  sku?: string;
  weight?: number;
  dimensions?: any;
  images: string[];
  video?: string;
  tags: string[];
  specifications?: any;
  status: string;
  isPublished: boolean;
  isFeatured: boolean;
  averageRating?: number;
  reviewCount: number;
  salesCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  
  sellerId: string;
  categoryId: string;
  seller: User;
  category: Category;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  products: Product[];
  parent?: Category;
  children: Category[];
}

// Order types
export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  deliveryOption: string;
  trackingNumber?: string;
  deliveryAddress?: any;
  deliveryNotes?: string;
  notes?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  
  buyerId: string;
  sellerId: string;
  shippingAddressId: string;
  buyer: User;
  seller: User;
  shippingAddress: Address;
  items: OrderItem[];
  payments: Payment[];
  reviews: Review[];
}

// Order Item types
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  
  order: Order;
  product: Product;
}

// Payment types
export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  gatewayResponse?: any;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  
  order: Order;
  user: User;
}

// Review types
export interface Review {
  id: string;
  productId: string;
  orderId: string;
  userId: string;
  sellerId: string;
  rating: number;
  comment?: string;
  images: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  
  product: Product;
  order: Order;
  user: User;
  seller: User;
}

// Address types
export interface Address {
  id: string;
  userId: string;
  type: string;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  
  user: User;
  orders: Order[];
}

// Wishlist types
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  
  user: User;
  product: Product;
}

// Chat types
export interface Chat {
  id: string;
  status: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  
  participant1Id: string;
  participant2Id: string;
  participant1: User;
  participant2: User;
  messages: Message[];
}

// Message types
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  
  chat: Chat;
  sender: User;
  receiver: User;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  
  user: User;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  agreeToTerms: boolean;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  token: string;
  password: string;
  confirmPassword: string;
}

// Filter types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  location?: string;
  search?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popularity' | 'rating';
}

// Analytics types
export interface SellerAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  topProducts: Array<{
    product: Product;
    sales: number;
    revenue: number;
  }>;
}