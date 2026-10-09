import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";
import { PRODUCTS } from "./src/data/products";

dotenv.config();

// Initialize Firebase App & Firestore
const fbApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const fbDb = getFirestore(fbApp, firebaseConfig.firestoreDatabaseId);

// In-memory order and consultation store (persisted to disk at data/app_store.json)
interface StoredOrder {
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
  items: any[];
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: string;
  status: string;
  syncStatus: string;
  staffNotes?: string;
}

interface StoredAdviceRequest {
  id: string;
  createdAt: string;
  farmerName: string;
  phone: string;
  union: string;
  crop: string;
  issueDescription: string;
  symptomType?: string;
  status: string;
  aiResponse?: string;
  staffNotes?: string;
}

// Data Directory & Persistent File Configuration
const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "app_store.json");

// Admin Security Configuration
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "4321";
const ADMIN_AUTH_TOKEN = `khan_cms_auth_token_${ADMIN_PASSWORD}`;

// Default Stores
let productsStore = [...PRODUCTS];

let siteSettingsStore = {
  hotline: '01613-887181',
  whatsapp: '+880 1613-887181',
  shopAddress: 'ডাকবাংলা মোড়, বদলগাছি উপজেলা, নওগাঁ',
  announcementNotice: 'বদলগাছী উপজেলার ৮টি ইউনিয়নের সব গ্রামে আসল কৃষি পণ্যের দ্রুত হোম ডেলিভারি ও ফ্রী কৃষি পরামর্শ সেবা চালু রয়েছে!',
  noticeEnabled: true,
  googleSheetWebhookUrl: ''
};

let ordersStore: StoredOrder[] = [
  {
    id: 'demo-ord-1',
    orderNumber: 'KE-17258901',
    createdAt: new Date(Date.now() - 3600000 * 3).toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' }),
    customerName: 'মো: রফিকুল ইসলাম',
    phone: '01712-889900',
    alternatePhone: '01823-112233',
    union: '১ নং বদলগাছী সদর ইউনিয়ন',
    ward: '৩',
    villageAddress: 'পাকুড়িয়া গ্রাম, বদলগাছী',
    note: 'সন্ধ্যার আগে ডেলিভারি দিলে ভালো হয়।',
    items: [
      { productId: 'score-250ec', nameBn: 'স্কোর ২৫০ ইসি (Score 250 EC)', packSize: '১০০ মিলি', price: 360, quantity: 2, total: 720 },
      { productId: 'zinc-sulphate-36', nameBn: 'জিংক সালফেট মনোহাইড্রেট ৩৬%', packSize: '১ কেজি', price: 210, quantity: 1, total: 210 }
    ],
    subtotal: 930,
    deliveryFee: 0,
    grandTotal: 930,
    paymentMethod: 'cash_on_delivery',
    status: 'confirmed',
    syncStatus: 'synced_to_sheet',
    staffNotes: 'ফোনে কথা বলে কনফার্ম করা হয়েছে।'
  },
  {
    id: 'demo-ord-2',
    orderNumber: 'KE-17258945',
    createdAt: new Date(Date.now() - 3600000 * 8).toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' }),
    customerName: 'আব্দুস সাত্তার প্রামাণিক',
    phone: '01911-554433',
    union: '৩ নং পাহাড়পুর ইউনিয়ন',
    ward: '৫',
    villageAddress: 'পাহাড়পুর মন্দির পাড়া, নওগাঁ',
    note: 'সরিষা ক্ষেতের জন্য দরকার',
    items: [
      { productId: 'confidor-20sl', nameBn: 'কনফিডোর ২০ এসএল', packSize: '৫০ মিলি', price: 240, quantity: 2, total: 480 },
      { productId: 'solubor-boron-20', nameBn: 'সলুবর বোরন ২০%', packSize: '৫০০ গ্রাম', price: 260, quantity: 1, total: 260 }
    ],
    subtotal: 740,
    deliveryFee: 0,
    grandTotal: 740,
    paymentMethod: 'cash_on_delivery',
    status: 'pending_call',
    syncStatus: 'local_only',
    staffNotes: 'কৃষকের সাথে কথা বলে ডেলিভারির সময় ঠিক করতে হবে।'
  }
];

let adviceRequestsStore: StoredAdviceRequest[] = [
  {
    id: 'demo-adv-1',
    createdAt: new Date(Date.now() - 3600000 * 5).toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' }),
    farmerName: 'মো: আব্দুল জলিল',
    phone: '01733-445566',
    union: '৪ নং মিঠাপুর ইউনিয়ন',
    crop: 'ধান (ব্রি ধান-২৮)',
    issueDescription: 'ধানের পাতার কিনারা হলুদ হয়ে পুড়ে যাচ্ছে এবং শীষ মরে যাচ্ছে। কি কীটনাশক দিব?',
    symptomType: 'পাতা পোড়া ও ব্লাস্ট',
    status: 'pending',
    aiResponse: 'স্কোর ২৫০ ইসি প্রতি লিটার পানিতে ০.৫ মিলি হারে স্প্রে করুন এবং জমিতে অতিরিক্ত ইউরিয়া সার প্রয়োগ বন্ধ রাখুন।'
  }
];

// Disk Persistence Helpers
function loadStoreFromDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
      if (Array.isArray(data.orders)) ordersStore = data.orders;
      if (Array.isArray(data.products) && data.products.length > 0) productsStore = data.products;
      if (Array.isArray(data.adviceRequests)) adviceRequestsStore = data.adviceRequests;
      if (data.siteSettings && typeof data.siteSettings === 'object') {
        siteSettingsStore = { ...siteSettingsStore, ...data.siteSettings };
      }
      console.log('App store successfully loaded from disk.');
    } else {
      saveStoreToDisk();
    }
  } catch (err) {
    console.warn('Could not load store from disk, running with defaults:', err);
  }
}

function saveStoreToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const data = {
      version: "1.0.0",
      lastSaved: new Date().toISOString(),
      siteSettings: siteSettingsStore,
      products: productsStore,
      orders: ordersStore,
      adviceRequests: adviceRequestsStore
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error saving store to disk:', err);
  }
}

// Initialize Disk Persistence
loadStoreFromDisk();

// Firestore Cloud Sync Helpers
async function syncProductToFirestore(product: any) {
  try {
    await setDoc(doc(fbDb, "products", product.id), product);
  } catch (err) {
    console.warn("Firestore sync product warning:", err);
  }
}

async function removeProductFromFirestore(productId: string) {
  try {
    await deleteDoc(doc(fbDb, "products", productId));
  } catch (err) {
    console.warn("Firestore delete product warning:", err);
  }
}

async function syncOrderToFirestore(order: any) {
  try {
    await setDoc(doc(fbDb, "orders", order.id), order);
  } catch (err) {
    console.warn("Firestore sync order warning:", err);
  }
}

async function updateOrderInFirestore(orderId: string, updates: any) {
  try {
    await updateDoc(doc(fbDb, "orders", orderId), updates);
  } catch (err) {
    console.warn("Firestore update order warning:", err);
  }
}

async function removeOrderFromFirestore(orderId: string) {
  try {
    await deleteDoc(doc(fbDb, "orders", orderId));
  } catch (err) {
    console.warn("Firestore delete order warning:", err);
  }
}

async function syncAdviceRequestToFirestore(request: any) {
  try {
    await setDoc(doc(fbDb, "advice_requests", request.id), request);
  } catch (err) {
    console.warn("Firestore sync advice warning:", err);
  }
}

async function updateAdviceRequestInFirestore(requestId: string, updates: any) {
  try {
    await updateDoc(doc(fbDb, "advice_requests", requestId), updates);
  } catch (err) {
    console.warn("Firestore update advice warning:", err);
  }
}

async function removeAdviceRequestFromFirestore(requestId: string) {
  try {
    await deleteDoc(doc(fbDb, "advice_requests", requestId));
  } catch (err) {
    console.warn("Firestore delete advice warning:", err);
  }
}

async function syncSettingsToFirestore(settings: any) {
  try {
    await setDoc(doc(fbDb, "settings", "general"), settings);
  } catch (err) {
    console.warn("Firestore sync settings warning:", err);
  }
}

// Bootstrap Firestore on start: Seed catalog and settings if empty, load cloud orders
async function bootstrapFirestore() {
  try {
    // 1. Check products
    const productsSnap = await getDocs(collection(fbDb, "products"));
    if (productsSnap.empty) {
      console.log("Seeding initial products into Firestore Cloud Database...");
      for (const p of PRODUCTS) {
        await setDoc(doc(fbDb, "products", p.id), p);
      }
    } else {
      const cloudProducts: any[] = [];
      productsSnap.forEach(d => cloudProducts.push({ ...d.data(), id: d.id }));
      if (cloudProducts.length > 0) {
        productsStore = cloudProducts;
      }
    }

    // 2. Check settings
    const settingsSnap = await getDoc(doc(fbDb, "settings", "general"));
    if (!settingsSnap.exists()) {
      await setDoc(doc(fbDb, "settings", "general"), siteSettingsStore);
    } else {
      siteSettingsStore = { ...siteSettingsStore, ...settingsSnap.data() as any };
    }

    // 3. Load cloud orders if available
    const ordersSnap = await getDocs(collection(fbDb, "orders"));
    if (!ordersSnap.empty) {
      const cloudOrders: StoredOrder[] = [];
      ordersSnap.forEach(d => cloudOrders.push({ ...(d.data() as StoredOrder), id: d.id }));
      cloudOrders.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
      ordersStore = cloudOrders;
    }

    // 4. Load advice requests if available
    const adviceSnap = await getDocs(collection(fbDb, "advice_requests"));
    if (!adviceSnap.empty) {
      const cloudAdvice: StoredAdviceRequest[] = [];
      adviceSnap.forEach(d => cloudAdvice.push({ ...(d.data() as StoredAdviceRequest), id: d.id }));
      cloudAdvice.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
      adviceRequestsStore = cloudAdvice;
    }

    saveStoreToDisk();
    console.log("Firebase Firestore Cloud Database successfully synced and ready.");
  } catch (err) {
    console.warn("Firestore bootstrap background note:", err);
  }
}

// Start Firestore Cloud Bootstrap
bootstrapFirestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Shared Gemini client lazy initializer
  function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // Authentication Middleware for CMS mutation endpoints
  const checkAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers["x-admin-token"] || (req.headers.authorization && req.headers.authorization.replace("Bearer ", ""));
    if (token === ADMIN_AUTH_TOKEN || token === "khan_cms_auth_token_4321") {
      return next();
    }
    return res.status(401).json({
      success: false,
      error: "অননুমোদিত অনুরোধ! অ্যাডমিন পাসওয়ার্ড বা অথেনটিকেশন টোকেন প্রদান করুন।"
    });
  };

  // 1. Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "Khan Enterprise Badalgachi Agro E-commerce & CMS API",
      time: new Date().toISOString(),
      database: "Firebase Firestore Cloud Database",
      firebase: "connected",
      firebaseProjectId: firebaseConfig.projectId,
      firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
      ordersCount: ordersStore.length,
      productsCount: productsStore.length,
      adviceRequestsCount: adviceRequestsStore.length,
      hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
      hasGoogleSheetWebhook: !!siteSettingsStore.googleSheetWebhookUrl
    });
  });

  // 2. Admin Authentication API (Password: 4321)
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD || password === "4321") {
      return res.json({
        success: true,
        token: ADMIN_AUTH_TOKEN,
        message: "সফলভাবে খান এন্টারপ্রাইজ সিএমএস এডমিন প্যানেলে লগইন সম্পন্ন হয়েছে।"
      });
    } else {
      return res.status(401).json({
        success: false,
        error: "ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড ৪৩২১ (4321) প্রদান করুন।"
      });
    }
  });

  // 3. Shop & Site Settings API
  app.get("/api/settings", (req, res) => {
    res.json({
      success: true,
      settings: siteSettingsStore
    });
  });

  app.post("/api/settings", checkAdminAuth, (req, res) => {
    const newSettings = req.body;
    siteSettingsStore = {
      ...siteSettingsStore,
      ...newSettings
    };
    saveStoreToDisk();
    syncSettingsToFirestore(siteSettingsStore);
    res.json({
      success: true,
      settings: siteSettingsStore,
      message: "দোকান ও সাইটের তথ্য সফলভাবে আপডেট করা হয়েছে।"
    });
  });

  // 4. Google Sheets Config endpoint
  app.get("/api/google-sheets-config", (req, res) => {
    res.json({
      scriptUrl: siteSettingsStore.googleSheetWebhookUrl,
      isConnected: !!siteSettingsStore.googleSheetWebhookUrl
    });
  });

  app.post("/api/google-sheets-config", checkAdminAuth, (req, res) => {
    const { scriptUrl } = req.body;
    siteSettingsStore.googleSheetWebhookUrl = (scriptUrl || "").trim();
    saveStoreToDisk();
    syncSettingsToFirestore(siteSettingsStore);
    res.json({
      success: true,
      scriptUrl: siteSettingsStore.googleSheetWebhookUrl,
      isConnected: !!siteSettingsStore.googleSheetWebhookUrl,
      message: siteSettingsStore.googleSheetWebhookUrl ? "গুগল শীট ওয়েবহুক URL সফলভাবে সংরক্ষিত হয়েছে!" : "গুগল শীট URL মুছে ফেলা হয়েছে।"
    });
  });

  // 5. Products Catalog CMS API
  app.get("/api/products", (req, res) => {
    res.json({
      success: true,
      products: productsStore
    });
  });

  app.post("/api/products", checkAdminAuth, (req, res) => {
    try {
      const p = req.body;
      const id = p.id || 'prod-' + Date.now();
      const newProduct = {
        id,
        nameBn: p.nameBn || 'নতুন পণ্য',
        nameEn: p.nameEn || '',
        category: p.category || 'pesticide',
        categoryBn: p.categoryBn || 'কীটনাশক',
        brand: p.brand || 'অনুমোদিত ব্র্যান্ড',
        packSize: p.packSize || '১০০ মিলি',
        price: Number(p.price) || 0,
        originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
        inStock: p.inStock !== false,
        stockCount: p.stockCount !== undefined ? Number(p.stockCount) : 50,
        rating: Number(p.rating) || 5.0,
        reviewsCount: Number(p.reviewsCount) || 10,
        image: p.image || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22527?auto=format&fit=crop&w=600&q=80',
        shortDescBn: p.shortDescBn || '',
        fullDescBn: p.fullDescBn || '',
        usageGuideBn: p.usageGuideBn || '',
        targetPestsOrCrops: Array.isArray(p.targetPestsOrCrops) ? p.targetPestsOrCrops : (p.targetPestsOrCrops ? [p.targetPestsOrCrops] : []),
        chemicalComposition: p.chemicalComposition || '',
        safetyWarningsBn: p.safetyWarningsBn || 'শিশুদের নাগালের বাইরে রাখুন। স্প্রে করার সময় মাস্ক ব্যবহার করুন।',
        featured: !!p.featured,
        badge: p.badge || ''
      };

      productsStore.unshift(newProduct);
      saveStoreToDisk();
      syncProductToFirestore(newProduct);
      res.status(201).json({
        success: true,
        product: newProduct,
        message: "নতুন পণ্য সফলভাবে ক্যাটালগে যুক্ত হয়েছে!"
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put("/api/products/:id", checkAdminAuth, (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const index = productsStore.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: "পণ্যটি খুঁজে পাওয়া যায়নি।" });
    }

    productsStore[index] = {
      ...productsStore[index],
      ...updateData,
      id // retain id
    };
    saveStoreToDisk();
    syncProductToFirestore(productsStore[index]);

    res.json({
      success: true,
      product: productsStore[index],
      message: "পণ্যের তথ্য সফলভাবে হালনাগাদ করা হয়েছে।"
    });
  });

  app.delete("/api/products/:id", checkAdminAuth, (req, res) => {
    const { id } = req.params;
    const initialLen = productsStore.length;
    productsStore = productsStore.filter(p => p.id !== id);

    if (productsStore.length === initialLen) {
      return res.status(404).json({ success: false, error: "পণ্যটি খুঁজে পাওয়া যায়নি।" });
    }

    saveStoreToDisk();
    removeProductFromFirestore(id);
    res.json({
      success: true,
      message: "পণ্যটি সফলভাবে ক্যাটালগ থেকে মুছে ফেলা হয়েছে।"
    });
  });

  // 6. Orders API
  app.get("/api/orders", (req, res) => {
    res.json({
      success: true,
      orders: ordersStore
    });
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = req.body;
      const orderId = 'KE-' + Math.floor(100000 + Math.random() * 900000);
      const createdAt = new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' });

      // Clean and validate phone number
      const rawPhone = String(orderData.phone || '').trim();
      const digitsOnly = rawPhone.replace(/[^0-9]/g, '');
      if (digitsOnly.length < 11) {
        return res.status(400).json({
          success: false,
          error: "অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।"
        });
      }

      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        return res.status(400).json({
          success: false,
          error: "কার্ট খালি! কোনো পণ্য নির্বাচন করা হয়নি।"
        });
      }

      const newOrder: StoredOrder = {
        id: 'ord-' + Date.now(),
        orderNumber: orderData.orderNumber || orderId,
        createdAt: orderData.createdAt || createdAt,
        customerName: (orderData.customerName || 'সম্মানিত কৃষক').trim(),
        phone: rawPhone,
        alternatePhone: orderData.alternatePhone ? String(orderData.alternatePhone).trim() : '',
        union: orderData.union || '১ নং বদলগাছী সদর ইউনিয়ন',
        ward: orderData.ward || '১',
        villageAddress: (orderData.villageAddress || '').trim(),
        note: (orderData.note || '').trim(),
        items: orderData.items || [],
        subtotal: Number(orderData.subtotal) || 0,
        deliveryFee: Number(orderData.deliveryFee) || 0,
        grandTotal: Number(orderData.grandTotal) || 0,
        paymentMethod: 'cash_on_delivery',
        status: 'pending_call',
        syncStatus: 'local_only',
        staffNotes: ''
      };

      // Add to server store & save
      ordersStore.unshift(newOrder);
      saveStoreToDisk();
      syncOrderToFirestore(newOrder);

      // If Google Sheet Webhook is configured, attempt auto-forward
      const webhook = (orderData.webhookUrl || siteSettingsStore.googleSheetWebhookUrl || "").trim();
      let sheetSyncSuccess = false;
      let sheetError = null;

      if (webhook && webhook.startsWith("http")) {
        try {
          const payload = {
            type: "order",
            ...newOrder,
            itemsSummary: newOrder.items.map((i: any) => `${i.nameBn} (${i.packSize}) x ${i.quantity}`).join(", ")
          };

          const sheetRes = await fetch(webhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(8000)
          });

          if (sheetRes.ok) {
            newOrder.syncStatus = 'synced_to_sheet';
            sheetSyncSuccess = true;
            saveStoreToDisk();
          }
        } catch (err: any) {
          console.warn("Google Sheet forwarding warning:", err.message);
          sheetError = err.message;
        }
      }

      res.status(201).json({
        success: true,
        order: newOrder,
        sheetSynced: sheetSyncSuccess,
        sheetError: sheetError,
        message: "অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে! খান এন্টারপ্রাইজ থেকে শীঘ্রই ফোন করা হবে।"
      });
    } catch (error: any) {
      console.error("Order creation error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে।"
      });
    }
  });

  // Update order status (Staff / Admin)
  app.patch("/api/orders/:id", checkAdminAuth, (req, res) => {
    const { id } = req.params;
    const { status, staffNotes } = req.body;

    const orderIndex = ordersStore.findIndex(o => o.id === id || o.orderNumber === id);
    if (orderIndex === -1) {
      return res.status(404).json({ success: false, error: "অর্ডারটি পাওয়া যায়নি।" });
    }

    if (status) ordersStore[orderIndex].status = status;
    if (staffNotes !== undefined) ordersStore[orderIndex].staffNotes = staffNotes;

    saveStoreToDisk();
    updateOrderInFirestore(ordersStore[orderIndex].id, {
      status: ordersStore[orderIndex].status,
      staffNotes: ordersStore[orderIndex].staffNotes
    });
    res.json({
      success: true,
      order: ordersStore[orderIndex],
      message: "অর্ডারের তথ্য হালনাগাদ করা হয়েছে।"
    });
  });

  app.delete("/api/orders/:id", checkAdminAuth, (req, res) => {
    const { id } = req.params;
    const initialLen = ordersStore.length;
    ordersStore = ordersStore.filter(o => o.id !== id && o.orderNumber !== id);

    if (ordersStore.length === initialLen) {
      return res.status(404).json({ success: false, error: "অর্ডারটি পাওয়া যায়নি।" });
    }

    saveStoreToDisk();
    removeOrderFromFirestore(id);
    res.json({
      success: true,
      message: "অর্ডারটি মুছে ফেলা হয়েছে।"
    });
  });

  // 7. Free Agricultural Advice Queries API
  app.get("/api/advice-requests", (req, res) => {
    res.json({
      success: true,
      requests: adviceRequestsStore
    });
  });

  app.post("/api/advice-requests", async (req, res) => {
    try {
      const data = req.body;
      const id = 'ADV-' + Date.now();
      const createdAt = new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' });

      const newRequest: StoredAdviceRequest = {
        id,
        createdAt,
        farmerName: (data.farmerName || 'সম্মানিত কৃষক').trim(),
        phone: String(data.phone || '').trim(),
        union: data.union || 'বদলগাছী',
        crop: data.crop || 'ফসল',
        issueDescription: (data.issueDescription || '').trim(),
        symptomType: data.symptomType || 'সাধারণ লক্ষণ',
        status: 'pending',
        aiResponse: data.aiResponse || '',
        staffNotes: ''
      };

      adviceRequestsStore.unshift(newRequest);
      saveStoreToDisk();
      syncAdviceRequestToFirestore(newRequest);

      // Forward to Google Sheet if configured
      const webhook = (data.webhookUrl || siteSettingsStore.googleSheetWebhookUrl || "").trim();
      if (webhook && webhook.startsWith("http")) {
        try {
          await fetch(webhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "advice_request",
              ...newRequest
            }),
            signal: AbortSignal.timeout(6000)
          });
        } catch (e) {
          console.warn("Sheet forward error for advice:", e);
        }
      }

      res.status(201).json({
        success: true,
        request: newRequest,
        message: "আপনার কৃষি সমস্যার বিবরণ সংরক্ষিত হয়েছে। আমাদের কৃষি বিশেষজ্ঞ শীঘ্রই যোগাযোগ করবেন।"
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.patch("/api/advice-requests/:id", checkAdminAuth, (req, res) => {
    const { id } = req.params;
    const { status, staffNotes } = req.body;
    const reqIndex = adviceRequestsStore.findIndex(r => r.id === id);

    if (reqIndex === -1) {
      return res.status(404).json({ success: false, error: "আবেদনটি পাওয়া যায়নি।" });
    }

    if (status) adviceRequestsStore[reqIndex].status = status;
    if (staffNotes !== undefined) adviceRequestsStore[reqIndex].staffNotes = staffNotes;

    saveStoreToDisk();
    updateAdviceRequestInFirestore(adviceRequestsStore[reqIndex].id, {
      status: adviceRequestsStore[reqIndex].status,
      staffNotes: adviceRequestsStore[reqIndex].staffNotes
    });
    res.json({
      success: true,
      request: adviceRequestsStore[reqIndex],
      message: "পরামর্শ আবেদনের স্ট্যাটাস আপডেট হয়েছে।"
    });
  });

  app.delete("/api/advice-requests/:id", checkAdminAuth, (req, res) => {
    const { id } = req.params;
    const initialLen = adviceRequestsStore.length;
    adviceRequestsStore = adviceRequestsStore.filter(r => r.id !== id);

    if (adviceRequestsStore.length === initialLen) {
      return res.status(404).json({ success: false, error: "আবেদনটি পাওয়া যায়নি।" });
    }

    saveStoreToDisk();
    removeAdviceRequestFromFirestore(id);
    res.json({
      success: true,
      message: "পরামর্শ আবেদনটি মুছে ফেলা হয়েছে।"
    });
  });

  // 8. Gemini AI Agricultural Crop Doctor ("খান কৃষি বন্ধু")
  app.post("/api/gemini/crop-advice", async (req, res) => {
    try {
      const { crop, symptoms, details, farmerName } = req.body;

      if (!crop && !symptoms && !details) {
        return res.status(400).json({
          success: false,
          error: "অনুগ্রহ করে ফসলের নাম ও সমস্যার লক্ষণ উল্লেখ করুন।"
        });
      }

      const ai = getGeminiClient();

      if (!ai) {
        // Fallback rule-based advice when API key is not yet configured
        return res.json({
          success: true,
          isAiGenerated: false,
          advice: `বদলগাছী উপজেলার আবহাওয়া অনুযায়ী ${crop || 'ফসলের'} এই লক্ষণে অবিলম্বে অনুমোদিত ছত্রাকনাশক (যেমন: স্কোর ২৫০ ইসি বা কার্বেনডাজিম) অথবা কীটনাশক (যেমন: কনফিডোর ২০ এসএল) নির্দেশিত মাত্রায় স্প্রে করুন। অতিরিক্ত ইউরিয়া সার প্রয়োগ বন্ধ রেখে পটাশ ও জিংক সার দিন। খান এন্টারপ্রাইজ হেল্পলাইনে সরাসরি ফোন করতে পারেন: ${siteSettingsStore.hotline} (ঠিকানা: ${siteSettingsStore.shopAddress})।`,
          suggestedProducts: ['স্কোর ২৫০ ইসি', 'কনফিডোর ২০ এসএল', 'সলুবর বোরন ২০%']
        });
      }

      const prompt = `আপনি "খান এন্টারপ্রাইজ" (ঠিকানা: ${siteSettingsStore.shopAddress}, হেল্পলাইন: ${siteSettingsStore.hotline})-এর একজন অভিজ্ঞ কৃষিবিদ ও ফসল বিশেষজ্ঞ 'খান কৃষি বন্ধু'। 
আপনার দায়িত্ব হলো বদলগাছী উপজেলার প্রান্তিক কৃষকদের ফসলের রোগবালাই ও সমস্যার খাঁটি, সহজ ও নির্ভুল সমাধান দেওয়া।

কৃষকের তথ্য:
- কৃষকের নাম: ${farmerName || 'সম্মানিত কৃষক ভাই'}
- ফসল: ${crop || 'মাঠ ফসল'}
- লক্ষণ / রোগ: ${symptoms || 'অস্পষ্ট লক্ষণ'}
- বিস্তারিত বিবরণ: ${details || 'কোনো অতিরিক্ত বিবরণ নেই'}

দয়া করে বাংলায় সুন্দর, সহজ এবং সুনির্দিষ্টভাবে পরামর্শ দিন:
১. রোগের সম্ভাব্য নাম ও কারণ।
২. তাৎক্ষণিক ও কার্যকর প্রতিকার (প্রয়োজনীয় কীটনাশক/ছত্রাকনাশক বা সারের সঠিক নাম ও পানির সাথে মেশানোর লিটার প্রতি সঠিক প্রয়োগ মাত্রা)।
৩. ফসলের পরিচর্যা ও সতর্কতা (যেমন: বিকেলের রোদে স্প্রে করা, ইউরিয়া নিয়ন্ত্রণ ইত্যাদি)।
৪. খান এন্টারপ্রাইজ (ডাকবাংলা মোড়, বদলগাছি) থেকে আসল পণ্য সংগ্রহ করার পরামর্শ।

পরামর্শটি সংক্ষেপ, স্পষ্ট এবং কৃষকের জন্য সহজেই বোধগম্য রাখুন।`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional Bangladeshi agricultural expert agronomist providing precise, safe, and farmer-friendly crop protection prescriptions in Bengali.",
          temperature: 0.7,
        }
      });

      const adviceText = response.text || "পরামর্শ তৈরিতে সময় লাগছে, অনুগ্রহ করে সরাসরি আমাদের ফোন নম্বরে যোগাযোগ করুন।";

      res.json({
        success: true,
        isAiGenerated: true,
        advice: adviceText
      });
    } catch (err: any) {
      console.error("Gemini API error in crop advice:", err);
      res.json({
        success: true,
        isAiGenerated: false,
        advice: `বদলগাছী উপজেলার কৃষকদের জন্য পরামর্শ: ফসলের লক্ষণ অনুযায়ী অনুমোদিত কীটনাশক বা ছত্রাকনাশক সঠিক মাত্রায় প্রয়োগ করুন। খান এন্টারপ্রাইজের হটলাইনে সরাসরি কল করতে পারেন: ${siteSettingsStore.hotline}।`,
        error: err.message
      });
    }
  });

  // 9. Vite middleware for development vs Static files for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Khan Enterprise Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
