import React from 'react';
import { ShoppingCart, Zap, Star, ShieldCheck, Info } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onBuyNow,
  onViewDetails,
}) => {
  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
    >
      {/* Product Image and Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onViewDetails(product)}>
        <img
          src={product.image}
          alt={product.nameBn}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Brand & Category Pill */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-white">
            {product.brand}
          </span>
          {product.badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-emerald-950 shadow-xs">
              {product.badge}
            </span>
          )}
        </div>

        {/* Pack Size Pill */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-800/90 text-white shadow-xs">
            {product.packSize}
          </span>
        </div>
      </div>

      {/* Product Information Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Category text & rating */}
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="text-emerald-700 font-semibold">{product.categoryBn}</span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-stone-700 text-[11px]">{product.rating}</span>
              <span className="text-stone-400 text-[10px]">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onViewDetails(product)}
            className="font-bold text-stone-900 text-base leading-snug group-hover:text-emerald-800 transition-colors cursor-pointer line-clamp-2"
            title={product.nameBn}
          >
            {product.nameBn}
          </h3>

          {/* Short description */}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {product.shortDescBn}
          </p>

          {/* Target crop tags */}
          {product.targetPestsOrCrops && product.targetPestsOrCrops.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {product.targetPestsOrCrops.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-medium border border-emerald-100"
                >
                  {tag}
                </span>
              ))}
              {product.targetPestsOrCrops.length > 2 && (
                <span className="text-[10px] text-stone-400 self-center">
                  +{product.targetPestsOrCrops.length - 2}টি
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-2 border-t border-stone-100 space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-emerald-800">
                ৳{product.price.toLocaleString('bn-BD')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-stone-400 line-through">
                  ৳{product.originalPrice.toLocaleString('bn-BD')}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              আসল পণ্য
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id={`btn-add-cart-${product.id}`}
              onClick={() => onAddToCart(product)}
              className="py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-700" />
              <span>কার্টে নিন</span>
            </button>

            <button
              id={`btn-buy-now-${product.id}`}
              onClick={() => onBuyNow(product)}
              className="py-2.5 px-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>এখনই কিনুন</span>
            </button>
          </div>

          <button
            onClick={() => onViewDetails(product)}
            className="w-full text-center text-xs text-stone-500 hover:text-emerald-700 font-medium flex items-center justify-center gap-1 pt-0.5 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>প্রয়োগ মাত্রা ও বিস্তারিত দেখুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
