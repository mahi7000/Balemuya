import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  UserGroupIcon, 
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon,
  HeartIcon,
  TruckIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-primary-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary-600">
                  ባለሙያ
                </h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/products" className="text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Products
                </Link>
                <Link to="/auth/login" className="text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign In
                </Link>
                <Link to="/auth/register" className="btn-primary">
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
              Empowering Women,
              <span className="text-primary-600 block">One Skill at a Time</span>
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
              Join Ethiopia's premier marketplace where talented women showcase their crafts, 
              share their stories, and build thriving businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register" className="btn-primary text-lg px-8 py-4">
                Start Your Journey
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/products" className="btn-outline text-lg px-8 py-4">
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Discover Amazing Crafts
            </h2>
            <p className="text-lg text-neutral-600">
              From traditional handcrafts to modern creations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Handcrafts', icon: '🎨', count: '150+ items' },
              { name: 'Food & Spices', icon: '🌶️', count: '80+ items' },
              { name: 'Clothing', icon: '👗', count: '200+ items' },
              { name: 'Home Decor', icon: '🏠', count: '120+ items' },
            ].map((category, index) => (
              <div key={index} className="card-hover text-center group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-neutral-600">{category.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-r from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-neutral-600">
              Simple steps to start your journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Join Our Community',
                description: 'Create your account and choose your role as a buyer or seller',
                icon: <UserGroupIcon className="h-8 w-8 text-primary-600" />
              },
              {
                step: '02',
                title: 'Start Selling or Buying',
                description: 'Sellers can list their products, buyers can discover amazing crafts',
                icon: <ShoppingBagIcon className="h-8 w-8 text-primary-600" />
              },
              {
                step: '03',
                title: 'Build Your Business',
                description: 'Grow your business with our support and community features',
                icon: <StarIcon className="h-8 w-8 text-primary-600" />
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  {item.icon}
                </div>
                <div className="text-sm font-semibold text-primary-600 mb-2">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-neutral-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Why Choose ባለሙያ?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <ShieldCheckIcon className="h-8 w-8 text-primary-600" />,
                title: 'Secure Payments',
                description: 'Your transactions are protected with bank-level security'
              },
              {
                icon: <HeartIcon className="h-8 w-8 text-primary-600" />,
                title: 'Women-Only Community',
                description: 'A safe space created exclusively for women entrepreneurs'
              },
              {
                icon: <TruckIcon className="h-8 w-8 text-primary-600" />,
                title: 'Reliable Delivery',
                description: 'Fast and secure delivery across Ethiopia'
              },
              {
                icon: <CreditCardIcon className="h-8 w-8 text-primary-600" />,
                title: 'Multiple Payment Options',
                description: 'Pay with mobile money, bank transfer, or cash on delivery'
              },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-neutral-600">
              Real women, real success
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Aster T.',
                role: 'Handcraft Seller',
                story: 'I started selling my traditional baskets and now I support my entire family.',
                revenue: '₦50,000/month'
              },
              {
                name: 'Hirut M.',
                role: 'Food Entrepreneur',
                story: 'My spice blends are now sold across three regions. This platform changed my life.',
                revenue: '₦75,000/month'
              },
              {
                name: 'Meron K.',
                role: 'Fashion Designer',
                story: 'From making clothes for friends to having 200+ customers nationwide.',
                revenue: '₦100,000/month'
              },
            ].map((story, index) => (
              <div key={index} className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {story.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                  {story.name}
                </h3>
                <p className="text-primary-600 text-sm mb-3">{story.role}</p>
                <p className="text-neutral-600 mb-4 italic">
                  "{story.story}"
                </p>
                <div className="text-lg font-bold text-primary-600">
                  {story.revenue}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of women who are already building their dreams on ባለሙያ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register" className="bg-white text-primary-600 hover:bg-primary-50 font-medium px-8 py-4 rounded-lg transition-colors">
              Join as Seller
            </Link>
            <Link to="/products" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium px-8 py-4 rounded-lg transition-colors">
              Start Shopping
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-primary-400 mb-4">
                ባለሙያ
              </h3>
              <p className="text-neutral-400">
                Empowering women through ecommerce
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Buyers</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><Link to="/products" className="hover:text-white">Browse Products</Link></li>
                <li><Link to="/auth/register" className="hover:text-white">Create Account</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Sellers</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><Link to="/auth/register" className="hover:text-white">Start Selling</Link></li>
                <li><Link to="/seller" className="hover:text-white">Seller Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; 2024 ባለሙያ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
