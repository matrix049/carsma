'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'fr' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    fr: string;
    ar: string;
  };
}

const dictionary: Translations = {
  home: { en: 'Home', fr: 'Accueil', ar: 'الرئيسية' },
  contact: { en: 'Contact', fr: 'Contact', ar: 'اتصل بنا' },
  addToCart: { en: 'Add to Cart', fr: 'Ajouter au panier', ar: 'أضف إلى السلة' },
  unavailable: { en: 'Unavailable', fr: 'Indisponible', ar: 'غير متوفر' },
  checkout: { en: 'Checkout', fr: 'Caisse', ar: 'الدفع' },
  proceedToCheckout: { en: 'Proceed to Checkout', fr: 'Passer à la caisse', ar: 'التقدم للدفع' },
  shoppingCart: { en: 'Shopping Cart', fr: 'Panier', ar: 'سلة المشتريات' },
  emptyCart: { en: 'Your cart is empty', fr: 'Votre panier est vide', ar: 'سلة التسوق فارغة' },
  continueShopping: { en: 'Continue Shopping', fr: 'Continuer les achats', ar: 'مواصلة التسوق' },
  remove: { en: 'Remove', fr: 'Retirer', ar: 'إزالة' },
  orderSummary: { en: 'Order Summary', fr: 'Résumé de la commande', ar: 'ملخص الطلب' },
  subtotal: { en: 'Subtotal', fr: 'Sous-total', ar: 'المجموع الفرعي' },
  shipping: { en: 'Shipping', fr: 'Livraison', ar: 'الشحن' },
  total: { en: 'Total', fr: 'Total', ar: 'الإجمالي' },
  shippingNote: { en: 'Delivery available only inside Morocco', fr: 'Livraison disponible uniquement au Maroc', ar: 'التوصيل متاح داخل المغرب فقط' },
  shippingInfo: { en: 'Shipping Information', fr: 'Informations de livraison', ar: 'معلومات الشحن' },
  firstName: { en: 'First name', fr: 'Prénom', ar: 'الاسم الأول' },
  lastName: { en: 'Last name', fr: 'Nom', ar: 'الاسم العائلي' },
  email: { en: 'Email Address', fr: 'Adresse e-mail', ar: 'البريد الإلكتروني' },
  phone: { en: 'Phone', fr: 'Téléphone', ar: 'רقم الهاتف' },
  address: { en: 'Address', fr: 'Adresse', ar: 'العنوان' },
  city: { en: 'City', fr: 'Ville', ar: 'المدينة' },
  state: { en: 'State / Region', fr: 'Région', ar: 'الجهة' },
  zip: { en: 'Postal Code (Optional)', fr: 'Code postal (Optionnel)', ar: 'الرمز البريدي (اختياري)' },
  orderNotes: { en: 'Order Notes (Optional)', fr: 'Notes de commande (Optionnel)', ar: 'ملاحظات الطلب (اختياري)' },
  paymentMethod: { en: 'Payment Method', fr: 'Méthode de paiement', ar: 'طريقة الدفع' },
  cod: { en: 'Cash on Delivery', fr: 'Paiement à la livraison', ar: 'الدفع عند الاستلام' },
  placeOrder: { en: 'Place Order', fr: 'Passer la commande', ar: 'تأكيد الطلب' },
  processing: { en: 'Processing...', fr: 'Traitement...', ar: 'جاري المعالجة...' },
  backToArtworks: { en: 'Back to artworks', fr: 'Retour aux œuvres', ar: 'العودة إلى الأعمال الفنية' },
  featuredArtworks: { en: 'Featured Artworks', fr: 'Œuvres en vedette', ar: 'الأعمال الفنية المميزة' },
  exploreSelection: { en: 'Explore our curated selection of car posters.', fr: 'Découvrez notre sélection d\'affiches automobiles.', ar: 'استكشف مجموعتنا المختارة من ملصقات السيارات' },
  noArtworks: { en: 'No artworks found at the moment.', fr: 'Aucune œuvre trouvée pour le moment.', ar: 'لم يتم العثور على أعمال فنية في الوقت الحالي' },
  premiumWall: { en: 'Premium Automotive', fr: 'Automobile Premium', ar: 'سيارات فاخرة' },
  wallCollection: { en: 'Wall Collection', fr: 'Collection Murale', ar: 'مجموعة الحائط' },
  heroDesc: { 
    en: 'Elevate your space with exclusive, high-quality wall art featuring iconic automobiles.', 
    fr: 'Sublimez votre espace avec des œuvres murales automobiles exclusives de haute qualité.', 
    ar: 'ارتق بمساحتك مع أعمال فنية جدارية حصرية عالية الجودة للسيارات المميزة' 
  },
  shopCollection: { en: 'Shop Collection', fr: 'Acheter', ar: 'تسوق المجموعة' },
  outOfStock: { en: 'Out of Stock', fr: 'En rupture de stock', ar: 'نفد من المخزون' },
  freeShipping: { en: 'Delivery inside Morocco (+30 MAD)', fr: 'Livraison partout au Maroc (+30 MAD)', ar: 'توصيل داخل المغرب (+30 درهم)' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load saved lang on mount
  useEffect(() => {
    const saved = localStorage.getItem('carsma-language') as Language;
    if (saved && ['en', 'fr', 'ar'].includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('carsma-language', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  const t = (key: string): string => {
    if (dictionary[key]) {
      return dictionary[key][language];
    }
    return key; // fallback
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
