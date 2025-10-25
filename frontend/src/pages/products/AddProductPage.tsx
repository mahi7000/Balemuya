// pages/AddProduct.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../../lib/api';

interface ProductFormData {
  // Step 1: Basic Info
  title: string;
  description: string;
  category: string;
  tags: string[];
  
  // Step 2: Media
  images: string[];
  video?: string;
  
  // Step 3: Pricing & Inventory
  price: number;
  comparePrice?: number;
  costPerItem?: number;
  sku: string;
  trackQuantity: boolean;
  quantity: number;
  continueSelling: boolean;
  
  // Step 4: Delivery
  weight: number;
  weightUnit: string;
  requiresShipping: boolean;
  
  // Step 5: Organization
  productType: string;
  vendor: string;
  collections: string[];
}

interface FormErrors {
  [key: string]: string;
}

// Safe extraction helper function
const safeExtract = (res: any) => {
  if (!res) return null;
  if (Array.isArray(res)) return res;
  return res.data?.data || res.data || res || null;
};

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<ProductFormData>({
    // Step 1: Basic Info
    title: '',
    description: '',
    category: '',
    tags: [],
    
    // Step 2: Media
    images: [],
    video: '',
    
    // Step 3: Pricing & Inventory
    price: 0,
    comparePrice: 0,
    costPerItem: 0,
    sku: '',
    trackQuantity: true,
    quantity: 0,
    continueSelling: false,
    
    // Step 4: Delivery
    weight: 0,
    weightUnit: 'kg',
    requiresShipping: true,
    
    // Step 5: Organization
    productType: '',
    vendor: '',
    collections: [],
  });

  const [tagInput, setTagInput] = useState('');

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Product title and description' },
    { number: 2, title: 'Media', description: 'Images and videos' },
    { number: 3, title: 'Pricing', description: 'Price and inventory' },
    { number: 4, title: 'Delivery', description: 'Shipping details' },
    { number: 5, title: 'Review', description: 'Final review' },
  ];

  const categories = [
    'Handcrafts',
    'Clothing',
    'Jewelry',
    'Home Decor',
    'Food & Spices',
    'Beauty & Health',
    'Electronics',
    'Other'
  ];

  const productTypes = [
    'Physical Product',
    'Digital Product',
    'Service'
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          newErrors.title = 'Product title is required';
        }
        if (!formData.description.trim()) {
          newErrors.description = 'Product description is required';
        }
        if (!formData.category) {
          newErrors.category = 'Category is required';
        }
        break;

      case 2:
        if (formData.images.length === 0) {
          newErrors.images = 'At least one image is required';
        }
        break;

      case 3:
        if (!formData.price || formData.price <= 0) {
          newErrors.price = 'Valid price is required';
        }
        if (formData.trackQuantity && (!formData.quantity || formData.quantity < 0)) {
          newErrors.quantity = 'Valid quantity is required';
        }
        break;

      case 4:
        if (formData.requiresShipping && (!formData.weight || formData.weight <= 0)) {
          newErrors.weight = 'Valid weight is required for shipping';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors({ images: 'Image size must be less than 5MB' });
      return;
    }

    setUploading(true);
    try {
      const response = await apiClient.upload.image(file);
      const responseData = safeExtract(response);
      
      if (responseData?.url) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, responseData.url]
        }));
        setErrors(prev => ({ ...prev, images: '' }));
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors({ images: 'Failed to upload image. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setErrors({ video: 'Video size must be less than 50MB' });
      return;
    }

    setUploading(true);
    try {
      const response = await apiClient.upload.video(file);
      const responseData = safeExtract(response);
      
      if (responseData?.url) {
        setFormData(prev => ({
          ...prev,
          video: responseData.url
        }));
        setErrors(prev => ({ ...prev, video: '' }));
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      setErrors({ video: 'Failed to upload video. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      // Prepare data for API
      const productData = {
        name: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        images: formData.images,
        video: formData.video,
        price: formData.price,
        originalPrice: formData.comparePrice || undefined,
        costPerItem: formData.costPerItem || undefined,
        sku: formData.sku || undefined,
        trackQuantity: formData.trackQuantity,
        quantity: formData.trackQuantity ? formData.quantity : undefined,
        continueSellingWhenOutOfStock: formData.continueSelling,
        weight: formData.requiresShipping ? formData.weight : undefined,
        weightUnit: formData.requiresShipping ? formData.weightUnit : undefined,
        requiresShipping: formData.requiresShipping,
        productType: formData.productType || undefined,
        vendor: formData.vendor || undefined,
        collections: formData.collections,
      };

      const response = await apiClient.products.create(productData);
      const responseData = safeExtract(response);

      if (responseData) {
        // Show success message and redirect
        alert('Product created successfully!');
        navigate('/seller/products');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create product. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Enter product title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={6}
                className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Describe your product in detail..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={`input-field ${errors.category ? 'border-red-500' : ''}`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="input-field flex-1"
                  placeholder="Add tags (press Enter to add)"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn-secondary"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-primary-900"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Product Images *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  errors.images ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-primary-400'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : 'Add Image'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  />
                </label>
              </div>
              {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
              <p className="text-xs text-gray-500 mt-2">
                Upload high-quality images. First image will be the main product image.
              </p>
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Product Video (Demonstration)
              </label>
              {formData.video ? (
                <div className="relative">
                  <video
                    src={formData.video}
                    controls
                    className="w-full max-w-md rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, video: '' }))}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  errors.video ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-primary-400'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <VideoCameraIcon className="w-12 h-12 text-gray-400 mb-4" />
                  <span className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : 'Upload Product Video'}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Optional - Max 50MB</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="video/*"
                    disabled={uploading}
                    onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                  />
                </label>
              )}
              {errors.video && <p className="text-red-500 text-sm mt-1">{errors.video}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (ETB) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className={`input-field ${errors.price ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compare Price (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.comparePrice || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, comparePrice: parseFloat(e.target.value) || undefined }))}
                  className="input-field"
                  placeholder="Original price for discount"
                />
                <p className="text-xs text-gray-500 mt-1">Show a discounted price</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost per Item (ETB)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.costPerItem || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, costPerItem: parseFloat(e.target.value) || undefined }))}
                className="input-field"
                placeholder="Your cost for this product"
              />
              <p className="text-xs text-gray-500 mt-1">For profit calculation</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                className="input-field"
                placeholder="e.g., PROD-001"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Track Quantity
                  </label>
                  <p className="text-sm text-gray-500">Manage inventory levels</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, trackQuantity: !prev.trackQuantity }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.trackQuantity ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.trackQuantity ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {formData.trackQuantity && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    className={`input-field ${errors.quantity ? 'border-red-500' : ''}`}
                    placeholder="Available quantity"
                  />
                  {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Continue Selling When Out of Stock
                  </label>
                  <p className="text-sm text-gray-500">Allow purchases when inventory is zero</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, continueSelling: !prev.continueSelling }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.continueSelling ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.continueSelling ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  This product requires shipping
                </label>
                <p className="text-sm text-gray-500">Customer will enter shipping address</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, requiresShipping: !prev.requiresShipping }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.requiresShipping ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.requiresShipping ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {formData.requiresShipping && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                    className={`input-field ${errors.weight ? 'border-red-500' : ''}`}
                    placeholder="0.0"
                  />
                  {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight Unit *
                  </label>
                  <select
                    value={formData.weightUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, weightUnit: e.target.value }))}
                    className="input-field"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="lb">Pounds (lb)</option>
                    <option value="oz">Ounces (oz)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-400 mr-2" />
                <p className="text-green-800">All required information is complete!</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Summary</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Title</p>
                    <p className="text-gray-900">{formData.title}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Category</p>
                    <p className="text-gray-900">{formData.category}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Price</p>
                    <p className="text-gray-900">ETB {formData.price.toFixed(2)}</p>
                    {formData.comparePrice && (
                      <p className="text-sm text-gray-500 line-through">
                        ETB {formData.comparePrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Quantity</p>
                    <p className="text-gray-900">
                      {formData.trackQuantity ? formData.quantity : 'Not tracked'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Media Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Media Preview</h3>
                
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {formData.images.slice(0, 3).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ))}
                    {formData.images.length > 3 && (
                      <div className="flex items-center justify-center bg-gray-100 rounded-lg">
                        <span className="text-sm text-gray-600">
                          +{formData.images.length - 3} more
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {formData.video && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Video</p>
                    <video
                      src={formData.video}
                      controls
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-800">{errors.submit}</p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600">Create a new product listing for your store</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= step.number
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{step.number}</span>
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    currentStep > step.number ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="card">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Back
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="btn-primary"
              >
                Next
                <ChevronRightIcon className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Publishing...' : 'Publish Product'}
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 flex items-start text-sm text-gray-500">
          <InformationCircleIcon className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
          <p>
            All fields marked with * are required. You can save as draft or publish immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;