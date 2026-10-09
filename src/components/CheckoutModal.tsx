import React, { useState } from 'react';
import { X, PhoneCall, CheckCircle, ShieldCheck, MapPin, Truck, AlertCircle, ShoppingBag, FileText } from 'lucide-react';
import { CartItem, CustomerOrderData, Order } from '../types';
import { BADALGACHI_UNIONS, BADALGACHI_HOTLINE } from '../data/unions';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderSuccess: (order: Order) => void;
  googleSheetUrl: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderSuccess,
  googleSheetUrl,
}) => {
  const [formData, setFormData] = useState<CustomerOrderData>({
    customerName: '',
    phone: '',
    alternatePhone: '',
    union: BADALGACHI_UNIONS[0].nameBn,
    ward: '১',
    villageAddress: '',
    note: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = 0; // Free delivery in Badalgachi
  const grandTotal = subtotal + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.customerName.trim()) {
      setErrorMessage('অনুগ্রহ করে কৃষকের পুরো নাম লিখুন।');
      return;
    }

    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      setErrorMessage('অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX, 018XXXXXXXX, 019XXXXXXXX)।');
      return;
    }

    if (!formData.villageAddress.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার গ্রাম বা বিস্তারিত ঠিকানা লিখুন।');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('আপনার কার্ট খালি! অনুগ্রহ করে প্রথমে পণ্য যোগ করুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = 'KE-' + Math.floor(100000 + Math.random() * 900000);
      const createdAt = new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' });

      const payload = {
        orderNumber,
        createdAt,
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        alternatePhone: formData.alternatePhone?.trim() || '',
        union: formData.union,
        ward: formData.ward,
        villageAddress: formData.villageAddress.trim(),
        note: formData.note?.trim() || '',
        items: cartItems.map(item => ({
          productId: item.product.id,
          nameBn: item.product.nameBn,
          packSize: item.product.packSize,
          price: item.product.price,
          quantity: item.quantity,
          total: item.product.price * item.quantity,
        })),
        subtotal,
        deliveryFee,
        grandTotal,
        paymentMethod: 'cash_on_delivery',
        webhookUrl: googleSheetUrl,
      };

      // 1. Submit to Backend API
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.order) {
        onOrderSuccess(data.order);
      } else {
        // Fallback simulated order if backend network interrupted
        const fallbackOrder: Order = {
          id: 'ord-' + Date.now(),
          orderNumber,
          createdAt,
          customerName: formData.customerName,
          phone: formData.phone,
          alternatePhone: formData.alternatePhone,
          union: formData.union,
          ward: formData.ward,
          villageAddress: formData.villageAddress,
          note: formData.note,
          items: payload.items,
          subtotal,
          deliveryFee,
          grandTotal,
          paymentMethod: 'cash_on_delivery',
          status: 'pending_call',
          syncStatus: 'local_only',
        };
        onOrderSuccess(fallbackOrder);
      }
    } catch (err: any) {
      console.error('Order submission error:', err);
      // Even if network fails, construct safe local order so farmer is never stuck
      const orderNumber = 'KE-' + Math.floor(100000 + Math.random() * 900000);
      const fallbackOrder: Order = {
        id: 'ord-' + Date.now(),
        orderNumber,
        createdAt: new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' }),
        customerName: formData.customerName,
        phone: formData.phone,
        alternatePhone: formData.alternatePhone,
        union: formData.union,
        ward: formData.ward,
        villageAddress: formData.villageAddress,
        note: formData.note,
        items: cartItems.map(item => ({
          productId: item.product.id,
          nameBn: item.product.nameBn,
          packSize: item.product.packSize,
          price: item.product.price,
          quantity: item.quantity,
          total: item.product.price * item.quantity,
        })),
        subtotal,
        deliveryFee,
        grandTotal,
        paymentMethod: 'cash_on_delivery',
        status: 'pending_call',
        syncStatus: 'local_only',
      };
      onOrderSuccess(fallbackOrder);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">হোম ডেলিভারি অর্ডার ফরম</h2>
              <p className="text-xs text-emerald-200">
                বদলগাছী উপজেলার ৮টি ইউনিয়নে ক্যাশ অন ডেলিভারি
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-700/80 text-emerald-100 transition-colors cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Notice banner for farmer */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <PhoneCall className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>গুরুত্বপূর্ণ তথ্য:</strong> কোনো অনলাইন পেমেন্ট করতে হবে না। ফরম পূরণ করার পর খান এন্টারপ্রাইজ কর্তৃপক্ষ আপনাকে ফোন করে অর্ডারটি কনফার্ম করবে এবং পণ্য আপনার ঠিকানায় পৌঁছে দিয়ে টাকা গ্রহণ করবে।
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Customer Input Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                কৃষকের পুরো নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                placeholder="যেমন: মো: রফিকুল ইসলাম"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-stone-900 bg-stone-50/50"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                মোবাইল নম্বর (কনফার্মেশন কলের জন্য) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="যেমন: 017XXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-stone-900 bg-stone-50/50"
              />
            </div>

            {/* Alternate Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                বিকল্প মোবাইল নম্বর (ঐচ্ছিক)
              </label>
              <input
                type="tel"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleInputChange}
                placeholder="জরুরি যোগাযোগের জন্য আরেকটি নম্বর"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 bg-stone-50/50"
              />
            </div>

            {/* Union Selector (8 Unions of Badalgachi) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ইউনিয়ন (বদলগাছী উপজেলা) <span className="text-rose-500">*</span>
              </label>
              <select
                name="union"
                value={formData.union}
                onChange={handleInputChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 bg-stone-50/50 font-medium"
              >
                {BADALGACHI_UNIONS.map((u) => (
                  <option key={u.id} value={u.nameBn}>
                    {u.nameBn}
                  </option>
                ))}
              </select>
            </div>

            {/* Ward Selector (1 to 9) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ওয়ার্ড নম্বর <span className="text-rose-500">*</span>
              </label>
              <select
                name="ward"
                value={formData.ward}
                onChange={handleInputChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 bg-stone-50/50 font-medium"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((w) => (
                  <option key={w} value={w.toString()}>
                    {w} নং ওয়ার্ড
                  </option>
                ))}
              </select>
            </div>

            {/* Detailed Address / Village */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                গ্রাম ও সুনির্দিষ্ট ঠিকানা <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="villageAddress"
                value={formData.villageAddress}
                onChange={handleInputChange}
                required
                placeholder="যেমন: পাকুড়িয়া গ্রাম, পূর্ব পাড়া জামে মসজিদের পাশে"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 bg-stone-50/50"
              />
            </div>
          </div>

          {/* Optional Order Note */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              বিশেষ নির্দেশনা / ডেলিভারির সময় (ঐচ্ছিক)
            </label>
            <textarea
              name="note"
              rows={2}
              value={formData.note}
              onChange={handleInputChange}
              placeholder="যেমন: বিকেলে ডেলিভারি দিলে ভালো হয় / অমুক দোকানের সামনে"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 bg-stone-50/50"
            />
          </div>

          {/* Order Items Summary Box */}
          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2">
            <h4 className="font-bold text-xs text-stone-700 flex items-center justify-between">
              <span>পণ্যের বিবরণ ({cartItems.length} টি আইটেম):</span>
              <span className="text-emerald-800">ক্যাশ অন ডেলিভারি</span>
            </h4>
            
            <div className="max-h-32 overflow-y-auto divide-y divide-stone-200/60 text-xs">
              {cartItems.map((item) => (
                <div key={item.product.id} className="py-1.5 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="font-medium text-stone-800">{item.product.nameBn}</span>
                    <span className="text-[11px] text-stone-500 ml-1">({item.product.packSize} x {item.quantity})</span>
                  </div>
                  <span className="font-bold text-stone-900 shrink-0">
                    ৳{(item.product.price * item.quantity).toLocaleString('bn-BD')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-sm sm:text-base font-extrabold text-stone-900">
              <span>সর্বমোট প্রদেয় টাকা:</span>
              <span className="text-emerald-800">৳{grandTotal.toLocaleString('bn-BD')}</span>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              id="btn-confirm-order-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-base shadow-lg shadow-emerald-800/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>অর্ডার জমা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-amber-300" />
                  <span>অর্ডারটি নিশ্চিত করুন (Cash on Delivery)</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-center text-stone-400">
            খান এন্টারপ্রাইজ • বদলগাছী থানা রোড, বদলগাছী বাজার, নওগাঁ • হেল্পলাইন: {BADALGACHI_HOTLINE}
          </p>

        </form>

      </div>
    </div>
  );
};
