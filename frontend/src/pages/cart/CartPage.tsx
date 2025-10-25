import React from 'react';
import { Link } from 'react-router-dom';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

const CartPage: React.FC = () => {
  const cartItems = [
    {
      id: '1',
      name: 'Handwoven Traditional Basket',
      seller: 'Aster T.',
      price: 2500,
      originalPrice: 3000,
      quantity: 1,
      image: '🧺',
      inStock: true
    },
    {
      id: '2',
      name: 'Ethiopian Coffee Beans',
      seller: 'Hirut M.',
      price: 1800,
      originalPrice: null,
      quantity: 2,
      image: '☕',
      inStock: true
    },
    {
      id: '3',
      name: 'Traditional Pottery Set',
      seller: 'Meron K.',
      price: 3200,
      originalPrice: 4000,
      quantity: 1,
      image: '🏺',
      inStock: false
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 500;
  const tax = subtotal * 0.15; // 15% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Your cart is empty</h2>
            <p className="text-neutral-600 mb-6">Add some products to get started!</p>
            <Link to="/products" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="card">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{item.image}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                        <p className="text-sm text-neutral-600">by {item.seller}</p>
                        {!item.inStock && (
                          <p className="text-sm text-red-600">Out of stock</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center border border-neutral-300 rounded-lg">
                          <button className="p-2 text-neutral-600 hover:text-neutral-900">
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 border-x border-neutral-300">
                            {item.quantity}
                          </span>
                          <button className="p-2 text-neutral-600 hover:text-neutral-900">
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-neutral-900">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </p>
                          {item.originalPrice && (
                            <p className="text-sm text-neutral-500 line-through">
                              ₦{(item.originalPrice * item.quantity).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <button className="text-red-500 hover:text-red-700">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card sticky top-8">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Subtotal</span>
                    <span className="font-medium">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : `₦${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Tax</span>
                    <span className="font-medium">₦{tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-neutral-900">Total</span>
                      <span className="text-lg font-bold text-neutral-900">₦{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="btn-primary w-full mb-4"
                >
                  Proceed to Checkout
                </Link>
                
                <Link
                  to="/products"
                  className="btn-outline w-full"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
