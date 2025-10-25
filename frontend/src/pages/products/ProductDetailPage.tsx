// pages/ProductDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  HeartIcon, 
  StarIcon, 
  TruckIcon, 
  ShieldCheckIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../../lib/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  video?: string;
  category: string;
  seller: {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    location: string;
  };
  rating: number;
  reviewCount: number;
  specifications: Record<string, string>;
  inStock: boolean;
  stockQuantity: number;
  tags: string[];
  createdAt: string;
}

interface Review {
  id: string;
  user: {
    id: string;
    name: string;
  };
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  const safeExtract = (res: any) => {
    if (!res) return null;
    if (Array.isArray(res)) return res;
    return res.data?.data || res.data?.items || res.data || res || null;
  };


  useEffect(() => {
    if (id) {
      fetchProductData();
    }
  }, [id]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const [productRes, reviewsRes, relatedRes] = await Promise.all([
        apiClient.products.getById(id!),
        apiClient.reviews.getByProduct(id!, { limit: 10 }),
        apiClient.products.getAll({ category: product?.category, limit: 3 })
      ]);

      const productData = safeExtract(productRes);
      const reviewsData = safeExtract(reviewsRes);
      const relatedData = safeExtract(relatedRes);

      setProduct(productData);
      setReviews(Array.isArray(reviewsData) ? reviewsData : reviewsData?.items || []);
      setRelatedProducts(Array.isArray(relatedData) ? relatedData : relatedData?.items || []);


      // Check if product is in wishlist
      const wishlistRes = await apiClient.wishlist.getAll();
      const wishlistItems = safeExtract(wishlistRes) || [];
      setIsWishlisted(wishlistItems.some((item: any) => item.productId === id));
    } catch (error) {
      console.error('Error fetching product data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      // This would typically call a cart API endpoint
      // For now, we'll simulate adding to cart
      const cartItem = {
        productId: product.id,
        quantity,
        price: product.price,
        name: product.name,
        image: product.images[0]
      };

      // Store in localStorage for demo
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIndex = existingCart.findIndex((item: any) => item.productId === product.id);
      
      if (existingItemIndex > -1) {
        existingCart[existingItemIndex].quantity += quantity;
      } else {
        existingCart.push(cartItem);
      }
      
      localStorage.setItem('cart', JSON.stringify(existingCart));
      
      // Show success message
      alert('Product added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;

    try {
      if (isWishlisted) {
        await apiClient.wishlist.remove(product.id);
        setIsWishlisted(false);
      } else {
        await apiClient.wishlist.add({ productId: product.id });
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleContactSeller = () => {
    if (product) {
      navigate(`/chat/${product.seller.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-neutral-200 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                <div className="h-20 bg-neutral-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Product Not Found</h2>
          <Link to="/products" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-neutral-500 hover:text-primary-600 mr-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back
          </button>
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-neutral-500 hover:text-primary-600">Home</Link>
            </li>
            <li className="text-neutral-400">/</li>
            <li>
              <Link to="/products" className="text-neutral-500 hover:text-primary-600">Products</Link>
            </li>
            <li className="text-neutral-400">/</li>
            <li>
              <Link to={`/products?category=${product.category}`} className="text-neutral-500 hover:text-primary-600">
                {product.category}
              </Link>
            </li>
            <li className="text-neutral-400">/</li>
            <li className="text-neutral-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-white rounded-xl border border-neutral-200 p-8 mb-4">
              {product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-neutral-100 rounded-lg flex items-center justify-center">
                  <span className="text-neutral-400">No Image</span>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`shrink-0 w-16 h-16 rounded-lg border-2 ${
                      selectedImage === index
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400'
                          : 'text-neutral-300'
                      }`}
                      fill="currentColor"
                    />
                  ))}
                </div>
                <span className="text-neutral-600">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-primary-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-semibold">
                      {product.seller.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{product.seller.name}</p>
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.seller.rating)
                                ? 'text-yellow-400'
                                : 'text-neutral-300'
                            }`}
                            fill="currentColor"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-neutral-600 ml-1">
                        {product.seller.rating} ({product.seller.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleContactSeller}
                  className="flex items-center text-primary-600 hover:text-primary-700"
                >
                  <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                  <span className="text-sm">Message</span>
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-neutral-900">
                  ETB {product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-neutral-500 line-through">
                      ETB {product.originalPrice.toLocaleString()}
                    </span>
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-neutral-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-neutral-600 hover:text-neutral-900"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-neutral-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-neutral-600 hover:text-neutral-900"
                    disabled={quantity >= product.stockQuantity}
                  >
                    +
                  </button>
                </div>
                <span className={`text-sm ${
                  product.inStock ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.inStock 
                    ? `${product.stockQuantity} in stock`
                    : 'Out of stock'
                  }
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-6">
              <button 
                onClick={handleAddToCart}
                disabled={!product.inStock || addingToCart}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={handleAddToWishlist}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  isWishlisted
                    ? 'border-red-500 text-red-500 bg-red-50'
                    : 'border-neutral-300 text-neutral-600 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <HeartIcon className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button className="p-3 rounded-lg border-2 border-neutral-300 text-neutral-600 hover:border-primary-500 hover:text-primary-500">
                <ShareIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Delivery Info */}
            <div className="space-y-3">
              <div className="flex items-center text-sm text-neutral-600">
                <TruckIcon className="h-5 w-5 mr-2" />
                <span>Free delivery on orders over ETB 5,000</span>
              </div>
              <div className="flex items-center text-sm text-neutral-600">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                <span>Secure payment with buyer protection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-8">
          <div className="border-b border-neutral-200">
            <nav className="flex space-x-8">
              <button className="py-2 px-1 border-b-2 border-primary-500 text-primary-600 font-medium">
                Description
              </button>
            </nav>
          </div>

          <div className="py-6">
            <div className="prose max-w-none">
              <p className="text-neutral-700 mb-6">{product.description}</p>
              
              {Object.keys(product.specifications).length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="font-medium text-neutral-900 w-32">{key}:</span>
                        <span className="text-neutral-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {product.tags.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4 mt-6">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-neutral-900 mb-6">
              Customer Reviews ({product.reviewCount})
            </h3>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-semibold text-sm">
                          {review.user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{review.user.name}</p>
                        <div className="flex items-center">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400'
                                    : 'text-neutral-300'
                                }`}
                                fill="currentColor"
                              />
                            ))}
                          </div>
                          {review.verified && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-neutral-500">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-neutral-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-6">
              You might also like
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="card-hover">
                  <div className="aspect-square bg-white rounded-lg mb-4 flex items-center justify-center">
                    {relatedProduct.images.length > 0 ? (
                      <img
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-neutral-400">No Image</div>
                    )}
                  </div>
                  <h4 className="font-semibold text-neutral-900 mb-2">{relatedProduct.name}</h4>
                  <p className="text-sm text-neutral-600 mb-2">by {relatedProduct.seller.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-neutral-900">
                      ETB {relatedProduct.price.toLocaleString()}
                    </span>
                    <Link
                      to={`/products/${relatedProduct.id}`}
                      className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;