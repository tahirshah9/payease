export interface LanguageContextType {
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    "merchant.dashboard": "Merchant Dashboard",
    "wallet.connect": "Connect Wallet",
    "wallet.disconnect": "Disconnect",
    "balance.title": "Current Balance",
    "sales.today": "Sales Today",
    "sales.week": "Sales This Week",
    "payment.request": "Request Payment",
    "amount.aed": "Amount (AED)",
    "generate.qr": "Generate QR Code",
    "recent.transactions": "Recent Transactions",
    "admin.panel": "Admin Panel",
    "customer": "Customer",
    "amount": "Amount",
    "points": "Points",
    "date": "Date",
    "payment.confirm": "Confirm Payment",
    "payment.success": "Payment Successful",
    "pay.with.wallet": "Pay with Wallet",
    "scan.to.pay": "Scan to Pay",
    "loyalty.balance": "Loyalty Points",
    "redeem.points": "Redeem Points",
    "home.tourist": "Tourist Payment Portal",
    "home.merchant": "Merchant Portal",
    "processing": "Processing..."
  },
  ar: {
    "merchant.dashboard": "لوحة تحكم التاجر",
    "wallet.connect": "ربط المحفظة",
    "wallet.disconnect": "فصل المحفظة",
    "balance.title": "الرصيد الحالي",
    "sales.today": "مبيعات اليوم",
    "sales.week": "مبيعات هذا الأسبوع",
    "payment.request": "طلب دفع",
    "amount.aed": "المبلغ (درهم)",
    "generate.qr": "إنشاء رمز الاستجابة السريعة",
    "recent.transactions": "المعاملات الأخيرة",
    "admin.panel": "لوحة الإدارة",
    "customer": "العميل",
    "amount": "المبلغ",
    "points": "النقاط",
    "date": "التاريخ",
    "payment.confirm": "تأكيد الدفع",
    "payment.success": "تم الدفع بنجاح",
    "pay.with.wallet": "الدفع عبر المحفظة",
    "scan.to.pay": "امسح للدفع",
    "loyalty.balance": "نقاط الولاء",
    "redeem.points": "استبدال النقاط",
    "home.tourist": "بوابة دفع السياح",
    "home.merchant": "بوابة التاجر",
    "processing": "جاري المعالجة..."
  }
};

export const getTranslation = (lang: 'en' | 'ar', key: string) => {
  // @ts-ignore
  return translations[lang][key] || key;
}
