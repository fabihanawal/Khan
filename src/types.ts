export type ProductCategory = 'all' | 'pesticide' | 'fertilizer' | 'seed' | 'equipment' | 'organic';

export interface Product {
  id: string;
  nameBn: string;
  nameEn: string;
  category: 'pesticide' | 'fertilizer' | 'seed' | 'equipment' | 'organic';
  categoryBn: string;
  brand: string;
  packSize: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  stockCount?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  shortDescBn: string;
  fullDescBn: string;
  usageGuideBn: string;
  targetPestsOrCrops: string[];
  chemicalComposition?: string;
  safetyWarningsBn: string;
  featured?: boolean;
  badge?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface BadalgachiUnion {
  id: string;
  nameBn: string;
  nameEn: string;
  wards: number[];
  deliveryHub: string;
  estimatedHours: string;
  descriptionBn: string;
}

export interface CustomerOrderData {
  customerName: string;
  phone: string;
  alternatePhone?: string;
  union: string;
  ward: string;
  villageAddress: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  nameBn: string;
  packSize: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  phone: string;
  alternatePhone?: string;
  union: string;
  ward: string;
  villageAddress: string;
  note?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: 'cash_on_delivery';
  status: 'pending_call' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  syncStatus: 'synced_to_sheet' | 'local_only' | 'error';
  staffNotes?: string;
}

export interface AdviceRequest {
  id: string;
  createdAt: string;
  farmerName: string;
  phone: string;
  union: string;
  crop: string;
  issueDescription: string;
  symptomType?: string;
  status: 'pending' | 'consulted' | 'resolved';
  aiResponse?: string;
}

export interface GoogleSheetsConfig {
  scriptUrl: string;
  isConnected: boolean;
  lastSyncTime?: string;
  autoSync: boolean;
}

export interface SiteSettings {
  hotline: string;
  whatsapp: string;
  shopAddress: string;
  announcementNotice: string;
  noticeEnabled: boolean;
  googleSheetWebhookUrl: string;
}
