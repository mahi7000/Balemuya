import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  HeartIcon, 
  StarIcon, 
  TruckIcon, 
  ShieldCheckIcon,
  ChatBubbleLeftIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Mock product data
  const product = {
    id: '1',
    name: 'Handwoven Traditional Basket',
    seller: 'Aster T.',
    sellerRating: 4.9,
    sellerReviews: 156,
    price: 2500,
    originalPrice: 3000,
    rating: 4.8,
    reviewCount: 24,
    images: ['🧺', '🏺', '🎨'],
    description: 'Beautiful handwoven traditional basket made from natural materials. Perfect for home decoration or practical use. Each basket is unique and crafted with care by skilled artisans.',
    specifications: {
      'Material': 'Natural fibers',
      'Dimensions': '30cm x 25cm x 15cm',
      'Weight': '500g',
      'Color': 'Natural brown',
      'Care Instructions': 'Hand wash only'
    },
    category: 'Handcrafts',
    location: 'Addis Ababa',
    inStock: true,
    stockQuantity: 5,
    tags: ['handmade', 'traditional', 'eco-friendly', 'decorative']
  };

  const reviews = [
    {
      id: 1,
      user: 'Sarah M.',
      rating: 5,
      comment: 'Absolutely beautiful! The craftsmanship is amazing and it arrived in perfect condition.',
      date: '2024-01-10',
      verified: true
    },
    {
      id: 2,
      user: 'Amina K.',
      rating: 4,
      comment: 'Great quality basket, exactly as described. Seller was very responsive to messages.',
      date: '2024-01-08',
      verified: true
    },
    {
      id: 3,
      user: 'Fatima A.',
      rating: 5,
      comment: 'Love this basket! It\'s perfect for storing fruits and vegetables. Highly recommend!',
      date: '2024-01-05',
      verified: false
    }
  ];

  const relatedProducts = [
    {
      id: '2',
      name: 'Traditional Pottery Set',
      price: 3200,
      image: '🏺',
      seller: 'Meron K.'
    },
    {
      id: '3',
      name: 'Handwoven Scarf',
      price: 2200,
      image: '🧣',
      seller: 'Aster T.'
    },
    {
      id: '4',
      name: 'Ethiopian Coffee Beans',
      price: 1800,
      image: '☕',
      seller: 'Hirut M.'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
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
              <div className="text-8xl text-center">
                {product.images[selectedImage]}
              </div>
            </div>
            <div className="flex space-x-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl ${
                    selectedImage === index
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {image}
                </button>
              ))}
            </div>
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
                      {product.seller.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{product.seller}</p>
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.sellerRating)
                                ? 'text-yellow-400'
                                : 'text-neutral-300'
                            }`}
                            fill="currentColor"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-neutral-600 ml-1">
                        {product.sellerRating} ({product.sellerReviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <button className="flex items-center text-primary-600 hover:text-primary-700">
                  <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                  <span className="text-sm">Message</span>
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-neutral-900">
                  ₦{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-neutral-500 line-through">
                    ₦{product.originalPrice.toLocaleString()}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
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
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-neutral-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-neutral-600 hover:text-neutral-900"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-neutral-600">
                  {product.stockQuantity} in stock
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-6">
              <button className="btn-primary flex-1">
                Add to Cart
              </button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
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
                <span>Free delivery on orders over ₦5,000</span>
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
              <button className="py-2 px-1 border-b-2 border-transparent text-neutral-500 hover:text-neutral-700">
                Specifications
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-neutral-500 hover:text-neutral-700">
                Reviews ({product.reviewCount})
              </button>
            </nav>
          </div>

          <div className="py-6">
            <div className="prose max-w-none">
              <p className="text-neutral-700 mb-6">{product.description}</p>
              
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-medium text-neutral-900 w-32">{key}:</span>
                    <span className="text-neutral-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-neutral-900 mb-6">
            Customer Reviews
          </h3>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary-600 font-semibold text-sm">
                        {review.user.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{review.user}</p>
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
                  <span className="text-sm text-neutral-500">{review.date}</span>
                </div>
                <p className="text-neutral-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-6">
            You might also like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((product) => (
              <div key={product.id} className="card-hover">
                <div className="text-4xl text-center mb-4">{product.image}</div>
                <h4 className="font-semibold text-neutral-900 mb-2">{product.name}</h4>
                <p className="text-sm text-neutral-600 mb-2">by {product.seller}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-neutral-900">
                    ₦{product.price.toLocaleString()}
                  </span>
                  <Link
                    to={`/products/${product.id}`}
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
