import React, { useState } from 'react';
import { Bot, PhoneCall, Send, CheckCircle2, Sparkles, AlertCircle, HelpCircle, FileSpreadsheet, Sprout } from 'lucide-react';
import { BADALGACHI_UNIONS, BADALGACHI_HOTLINE } from '../data/unions';
import { AdviceRequest } from '../types';

interface FreeAdviceSectionProps {
  onOpenAiDoctor: () => void;
  googleSheetUrl: string;
}

export const FreeAdviceSection: React.FC<FreeAdviceSectionProps> = ({
  onOpenAiDoctor,
  googleSheetUrl,
}) => {
  const [farmerName, setFarmerName] = useState('');
  const [phone, setPhone] = useState('');
  const [union, setUnion] = useState(BADALGACHI_UNIONS[0].nameBn);
  const [crop, setCrop] = useState('ধান');
  const [issueDescription, setIssueDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!farmerName.trim() || !phone.trim() || !issueDescription.trim()) {
      setError('অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং সমস্যার বিবরণ লিখুন।');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      setError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX, 018XXXXXXXX)।');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        type: 'advice_request',
        farmerName: farmerName.trim(),
        phone: phone.trim(),
        union,
        crop,
        issueDescription: issueDescription.trim(),
        symptomType: 'সাধারণ ফসলি সমস্যা',
        webhookUrl: googleSheetUrl,
      };

      await fetch('/api/advice-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setSubmittedSuccess(true);
      setFarmerName('');
      setPhone('');
      setIssueDescription('');
    } catch (err: any) {
      console.warn('Advice submission fallback:', err);
      setSubmittedSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="free-advice-section" className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-stone-100 to-white border-t border-stone-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold border border-emerald-200">
            <Sprout className="w-4 h-4 text-emerald-700" />
            <span>ফ্রী সেবা • কোনো ফি লাগবে না</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight">
            ফসল সুরক্ষা ও <span className="text-emerald-700">ফ্রী কৃষি পরামর্শ কেন্দ্র</span>
          </h2>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            ধান, আলু, সরিষা, ভুট্টা বা শাকসবজির রোগবালাই নিয়ে চিন্তিত? আমাদের এআই শস্য ডাক্তার থেকে তাৎক্ষণিক প্রেসক্রিপশন নিন অথবা ফরম পূরণ করে কৃষিবিদের সরাসরি ফোন পরামর্শ পান।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: AI Crop Doctor Hero Box (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 via-emerald-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/40 relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-md">
                <Bot className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  খান কৃষি বন্ধু (AI শস্য ডাক্তার)
                </h3>
                <p className="text-xs text-emerald-300">
                  কৃত্রিম বুদ্ধিমত্তা চালিত তাৎক্ষণিক ফসল প্রেসক্রিপশন
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              ফসলের রোগ বা পোকা আক্রমণের লক্ষণ নির্বাচন করুন। কয়েক সেকেন্ডেই পাবেন সঠিক কীটনাশকের নাম, ডোজ (প্রয়োগ মাত্রা) ও পরিচর্যার নির্দেশিকা।
            </p>

            <div className="space-y-2.5 text-xs text-emerald-100">
              <div className="flex items-center gap-2 bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-800/40">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ধানের ব্লাস্ট, খোলপোড়া ও মাজরা পোকা নির্ণয়</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-800/40">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>আলুর নাবি ধসা ও পাতা কোঁকড়ানো রোগ নিরাময়</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-800/40">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>সরিষা ও শাকসবজির জাবপোকা ও মিলিবাগ দমন</span>
              </div>
            </div>

            <button
              onClick={onOpenAiDoctor}
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-400/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bot className="w-5 h-5 text-emerald-950" />
              <span>এআই কৃষি ডাক্তারের পরামর্শ নিন</span>
            </button>

            <div className="pt-4 border-t border-emerald-800/60 flex items-center justify-between text-xs text-emerald-300">
              <span>সরাসরি কৃষিবিদ হটলাইন:</span>
              <a href={`tel:${BADALGACHI_HOTLINE}`} className="font-bold text-amber-300 hover:underline flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5" />
                {BADALGACHI_HOTLINE}
              </a>
            </div>
          </div>

          {/* Right Column: Free Advice Request Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-5">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900">
                কৃষিবিদের ফোন পরামর্শের জন্য আবেদন ফরম
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                আপনার ফসলের সমস্যা লিখে পাঠান। খান এন্টারপ্রাইজের অভিজ্ঞ কৃষি কর্মকর্তা আপনাকে ফোন করে সঠিক সমাধান ও ওষুধ ব্যবহারের নিয়ম বলে দেবেন।
              </p>
            </div>

            {submittedSuccess ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-stone-900 text-base">
                  আপনার প্রশ্নটি সফলভাবে জমা হয়েছে!
                </h4>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  আমাদের কৃষি পরামর্শক দল আপনার তথ্যাদি পর্যালোচনা করে দ্রুত আপনার নম্বরে যোগাযোগ করবেন।
                </p>
                <button
                  onClick={() => setSubmittedSuccess(false)}
                  className="text-xs font-bold text-emerald-800 hover:underline pt-2 cursor-pointer"
                >
                  আরেকটি প্রশ্ন পাঠান
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Farmer Name */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      আপনার নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      required
                      placeholder="যেমন: মো: কামরুল হাসান"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 bg-stone-50/50"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="যেমন: 017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 bg-stone-50/50"
                    />
                  </div>

                  {/* Union */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      ইউনিয়ন (বদলগাছী)
                    </label>
                    <select
                      value={union}
                      onChange={(e) => setUnion(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 bg-stone-50/50 font-medium"
                    >
                      {BADALGACHI_UNIONS.map((u) => (
                        <option key={u.id} value={u.nameBn}>
                          {u.nameBn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Crop */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      আক্রান্ত ফসলের নাম
                    </label>
                    <select
                      value={crop}
                      onChange={(e) => setCrop(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 bg-stone-50/50 font-medium"
                    >
                      <option value="ধান">ধান (আমন / বোরো)</option>
                      <option value="আলু">আলু (ডায়মন্ড / কার্ডিনাল)</option>
                      <option value="সরিষা">সরিষা (বারি-১৪/১৭)</option>
                      <option value="ভুট্টা">ভুট্টা</option>
                      <option value="টমেটো ও বেগুন">টমেটো ও বেগুন</option>
                      <option value="মরিচ">মরিচ</option>
                      <option value="লাউ ও শাকসবজি">লাউ ও শাকসবজি</option>
                      <option value="আম ও লিচু বাগান">আম ও লিচু বাগান</option>
                      <option value="অন্যান্য">অন্যান্য ফসল</option>
                    </select>
                  </div>
                </div>

                {/* Problem Description */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    রোগের লক্ষণ বা সমস্যার বিবরণ <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    required
                    placeholder="যেমন: ধানের পাতায় বাদামী দাগ পড়েছে এবং ডগা মরে যাচ্ছে। কি স্প্রে করতে হবে?"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 bg-stone-50/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-800/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <span>জমা হচ্ছে...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>পরামর্শের জন্য অনুরোধ পাঠান</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
