import React, { useState, useEffect } from 'react';
import {
  X,
  LayoutDashboard,
  ShoppingBag,
  Package,
  MessageSquare,
  Settings,
  PhoneCall,
  CheckCircle2,
  Clock,
  Truck,
  Download,
  Search,
  Filter,
  AlertCircle,
  FileSpreadsheet,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Printer,
  Sparkles,
  Check,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Tag,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Bot
} from 'lucide-react';
import { Order, AdviceRequest, Product, ProductCategory, SiteSettings } from '../types';
import { BADALGACHI_UNIONS, BADALGACHI_HOTLINE, BADALGACHI_WHATSAPP, SHOP_LOCATION_BN } from '../data/unions';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  adviceRequests: AdviceRequest[];
  products: Product[];
  siteSettings: SiteSettings;
  onUpdateOrderStatus: (orderId: string, status: Order['status'], notes?: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateAdviceStatus: (id: string, status: AdviceRequest['status'], staffNotes?: string) => void;
  onDeleteAdviceRequest: (id: string) => void;
  onUpdateSettings: (settings: Partial<SiteSettings>) => void;
  onOpenSheetGuide: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  orders,
  adviceRequests,
  products,
  siteSettings,
  onUpdateOrderStatus,
  onDeleteOrder,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateAdviceStatus,
  onDeleteAdviceRequest,
  onUpdateSettings,
  onOpenSheetGuide,
}) => {
  // Authentication State (Password 4321)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('khan_cms_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'advice' | 'settings'>('overview');

  // Search & Filter States
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderUnionFilter, setOrderUnionFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  const [adviceSearchQuery, setAdviceSearchQuery] = useState('');
  const [adviceStatusFilter, setAdviceStatusFilter] = useState('all');

  // Product Add / Edit Modal Sub-state
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<Partial<Product>>({
    nameBn: '',
    nameEn: '',
    category: 'pesticide',
    categoryBn: 'কীটনাশক ও ছত্রাকনাশক',
    brand: 'সিনজেনটা (Syngenta)',
    packSize: '১০০ মিলি',
    price: 350,
    originalPrice: 380,
    inStock: true,
    stockCount: 50,
    rating: 5.0,
    reviewsCount: 15,
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22527?auto=format&fit=crop&w=600&q=80',
    shortDescBn: '',
    fullDescBn: '',
    usageGuideBn: 'প্রতি লিটার পানিতে ০.৫ মিলি মিশিয়ে স্প্রে করতে হবে।',
    targetPestsOrCrops: ['ধানের ব্লাস্ট', 'পোকা দমন'],
    safetyWarningsBn: 'স্প্রে করার সময় মাস্ক ও গ্লাভস ব্যবহার করুন। শিশুদের নাগালের বাইরে রাখুন।',
    featured: false,
    badge: 'সেরা বিক্রয়'
  });

  // Settings Local Form State
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettings);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Print Invoice Sub-modal
  const [selectedOrderToPrint, setSelectedOrderToPrint] = useState<Order | null>(null);

  // Synchronize settings form when props update
  useEffect(() => {
    setSettingsForm(siteSettings);
  }, [siteSettings]);

  if (!isOpen) return null;

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (passwordInput.trim() === '4321') {
      setIsAuthenticated(true);
      sessionStorage.setItem('khan_cms_auth', 'true');
      setPasswordInput('');
      setLoginError(null);
    } else {
      setLoginError('ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড ৪৩২১ (4321) প্রদান করুন।');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('khan_cms_auth');
    setPasswordInput('');
  };

  // --- Filtering Logic ---
  const filteredOrders = orders.filter(order => {
    const matchSearch =
      order.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.phone.includes(orderSearchQuery) ||
      order.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.villageAddress.toLowerCase().includes(orderSearchQuery.toLowerCase());
    const matchUnion = orderUnionFilter === 'all' || order.union.includes(orderUnionFilter);
    const matchStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    return matchSearch && matchUnion && matchStatus;
  });

  const filteredProducts = products.filter(p => {
    const matchSearch =
      p.nameBn.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.usageGuideBn.toLowerCase().includes(productSearchQuery.toLowerCase());
    const matchCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchSearch && matchCat;
  });

  const filteredAdvice = adviceRequests.filter(adv => {
    const matchSearch =
      adv.farmerName.toLowerCase().includes(adviceSearchQuery.toLowerCase()) ||
      adv.phone.includes(adviceSearchQuery) ||
      adv.crop.toLowerCase().includes(adviceSearchQuery.toLowerCase()) ||
      adv.issueDescription.toLowerCase().includes(adviceSearchQuery.toLowerCase());
    const matchStatus = adviceStatusFilter === 'all' || adv.status === adviceStatusFilter;
    return matchSearch && matchStatus;
  });

  // KPI Calculations
  const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.grandTotal : 0), 0);
  const pendingCallsCount = orders.filter(o => o.status === 'pending_call').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const inTransitCount = orders.filter(o => o.status === 'in_transit').length;

  // Export to CSV
  const exportOrdersToCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Union', 'Ward', 'Address', 'Total (BDT)', 'Status', 'Staff Notes', 'Items'];
    const rows = orders.map(o => [
      o.orderNumber,
      `"${o.createdAt}"`,
      `"${o.customerName}"`,
      `"${o.phone}"`,
      `"${o.union}"`,
      `"Ward ${o.ward}"`,
      `"${o.villageAddress}"`,
      o.grandTotal,
      o.status,
      `"${o.staffNotes || ''}"`,
      `"${o.items.map(i => `${i.nameBn} x${i.quantity}`).join('; ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Khan_Enterprise_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending_call':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-md text-xs flex items-center gap-1"><Clock className="w-3 h-3 text-amber-700" />কল দেওয়া বাকি</span>;
      case 'confirmed':
        return <span className="bg-blue-100 text-blue-900 border border-blue-300 font-bold px-2 py-0.5 rounded-md text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-blue-700" />কনফার্মড</span>;
      case 'in_transit':
        return <span className="bg-purple-100 text-purple-900 border border-purple-300 font-bold px-2 py-0.5 rounded-md text-xs flex items-center gap-1"><Truck className="w-3 h-3 text-purple-700" />ডেলিভারি চলছে</span>;
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded-md text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-700" />ডেলিভারি সম্পন্ন</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-900 border border-rose-300 font-bold px-2 py-0.5 rounded-md text-xs">বাতিল</span>;
      default:
        return <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded text-xs">অপেক্ষমান</span>;
    }
  };

  // Open Product Add / Edit Form
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductFormData({
      nameBn: '',
      nameEn: '',
      category: 'pesticide',
      categoryBn: 'কীটনাশক ও ছত্রাকনাশক',
      brand: 'সিনজেনটা (Syngenta)',
      packSize: '১০০ মিলি',
      price: 350,
      originalPrice: 380,
      inStock: true,
      stockCount: 50,
      rating: 5.0,
      reviewsCount: 10,
      image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22527?auto=format&fit=crop&w=600&q=80',
      shortDescBn: '',
      fullDescBn: '',
      usageGuideBn: 'প্রতি লিটার পানিতে ০.৫ মিলি মিশিয়ে স্প্রে করতে হবে।',
      targetPestsOrCrops: ['ধান', 'আলু', 'পোকা দমন'],
      safetyWarningsBn: 'স্প্রে করার সময় মুখে মাস্ক ও গ্লাভস ব্যবহার করুন। শিশুদের নাগালের বাইরে রাখুন।',
      featured: false,
      badge: 'নতুন'
    });
    setIsProductFormOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductFormData({
      ...prod,
      targetPestsOrCrops: prod.targetPestsOrCrops || []
    });
    setIsProductFormOpen(true);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.nameBn || !productFormData.price) return;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...productFormData as Product,
        price: Number(productFormData.price),
        originalPrice: productFormData.originalPrice ? Number(productFormData.originalPrice) : undefined,
        stockCount: Number(productFormData.stockCount) || 50,
      });
    } else {
      onAddProduct({
        nameBn: productFormData.nameBn || 'নতুন পণ্য',
        nameEn: productFormData.nameEn || '',
        category: (productFormData.category as any) || 'pesticide',
        categoryBn: productFormData.categoryBn || 'কীটনাশক ও ছত্রাকনাশক',
        brand: productFormData.brand || 'অনুমোদিত ব্র্যান্ড',
        packSize: productFormData.packSize || '১০০ মিলি',
        price: Number(productFormData.price) || 0,
        originalPrice: productFormData.originalPrice ? Number(productFormData.originalPrice) : undefined,
        inStock: productFormData.inStock !== false,
        stockCount: Number(productFormData.stockCount) || 50,
        rating: 5.0,
        reviewsCount: 12,
        image: productFormData.image || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22527?auto=format&fit=crop&w=600&q=80',
        shortDescBn: productFormData.shortDescBn || productFormData.nameBn || '',
        fullDescBn: productFormData.fullDescBn || productFormData.nameBn || '',
        usageGuideBn: productFormData.usageGuideBn || 'অনুমোদিত মাত্রায় ব্যবহার করুন।',
        targetPestsOrCrops: productFormData.targetPestsOrCrops || ['ধান', 'পোকা দমন'],
        chemicalComposition: productFormData.chemicalComposition || '',
        safetyWarningsBn: productFormData.safetyWarningsBn || 'শিশুদের নাগালের বাইরে রাখুন।',
        featured: !!productFormData.featured,
        badge: productFormData.badge || ''
      });
    }
    setIsProductFormOpen(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      
      {/* -------------------- 1. PASSWORD AUTHENTICATION SCREEN -------------------- */}
      {!isAuthenticated ? (
        <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-900 text-amber-400 flex items-center justify-center shadow-lg shadow-emerald-950/30">
              <Lock className="w-8 h-8" />
            </div>
            
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                খান এন্টারপ্রাইজ • সিএমএস লগইন
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                সম্পূর্ণ প্রকল্প ও দোকান পরিচালনার জন্য অ্যাডমিন পাসওয়ার্ড দিন
              </p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                অ্যাডমিন পাসওয়ার্ড (৪ ডিজিট):
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন (যেমন: 4321)"
                  autoFocus
                  className="w-full pl-4 pr-11 py-3 rounded-xl border-2 border-stone-300 focus:border-emerald-600 focus:outline-hidden text-center text-lg font-bold tracking-widest text-stone-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Keypad Helper */}
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 space-y-2 text-center">
              <div className="flex items-center justify-between text-xs text-stone-600 px-1">
                <span>প্রকল্প পাসওয়ার্ড:</span>
                <span className="font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                  4321
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {['4', '3', '2', '1'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPasswordInput(prev => prev + num)}
                    className="py-2 bg-white hover:bg-emerald-50 active:bg-emerald-100 border border-stone-200 rounded-lg text-sm font-bold text-stone-800 shadow-2xs transition-colors cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPasswordInput('4321')}
                className="w-full py-1 text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
              >
                স্বয়ংক্রিয়ভাবে 4321 বসান
              </button>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Unlock className="w-4 h-4" />
                <span>লগইন করুন</span>
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center text-[11px] text-stone-400">
            খান এন্টারপ্রাইজ • {siteSettings.shopAddress}
          </div>
        </div>
      ) : (

        /* -------------------- 2. FULL CMS ADMIN PANEL DASHBOARD -------------------- */
        <div className="relative bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-2 flex flex-col max-h-[92vh]">
          
          {/* Top CMS Header */}
          <div className="p-4 sm:p-5 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base sm:text-lg">খান ইনটারপ্রাইজ • সিএমএস কন্ট্রোল প্যানেল</h2>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    এডমিন সক্রিয়
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  {siteSettings.shopAddress} • হেল্পলাইন: {siteSettings.hotline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportOrdersToCSV}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 border border-stone-700 transition-colors cursor-pointer"
                title="সকল অর্ডার CSV ফাইলে ডাউনলোড করুন"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">এক্সেল/CSV</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="অ্যাডমিন থেকে লগআউট করুন"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>লগআউট</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="bg-stone-100 border-b border-stone-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200/80'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>ওভারভিউ</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200/80'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>অর্ডার ব্যবস্থাপনা</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'orders' ? 'bg-amber-400 text-emerald-950' : 'bg-stone-300 text-stone-800'}`}>
                {orders.length}
              </span>
              {pendingCallsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200/80'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>পণ্য ক্যাটালগ ও ইনভেন্টরি</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'products' ? 'bg-amber-400 text-emerald-950' : 'bg-stone-300 text-stone-800'}`}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('advice')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'advice'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200/80'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>কৃষি পরামর্শ আবেদন</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'advice' ? 'bg-amber-400 text-emerald-950' : 'bg-stone-300 text-stone-800'}`}>
                {adviceRequests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ml-auto ${
                activeTab === 'settings'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200/80'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>দোকান ও নোটিশ সেটিংস</span>
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

            {/* ==================== TAB 1: OVERVIEW ==================== */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Top Stat Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
                    <span className="text-[11px] font-bold text-emerald-800 block">মোট অর্ডার</span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-950 mt-1 block">
                      {orders.length} টি
                    </span>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl">
                    <span className="text-[11px] font-bold text-amber-800 block">কল দেওয়া বাকি</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-950 mt-1 block">
                      {pendingCallsCount} টি
                    </span>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl">
                    <span className="text-[11px] font-bold text-purple-800 block">ডেলিভারি চলছে</span>
                    <span className="text-xl sm:text-2xl font-black text-purple-950 mt-1 block">
                      {inTransitCount} টি
                    </span>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl">
                    <span className="text-[11px] font-bold text-blue-800 block">সফল ডেলিভারি</span>
                    <span className="text-xl sm:text-2xl font-black text-blue-950 mt-1 block">
                      {deliveredOrdersCount} টি
                    </span>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-2xl">
                    <span className="text-[11px] font-bold text-stone-700 block">মোট বিক্রয় (৳)</span>
                    <span className="text-xl sm:text-2xl font-black text-stone-900 mt-1 block">
                      ৳{totalSales.toLocaleString('bn-BD')}
                    </span>
                  </div>

                  <div className="bg-teal-50 border border-teal-200 p-3.5 rounded-2xl">
                    <span className="text-[11px] font-bold text-teal-800 block">ক্যাটালগে পণ্য</span>
                    <span className="text-xl sm:text-2xl font-black text-teal-950 mt-1 block">
                      {products.length} টি
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons Banner */}
                <div className="bg-gradient-to-r from-emerald-900 to-stone-900 text-white p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1 max-w-lg">
                    <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>খান এন্টারপ্রাইজ কুইক অ্যাকশন হাব</span>
                    </h3>
                    <p className="text-xs text-stone-300">
                      নতুন কৃষি পণ্য যোগ করুন, গ্রাহকের অর্ডার কনফার্ম করতে সরাসরি কল করুন বা নোটিশ আপডেট করুন।
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-bold">
                    <button
                      onClick={handleOpenAddProduct}
                      className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>নতুন পণ্য যোগ করুন</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('orders')}
                      className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-white border border-stone-700 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-emerald-400" />
                      <span>সকল অর্ডার দেখুন</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('settings')}
                      className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-white border border-stone-700 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-amber-400" />
                      <span>নোটিশ ও ঠিকানা এডিট</span>
                    </button>
                  </div>
                </div>

                {/* Recent Orders Live Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-700" />
                      <span>সাম্প্রতিক অর্ডারের লাইভ তালিকা</span>
                    </h4>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                    >
                      সবগুলো দেখুন ({orders.length}) →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {orders.slice(0, 4).map((order) => (
                      <div
                        key={order.id}
                        className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 space-y-3 hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-stone-900 text-sm">{order.customerName}</span>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5">
                              {order.union} • ওয়ার্ড {order.ward} • {order.villageAddress}
                            </p>
                          </div>
                          <span className="font-black text-emerald-900 text-sm">
                            ৳{order.grandTotal.toLocaleString('bn-BD')}
                          </span>
                        </div>

                        <div className="text-xs text-stone-600 bg-white p-2 rounded-xl border border-stone-200/60">
                          {order.items.map((i, idx) => (
                            <span key={idx} className="inline-block mr-2">
                              • {i.nameBn} ({i.packSize}) x {i.quantity}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-1 text-xs">
                          <a
                            href={`tel:${order.phone}`}
                            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1 transition-colors"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>কল করুন ({order.phone})</span>
                          </a>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedOrderToPrint(order)}
                              className="p-1.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 rounded-lg cursor-pointer"
                              title="ইনভয়েস প্রিন্ট করুন"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <select
                              value={order.status}
                              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                              className="text-xs bg-white border border-stone-300 rounded-lg px-2 py-1 font-semibold text-stone-800"
                            >
                              <option value="pending_call">কল বাকি</option>
                              <option value="confirmed">কনফার্মড</option>
                              <option value="in_transit">ডেলিভারি চলছে</option>
                              <option value="delivered">ডেলিভারি সম্পন্ন</option>
                              <option value="cancelled">বাতিল</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ==================== TAB 2: ORDERS MANAGEMENT ==================== */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                
                {/* Search & Filter Bar */}
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                  <div className="sm:col-span-6 relative">
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="নাম, ফোন নম্বর, অর্ডার আইডি বা গ্রাম দিয়ে খুঁজুন..."
                      className="w-full pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:border-emerald-600"
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="sm:col-span-3">
                    <select
                      value={orderUnionFilter}
                      onChange={(e) => setOrderUnionFilter(e.target.value)}
                      className="w-full py-2 px-2.5 bg-white border border-stone-300 rounded-xl text-stone-800 focus:outline-hidden"
                    >
                      <option value="all">সকল ইউনিয়ন ({BADALGACHI_UNIONS.length}টি)</option>
                      {BADALGACHI_UNIONS.map(u => (
                        <option key={u.id} value={u.nameBn}>{u.nameBn}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="w-full py-2 px-2.5 bg-white border border-stone-300 rounded-xl text-stone-800 focus:outline-hidden"
                    >
                      <option value="all">সকল স্ট্যাটাস</option>
                      <option value="pending_call">কল দেওয়া বাকি ({orders.filter(o => o.status === 'pending_call').length})</option>
                      <option value="confirmed">কনফার্মড ({orders.filter(o => o.status === 'confirmed').length})</option>
                      <option value="in_transit">ডেলিভারি চলছে ({orders.filter(o => o.status === 'in_transit').length})</option>
                      <option value="delivered">ডেলিভারি সম্পন্ন ({orders.filter(o => o.status === 'delivered').length})</option>
                      <option value="cancelled">বাতিল</option>
                    </select>
                  </div>
                </div>

                {/* Orders List Table / Cards */}
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200 text-stone-500 space-y-2">
                    <AlertCircle className="w-8 h-8 mx-auto text-stone-400" />
                    <p className="font-bold text-sm">কোনো অর্ডার পাওয়া যায়নি।</p>
                    <p className="text-xs">ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => {
                      const waLink = `https://wa.me/88${order.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${order.customerName} ভাই, খান এন্টারপ্রাইজ (বদলগাছী) থেকে আপনার অর্ডার ${order.orderNumber} এর ব্যাপারে যোগাযোগ করছি।`)}`;
                      
                      return (
                        <div
                          key={order.id}
                          className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs hover:border-emerald-300 transition-colors space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-stone-100 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-stone-900 text-base">{order.customerName}</span>
                                <span className="font-mono text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                                  {order.orderNumber}
                                </span>
                                {getStatusBadge(order.status)}
                              </div>
                              <p className="text-xs text-stone-500 mt-1">
                                {order.createdAt} • <strong>{order.union}</strong>, ওয়ার্ড {order.ward}, {order.villageAddress}
                              </p>
                              {order.note && (
                                <p className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">
                                  কাস্টমার নোট: {order.note}
                                </p>
                              )}
                            </div>

                            <div className="text-right">
                              <span className="text-stone-500 text-xs block">সর্বমোট মূল্য:</span>
                              <span className="font-black text-emerald-950 text-lg">
                                ৳{order.grandTotal.toLocaleString('bn-BD')}
                              </span>
                              <span className="text-[11px] text-stone-500 block">ক্যাশ অন ডেলিভারি</span>
                            </div>
                          </div>

                          {/* Items List */}
                          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 text-xs space-y-1">
                            <span className="font-bold text-stone-700 block mb-1">অর্ডারকৃত পণ্যসমূহ:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {order.items.map((it, idx) => (
                                <div key={idx} className="flex items-center justify-between text-stone-800">
                                  <span>• {it.nameBn} ({it.packSize})</span>
                                  <span className="font-semibold">{it.quantity}টি = ৳{it.total}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Actions Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <a
                                href={`tel:${order.phone}`}
                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors"
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                                <span>কল করুন: {order.phone}</span>
                              </a>

                              {order.alternatePhone && (
                                <a
                                  href={`tel:${order.alternatePhone}`}
                                  className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium flex items-center gap-1 transition-colors"
                                >
                                  <span>বিকল্প: {order.alternatePhone}</span>
                                </a>
                              )}

                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                                <span>হোয়াটসঅ্যাপ</span>
                              </a>

                              <button
                                onClick={() => setSelectedOrderToPrint(order)}
                                className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-stone-600" />
                                <span>ইনভয়েস রশিদ</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <label className="text-stone-600 font-medium">স্ট্যাটাস:</label>
                              <select
                                value={order.status}
                                onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                                className="text-xs bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 font-bold text-stone-900 focus:outline-hidden"
                              >
                                <option value="pending_call">কল দেওয়া বাকি</option>
                                <option value="confirmed">কনফার্মড</option>
                                <option value="in_transit">ডেলিভারি চলছে</option>
                                <option value="delivered">ডেলিভারি সম্পন্ন</option>
                                <option value="cancelled">বাতিল</option>
                              </select>

                              <button
                                onClick={() => {
                                  if (confirm('আপনি কি এই অর্ডারটি স্থায়ীভাবে মুছে ফেলতে চান?')) {
                                    onDeleteOrder(order.id);
                                  }
                                }}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="অর্ডার মুছুন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* ==================== TAB 3: PRODUCTS CMS ==================== */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                
                {/* Products Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs">
                  <div className="flex-1 min-w-[240px] relative">
                    <input
                      type="text"
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      placeholder="পণ্যের নাম, ব্র্যান্ড বা প্রয়োগমাত্রা দিয়ে খুঁজুন..."
                      className="w-full pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:border-emerald-600"
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="py-2 px-3 bg-white border border-stone-300 rounded-xl text-stone-800 focus:outline-hidden"
                    >
                      <option value="all">সকল ক্যাটাগরি</option>
                      <option value="pesticide">কীটনাশক ও ছত্রাকনাশক</option>
                      <option value="fertilizer">সার ও অণুখাদ্য</option>
                      <option value="seed">হাইব্রিড বীজ</option>
                      <option value="organic">জৈব সার</option>
                      <option value="equipment">স্প্রে মেশিন ও যন্ত্রপাতি</option>
                    </select>

                    <button
                      onClick={handleOpenAddProduct}
                      className="py-2 px-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>নতুন পণ্য যোগ</span>
                    </button>
                  </div>
                </div>

                {/* Product Catalog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-emerald-400 transition-colors"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start gap-3">
                          <img
                            src={product.image}
                            alt={product.nameBn}
                            className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-100"
                            onError={(e: any) => {
                              e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22527?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {product.categoryBn}
                              </span>
                              {product.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-stone-900 text-sm mt-1 truncate">
                              {product.nameBn}
                            </h4>
                            <p className="text-xs text-stone-500 font-medium truncate">
                              {product.brand} • {product.packSize}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs text-stone-600 bg-stone-50 p-2 rounded-xl border border-stone-200/60 space-y-1">
                          <p className="line-clamp-2"><strong>প্রয়োগ মাত্রা:</strong> {product.usageGuideBn}</p>
                          <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 font-medium">
                            <span>স্টক: <strong className={product.inStock ? 'text-emerald-700' : 'text-rose-700'}>{product.inStock ? `${product.stockCount || 50}টি মজুত` : 'স্টক শেষ'}</strong></span>
                            <span className="text-stone-500">মূল্য: <strong className="text-emerald-950 text-sm">৳{product.price}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                        <button
                          onClick={() => {
                            onUpdateProduct({
                              ...product,
                              inStock: !product.inStock
                            });
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                            product.inStock
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300'
                          }`}
                        >
                          {product.inStock ? 'স্টকে আছে' : 'স্টক আউট'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditProduct(product)}
                            className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-stone-300 transition-colors cursor-pointer"
                            title="পণ্য সম্পাদনা করুন"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`আপনি কি "${product.nameBn}" পণ্যটি ক্যাটালগ থেকে মুছে ফেলতে চান?`)) {
                                onDeleteProduct(product.id);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-stone-300 transition-colors cursor-pointer"
                            title="পণ্য মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* ==================== TAB 4: ADVICE REQUESTS CMS ==================== */}
            {activeTab === 'advice' && (
              <div className="space-y-4">
                
                {/* Search & Filter */}
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                  <div className="sm:col-span-8 relative">
                    <input
                      type="text"
                      value={adviceSearchQuery}
                      onChange={(e) => setAdviceSearchQuery(e.target.value)}
                      placeholder="কৃষকের নাম, মোবাইল নম্বর, ফসল বা রোগ লিখে খুঁজুন..."
                      className="w-full pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:border-emerald-600"
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="sm:col-span-4">
                    <select
                      value={adviceStatusFilter}
                      onChange={(e) => setAdviceStatusFilter(e.target.value)}
                      className="w-full py-2 px-3 bg-white border border-stone-300 rounded-xl text-stone-800 focus:outline-hidden"
                    >
                      <option value="all">সকল পরামর্শ আবেদন ({adviceRequests.length}টি)</option>
                      <option value="pending">অপেক্ষমান (Pending)</option>
                      <option value="consulted">পরামর্শ দেওয়া হয়েছে (Consulted)</option>
                      <option value="resolved">সমাধানকৃত (Resolved)</option>
                    </select>
                  </div>
                </div>

                {filteredAdvice.length === 0 ? (
                  <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200 text-stone-500">
                    <p className="font-bold text-sm">কোনো কৃষি পরামর্শ আবেদন পাওয়া যায়নি।</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAdvice.map((adv) => (
                      <div
                        key={adv.id}
                        className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-2xs hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-stone-100 pb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900 text-base">{adv.farmerName}</span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                ফসল: {adv.crop}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5">
                              {adv.createdAt} • {adv.union}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={adv.status}
                              onChange={(e) => onUpdateAdviceStatus(adv.id, e.target.value as any)}
                              className="text-xs bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 font-bold text-stone-900"
                            >
                              <option value="pending">অপেক্ষমান</option>
                              <option value="consulted">পরামর্শ দেওয়া হয়েছে</option>
                              <option value="resolved">সমাধানকৃত</option>
                            </select>

                            <button
                              onClick={() => {
                                if (confirm('আপনি কি এই পরামর্শ আবেদনটি মুছে ফেলতে চান?')) {
                                  onDeleteAdviceRequest(adv.id);
                                }
                              }}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="আবেদন মুছুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Issue Details */}
                        <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl text-xs space-y-1">
                          <span className="font-bold text-amber-950 block">সমস্যার বিবরণ:</span>
                          <p className="text-stone-800 leading-relaxed">{adv.issueDescription}</p>
                        </div>

                        {adv.aiResponse && (
                          <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl text-xs space-y-1">
                            <span className="font-bold text-emerald-950 flex items-center gap-1">
                              <Bot className="w-3.5 h-3.5 text-emerald-700" />
                              <span>খান কৃষি বন্ধু (AI) সমাধান প্রেসক্রিপশন:</span>
                            </span>
                            <p className="text-stone-800 leading-relaxed">{adv.aiResponse}</p>
                          </div>
                        )}

                        {/* Action Call Button */}
                        <div className="flex items-center justify-between pt-1">
                          <a
                            href={`tel:${adv.phone}`}
                            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>কৃষককে সরাসরি ফোন করুন ({adv.phone})</span>
                          </a>

                          <a
                            href={`https://wa.me/88${adv.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${adv.farmerName} ভাই, খান এন্টারপ্রাইজ (বদলগাছী) থেকে আপনার ${adv.crop} ফসলের সমস্যা সম্পর্কে পরামর্শ দেওয়ার জন্য যোগাযোগ করছি।`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                            <span>হোয়াটসঅ্যাপ মেসেজ</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* ==================== TAB 5: SHOP & NOTICE SETTINGS ==================== */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                
                <form onSubmit={handleSaveSettings} className="bg-stone-50 border border-stone-200 rounded-3xl p-5 sm:p-6 space-y-5">
                  <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                        <Settings className="w-5 h-5 text-emerald-700" />
                        <span>দোকান ও সাইট সেটিংস কনফিগারেশন</span>
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        এখানে পরিবর্তন করলে পুরো ওয়েবসাইটে ঠিকানা, হটলাইন ও নোটিশ সাথে সাথে আপডেট হবে।
                      </p>
                    </div>

                    {settingsSavedMessage && (
                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 animate-in fade-in">
                        <Check className="w-4 h-4 text-emerald-700" />
                        <span>সফলভাবে সংরক্ষিত হয়েছে!</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    
                    {/* Hotline Number */}
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        হটলাইন নম্বর (ফোন কল):
                      </label>
                      <input
                        type="text"
                        value={settingsForm.hotline}
                        onChange={(e) => setSettingsForm({ ...settingsForm, hotline: e.target.value })}
                        placeholder="যেমন: 01613-887181"
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-hidden focus:border-emerald-600"
                        required
                      />
                    </div>

                    {/* WhatsApp Number */}
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        হোয়াটসঅ্যাপ নম্বর:
                      </label>
                      <input
                        type="text"
                        value={settingsForm.whatsapp}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                        placeholder="যেমন: +880 1613-887181"
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-hidden focus:border-emerald-600"
                        required
                      />
                    </div>

                    {/* Shop Location Address */}
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-stone-700 mb-1">
                        প্রতিষ্ঠানের ঠিকানা (দোকানের অবস্থান):
                      </label>
                      <input
                        type="text"
                        value={settingsForm.shopAddress}
                        onChange={(e) => setSettingsForm({ ...settingsForm, shopAddress: e.target.value })}
                        placeholder="ডাকবাংলা মোড়, বদলগাছি উপজেলা, নওগাঁ"
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-hidden focus:border-emerald-600"
                        required
                      />
                    </div>

                    {/* Top Announcement Notice Banner */}
                    <div className="sm:col-span-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-stone-700">
                          ওয়েবসাইটের শীর্ষ জরুরি নোটিশ / ঘোষণা বার্তা:
                        </label>
                        <label className="flex items-center gap-1.5 text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsForm.noticeEnabled}
                            onChange={(e) => setSettingsForm({ ...settingsForm, noticeEnabled: e.target.checked })}
                            className="rounded text-emerald-700 focus:ring-emerald-600"
                          />
                          <span>নোটিশ প্রদর্শন সক্রিয় রাখুন</span>
                        </label>
                      </div>
                      <textarea
                        rows={2}
                        value={settingsForm.announcementNotice}
                        onChange={(e) => setSettingsForm({ ...settingsForm, announcementNotice: e.target.value })}
                        placeholder="বদলগাছী উপজেলার ৮টি ইউনিয়নের সব গ্রামে দ্রুত ক্যাশ অন হোম ডেলিভারি ও ফ্রী কৃষি পরামর্শ সেবা চালু রয়েছে!"
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:border-emerald-600 font-medium"
                      />
                    </div>

                    {/* Google Sheet Webhook URL */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-stone-700 flex items-center gap-1.5">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                          <span>গুগল স্প্রেডশীট ওয়েবহুক URL (Google Apps Script Webhook):</span>
                        </label>
                        <button
                          type="button"
                          onClick={onOpenSheetGuide}
                          className="text-emerald-700 hover:underline font-bold text-[11px] cursor-pointer"
                        >
                          সংযোগ গাইড দেখুন →
                        </button>
                      </div>
                      <input
                        type="url"
                        value={settingsForm.googleSheetWebhookUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, googleSheetWebhookUrl: e.target.value })}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-mono text-xs focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>

                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-3 border-t border-stone-200">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>সেটিংস সংরক্ষণ করুন</span>
                    </button>
                  </div>
                </form>

                {/* Delivery Hubs & Coverage Summary */}
                <div className="bg-stone-50 border border-stone-200 rounded-3xl p-5 sm:p-6 space-y-3 text-xs">
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>বদলগাছী উপজেলার ৮টি ইউনিয়নের ডেলিভারি হাব ও কভারেজ</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {BADALGACHI_UNIONS.map((u) => (
                      <div key={u.id} className="bg-white p-3 rounded-xl border border-stone-200/80 space-y-1">
                        <span className="font-bold text-emerald-950 block">{u.nameBn}</span>
                        <p className="text-[11px] text-stone-600">হাব: {u.deliveryHub}</p>
                        <p className="text-[11px] text-emerald-700 font-semibold">সময়: {u.estimatedHours}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin Access Note */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      সিএমএস এডমিন লগইন পাসওয়ার্ড: <strong>4321</strong> (শুধুমাত্র স্বত্বাধিকারী ও অনুমোদিত কর্মচারীদের জন্য)
                    </span>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* -------------------- 3. ADD / EDIT PRODUCT MODAL FORM -------------------- */}
      {isProductFormOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4 max-h-[90vh] flex flex-col">
            
            <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <span>{editingProduct ? 'পণ্য সম্পাদনা করুন' : 'নতুন কৃষি পণ্য যোগ করুন'}</span>
              </h3>
              <button
                onClick={() => setIsProductFormOpen(false)}
                className="p-1 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">পণ্যের নাম (বাংলা) *</label>
                  <input
                    type="text"
                    value={productFormData.nameBn}
                    onChange={(e) => setProductFormData({ ...productFormData, nameBn: e.target.value })}
                    placeholder="যেমন: স্কোর ২৫০ ইসি (Score 250 EC)"
                    className="w-full p-2.5 border border-stone-300 rounded-xl focus:border-emerald-600 font-bold text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">পণ্যের নাম (English)</label>
                  <input
                    type="text"
                    value={productFormData.nameEn}
                    onChange={(e) => setProductFormData({ ...productFormData, nameEn: e.target.value })}
                    placeholder="e.g. Score 250 EC"
                    className="w-full p-2.5 border border-stone-300 rounded-xl focus:border-emerald-600 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={productFormData.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      let bn = 'কীটনাশক ও ছত্রাকনাশক';
                      if (val === 'fertilizer') bn = 'সার ও অণুখাদ্য';
                      if (val === 'seed') bn = 'হাইব্রিড বীজ';
                      if (val === 'organic') bn = 'জৈব সার';
                      if (val === 'equipment') bn = 'স্প্রে মেশিন ও যন্ত্রপাতি';
                      setProductFormData({ ...productFormData, category: val as any, categoryBn: bn });
                    }}
                    className="w-full p-2.5 border border-stone-300 rounded-xl font-semibold text-stone-900"
                  >
                    <option value="pesticide">কীটনাশক ও ছত্রাকনাশক</option>
                    <option value="fertilizer">সার ও অণুখাদ্য</option>
                    <option value="seed">উন্নত হাইব্রিড বীজ</option>
                    <option value="organic">খাঁটি জৈব সার</option>
                    <option value="equipment">স্প্রে মেশিন ও যন্ত্রপাতি</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">ব্র্যান্ড / কোম্পানি</label>
                  <input
                    type="text"
                    value={productFormData.brand}
                    onChange={(e) => setProductFormData({ ...productFormData, brand: e.target.value })}
                    placeholder="সিনজেনটা / বায়ার / এসিআই / বিএডিসি"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">প্যাক সাইজ</label>
                  <input
                    type="text"
                    value={productFormData.packSize}
                    onChange={(e) => setProductFormData({ ...productFormData, packSize: e.target.value })}
                    placeholder="১০০ মিলি / ৫০০ মিলি / ১ কেজি"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-stone-900 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">বিক্রয় মূল্য (৳) *</label>
                  <input
                    type="number"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: Number(e.target.value) })}
                    placeholder="350"
                    className="w-full p-2.5 border border-stone-300 rounded-xl font-bold text-emerald-950"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">আসল/পূর্বের মূল্য (৳) - ছাড় দেখাতে</label>
                  <input
                    type="number"
                    value={productFormData.originalPrice || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="380"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-stone-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">মজুত সংখ্যা (স্টক)</label>
                  <input
                    type="number"
                    value={productFormData.stockCount}
                    onChange={(e) => setProductFormData({ ...productFormData, stockCount: Number(e.target.value) })}
                    placeholder="50"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">পণ্যের ছবি (Image URL)</label>
                  <input
                    type="url"
                    value={productFormData.image}
                    onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-stone-900 font-mono text-xs"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">প্রয়োগ মাত্রা ও ব্যবহারের সঠিক নিয়ম *</label>
                  <textarea
                    rows={2}
                    value={productFormData.usageGuideBn}
                    onChange={(e) => setProductFormData({ ...productFormData, usageGuideBn: e.target.value })}
                    placeholder="প্রতি লিটার পানিতে ০.৫ মিলি হারে (১৬ লিটার ড্রামে ৮ মিলি) মিশিয়ে বিকেলে স্প্রে করতে হবে।"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-stone-900"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">সংক্ষিপ্ত বিবরণ</label>
                  <input
                    type="text"
                    value={productFormData.shortDescBn}
                    onChange={(e) => setProductFormData({ ...productFormData, shortDescBn: e.target.value })}
                    placeholder="ধানের ব্লাস্ট ও শাকসবজির পাতা পোড়া রোগের কার্যকরী ওষুধ।"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>

                <div className="flex items-center gap-4 sm:col-span-2 pt-1">
                  <label className="flex items-center gap-1.5 font-bold text-stone-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productFormData.inStock}
                      onChange={(e) => setProductFormData({ ...productFormData, inStock: e.target.checked })}
                      className="rounded text-emerald-700"
                    />
                    <span>বর্তমানে স্টকে উপলব্ধ</span>
                  </label>

                  <label className="flex items-center gap-1.5 font-bold text-stone-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productFormData.featured}
                      onChange={(e) => setProductFormData({ ...productFormData, featured: e.target.checked })}
                      className="rounded text-emerald-700"
                    />
                    <span>হোমপেজে ফিচার্ড হিসেবে দেখান</span>
                  </label>
                </div>

              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsProductFormOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* -------------------- 4. PRINT INVOICE SUB-MODAL -------------------- */}
      {selectedOrderToPrint && (
        <div className="fixed inset-0 z-70 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-black text-stone-900 text-base">অর্ডার ইনভয়েস রশিদ</h3>
              <button
                onClick={() => setSelectedOrderToPrint(null)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="text-center border-b border-stone-200 pb-3 space-y-1">
                <h2 className="text-lg font-black text-emerald-950">খান এন্টারপ্রাইজ</h2>
                <p className="text-stone-600">{siteSettings.shopAddress}</p>
                <p className="text-stone-600">হটলাইন: {siteSettings.hotline} • হোয়াটসঅ্যাপ: {siteSettings.whatsapp}</p>
              </div>

              <div className="flex justify-between">
                <div>
                  <p><strong>অর্ডার আইডি:</strong> {selectedOrderToPrint.orderNumber}</p>
                  <p><strong>তারিখ:</strong> {selectedOrderToPrint.createdAt}</p>
                </div>
                <div className="text-right">
                  <p><strong>কাস্টমার:</strong> {selectedOrderToPrint.customerName}</p>
                  <p><strong>মোবাইল:</strong> {selectedOrderToPrint.phone}</p>
                  <p><strong>ঠিকানা:</strong> {selectedOrderToPrint.union}, {selectedOrderToPrint.villageAddress}</p>
                </div>
              </div>

              <table className="w-full text-left border-collapse border border-stone-300">
                <thead>
                  <tr className="bg-stone-200 text-stone-800">
                    <th className="p-2 border border-stone-300">পণ্য</th>
                    <th className="p-2 border border-stone-300 text-center">পরিমাণ</th>
                    <th className="p-2 border border-stone-300 text-right">মূল্য (৳)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrderToPrint.items.map((i, idx) => (
                    <tr key={idx} className="bg-white">
                      <td className="p-2 border border-stone-300">{i.nameBn} ({i.packSize})</td>
                      <td className="p-2 border border-stone-300 text-center">{i.quantity}</td>
                      <td className="p-2 border border-stone-300 text-right">৳{i.total}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-stone-100 font-bold">
                    <td colSpan={2} className="p-2 border border-stone-300 text-right">সর্বমোট (Cash on Delivery):</td>
                    <td className="p-2 border border-stone-300 text-right text-emerald-900">৳{selectedOrderToPrint.grandTotal}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট করুন</span>
              </button>
              <button
                onClick={() => setSelectedOrderToPrint(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
