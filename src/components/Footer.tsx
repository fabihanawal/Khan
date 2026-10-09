import React from 'react';
import { PhoneCall, MapPin, MessageSquare, ShieldCheck, Truck, Bot, FileSpreadsheet, Lock, Sprout } from 'lucide-react';
import { BADALGACHI_HOTLINE, BADALGACHI_WHATSAPP, SHOP_LOCATION_BN, BADALGACHI_UNIONS } from '../data/unions';
import { ProductCategory, SiteSettings } from '../types';

interface FooterProps {
  onSelectCategory: (cat: ProductCategory) => void;
  onOpenCropDoctor: () => void;
  onOpenSheetGuide: () => void;
  onOpenAdmin: () => void;
  onScrollToTop: () => void;
  siteSettings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenCropDoctor,
  onOpenSheetGuide,
  onOpenAdmin,
  onScrollToTop,
  siteSettings,
}) => {
  const currentHotline = siteSettings?.hotline || BADALGACHI_HOTLINE;
  const currentAddress = siteSettings?.shopAddress || SHOP_LOCATION_BN;
  const currentWhatsApp = siteSettings?.whatsapp || BADALGACHI_WHATSAPP;
  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top 4 Trust Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-8 border-b border-stone-800 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">১০০% খাঁটি ও ব্র্যান্ডেড</h4>
              <p className="text-stone-400 mt-0.5 leading-relaxed">
                সিনজেনটা, বায়ার, এসিআই, বিএডিসি অনুমোদিত আসল কৃষি উপকরণ।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/40">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">বদলগাছীতে হোম ডেলিভারি</h4>
              <p className="text-stone-400 mt-0.5 leading-relaxed">
                উপজেলার ৮টি ইউনিয়নের প্রতিটি ওয়ার্ড ও গ্রামে নিজস্ব ডেলিভারি।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/40">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">ক্যাশ অন ডেলিভারি</h4>
              <p className="text-stone-400 mt-0.5 leading-relaxed">
                কোনো অগ্রিম পেমেন্ট নেই—পণ্য হাতে পেয়ে যাচাই করে টাকা দিন।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/40">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">ফ্রী কৃষি পরামর্শ</h4>
              <p className="text-stone-400 mt-0.5 leading-relaxed">
                ফসলের যে কোনো রোগবালাইয়ে এআই ডাক্তার ও অভিজ্ঞ কৃষিবিদের সেবা।
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
          
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-lg">
                খা
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-none">খান ইনটারপ্রাইজ</h3>
                <p className="text-[11px] text-emerald-400 mt-0.5">বদলগাছী উপজেলা, নওগাঁ</p>
              </div>
            </div>

            <p className="text-stone-400 leading-relaxed max-w-sm">
              বদলগাছীর প্রান্তিক কৃষক ভাইদের নির্ভরযোগ্য কৃষি পার্টনার। কীটনাশক, হাইব্রিড বীজ, রাসায়নিক ও জৈব সার সরাসরি সঠিক দামে হোম ডেলিভারি দিয়ে কৃষকের শ্রম ও খরচ বাঁচানোই আমাদের লক্ষ্য।
            </p>

            <div className="space-y-1.5 text-stone-300">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{currentAddress}</span>
              </p>
              <p className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>হটলাইন: <a href={`tel:${currentHotline}`} className="text-amber-400 hover:underline font-bold">{currentHotline}</a></span>
              </p>
              <p className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>হোয়াটসঅ্যাপ: <a href={`https://wa.me/88${currentWhatsApp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">{currentWhatsApp}</a></span>
              </p>
            </div>
          </div>

          {/* Categories Quick Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-white text-sm">কৃষি পণ্য ক্যাটাগরি</h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button onClick={() => onSelectCategory('pesticide')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  কীটনাশক ও ছত্রাকনাশক
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('fertilizer')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  সার ও অণুখাদ্য
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('seed')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  উন্নত জাতের হাইব্রিড বীজ
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('organic')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  খাঁটি জৈব সার ও ভার্মিকম্পোস্ট
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('equipment')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  স্প্রে মেশিন ও কৃষি যন্ত্রপাতি
                </button>
              </li>
            </ul>
          </div>

          {/* Badalgachi Unions Covered (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-bold text-white text-sm">বদলগাছীর ৮টি ইউনিয়ন কভারেজ</h4>
            <div className="grid grid-cols-2 gap-1.5 text-stone-400 text-[11px]">
              {BADALGACHI_UNIONS.map(u => (
                <span key={u.id} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {u.nameBn}
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-800 flex flex-wrap gap-2">
              <button
                onClick={onOpenCropDoctor}
                className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span>AI শস্য ডাক্তার</span>
              </button>

              <button
                onClick={onOpenSheetGuide}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>গুগল শীট গাইড</span>
              </button>

              <button
                onClick={onOpenAdmin}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>অর্ডার ড্যাশবোর্ড</span>
              </button>
            </div>
          </div>

        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-6 border-t border-stone-800 text-center text-[11px] text-stone-500 space-y-1">
          <p>© {new Date().getFullYear()} খান ইনটারপ্রাইজ (Khan Enterprise) • সর্বস্বত্ব সংরক্ষিত।</p>
          <p>বদলগাছী উপজেলা কৃষি সম্প্রসারণ অধিদপ্তর অনুমোদিত ডিলার ও খুচরা বিক্রেতা।</p>
        </div>

      </div>
    </footer>
  );
};
