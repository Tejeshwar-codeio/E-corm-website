import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck, MapPin, Loader2, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import useToastStore from '../store/useToastStore';
import api from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, getCartTotals, shippingAddress, saveShippingAddress, paymentMethod, savePaymentMethod, clearCart } = useCartStore();
  const { addToast } = useToastStore();

  const [loading, setLoading] = useState(false);
  
  // Address form fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [phone, setPhone] = useState('');
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState('');

  const { itemsPrice, discount, shippingPrice, taxPrice, totalPrice } = getCartTotals();

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // Load user saved address if available
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedSavedAddressId(defaultAddr._id);
      populateAddressFields(defaultAddr);
    }
  }, [user]);

  const populateAddressFields = (addr) => {
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country);
    setPhone(addr.phone);
  };

  const handleSavedAddressChange = (e) => {
    const addrId = e.target.value;
    setSelectedSavedAddressId(addrId);
    if (addrId === 'new') {
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
      setPhone('');
    } else {
      const addr = user.addresses.find(a => a._id === addrId);
      if (addr) populateAddressFields(addr);
    }
  };

  // Dynamically load Razorpay SDK Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !postalCode || !phone) {
      addToast('Please complete all shipping address fields', 'error');
      return;
    }

    if (!user) {
      addToast('Please register or login to complete checkout', 'error');
      navigate('/auth?redirect=checkout');
      return;
    }

    setLoading(true);

    const addressPayload = { street, city, state, postalCode, country, phone };
    saveShippingAddress(addressPayload);

    try {
      // 1. Create order on the backend
      const orderPayload = {
        orderItems: cart.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          image: item.product.images[0]?.url,
          price: item.product.discountPrice || item.product.price,
          size: item.size,
          color: item.color,
          product: item.product._id
        })),
        shippingAddress: addressPayload,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
      };

      const { data: order } = await api.post('/api/orders', orderPayload);

      // 2. Handle specific payment integration routines
      if (paymentMethod === 'Stripe') {
        const { data: session } = await api.post(`/api/orders/${order._id}/stripe-session`, {
          successUrl: `${window.location.origin}/dashboard?orderPaid=true`,
          cancelUrl: `${window.location.origin}/checkout`
        });
        
        // Redirect client to Stripe Checkout page
        window.location.href = session.url;
      } else if (paymentMethod === 'Razorpay') {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          addToast('Razorpay SDK failed to load. Please verify your connection.', 'error');
          setLoading(false);
          return;
        }

        const { data: rzpOrder } = await api.post(`/api/orders/${order._id}/razorpay-order`);

        // If mock configuration is active, process order immediately
        if (rzpOrder.isMock) {
          addToast('Stripe/Razorpay in simulation mode. Simulating successful checkout...', 'success');
          // Hit verification endpoint with mock data
          await api.post(`/api/orders/${order._id}/razorpay-verify`, {
            razorpay_payment_id: 'mock_pay_' + Math.random().toString(36).substr(2, 9),
            razorpay_order_id: rzpOrder.id
          });
          clearCart();
          navigate('/dashboard?orderPaid=true');
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'your_mock_key_id',
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: 'ShopSphere',
          description: 'Payment for order #' + order._id,
          order_id: rzpOrder.id,
          handler: async (response) => {
            try {
              const verifyPayload = {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              };
              await api.post(`/api/orders/${order._id}/razorpay-verify`, verifyPayload);
              addToast('Razorpay payment verified successfully!', 'success');
              clearCart();
              navigate('/dashboard?orderPaid=true');
            } catch (err) {
              addToast('Payment validation signature failed.', 'error');
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: phone
          },
          theme: {
            color: '#2563EB'
          }
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
        setLoading(false);
      } else {
        // Cash on Delivery
        addToast('Order placed successfully. Thank you for shopping!', 'success');
        clearCart();
        navigate('/dashboard');
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      if (paymentMethod !== 'Stripe') {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">Checkout Securely</h1>
        <p className="text-xs text-gray-400 mt-1">Specify delivery details and verify payment protocols</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Content */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Shipping Address Cards */}
          <div className="p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 space-y-6">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-500" /> Shipping Destination
            </h3>

            {/* Saved Address choice dropdown */}
            {user && user.addresses && user.addresses.length > 0 && (
              <div className="space-y-1.5 border-b border-gray-100 dark:border-gray-850 pb-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Choose Saved Address</label>
                <select
                  value={selectedSavedAddressId}
                  onChange={handleSavedAddressChange}
                  className="w-full px-4 py-2.5 text-xs bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none dark:text-white cursor-pointer"
                >
                  {user.addresses.map((addr) => (
                    <option key={addr._id} value={addr._id}>
                      {addr.street}, {addr.city}, {addr.state} ({addr.phone})
                    </option>
                  ))}
                  <option value="new">+ Key New Address</option>
                </select>
              </div>
            )}

            {/* Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Apartment, unit, suite, house number..."
                  className="w-full px-4 py-2.5 text-xs bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-primary-500 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-primary-500 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">State / Province</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-primary-500 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Postal / ZIP Code</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-primary-500 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Contact</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-primary-500 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Gateways Selections */}
          <div className="p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 space-y-6">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-secondary-500" /> Payment Protocol
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer text-center ${
                paymentMethod === 'Stripe'
                  ? 'border-primary-500 bg-primary-500/5 text-primary-600 dark:text-primary-400 font-bold'
                  : 'border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-350'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="Stripe"
                  checked={paymentMethod === 'Stripe'}
                  onChange={() => savePaymentMethod('Stripe')}
                  className="sr-only"
                />
                <span className="text-sm font-semibold">Stripe Secure Card</span>
                <span className="text-[9px] text-gray-400 uppercase">Worldwide Visa/MC</span>
              </label>

              <label className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer text-center ${
                paymentMethod === 'Razorpay'
                  ? 'border-primary-500 bg-primary-500/5 text-primary-600 dark:text-primary-400 font-bold'
                  : 'border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-355'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="Razorpay"
                  checked={paymentMethod === 'Razorpay'}
                  onChange={() => savePaymentMethod('Razorpay')}
                  className="sr-only"
                />
                <span className="text-sm font-semibold">Razorpay API</span>
                <span className="text-[9px] text-gray-400 uppercase">UPI / Net Banking</span>
              </label>

              <label className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer text-center ${
                paymentMethod === 'Cash'
                  ? 'border-primary-500 bg-primary-500/5 text-primary-600 dark:text-primary-400 font-bold'
                  : 'border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-355'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="Cash"
                  checked={paymentMethod === 'Cash'}
                  onChange={() => savePaymentMethod('Cash')}
                  className="sr-only"
                />
                <span className="text-sm font-semibold">Cash On Delivery</span>
                <span className="text-[9px] text-gray-400 uppercase">Pay at your doorstep</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right order summaries */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 space-y-6">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Order Details</h3>
            
            <div className="max-h-60 overflow-y-auto space-y-4 pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-xs">
                  <img src={item.product.images[0]?.url} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-200/50 dark:border-gray-800/50" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{item.product.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Qty {item.quantity} | {item.size || 'Standard'}</p>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3.5 text-xs text-gray-500 font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${itemsPrice.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Taxes</span>
                <span>${taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-4 text-sm font-extrabold text-gray-900 dark:text-white">
                <span>Grand Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Routing Checkout Gateway...
                </>
              ) : (
                <>
                  Verify & Pay
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2.5 justify-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure 256-bit SSL Checkout</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
