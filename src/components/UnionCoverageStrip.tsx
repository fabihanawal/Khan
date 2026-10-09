import React from 'react';
import { MapPin, Clock, Truck, Check } from 'lucide-react';
import { BADALGACHI_UNIONS } from '../data/unions';

interface UnionCoverageStripProps {
  selectedUnion: string;
  onSelectUnion: (unionId: string) => void;
}

export const UnionCoverageStrip: React.FC<UnionCoverageStripProps> = ({
  selectedUnion,
  onSelectUnion,
}) => {
  return (
    <section className="bg-emerald-50/70 border-b border-emerald-100 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm sm:text-base font-bold text-emerald-950">
                বদলগাছী উপজেলার ৮টি ইউনিয়নে আমাদের ডেলিভারি কভারেজ
              </h2>
            </div>
            <p className="text-xs text-stone-600">
              আপনার ইউনিয়ন নির্বাচন করুন এবং দেখে নিন ডেলিভারির সময় ও নিকটস্থ সাব-হাব পয়েন্ট।
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs self-start sm:self-auto">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            <span>প্রতিটি ওয়ার্ডে সরাসরি ডেলিভারি ভ্যান যায়</span>
          </div>
        </div>

        {/* 8 Unions Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {BADALGACHI_UNIONS.map((union) => {
            const isSelected = selectedUnion === union.id;
            return (
              <button
                key={union.id}
                onClick={() => onSelectUnion(isSelected ? 'all' : union.id)}
                className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-md scale-[1.02]'
                    : 'bg-white hover:bg-emerald-100/60 text-stone-800 border-emerald-200/80 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isSelected ? 'bg-emerald-900 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {union.wards.length} টি ওয়ার্ড
                    </span>
                    {isSelected && <Check className="w-3 h-3 text-amber-300" />}
                  </div>
                  <h3 className="text-xs font-bold leading-tight line-clamp-1">
                    {union.nameBn.replace('১ নং ', '').replace('২ নং ', '').replace('৩ নং ', '').replace('৪ নং ', '').replace('৫ নং ', '').replace('৬ নং ', '').replace('৭ নং ', '').replace('৮ নং ', '')}
                  </h3>
                </div>

                <div className="mt-2 pt-1 border-t border-current/10 flex items-center justify-between text-[10px] opacity-90">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {union.estimatedHours.split(' ')[0]}
                  </span>
                  <span className="font-semibold text-amber-500">ফ্রী ডেলিভারি</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
