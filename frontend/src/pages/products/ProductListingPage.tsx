// pages/ProductListingPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../../lib/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  seller: {
    id: string;
    name: string;
    rating: number;
    location: string;
  };
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  tags: string[];
  createdAt: string;
}

interface FilterState {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  location: string;
  sortBy: string;
  page: number;
  limit: number;
}

// Safely extract data from API response, whether it's an array or nested
const safeExtract = (res: any) => {
  if (!res) return null;
  if (Array.isArray(res)) return res;
  return res.data?.data?.items || res.data?.items || res.data || res || null;
};

const safeExtractTotal = (res: any) => {
  if (!res) return 0;
  return res.data?.data?.total || res.data?.total || 0;
};


const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 10000,
    minRating: Number(searchParams.get('minRating')) || 0,
    location: searchParams.get('location') || 'all',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: Number(searchParams.get('page')) || 1,
    limit: 12
  });

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, [filters]);

  useEffect(() => {
    // Update URL with current filters
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy
      };

      if (filters.search) params.search = filters.search;
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.minPrice > 0) params.minPrice = filters.minPrice;
      if (filters.maxPrice < 10000) params.maxPrice = filters.maxPrice;
      if (filters.minRating > 0) params.minRating = filters.minRating;
      if (filters.location !== 'all') params.location = filters.location;

      const response = await apiClient.products.getAll(params);
      const productsData = safeExtract(response) || [];
      const total = safeExtractTotal(response);

      setProducts(productsData);
      setTotalProducts(total);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await apiClient.wishlist.getAll();
      const wishlistItems = safeExtract(response) || [];
      const wishlistSet = new Set<string>(wishlistItems.map((item: any) => String(item.productId)));
      setWishlist(wishlistSet);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const handleAddToWishlist = async (productId: string) => {
    try {
      if (wishlist.has(productId)) {
        await apiClient.wishlist.remove(productId);
        setWishlist(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        await apiClient.wishlist.add({ productId });
        setWishlist(prev => new Set(prev).add(productId));
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const totalPages = Math.ceil(totalProducts / filters.limit);

  const categories = [
    'All',
    'Handcrafts',
    'Food & Spices',
    'Clothing',
    'Jewelry',
    'Home Decor',
    'Beauty & Health',
    'Electronics'
  ];

  const locations = [
    'All Locations',
    'Addis Ababa',
    'Dire Dawa',
    'Bahir Dar',
    'Hawassa',
    'Mekele',
    'Gondar'
  ];

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="h-96 bg-neutral-200 rounded"></div>
              </div>
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-80 bg-neutral-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <form onSubmit={handleSearch}>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Search products..."
                    />
                  </div>
                </form>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Category
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          checked={filters.category === category.toLowerCase() || (category === 'All' && filters.category === 'all')}
                          onChange={() => handleFilterChange('category', category === 'All' ? 'all' : category.toLowerCase())}
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
                    Price Range (ETB)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="500"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>ETB {filters.minPrice}</span>
                      <span>ETB {filters.maxPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Minimum Rating
                  </label>
                  <div className="space-y-2">
                    {[4, 3, 2, 1, 0].map((rating) => (
                      <label key={rating} className="flex items-center">
                        <input
                          type="radio"
                          name="rating"
                          checked={filters.minRating === rating}
                          onChange={() => handleFilterChange('minRating', rating)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                        />
                        <div className="flex items-center ml-2">
                          {rating > 0 ? (
                            <>
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
                            </>
                          ) : (
                            <span className="text-sm text-neutral-700">Any rating</span>
                          )}
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
                  <select 
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {locations.map(location => (
                      <option key={location} value={location === 'All Locations' ? 'all' : location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => setFilters({
                    search: '',
                    category: 'all',
                    minPrice: 0,
                    maxPrice: 10000,
                    minRating: 0,
                    location: 'all',
                    sortBy: 'newest',
                    page: 1,
                    limit: 12
                  })}
                  className="w-full btn-outline text-sm"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-neutral-600">
                  {totalProducts} products found
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
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
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 text-6xl mb-4">🧺</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No products found</h3>
                <p className="text-neutral-600 mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => setFilters({
                    search: '',
                    category: 'all',
                    minPrice: 0,
                    maxPrice: 10000,
                    minRating: 0,
                    location: 'all',
                    sortBy: 'newest',
                    page: 1,
                    limit: 12
                  })}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
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
                          <div className="aspect-square bg-white rounded-lg mb-4 flex items-center justify-center">
                            {product.images.length > 0 ? (
                              <img
                                src={product.images?.[0] || ''}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="text-neutral-400">No Image</div>
                            )}
                          </div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-neutral-900 text-lg">
                              {product.name}
                            </h3>
                            <button 
                              onClick={() => handleAddToWishlist(product.id)}
                              className="text-neutral-400 hover:text-red-500"
                            >
                              <HeartIcon className={`h-5 w-5 ${
                                wishlist.has(product.id) ? 'text-red-500 fill-current' : ''
                              }`} />
                            </button>
                          </div>
                          <p className="text-sm text-neutral-600 mb-2">by {product.seller.name}</p>
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
                                ETB {product.price.toLocaleString()}
                              </span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-sm text-neutral-500 line-through ml-2">
                                  ETB {product.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-neutral-500">{product.seller.location}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-32 h-32 bg-white rounded-lg mr-4 flex items-center justify-center">
                            {product.images.length > 0 ? (
                              <img
                                src={product.images?.[0] || ''}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="text-neutral-400">No Image</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-neutral-900 text-lg">
                                {product.name}
                              </h3>
                              <button 
                                onClick={() => handleAddToWishlist(product.id)}
                                className="text-neutral-400 hover:text-red-500"
                              >
                                <HeartIcon className={`h-5 w-5 ${
                                  wishlist.has(product.id) ? 'text-red-500 fill-current' : ''
                                }`} />
                              </button>
                            </div>
                            <p className="text-sm text-neutral-600 mb-2">by {product.seller.name}</p>
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
                                  ETB {product.price.toLocaleString()}
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <span className="text-sm text-neutral-500 line-through ml-2">
                                    ETB {product.originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-neutral-500">{product.seller.location}</span>
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
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                        disabled={filters.page === 1}
                        className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        // Show first page, last page, and pages around current page
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= filters.page - 1 && page <= filters.page + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handleFilterChange('page', page)}
                              className={`px-3 py-2 text-sm rounded-lg ${
                                filters.page === page
                                  ? 'bg-primary-500 text-white'
                                  : 'text-neutral-500 hover:text-neutral-700'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === filters.page - 2 || page === filters.page + 2) {
                          return <span key={page} className="px-2 text-neutral-400">...</span>;
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                        disabled={filters.page === totalPages}
                        className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;