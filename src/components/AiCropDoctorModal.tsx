import React, { useState } from 'react';
import { X, Bot, Sparkles, Send, Droplet, ShieldCheck, AlertCircle, ShoppingCart, RefreshCw, PhoneCall } from 'lucide-react';
import { Product } from '../types';
import { BADALGACHI_HOTLINE } from '../data/unions';

interface AiCropDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  allProducts: Product[];
}

export const AiCropDoctorModal: React.FC<AiCropDoctorModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  allProducts,
}) => {
  const [selectedCrop, setSelectedCrop] = useState('ধান');
  const [selectedSymptom, setSelectedSymptom] = useState('পাতায় বাদামী দাগ ও ব্লাস্ট রোগ');
  const [customDetails, setCustomDetails] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [adviceResult, setAdviceResult] = useState<string | null>(null);
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);

  if (!isOpen) return null;

  const CROP_OPTIONS = [
    { name: 'ধান (আমন/বোরো)', value: 'ধান' },
    { name: 'আলু', value: 'আলু' },
    { name: 'সরিষা', value: 'সরিষা' },
    { name: 'ভুট্টা', value: 'ভুট্টা' },
    { name: 'বেগুন ও টমেটো', value: 'বেগুন ও টমেটো' },
    { name: 'মরিচ', value: 'মরিচ' },
    { name: 'লাউ, শসা ও করলা', value: 'সবজি' },
    { name: 'আম ও ফলদ বাগান', value: 'ফল বাগান' },
  ];

  const COMMON_SYMPTOMS = [
    'পাতায় বাদামী দাগ ও ব্লাস্ট রোগ',
    'পাতা হলুদ হয়ে শুকিয়ে যাওয়া বা খায়রা রোগ',
    'পাতার নিচে সাদা মাছি, জাবপোকা বা শোষক পোকা',
    'ধানের মাজরা পোকা বা ডগা মরে যাওয়া',
    'আলুর নাবি ধসা বা পাতা পচা',
    'বেগুনের ডগা ও ফল ছিদ্রকারী পোকা',
    'গাছ ঢলে পড়া বা গোড়া পচা রোগ',
    'ফুল ও ছোট ফল ঝরে যাওয়া',
  ];

  const handleGenerateAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAdviceResult(null);

    try {
      const res = await fetch('/api/gemini/crop-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: selectedCrop,
          symptoms: selectedSymptom,
          details: customDetails,
          farmerName: farmerName || 'বদলগাছীর কৃষক ভাই',
        }),
      });

      const data = await res.json();
      if (data.success && data.advice) {
        setAdviceResult(data.advice);

        // Find matched products in catalog
        const lowerAdvice = data.advice.toLowerCase();
        const found = allProducts.filter(p => {
          const matchName = lowerAdvice.includes(p.nameBn.split(' ')[0].toLowerCase());
          const matchTarget = p.targetPestsOrCrops.some(t => lowerAdvice.includes(t.toLowerCase()) || t.includes(selectedCrop));
          return matchName || matchTarget;
        });
        setMatchedProducts(found.slice(0, 3));
      } else {
        setAdviceResult('পরামর্শ সংগ্রহে সমস্যা হয়েছে। সরাসরি আমাদের হটলাইনে ফোন করুন: ' + BADALGACHI_HOTLINE);
      }
    } catch (err: any) {
      console.error('Crop doctor error:', err);
      setAdviceResult(`বদলগাছী আবহাওয়া অনুযায়ী ${selectedCrop} ফসলের ${selectedSymptom} সমস্যা নিয়ন্ত্রণে অবিলম্বে অনুমোদিত ছত্রাকনাশক (স্কোর ২৫০ ইসি) অথবা কীটনাশক (কনফিডোর) প্রতি লিটার পানিতে ০.৫ মিলি হারে স্প্রে করুন। অতিরিক্ত ইউরিয়া সার বন্ধ রাখুন।`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-emerald-950 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg">খান কৃষি বন্ধু (AI শস্য ডাক্তার)</h2>
                <span className="text-[10px] font-bold bg-emerald-700/80 px-2 py-0.5 rounded text-emerald-200">
                  বদলগাছী স্পেশাল
                </span>
              </div>
              <p className="text-xs text-emerald-300">
                তাৎক্ষণিক রোগ নির্ণয়, অনুমোদিত কীটনাশক প্রেসক্রিপশন ও সঠিক প্রয়োগ মাত্রা
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-800 text-emerald-200 transition-colors cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto space-y-6">
          
          <form onSubmit={handleGenerateAdvice} className="space-y-4">
            
            {/* Farmer Name & Crop Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  কৃষকের নাম (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder="আপনার নাম লিখুন..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ফসলের নাম নির্বাচন করুন <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 bg-stone-50/50 font-medium"
                >
                  {CROP_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Symptoms Pills */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                প্রধান লক্ষণ বা বালাই আক্রমণ নির্বাচন করুন <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SYMPTOMS.map((symptom) => {
                  const isSelected = selectedSymptom === symptom;
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => setSelectedSymptom(symptom)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs scale-[1.02]'
                          : 'bg-stone-50 hover:bg-emerald-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional details */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                অতিরিক্ত বিস্তারিত (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value)}
                placeholder="যেমন: কতদিন ধরে দেখা দিয়েছে / আগে কোনো সার দিয়েছিলেন কি না..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 bg-stone-50/50"
              />
            </div>

            {/* Submit Advice Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-800/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>কৃষি এআই প্রেসক্রিপশন তৈরি করছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>তাৎক্ষণিক সমাধান ও প্রেসক্রিপশন পান</span>
                </>
              )}
            </button>
          </form>

          {/* AI Response Display Box */}
          {adviceResult && (
            <div className="p-5 sm:p-6 bg-emerald-50/90 rounded-2xl border border-emerald-200 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                      খান কৃষি বন্ধু প্রেসক্রিপশন
                    </h3>
                    <p className="text-[11px] text-emerald-800">
                      ফসল: {selectedCrop} • লক্ষণ: {selectedSymptom}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded">
                  বিশেষজ্ঞ মতামত
                </span>
              </div>

              {/* Advice Text */}
              <div className="text-xs sm:text-sm text-stone-800 whitespace-pre-line leading-relaxed space-y-2">
                {adviceResult}
              </div>

              {/* Matched Products in Shop */}
              {matchedProducts.length > 0 && (
                <div className="pt-3 border-t border-emerald-200/80 space-y-2">
                  <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>প্রয়োজনীয় আসল ওষুধ খান এন্টারপ্রাইজে রেডি আছে:</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {matchedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white p-2.5 rounded-xl border border-emerald-200 flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                            {prod.packSize}
                          </span>
                          <h5 className="font-bold text-stone-900 text-xs truncate mt-0.5">
                            {prod.nameBn}
                          </h5>
                          <p className="text-xs font-extrabold text-emerald-900 mt-1">
                            ৳{prod.price.toLocaleString('bn-BD')}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            onAddToCart(prod);
                            onClose();
                          }}
                          className="mt-2 w-full py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>কার্টে নিন</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct call banner */}
              <div className="bg-white p-3 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-stone-700">
                <span>কোনো কিছু না বুঝলে সরাসরি কথা বলুন:</span>
                <a
                  href={`tel:${BADALGACHI_HOTLINE}`}
                  className="font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  {BADALGACHI_HOTLINE}
                </a>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
