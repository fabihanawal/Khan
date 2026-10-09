export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * খান এন্টারপ্রাইজ (Khan Enterprise) - বদলগাছী, নওগাঁ
 * Google Apps Script - ই-কমার্স অর্ডার ও কৃষি পরামর্শ ডাটাবেজ ইন্টিগ্রেশন
 * 
 * এটি আপনার গুগল স্প্রেডশীটে "Orders" এবং "Advice_Requests" নামক দুটি ট্যাবে
 * স্বয়ংক্রিয়ভাবে ডাটা সেভ করবে।
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    // ১. যদি এটি একটি অর্ডার (Order) হয়:
    if (data.type === 'order' || data.orderNumber) {
      var orderSheet = doc.getSheetByName("Orders");
      if (!orderSheet) {
        orderSheet = doc.insertSheet("Orders");
        orderSheet.appendRow([
          "অর্ডার আইডি (Order ID)",
          "তারিখ ও সময় (Date/Time)",
          "কৃষকের নাম (Customer Name)",
          "মোবাইল নম্বর (Phone)",
          "বিকল্প মোবাইল (Alt Phone)",
          "ইউনিয়ন (Union)",
          "ওয়ার্ড নং (Ward)",
          "গ্রাম / বিস্তারিত ঠিকানা (Address)",
          "পণ্যের বিবরণ (Ordered Products)",
          "মোট পরিমাণ (Total Items)",
          "পণ্যের মূল্য (Subtotal ৳)",
          "ডেলিভারি চার্জ (Delivery Fee ৳)",
          "সর্বমোট মূল্য (Grand Total ৳)",
          "পেমেন্ট মাধ্যম (Payment)",
          "অর্ডার স্ট্যাটাস (Status)",
          "কৃষকের বিশেষ নির্দেশনা (Customer Note)"
        ]);
        // Format Header
        orderSheet.getRange(1, 1, 1, 16).setFontWeight("bold").setBackground("#10b981").setFontColor("#ffffff");
      }

      var itemsList = "";
      if (Array.isArray(data.items)) {
        itemsList = data.items.map(function(item) {
          return item.nameBn + " (" + item.packSize + ") x " + item.quantity + " = ৳" + item.total;
        }).join(" | ");
      } else {
        itemsList = data.itemsSummary || "";
      }

      orderSheet.appendRow([
        data.orderNumber || ("KE-" + new Date().getTime()),
        data.createdAt || new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" }),
        data.customerName || "",
        data.phone || "",
        data.alternatePhone || "-",
        data.union || "",
        "ওয়ার্ড " + (data.ward || ""),
        data.villageAddress || "",
        itemsList,
        data.totalItemsCount || (data.items ? data.items.length : 1),
        data.subtotal || 0,
        data.deliveryFee || 0,
        data.grandTotal || 0,
        "ক্যাশ অন ডেলিভারি (পণ্য পেয়ে টাকা)",
        "অপেক্ষমান (কল দিয়ে কনফার্ম করুন)",
        data.note || "-"
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        "result": "success",
        "message": "অর্ডারটি সফলভাবে গুগল শীটে যুক্ত হয়েছে!",
        "orderNumber": data.orderNumber
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ২. যদি এটি কৃষি পরামর্শের আবেদন (Advice Request) হয়:
    else if (data.type === 'advice_request' || data.issueDescription) {
      var adviceSheet = doc.getSheetByName("Advice_Requests");
      if (!adviceSheet) {
        adviceSheet = doc.insertSheet("Advice_Requests");
        adviceSheet.appendRow([
          "আইডি (ID)",
          "তারিখ ও সময় (Date)",
          "কৃষকের নাম (Farmer Name)",
          "মোবাইল নম্বর (Phone)",
          "ইউনিয়ন (Union)",
          "ফসলের নাম (Crop)",
          "সমস্যার বিবরণ (Problem Description)",
          "লক্ষণ (Symptom)",
          "স্ট্যাটাস (Status)"
        ]);
        adviceSheet.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#059669").setFontColor("#ffffff");
      }

      adviceSheet.appendRow([
        "ADV-" + new Date().getTime(),
        data.createdAt || new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" }),
        data.farmerName || "",
        data.phone || "",
        data.union || "",
        data.crop || "",
        data.issueDescription || "",
        data.symptomType || "সাধারণ",
        "পরামর্শের জন্য কল দেওয়া বাকি"
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        "result": "success",
        "message": "পরামর্শের অনুরোধ সফলভাবে গুগল শীটে জমা হয়েছে!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Default fallback
    return ContentService.createTextOutput(JSON.stringify({
      "result": "unknown_payload",
      "data": data
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error",
      "error": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    "status": "online",
    "service": "Khan Enterprise Badalgachi Google Apps Script API",
    "timestamp": new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
`;

export const GOOGLE_SHEETS_TUTORIAL_STEPS = [
  {
    step: 1,
    titleBn: 'নতুন গুগল স্প্রেডশীট (Google Sheet) খুলুন',
    descBn: 'আপনার গুগল ড্রাইভে গিয়ে sheets.new টাইপ করে একটি নতুন Google Sheet খুলুন এবং নাম দিন "খান এন্টারপ্রাইজ অর্ডার বুকিং - বদলগাছী"।'
  },
  {
    step: 2,
    titleBn: 'Extensions > Apps Script অপশনে যান',
    descBn: 'শীটের মেনুবার থেকে Extensions (এক্সটেনশন) এ ক্লিক করে Apps Script অপশনটিতে চাপ দিন।'
  },
  {
    step: 3,
    titleBn: 'কোড কপি করে পেস্ট করুন',
    descBn: 'Apps Script এডিটরটিতে থাকা আগের কোড মুছে দিয়ে উপরের "Apps Script কোডটি কপি করুন" বাটনে ক্লিক করে পুরো কোডটি পেস্ট করুন এবং Save আইকনে চাপুন।'
  },
  {
    step: 4,
    titleBn: 'Deploy as Web App হিসেবে প্রকাশ করুন',
    descBn: 'উপরের ডানপাশের Deploy (ডিপ্লয়) বাটন > New deployment > নির্বাচন করুন "Web app"। Description এ লিখুন "Khan Enterprise V1"।'
  },
  {
    step: 5,
    titleBn: 'অ্যাক্সেস পারমিশন নির্বাচন করুন (জরুরি)',
    descBn: 'Execute as: "Me (আপনার ইমেইল)" এবং Who has access: অবশ্যই "Anyone" (যে কেউ) নির্বাচন করুন। এরপর Deploy বাটনে চাপুন।'
  },
  {
    step: 6,
    titleBn: 'ওয়েব অ্যাপ URL কপি করে এখানে সেট করুন',
    descBn: 'ডিপ্লয় সম্পন্ন হলে পাওয়া Web App URL টি কপি করে এই ওয়েবসাইটের "গুগল শীট সংযোগ সেটিংস"-এ পেস্ট করে সংরক্ষণ করুন। ব্যস! প্রতিটি নতুন অর্ডার সাথে সাথে আপনার গুগল শীটে চলে যাবে!'
  }
];
