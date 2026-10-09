import React, { useState } from 'react';
import { ShoppingCart, PhoneCall, Bot, ShieldCheck, Search, Menu, X, FileSpreadsheet, MapPin } from 'lucide-react';
import { BADALGACHI_HOTLINE, BADALGACHI_UNIONS } from '../data/unions';
import { SiteSettings } from '../types';

interface NavbarProps {
  cartItemsCount: number;
  onOpenCart: () => void;
  onOpenCropDoctor: () => void;
  onOpenAdmin: () => void;
  onOpenSheetGuide: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedUnionFilter: string;
  onSelectUnionFilter: (unionId: string) => void;
  onNavigateHome: () => void;
  onNavigateAdvice: () => void;
  onNavigateAbout: () => void;
  siteSettings?: SiteSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartItemsCount,
  onOpenCart,
  onOpenCropDoctor,
  onOpenAdmin,
  onOpenSheetGuide,
  searchQuery,
  onSearchChange,
  selectedUnionFilter,
  onSelectUnionFilter,
  onNavigateHome,
  onNavigateAdvice,
  onNavigateAbout,
  siteSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentHotline = siteSettings?.hotline || BADALGACHI_HOTLINE;
  const currentNotice = siteSettings?.announcementNotice || 'উপজেলার ৮টি ইউনিয়নের সব গ্রামে দ্রুত ক্যাশ অন হোম ডেলিভারি!';
  const showNotice = siteSettings?.noticeEnabled !== false;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
      {/* Top Notification Announcement Bar */}
      {showNotice && (
        <div className="bg-emerald-900 text-emerald-50 text-xs sm:text-sm py-1.5 px-3 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-emerald-950">
                বদলগাছী স্পেশাল
              </span>
              <span className="font-medium">
                {currentNotice}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium ml-auto">
              <a
                href={`tel:${currentHotline}`}
                className="flex items-center gap-1.5 font-bold text-amber-300 hover:text-amber-200 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>হটলাইন: {currentHotline}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl font-bold tracking-tight">খাঁ</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold text-emerald-950 tracking-tight">
                  খান এন্টারপ্রাইজ
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  কৃষি সেবা
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                বদলগাছী, নওগাঁ • আসল কৃষি উপকরণ ও পরামর্শ
              </p>
            </div>
          </div>

          {/* Search Box - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="কীটনাশক, সার বা বীজের নাম দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 bg-stone-100/90 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-stone-800 placeholder-stone-400"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Free Advice / AI Crop Doctor Button */}
            <button
              id="btn-crop-doctor-nav"
              onClick={onOpenCropDoctor}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
            >
              <Bot className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>ফ্রী কৃষি পরামর্শ (AI)</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              id="btn-open-cart-header"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-emerald-700/20 active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">কার্ট</span>
              {cartItemsCount > 0 && (
                <span className="bg-amber-400 text-emerald-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100 border border-stone-200 cursor-pointer"
              aria-label="মেনু খুলুন"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2.5 lg:hidden">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="কীটনাশক, সার বা বীজের নাম খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 bg-stone-100 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-800 placeholder-stone-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Expandable Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pt-3 pb-2 border-t border-stone-200 mt-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onOpenCropDoctor();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-200"
              >
                <Bot className="w-4 h-4 text-emerald-600" />
                <span>ফ্রী কৃষি পরামর্শ</span>
              </button>

              <button
                onClick={() => {
                  onNavigateAbout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-stone-100 text-stone-800 font-medium text-xs border border-stone-200"
              >
                <ShieldCheck className="w-4 h-4 text-stone-600" />
                <span>আমাদের সম্পর্কে ও ডেলিভারি</span>
              </button>
            </div>

            <div className="pt-2">
              <p className="text-xs font-semibold text-stone-600 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                বদলগাছীর ৮টি ইউনিয়ন ফিল্টার:
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => {
                    onSelectUnionFilter('all');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium ${
                    selectedUnionFilter === 'all'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-stone-700 border-stone-300'
                  }`}
                >
                  সব ইউনিয়ন
                </button>
                {BADALGACHI_UNIONS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSelectUnionFilter(u.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium ${
                      selectedUnionFilter === u.id
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    {u.nameBn.split(' ')[2] || u.nameBn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
