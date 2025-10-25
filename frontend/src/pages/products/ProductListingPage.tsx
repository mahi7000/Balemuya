import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const ProductListingPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');

  const products = [
    {
      id: '1',
      name: 'Handwoven Traditional Basket',
      seller: 'Aster T.',
      price: 2500,
      originalPrice: 3000,
      rating: 4.8,
      reviewCount: 24,
      image: '🧺',
      category: 'Handcrafts',
      location: 'Addis Ababa',
      isWishlisted: false
    },
    {
      id: '2',
      name: 'Ethiopian Coffee Beans',
      seller: 'Hirut M.',
      price: 1800,
      originalPrice: null,
      rating: 4.9,
      reviewCount: 18,
      image: '☕',
      category: 'Food & Spices',
      location: 'Dire Dawa',
      isWishlisted: true
    },
    {
      id: '3',
      name: 'Traditional Pottery Set',
      seller: 'Meron K.',
      price: 3200,
      originalPrice: 4000,
      rating: 4.7,
      reviewCount: 12,
      image: '🏺',
      category: 'Handcrafts',
      location: 'Bahir Dar',
      isWishlisted: false
    },
    {
      id: '4',
      name: 'Handwoven Scarf',
      seller: 'Aster T.',
      price: 2200,
      originalPrice: null,
      rating: 4.9,
      reviewCount: 31,
      image: '🧣',
      category: 'Clothing',
      location: 'Addis Ababa',
      isWishlisted: false
    },
    {
      id: '5',
      name: 'Traditional Spice Mix',
      seller: 'Hirut M.',
      price: 1200,
      originalPrice: 1500,
      rating: 4.6,
      reviewCount: 15,
      image: '🌶️',
      category: 'Food & Spices',
      location: 'Dire Dawa',
      isWishlisted: true
    },
    {
      id: '6',
      name: 'Handmade Jewelry Set',
      seller: 'Meron K.',
      price: 4500,
      originalPrice: null,
      rating: 4.8,
      reviewCount: 8,
      image: '💍',
      category: 'Jewelry',
      location: 'Bahir Dar',
      isWishlisted: false
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Discover Amazing Products
          </h1>
          <p className="text-neutral-600">
            Find unique handcrafted items from talented women entrepreneurs
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">Filters</h3>
                <FunnelIcon className="h-5 w-5 text-neutral-500" />
              </div>
              
              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Search products..."
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Category
                  </label>
                  <div className="space-y-2">
                    {['All', 'Handcrafts', 'Food & Spices', 'Clothing', 'Jewelry', 'Home Decor'].map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                        />
                        <span className="ml-2 text-sm text-neutral-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Price Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="500"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>₦0</span>
                      <span>₦10,000</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Minimum Rating
                  </label>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center">
                        <input
                          type="radio"
                          name="rating"
                          value={rating}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                        />
                        <div className="flex items-center ml-2">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < rating ? 'text-yellow-400' : 'text-neutral-300'
                              }`}
                              fill="currentColor"
                            />
                          ))}
                          <span className="ml-1 text-sm text-neutral-700">& up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Location
                  </label>
                  <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>All Locations</option>
                    <option>Addis Ababa</option>
                    <option>Dire Dawa</option>
                    <option>Bahir Dar</option>
                    <option>Hawassa</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-neutral-600">
                  {products.length} products found
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
                
                <div className="flex border border-neutral-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-neutral-500'}`}
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-neutral-500'}`}
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <div key={product.id} className={`card-hover ${
                  viewMode === 'list' ? 'flex' : ''
                }`}>
                  {viewMode === 'grid' ? (
                    <>
                      <div className="text-6xl text-center mb-4">{product.image}</div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-neutral-900 text-lg">
                          {product.name}
                        </h3>
                        <button className="text-neutral-400 hover:text-red-500">
                          <HeartIcon className={`h-5 w-5 ${product.isWishlisted ? 'text-red-500 fill-current' : ''}`} />
                        </button>
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">by {product.seller}</p>
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating)
                                  ? 'text-yellow-400'
                                  : 'text-neutral-300'
                              }`}
                              fill="currentColor"
                            />
                          ))}
                        </div>
                        <span className="text-sm text-neutral-600 ml-1">
                          {product.rating} ({product.reviewCount})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-neutral-900">
                            ₦{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-neutral-500 line-through ml-2">
                              ₦{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-neutral-500">{product.location}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl mr-4">{product.image}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-neutral-900 text-lg">
                            {product.name}
                          </h3>
                          <button className="text-neutral-400 hover:text-red-500">
                            <HeartIcon className={`h-5 w-5 ${product.isWishlisted ? 'text-red-500 fill-current' : ''}`} />
                          </button>
                        </div>
                        <p className="text-sm text-neutral-600 mb-2">by {product.seller}</p>
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.rating)
                                    ? 'text-yellow-400'
                                    : 'text-neutral-300'
                                }`}
                                fill="currentColor"
                              />
                            ))}
                          </div>
                          <span className="text-sm text-neutral-600 ml-1">
                            {product.rating} ({product.reviewCount})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-neutral-900">
                              ₦{product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-neutral-500 line-through ml-2">
                                ₦{product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-neutral-500">{product.location}</span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <Link
                    to={`/products/${product.id}`}
                    className="btn-primary w-full mt-4"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700">
                  Previous
                </button>
                <button className="px-3 py-2 text-sm bg-primary-500 text-white rounded-lg">
                  1
                </button>
                <button className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700">
                  2
                </button>
                <button className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700">
                  3
                </button>
                <button className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;
