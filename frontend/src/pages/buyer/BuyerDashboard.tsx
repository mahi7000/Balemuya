import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  HeartIcon, 
  ClockIcon,
  StarIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const BuyerDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-neutral-600">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Total Orders</p>
                <p className="text-2xl font-bold text-neutral-900">12</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HeartIcon className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Wishlist Items</p>
                <p className="text-2xl font-bold text-neutral-900">8</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Pending Orders</p>
                <p className="text-2xl font-bold text-neutral-900">3</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Reviews Given</p>
                <p className="text-2xl font-bold text-neutral-900">7</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-900">Recent Orders</h2>
                <Link to="/orders" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                  View all
                </Link>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    id: 'BAL-001',
                    product: 'Handwoven Basket',
                    seller: 'Aster T.',
                    status: 'Delivered',
                    date: '2024-01-15',
                    amount: '₦2,500'
                  },
                  {
                    id: 'BAL-002',
                    product: 'Traditional Spices',
                    seller: 'Hirut M.',
                    status: 'Shipped',
                    date: '2024-01-14',
                    amount: '₦1,800'
                  },
                  {
                    id: 'BAL-003',
                    product: 'Ethiopian Coffee',
                    seller: 'Meron K.',
                    status: 'Processing',
                    date: '2024-01-13',
                    amount: '₦3,200'
                  }
                ].map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900">{order.product}</h3>
                      <p className="text-sm text-neutral-600">by {order.seller}</p>
                      <p className="text-xs text-neutral-500">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900">{order.amount}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Recommendations */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/products"
                  className="flex items-center p-3 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <ChartBarIcon className="h-5 w-5 mr-3 text-primary-600" />
                  Browse Products
                </Link>
                <Link
                  to="/wishlist"
                  className="flex items-center p-3 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <HeartIcon className="h-5 w-5 mr-3 text-red-500" />
                  View Wishlist
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center p-3 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <ShoppingBagIcon className="h-5 w-5 mr-3 text-primary-600" />
                  View Cart
                </Link>
              </div>
            </div>

            {/* Recommended Products */}
            <div className="card">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recommended for You</h3>
              <div className="space-y-4">
                {[
                  {
                    name: 'Traditional Pottery',
                    seller: 'Aster T.',
                    price: '₦1,500',
                    rating: 4.8,
                    image: '🏺'
                  },
                  {
                    name: 'Handwoven Scarf',
                    seller: 'Hirut M.',
                    price: '₦2,200',
                    rating: 4.9,
                    image: '🧣'
                  }
                ].map((product, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="text-2xl">{product.image}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900 text-sm">{product.name}</h4>
                      <p className="text-xs text-neutral-600">by {product.seller}</p>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.rating)
                                  ? 'text-yellow-400'
                                  : 'text-neutral-300'
                              }`}
                              fill="currentColor"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-neutral-600 ml-1">{product.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900 text-sm">{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/products"
                className="block w-full mt-4 text-center text-primary-600 hover:text-primary-500 text-sm font-medium"
              >
                View All Recommendations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
