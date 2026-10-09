import React from 'react';
import { Truck, ShieldCheck, PhoneCall, Bot, CheckCircle2, MapPin, Sparkles, Sprout } from 'lucide-react';
import { BADALGACHI_HOTLINE } from '../data/unions';

interface HeroBannerProps {
  onScrollToProducts: () => void;
  onOpenCropDoctor: () => void;
  onSelectCategory: (cat: any) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onScrollToProducts,
  onOpenCropDoctor,
  onSelectCategory,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-950 to-stone-900 text-white pt-6 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-800/40">
      {/* Subtle Background Pattern Accent */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Hero Content - 7 cols */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            
            {/* Top Local Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-700/60 text-emerald-200 text-xs sm:text-sm font-medium shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>বদলগাছী উপজেলা, নওগাঁ স্পেশাল সেবা</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.25] sm:leading-[1.2]">
              সঠিক মূল্যে <span className="text-amber-400 underline decoration-emerald-500 decoration-wavy decoration-2">আসল কৃষি পণ্য</span>, সরাসরি আপনার দোরগোড়ায় হোম ডেলিভারি!
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base lg:text-lg text-emerald-100/90 leading-relaxed max-w-2xl">
              বদলগাছীর ৮টি ইউনিয়নের প্রতিটি ওয়ার্ডের কৃষকদের জন্য খাঁটি কীটনাশক, সার, বীজ ও কৃষি যন্ত্রপাতি অর্ডার করার বিশ্বস্ত প্ল্যাটফর্ম। কোনো অগ্রিম টাকা লাগবে না—পণ্য বুঝে পেয়ে মূল্য পরিশোধ করুন।
            </p>

            {/* 4 Value Propositions Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-100 bg-emerald-900/50 p-2 rounded-xl border border-emerald-800/40">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>১০০% খাঁটি ও মেয়াদী পণ্য</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-100 bg-emerald-900/50 p-2 rounded-xl border border-emerald-800/40">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>২৪ ঘণ্টায় হোম ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-100 bg-emerald-900/50 p-2 rounded-xl border border-emerald-800/40">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ফোনে নিশ্চিত করে পাঠানো</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-100 bg-emerald-900/50 p-2 rounded-xl border border-emerald-800/40">
                <Bot className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ফ্রী কৃষি পরামর্শ ও সমাধান</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="btn-hero-browse-products"
                onClick={onScrollToProducts}
                className="px-5 sm:px-7 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-400/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sprout className="w-5 h-5 text-emerald-900" />
                <span>পণ্য দেখুন ও অর্ডার করুন</span>
              </button>

              <button
                id="btn-hero-crop-doctor"
                onClick={onOpenCropDoctor}
                className="px-4 sm:px-6 py-3 rounded-xl bg-emerald-800/90 hover:bg-emerald-800 text-white font-semibold text-sm sm:text-base border border-emerald-600/60 shadow-sm active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Bot className="w-5 h-5 text-emerald-300 animate-bounce" />
                <span>ফসল ডাক্তারের ফ্রী পরামর্শ</span>
              </button>
            </div>
          </div>

          {/* Quick Order Hotline Card & Local Delivery Hub - 5 cols */}
          <div className="lg:col-span-5 space-y-4">
            {/* Phone Order Card */}
            <div className="bg-stone-900/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-emerald-700/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    সরাসরি কল সেন্টার
                  </span>
                </div>
                <span className="text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded text-emerald-300 border border-emerald-800">
                  সকাল ৮টা - রাত ১০টা
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                  ফোনে কথা বলে সহজেই অর্ডার দিন
                </h3>
                <p className="text-xs text-stone-300">
                  ওয়েবসাইটে অর্ডার করতে অসুবিধা হলে আমাদের নাম্বারে সরাসরি কল করুন, আমরাই ঠিকানা ও পণ্যের তালিকা লিখে নিব।
                </p>
              </div>

              <a
                href={`tel:${BADALGACHI_HOTLINE}`}
                className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-base sm:text-lg shadow-md active:scale-98 transition-all"
              >
                <PhoneCall className="w-5 h-5 animate-pulse" />
                <span>কল করুন: {BADALGACHI_HOTLINE}</span>
              </a>

              {/* Badalgachi Quick Info */}
              <div className="pt-2 border-t border-stone-800/80 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-stone-800/50">
                  <span className="text-stone-400 block text-[11px]">ডেলিভারি এলাকা</span>
                  <span className="font-semibold text-emerald-300">৮টি ইউনিয়ন (বদলগাছী)</span>
                </div>
                <div className="p-2 rounded-lg bg-stone-800/50">
                  <span className="text-stone-400 block text-[11px]">পেমেন্ট মাধ্যম</span>
                  <span className="font-semibold text-amber-300">ক্যাশ অন ডেলিভারি</span>
                </div>
              </div>
            </div>

            {/* Fast Category Quick Jumps */}
            <div className="bg-emerald-900/40 rounded-xl p-3 border border-emerald-800/30 flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                জরুরি প্রয়োজন?
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    onSelectCategory('pesticide');
                    onScrollToProducts();
                  }}
                  className="px-2 py-1 bg-emerald-800/80 hover:bg-emerald-700 rounded text-emerald-100 font-medium transition-colors cursor-pointer"
                >
                  কীটনাশক
                </button>
                <button
                  onClick={() => {
                    onSelectCategory('fertilizer');
                    onScrollToProducts();
                  }}
                  className="px-2 py-1 bg-emerald-800/80 hover:bg-emerald-700 rounded text-emerald-100 font-medium transition-colors cursor-pointer"
                >
                  সার
                </button>
                <button
                  onClick={() => {
                    onSelectCategory('seed');
                    onScrollToProducts();
                  }}
                  className="px-2 py-1 bg-emerald-800/80 hover:bg-emerald-700 rounded text-emerald-100 font-medium transition-colors cursor-pointer"
                >
                  বীজ
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
