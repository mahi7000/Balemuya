import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  DevicePhoneMobileIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(10, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  paymentMethod: z.enum(['card', 'mobile', 'bank', 'cod']),
  deliveryOption: z.enum(['standard', 'express', 'pickup'])
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const CheckoutPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'card',
      deliveryOption: 'standard'
    }
  });

  const paymentMethod = watch('paymentMethod');

  const orderItems = [
    {
      id: '1',
      name: 'Handwoven Traditional Basket',
      seller: 'Aster T.',
      price: 2500,
      quantity: 1,
      image: '🧺'
    },
    {
      id: '2',
      name: 'Ethiopian Coffee Beans',
      seller: 'Hirut M.',
      price: 1800,
      quantity: 2,
      image: '☕'
    }
  ];

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 500;
  const tax = subtotal * 0.15;
  const total = subtotal + shipping + tax;

  const onSubmit = async (data: CheckoutForm) => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    // Redirect to success page
  };

  const steps = [
    { id: 1, name: 'Delivery Address', description: 'Where should we deliver?' },
    { id: 2, name: 'Payment Method', description: 'How would you like to pay?' },
    { id: 3, name: 'Review Order', description: 'Confirm your order' }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= step.id 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {step.id}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-primary-600' : 'text-neutral-600'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-neutral-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-primary-500' : 'bg-neutral-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">Delivery Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      First Name *
                    </label>
                    <input
                      {...register('firstName')}
                      className="input-field"
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      {...register('lastName')}
                      className="input-field"
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Email *
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="input-field"
                      placeholder="Enter email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Phone *
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="input-field"
                      placeholder="+251 9XX XXX XXX"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      {...register('address')}
                      rows={3}
                      className="input-field"
                      placeholder="Enter full address"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      City *
                    </label>
                    <input
                      {...register('city')}
                      className="input-field"
                      placeholder="Enter city"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      State *
                    </label>
                    <input
                      {...register('state')}
                      className="input-field"
                      placeholder="Enter state"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      {...register('postalCode')}
                      className="input-field"
                      placeholder="Enter postal code"
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                    )}
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Delivery Option
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                      <input
                        {...register('deliveryOption')}
                        type="radio"
                        value="standard"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <TruckIcon className="h-5 w-5 text-neutral-500 mr-2" />
                          <span className="font-medium">Standard Delivery</span>
                        </div>
                        <p className="text-sm text-neutral-600">5-7 business days - ₦500</p>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                      <input
                        {...register('deliveryOption')}
                        type="radio"
                        value="express"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <TruckIcon className="h-5 w-5 text-neutral-500 mr-2" />
                          <span className="font-medium">Express Delivery</span>
                        </div>
                        <p className="text-sm text-neutral-600">2-3 business days - ₦1,000</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">Payment Method</h2>
                <div className="space-y-4">
                  <label className="flex items-center p-4 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="card"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                    />
                    <div className="ml-3 flex items-center">
                      <CreditCardIcon className="h-6 w-6 text-neutral-500 mr-3" />
                      <div>
                        <span className="font-medium">Credit/Debit Card</span>
                        <p className="text-sm text-neutral-600">Visa, Mastercard, American Express</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="mobile"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                    />
                    <div className="ml-3 flex items-center">
                      <DevicePhoneMobileIcon className="h-6 w-6 text-neutral-500 mr-3" />
                      <div>
                        <span className="font-medium">Mobile Money</span>
                        <p className="text-sm text-neutral-600">Chapa, CBE Birr, Telebirr</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="bank"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                    />
                    <div className="ml-3 flex items-center">
                      <BanknotesIcon className="h-6 w-6 text-neutral-500 mr-3" />
                      <div>
                        <span className="font-medium">Bank Transfer</span>
                        <p className="text-sm text-neutral-600">Direct bank transfer</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="cod"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                    />
                    <div className="ml-3 flex items-center">
                      <BanknotesIcon className="h-6 w-6 text-neutral-500 mr-3" />
                      <div>
                        <span className="font-medium">Cash on Delivery</span>
                        <p className="text-sm text-neutral-600">Pay when your order arrives</p>
                      </div>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'card' && (
                  <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                    <h3 className="font-medium text-neutral-900 mb-4">Card Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">Review Your Order</h2>
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-neutral-200 rounded-lg">
                      <div className="text-2xl">{item.image}</div>
                      <div className="flex-1">
                        <h3 className="font-medium text-neutral-900">{item.name}</h3>
                        <p className="text-sm text-neutral-600">by {item.seller}</p>
                        <p className="text-sm text-neutral-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neutral-900">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
              )}
              {currentStep < 3 && (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next
                </Button>
              )}
              {currentStep === 3 && (
                <Button
                  type="submit"
                  loading={isProcessing}
                >
                  {isProcessing ? 'Processing Payment...' : 'Complete Order'}
                </Button>
              )}
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
                  <span className="font-medium">₦{shipping.toLocaleString()}</span>
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

              <div className="flex items-center text-sm text-neutral-600 mb-4">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
