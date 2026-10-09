import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types';
import { BADALGACHI_HOTLINE } from '../data/unions';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onClearCart,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = 0; // Free delivery for Badalgachi upazila promotions!
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs flex justify-end">
      {/* Click outside backdrop */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">আপনার শপিং কার্ট</h2>
              <p className="text-xs text-stone-500">
                {cartItems.length > 0 ? `${cartItems.length} টি পণ্য নির্বাচিত` : 'কার্ট খালি আছে'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 rounded cursor-pointer"
                title="কার্ট খালি করুন"
              >
                মুছুন
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 cursor-pointer"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Delivery Banner for Badalgachi */}
        <div className="bg-emerald-800 text-white px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>বদলগাছীর ৮টি ইউনিয়নে <strong>ফ্রী হোম ডেলিভারি</strong></span>
          </div>
          <span className="bg-emerald-950 text-amber-300 font-bold px-1.5 py-0.5 rounded text-[10px]">
            ক্যাশ অন ডেলিভারি
          </span>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-stone-500">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-stone-700 text-base">আপনার কার্টে কোনো পণ্য নেই</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  প্রয়োজনীয় কীটনাশক, সার বা বীজ কার্টে যোগ করে সহজেই অর্ডার করুন।
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold text-xs cursor-pointer shadow-sm"
              >
                পণ্য ব্রাউজ করুন
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.product.id}
                className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center gap-3 relative group"
              >
                <img
                  src={item.product.image}
                  alt={item.product.nameBn}
                  className="w-16 h-16 object-cover rounded-xl bg-white border border-stone-200 shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                    {item.product.packSize}
                  </span>
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate mt-0.5" title={item.product.nameBn}>
                    {item.product.nameBn}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-bold text-emerald-900">
                      ৳{(item.product.price * item.quantity).toLocaleString('bn-BD')}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      (৳{item.product.price} x {item.quantity})
                    </span>
                  </div>

                  {/* Quantity adjustment buttons */}
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-200/60">
                    <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 cursor-pointer"
                        title="কমান"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-stone-800">
                        {item.quantity.toLocaleString('bn-BD')}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 cursor-pointer"
                        title="বাড়ান"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      title="আইটেমটি মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 space-y-3">
            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>পণ্যের মোট মূল্য:</span>
                <span className="font-semibold text-stone-900">৳{subtotal.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span>হোম ডেলিভারি চার্জ (বদলগাছী):</span>
                <span className="font-bold text-emerald-700">ফ্রী (৳০)</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-extrabold text-stone-900 pt-1.5 border-t border-stone-200">
                <span>সর্বমোট প্রদেয় মূল্য:</span>
                <span className="text-emerald-800">৳{grandTotal.toLocaleString('bn-BD')}</span>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>পণ্য হাতে পেয়ে মূল্য দিন। অর্ডার কনফার্ম করতে আপনাকে ফোন করা হবে।</span>
            </div>

            {/* Checkout Button */}
            <button
              id="btn-proceed-to-checkout"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-98 transition-all cursor-pointer"
            >
              <span>অর্ডারের তথ্য পূরণ করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Phone Help Link */}
            <p className="text-[11px] text-center text-stone-500">
              অর্ডারে সমস্যা হলে কল করুন: <a href={`tel:${BADALGACHI_HOTLINE}`} className="font-bold text-emerald-800 hover:underline">{BADALGACHI_HOTLINE}</a>
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
