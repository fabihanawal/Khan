import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { UnionCoverageStrip } from './components/UnionCoverageStrip';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { FreeAdviceSection } from './components/FreeAdviceSection';
import { AiCropDoctorModal } from './components/AiCropDoctorModal';
import { GoogleSheetIntegrationModal } from './components/GoogleSheetIntegrationModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { Footer } from './components/Footer';

import { PRODUCTS as DEFAULT_PRODUCTS } from './data/products';
import { BADALGACHI_UNIONS, BADALGACHI_HOTLINE, BADALGACHI_WHATSAPP, SHOP_LOCATION_BN } from './data/unions';
import { Product, ProductCategory, CartItem, Order, AdviceRequest, SiteSettings } from './types';
import {
  testFirestoreConnection,
  subscribeToOrders,
  subscribeToProducts,
  subscribeToAdviceRequests,
  subscribeToSettings,
  subscribeToAdminAuth
} from './lib/firebase';
import { ShoppingBag, Bot, PhoneCall, Search, Sparkles, Filter, Check, ArrowUp, Zap, HelpCircle } from 'lucide-react';

export default function App() {
  // --- Catalog & Filters State ---
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnion, setSelectedUnion] = useState<string>('all');

  // --- Site Settings State ---
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('khan_site_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved settings', e);
    }
    return {
      hotline: BADALGACHI_HOTLINE,
      whatsapp: BADALGACHI_WHATSAPP,
      shopAddress: SHOP_LOCATION_BN,
      announcementNotice: 'বদলগাছী উপজেলার ৮টি ইউনিয়নের সব গ্রামে দ্রুত ক্যাশ অন হোম ডেলিভারি ও ফ্রী কৃষি পরামর্শ সেবা চালু রয়েছে!',
      noticeEnabled: true,
      googleSheetWebhookUrl: localStorage.getItem('khan_google_sheet_url') || ''
    };
  });

  // --- Cart State (Persisted in localStorage) ---
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('khan_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('khan_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Could not persist cart to localStorage', e);
    }
  }, [cartItems]);

  // --- Modal & Drawer States ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [lastSubmittedOrder, setLastSubmittedOrder] = useState<Order | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [isAiDoctorOpen, setIsAiDoctorOpen] = useState(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // --- Orders & Advice Requests State ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [adviceRequests, setAdviceRequests] = useState<AdviceRequest[]>([]);
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>(() => {
    return localStorage.getItem('khan_google_sheet_url') || '';
  });

  // Section references for smooth scrolling
  const productsSectionRef = useRef<HTMLDivElement>(null);
  const adviceSectionRef = useRef<HTMLDivElement>(null);

  const handleScrollToProducts = () => {
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToAdvice = () => {
    adviceSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch initial data & initialize Real-time Firebase Firestore Listeners
  useEffect(() => {
    // 1. Test connection to Firestore as required by SKILL.md
    testFirestoreConnection();

    // 2. Fetch server data as baseline
    const fetchServerData = async () => {
      try {
        const [ordersRes, adviceRes, configRes, settingsRes, productsRes] = await Promise.allSettled([
          fetch('/api/orders').then(r => r.json()),
          fetch('/api/advice-requests').then(r => r.json()),
          fetch('/api/google-sheets-config').then(r => r.json()),
          fetch('/api/settings').then(r => r.json()),
          fetch('/api/products').then(r => r.json()),
        ]);

        if (ordersRes.status === 'fulfilled' && ordersRes.value?.orders) {
          setOrders(ordersRes.value.orders);
        }
        if (adviceRes.status === 'fulfilled' && adviceRes.value?.adviceRequests) {
          setAdviceRequests(adviceRes.value.adviceRequests);
        }
        if (configRes.status === 'fulfilled' && configRes.value?.webhookUrl) {
          setGoogleSheetUrl(configRes.value.webhookUrl);
        }
        if (settingsRes.status === 'fulfilled' && settingsRes.value?.settings) {
          setSiteSettings(prev => ({ ...prev, ...settingsRes.value.settings }));
        }
        if (productsRes.status === 'fulfilled' && Array.isArray(productsRes.value?.products) && productsRes.value.products.length > 0) {
          setProducts(productsRes.value.products);
        }
      } catch (e) {
        console.warn('Initial server fetch error:', e);
      }
    };
    fetchServerData();

    // 3. Attach Real-time Firebase Firestore Snapshots for Public collections
    let unsubProducts: (() => void) | undefined;
    let unsubSettings: (() => void) | undefined;

    try {
      unsubProducts = subscribeToProducts((cloudProducts) => {
        if (cloudProducts.length > 0) {
          setProducts(cloudProducts);
        }
      });
      unsubSettings = subscribeToSettings((cloudSettings) => {
        setSiteSettings((prev) => ({ ...prev, ...cloudSettings }));
      });
    } catch (e) {
      console.warn('Real-time Firestore listeners initialization for public collections:', e);
    }

    // 4. Attach Real-time Firebase Firestore Snapshots for Admin-only collections (Orders, Advice Requests)
    // ONLY when user is authenticated with Firebase Auth (mandated by SKILL.md)
    let unsubOrders: (() => void) | undefined;
    let unsubAdvice: (() => void) | undefined;

    const unsubAuth = subscribeToAdminAuth((adminUser) => {
      // Clean up previous listeners if user signed out
      if (unsubOrders) {
        unsubOrders();
        unsubOrders = undefined;
      }
      if (unsubAdvice) {
        unsubAdvice();
        unsubAdvice = undefined;
      }

      if (adminUser) {
        try {
          unsubOrders = subscribeToOrders((cloudOrders) => {
            if (cloudOrders.length > 0) {
              setOrders(cloudOrders);
            }
          });
          unsubAdvice = subscribeToAdviceRequests((cloudAdvice) => {
            if (cloudAdvice.length > 0) {
              setAdviceRequests(cloudAdvice);
            }
          });
        } catch (e) {
          console.warn('Admin Firestore subscriptions error:', e);
        }
      }
    });

    return () => {
      unsubProducts?.();
      unsubSettings?.();
      unsubOrders?.();
      unsubAdvice?.();
      unsubAuth();
    };
  }, []);

  const getAdminHeaders = () => {
    const token = sessionStorage.getItem('khan_admin_token') || 'khan_cms_auth_token_4321';
    return {
      'Content-Type': 'application/json',
      'x-admin-token': token,
    };
  };

  const handleSaveGoogleSheetUrl = async (url: string) => {
    setGoogleSheetUrl(url);
    localStorage.setItem('khan_google_sheet_url', url);
    setSiteSettings(prev => ({ ...prev, googleSheetWebhookUrl: url }));
    try {
      await fetch('/api/google-sheets-config', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ scriptUrl: url }),
      });
    } catch (e) {
      console.warn('Error syncing webhook URL with server', e);
    }
  };

  // Update Settings via CMS
  const handleUpdateSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...siteSettings, ...newSettings };
    setSiteSettings(updated);
    try {
      localStorage.setItem('khan_site_settings', JSON.stringify(updated));
      await fetch('/api/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('Error updating settings on server', e);
    }
  };

  // --- Cart Management Functions ---
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderSuccess = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setLastSubmittedOrder(order);
    setCartItems([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setIsOrderSuccessOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status'], notes?: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status, staffNotes: notes || o.staffNotes } : o))
    );
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ status, staffNotes: notes }),
      });
    } catch (e) {
      console.warn('Update order status error', e);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
    } catch (e) {
      console.warn('Delete order error', e);
    }
  };

  // --- Product CMS Management Functions ---
  const handleAddProduct = async (newProductData: Omit<Product, 'id'>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(newProductData),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts(prev => [data.product, ...prev]);
      } else {
        const localProduct: Product = {
          ...newProductData,
          id: 'PRD-' + Date.now(),
        };
        setProducts(prev => [localProduct, ...prev]);
      }
    } catch (e) {
      const localProduct: Product = {
        ...newProductData,
        id: 'PRD-' + Date.now(),
      };
      setProducts(prev => [localProduct, ...prev]);
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
    try {
      await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(updatedProduct),
      });
    } catch (e) {
      console.warn('Update product error', e);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
    } catch (e) {
      console.warn('Delete product error', e);
    }
  };

  // --- Farmer Advice CMS Management Functions ---
  const handleUpdateAdviceStatus = async (id: string, status: AdviceRequest['status'], staffNotes?: string) => {
    setAdviceRequests(prev =>
      prev.map(a => (a.id === id ? { ...a, status, staffNotes: staffNotes || a.staffNotes } : a))
    );
    try {
      await fetch(`/api/advice-requests/${id}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ status, staffNotes }),
      });
    } catch (e) {
      console.warn('Update advice status error', e);
    }
  };

  const handleDeleteAdviceRequest = async (id: string) => {
    setAdviceRequests(prev => prev.filter(a => a.id !== id));
    try {
      await fetch(`/api/advice-requests/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
    } catch (e) {
      console.warn('Delete advice error', e);
    }
  };

  // --- Filtered Products Calculation ---
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;

      // Search query filter
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        product.nameBn.toLowerCase().includes(query) ||
        product.nameEn.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.categoryBn.toLowerCase().includes(query) ||
        product.shortDescBn.toLowerCase().includes(query) ||
        product.targetPestsOrCrops.some(tag => tag.toLowerCase().includes(query));

      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Product counts by category
  const productsCountByCategory = useMemo(() => {
    const counts: Record<ProductCategory, number> = {
      all: products.length,
      pesticide: 0,
      fertilizer: 0,
      seed: 0,
      organic: 0,
      equipment: 0,
    };
    products.forEach(p => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });
    return counts;
  }, [products]);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-900 flex flex-col selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* Top Navigation Bar */}
      <Navbar
        cartItemsCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        selectedUnionFilter={selectedUnion}
        onSelectUnionFilter={setSelectedUnion}
        onOpenCropDoctor={() => setIsAiDoctorOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenSheetGuide={() => setIsSheetModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateAdvice={handleScrollToAdvice}
        onNavigateAbout={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
        siteSettings={siteSettings}
      />

      {/* Main Hero Banner with Badalgachi Focus */}
      <HeroBanner
        onScrollToProducts={handleScrollToProducts}
        onOpenCropDoctor={() => setIsAiDoctorOpen(true)}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* 8 Badalgachi Unions Interactive Coverage Strip */}
      <UnionCoverageStrip
        selectedUnion={selectedUnion}
        onSelectUnion={setSelectedUnion}
      />

      {/* Main Content Area: Products Catalog */}
      <main ref={productsSectionRef} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Catalog Header & Category Pills */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  অনুমোদিত মূল্যে খাঁটি কৃষি উপকরণ
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 mt-1">
                কৃষি পণ্য ক্যাটালগ ও অর্ডার
              </h2>
            </div>

            <span className="text-xs sm:text-sm font-semibold text-stone-600 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs self-start sm:self-auto">
              মোট <strong className="text-emerald-800">{filteredProducts.length}</strong> টি পণ্য পাওয়া গেছে
            </span>
          </div>

          {/* Category Filter Pills */}
          <CategoryBar
            activeCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            productsCountByCategory={productsCountByCategory}
          />
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-lg">
                দুঃখিত, কোনো কৃষি পণ্য খুঁজে পাওয়া যায়নি
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
                অন্য কোনো শব্দ বা সাধারণ ফসলের নাম (যেমন: ধান, আলু, সার, কীটনাশক) দিয়ে অনুসন্ধান করুন।
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              সকল পণ্য দেখুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onViewDetails={(p) => setSelectedProductDetails(p)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Free Agricultural Advice Section & AI Doctor Promotion */}
      <div ref={adviceSectionRef}>
        <FreeAdviceSection
          onOpenAiDoctor={() => setIsAiDoctorOpen(true)}
          googleSheetUrl={googleSheetUrl}
        />
      </div>

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          handleScrollToProducts();
        }}
        onOpenCropDoctor={() => setIsAiDoctorOpen(true)}
        onOpenSheetGuide={() => setIsSheetModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        siteSettings={siteSettings}
      />

      {/* Floating Bottom Quick Bar (Cart & AI Doctor on Mobile & Desktop) */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2.5 items-end">
        
        {/* Floating AI Crop Doctor Button */}
        <button
          id="btn-floating-ai-doctor"
          onClick={() => setIsAiDoctorOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs sm:text-sm shadow-xl border border-emerald-600/60 active:scale-95 transition-all cursor-pointer group"
          title="ফসল ডাক্তার এআই পরামর্শ"
        >
          <Bot className="w-5 h-5 text-amber-400 group-hover:animate-bounce" />
          <span className="hidden sm:inline">ফসল ডাক্তার (AI)</span>
          <span className="sm:hidden">ডাক্তার</span>
        </button>

        {/* Floating Cart Button (when cart has items) */}
        {totalCartCount > 0 && (
          <button
            id="btn-floating-cart"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm sm:text-base shadow-2xl border border-emerald-600 active:scale-95 transition-all cursor-pointer animate-pulse"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              <span className="absolute -top-2 -right-2 bg-amber-400 text-emerald-950 text-[11px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            </div>
            <span>৳{totalCartPrice.toLocaleString('bn-BD')}</span>
            <span className="text-xs bg-emerald-950 px-2 py-0.5 rounded-full text-emerald-200">
              অর্ডার করুন
            </span>
          </button>
        )}
      </div>

      {/* --- Modals & Drawers --- */}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onClearCart={handleClearCart}
      />

      {/* Checkout Form Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderSuccess={handleOrderSuccess}
        googleSheetUrl={googleSheetUrl}
      />

      {/* Order Success Celebratory Invoice Screen */}
      <OrderSuccessModal
        order={lastSubmittedOrder}
        onClose={() => setIsOrderSuccessOpen(false)}
      />

      {/* Product Details & Dosage Guide Modal */}
      <ProductDetailModal
        product={selectedProductDetails}
        onClose={() => setSelectedProductDetails(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* AI Crop Doctor (Khan Krishi Bondhu) Modal */}
      <AiCropDoctorModal
        isOpen={isAiDoctorOpen}
        onClose={() => setIsAiDoctorOpen(false)}
        onAddToCart={handleAddToCart}
        allProducts={products}
      />

      {/* Google Sheets Integration Guide & Webhook Modal */}
      <GoogleSheetIntegrationModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        currentUrl={googleSheetUrl}
        onSaveUrl={handleSaveGoogleSheetUrl}
      />

      {/* Full CMS Admin Panel Dashboard Modal (Password 4321) */}
      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        orders={orders}
        adviceRequests={adviceRequests}
        products={products}
        siteSettings={siteSettings}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onDeleteOrder={handleDeleteOrder}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onUpdateAdviceStatus={handleUpdateAdviceStatus}
        onDeleteAdviceRequest={handleDeleteAdviceRequest}
        onUpdateSettings={handleUpdateSettings}
        onOpenSheetGuide={() => {
          setIsAdminModalOpen(false);
          setIsSheetModalOpen(true);
        }}
      />

    </div>
  );
}
