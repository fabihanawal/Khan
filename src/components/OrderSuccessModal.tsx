import React, { useEffect } from 'react';
import { CheckCircle2, PhoneCall, Printer, MessageSquare, ArrowRight, ShieldCheck, MapPin, Package, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../types';
import { BADALGACHI_HOTLINE, BADALGACHI_WHATSAPP, SHOP_LOCATION_BN } from '../data/unions';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
}) => {
  useEffect(() => {
    if (order) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#f59e0b', '#10b981'],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [order]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = encodeURIComponent(
    `আসসালামু আলাইকুম খান এন্টারপ্রাইজ।\nআমি বদলগাছী অনলাইন পোর্টাল থেকে অর্ডার করেছি।\nআমার অর্ডার আইডি: ${order.orderNumber}\nনাম: ${order.customerName}\nফোন: ${order.phone}\nইউনিয়ন: ${order.union}, ওয়ার্ড: ${order.ward}\nমোট মূল্য: ৳${order.grandTotal}\nদয়া করে অর্ডারটি দ্রুত পাঠান।`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4">
        
        {/* Printable Order Receipt Container */}
        <div id="order-receipt-print" className="p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
          
          {/* Success Banner */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              আলহামদুলিল্লাহ! আপনার অর্ডার সফলভাবে জমা হয়েছে
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
              খান এন্টারপ্রাইজ কর্তৃপক্ষ শীঘ্রই আপনার দেওয়া নম্বরে (<strong className="text-emerald-800">{order.phone}</strong>) কল করে অর্ডারটি চূড়ান্ত নিশ্চিত করবে।
            </p>
          </div>

          {/* Order ID & Date Pill */}
          <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div>
              <span className="text-stone-500 block text-[11px]">অর্ডার আইডি (Order ID):</span>
              <span className="font-extrabold text-emerald-950 text-base">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">অর্ডারের তারিখ ও সময়:</span>
              <span className="font-semibold text-stone-800">{order.createdAt}</span>
            </div>
            <div className="text-right">
              <span className="text-stone-500 block text-[11px]">পেমেন্ট পদ্ধতি:</span>
              <span className="font-bold text-amber-700">ক্যাশ অন ডেলিভারি (পণ্য পেয়ে টাকা)</span>
            </div>
          </div>

          {/* Farmer & Delivery Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="space-y-1">
              <h4 className="font-bold text-stone-900 uppercase text-[11px] tracking-wider text-emerald-800">
                কৃষকের তথ্য
              </h4>
              <p><strong>নাম:</strong> {order.customerName}</p>
              <p><strong>মোবাইল:</strong> {order.phone}</p>
              {order.alternatePhone && <p><strong>বিকল্প মোবাইল:</strong> {order.alternatePhone}</p>}
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-stone-900 uppercase text-[11px] tracking-wider text-emerald-800">
                ডেলিভারি ঠিকানা
              </h4>
              <p><strong>ইউনিয়ন:</strong> {order.union}</p>
              <p><strong>ওয়ার্ড নং:</strong> {order.ward} নং ওয়ার্ড</p>
              <p><strong>গ্রাম / ঠিকানা:</strong> {order.villageAddress}</p>
              {order.note && <p><strong>নির্দেশনা:</strong> {order.note}</p>}
            </div>
          </div>

          {/* Ordered Products Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-800 text-xs sm:text-sm flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-700" />
              <span>অর্ডারকৃত পণ্যের তালিকা</span>
            </h4>

            <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-2.5">পণ্যের নাম</th>
                    <th className="p-2.5 text-center">প্যাক</th>
                    <th className="p-2.5 text-center">পরিমাণ</th>
                    <th className="p-2.5 text-right">মূল্য (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/80">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="p-2.5 font-medium text-stone-900">{item.nameBn}</td>
                      <td className="p-2.5 text-center text-stone-600">{item.packSize}</td>
                      <td className="p-2.5 text-center font-bold text-stone-800">{item.quantity}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-900">
                        ৳{item.total.toLocaleString('bn-BD')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-stone-50 font-bold text-stone-900 border-t border-stone-200">
                  <tr>
                    <td colSpan={3} className="p-2.5 text-right">ডেলিভারি চার্জ (বদলগাছী উপজেলা):</td>
                    <td className="p-2.5 text-right text-emerald-700">ফ্রী (৳০)</td>
                  </tr>
                  <tr className="text-sm bg-emerald-50/50">
                    <td colSpan={3} className="p-2.5 text-right font-extrabold text-emerald-950">
                      সর্বমোট প্রদেয় মূল্য (Cash on Delivery):
                    </td>
                    <td className="p-2.5 text-right font-extrabold text-emerald-900 text-base">
                      ৳{order.grandTotal.toLocaleString('bn-BD')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Khan Enterprise Footer for receipt */}
          <div className="text-[11px] text-stone-500 border-t border-stone-200 pt-3 text-center space-y-1">
            <p className="font-bold text-stone-700">খান এন্টারপ্রাইজ (কৃষি উপকরণ সরবরাহকারী ও সেবা কেন্দ্র)</p>
            <p>{SHOP_LOCATION_BN}</p>
            <p>হেল্পলাইন: {BADALGACHI_HOTLINE} • ফ্রী ডেলিভারি সেবা বদলগাছী</p>
          </div>

        </div>

        {/* Action Controls (Hidden in print) */}
        <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-3.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span>রশিদ প্রিন্ট করুন</span>
            </button>

            <a
              href={`https://wa.me/88${BADALGACHI_WHATSAPP.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপে জানান</span>
            </a>
          </div>

          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer ml-auto"
          >
            <span>নতুন অর্ডার করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
