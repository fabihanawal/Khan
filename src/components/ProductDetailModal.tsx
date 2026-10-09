import React, { useState } from 'react';
import { X, ShoppingCart, Zap, Star, ShieldCheck, AlertCircle, CheckCircle, Truck, PhoneCall, Droplet } from 'lucide-react';
import { Product } from '../types';
import { BADALGACHI_HOTLINE } from '../data/unions';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4">
        
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-stone-100/90 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          
          {/* Left Column: Image & Badges (5 cols) */}
          <div className="md:col-span-5 bg-stone-100 p-6 flex flex-col justify-between items-center text-center">
            <div className="w-full relative aspect-square rounded-2xl overflow-hidden bg-white shadow-xs border border-stone-200/80 mb-4">
              <img
                src={product.image}
                alt={product.nameBn}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-stone-900/90 text-white">
                  {product.brand}
                </span>
                {product.badge && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-400 text-emerald-950">
                    {product.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Guarantees */}
            <div className="w-full space-y-2 text-left bg-white p-3.5 rounded-xl border border-stone-200 text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">১০০% আসল ও মেয়াদোত্তীর্ণ নয়</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>বদলগাছীর ৮টি ইউনিয়নে হোম ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>অর্ডারের পর ফোন কলে কনফার্মেশন</span>
              </div>
            </div>
          </div>

          {/* Right Column: Full Details & Order Box (7 cols) */}
          <div className="md:col-span-7 p-6 space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold mb-1">
                <span>{product.categoryBn}</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-stone-800">{product.rating}</span>
                  <span className="text-stone-400">({product.reviewsCount} জন কৃষক মতামত দিয়েছেন)</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
                {product.nameBn}
              </h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {product.nameEn} • প্যাক সাইজ: <span className="font-bold text-emerald-800">{product.packSize}</span>
              </p>
            </div>

            {/* Price Box */}
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900">
                    ৳{(product.price * quantity).toLocaleString('bn-BD')}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-stone-400 line-through">
                      ৳{(product.originalPrice * quantity).toLocaleString('bn-BD')}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-800 font-medium">
                  প্যাক প্রতি মূল্য: ৳{product.price.toLocaleString('bn-BD')} (ক্যাশ অন ডেলিভারি)
                </p>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center border border-emerald-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                <button
                  onClick={handleDecrement}
                  className="px-3 py-1.5 text-stone-600 hover:bg-emerald-50 font-bold text-base transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 font-bold text-sm text-stone-900">
                  {quantity.toLocaleString('bn-BD')}
                </span>
                <button
                  onClick={handleIncrement}
                  className="px-3 py-1.5 text-stone-600 hover:bg-emerald-50 font-bold text-base transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                পণ্যের বিবরণ
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                {product.fullDescBn}
              </p>
            </div>

            {/* Usage Guide / Dosage */}
            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs sm:text-sm">
                <Droplet className="w-4 h-4 text-amber-600" />
                <span>প্রয়োগ মাত্রা ও স্প্রে করার নিয়ম:</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">
                {product.usageGuideBn}
              </p>
            </div>

            {/* Chemical & Target pests */}
            {product.chemicalComposition && (
              <div className="text-xs text-stone-600 space-y-1 border-t border-stone-100 pt-3">
                <p><strong className="text-stone-800">রাসায়নিক উপাদান:</strong> {product.chemicalComposition}</p>
                <p><strong className="text-stone-800">কার্যকরী ফসল/বালাই:</strong> {product.targetPestsOrCrops.join(', ')}</p>
              </div>
            )}

            {/* Safety Warning */}
            <div className="flex items-start gap-2 text-xs text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>সতর্কতা:</strong> {product.safetyWarningsBn}</span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
                className="py-3 px-4 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>কার্টে যোগ করুন</span>
              </button>

              <button
                onClick={() => {
                  onBuyNow(product, quantity);
                  onClose();
                }}
                className="py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-800/20 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>সরাসরি অর্ডার করুন</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
