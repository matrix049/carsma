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
  // Navigation
  home: { en: 'Home', fr: 'Accueil', ar: 'الرئيسية' },
  shop: { en: 'Gallery', fr: 'Galerie', ar: 'ݣالوري' },
  contact: { en: 'Contact', fr: 'Contact', ar: 'اتصل بنا' },
  categories: { en: 'Categories', fr: 'Catégories', ar: 'الأصناف' },
  allCategories: { en: 'All Designs', fr: 'Toutes les Créations', ar: 'كلشي' },
  exploreGallery: { en: 'Explore Gallery', fr: 'Explorer la Galerie', ar: 'شوف الݣالوري' },
  featuredSelection: { en: 'Featured Selection', fr: 'Sélection Vedette', ar: 'تصاميم مختارة' },
  adminDashboard: { en: 'Admin Dashboard', fr: 'Tableau de bord', ar: 'لوحة التحكم' },
  
  // Shopping
  addToCart: { en: 'Add to Cart', fr: 'Ajouter au panier', ar: 'زيد ل-panier' },
  unavailable: { en: 'Unavailable', fr: 'Indisponible', ar: 'ماكاينش دابا' },
  checkout: { en: 'Checkout', fr: 'Paiement', ar: 'خلاص' },
  selectLanguage: { en: 'Language', fr: 'Langue', ar: 'اللغة / Darija' },
  proceedToCheckout: { en: 'Proceed to Checkout', fr: 'Passer au paiement', ar: 'كمل باش تخلص' },
  shoppingCart: { en: 'Shopping Cart', fr: 'Panier', ar: 'السلة ديالي' },
  emptyCart: { en: 'Your cart is empty', fr: 'Votre panier est vide', ar: 'السلة خاوية' },
  continueShopping: { en: 'Continue Shopping', fr: 'Continuer les achats', ar: 'رجع تقضا' },
  remove: { en: 'Remove', fr: 'Retirer', ar: 'حيد' },
  
  // Order Summary
  orderSummary: { en: 'Order Summary', fr: 'Résumé de la commande', ar: 'شنو غادي تشري' },
  subtotal: { en: 'Subtotal', fr: 'Sous-total', ar: 'المجموع' },
  shipping: { en: 'Shipping', fr: 'Livraison', ar: 'التوصيل' },
  total: { en: 'Total', fr: 'Total', ar: 'كولشي' },
  shippingNote: { en: 'Delivery available inside Morocco only', fr: 'Livraison disponible au Maroc uniquement', ar: 'التوصيل متاح غير فالمغرب' },
  shippingToMoroccoOnly: { en: 'Shipping to Morocco only', fr: 'Livraison au Maroc uniquement', ar: 'التوصيل كاين غير فالمغرب' },
  
  // Checkout Form
  shippingInfo: { en: 'Shipping Information', fr: 'Informations de livraison', ar: 'فين غادي نوصلو ليك' },
  firstName: { en: 'First name', fr: 'Prénom', ar: 'السمية' },
  lastName: { en: 'Last name', fr: 'Nom', ar: 'الكنية' },
  email: { en: 'Email Address', fr: 'Email', ar: 'الايميل' },
  phone: { en: 'Phone number', fr: 'Téléphone', ar: 'النمرة د التلفون' },
  address: { en: 'Address', fr: 'Adresse', ar: 'العنوان' },
  city: { en: 'City', fr: 'Ville', ar: 'المدينة' },
  state: { en: 'State / Region', fr: 'Région', ar: 'الجهة' },
  zip: { en: 'Postal Code (Optional)', fr: 'Code postal (Optionnel)', ar: 'كود بوستال (اختياري)' },
  orderNotes: { en: 'Order Notes (Optional)', fr: 'Notes (Optionnel)', ar: 'ملاحظات (اختياري)' },
  paymentMethod: { en: 'Payment Method', fr: 'Paiement', ar: 'كيفاش غادي تخلص' },
  cod: { en: 'Cash on Delivery', fr: 'Paiement à la livraison', ar: 'حتى توصلك عاد خلص (COD)' },
  placeOrder: { en: 'Confirm Order', fr: 'Confirmer la commande', ar: 'أكد الطلب' },
  processing: { en: 'Processing...', fr: 'Traitement...', ar: 'جاري المعالجة...' },
  
  // Validation & Errors
  invalidEmail: { en: 'Please enter a valid email address', fr: 'Email non valide', ar: 'الايميل ماشي صحيح' },
  orderFailed: { en: 'Failed to process order. Please try again.', fr: 'Une erreur est survenue. Réessayez.', ar: 'كاين مشكل، عاود جرب مرة اخرى' },
  somethingWentWrong: { en: 'Something went wrong. Please try again.', fr: 'Une erreur est survenue.', ar: 'كاين شي غلط، عاود جرب' },

  // Success States
  orderConfirmed: { en: 'Order Confirmed!', fr: 'Commande Confirmée !', ar: 'الطلب تحط بنجاح!' },
  orderSuccessDesc: { 
    en: 'Thank you for your purchase. We have received your order and will contact you shortly.', 
    fr: 'Merci pour votre achat. Nous avons reçu votre commande.', 
    ar: 'شكراً بزاف على الطلب ديالك. غادي نتصلو بيك دغيا باش نأكدو معاك.' 
  },

  // Home Page
  backToArtworks: { en: 'Back to artworks', fr: 'Retour aux œuvres', ar: 'رجع للأعمال الفنية' },
  featuredArtworks: { en: 'Featured Artworks', fr: 'Œuvres en vedette', ar: 'تصاميم مميزة' },
  exploreSelection: { en: 'Exclusive automotive wall art for your space.', fr: 'Art mural exclusif pour votre espace.', ar: 'تصاميم حصرية للطموبيلات باش تزوق الحيط' },
  noArtworks: { en: 'No artworks found at the moment.', fr: 'Aucune œuvre trouvée.', ar: 'ماكاينش أعمال دابا' },
  premiumWall: { en: 'Premium', fr: 'Premium', ar: 'تصاميم' },
  wallCollection: { en: 'Collection', fr: 'Collection', ar: 'واعرة' },
  heroDesc: { 
    en: 'Elevate your space with exclusive, gallery-grade automotive art.', 
    fr: 'Sublimez votre espace avec des œuvres murales premium.', 
    ar: 'ديكور واعر للحيط ديالك مع تصاميم طموبيلات طوب' 
  },
  shopCollection: { en: 'Shop Now', fr: 'Acheter', ar: 'تقضا دابا' },
  outOfStock: { en: 'Out of Stock', fr: 'En rupture', ar: 'تقضا' },

  // Contact Page
  contactDesc: { 
    en: 'Have a question about our premium wall art or your order? Fill out the form below and we\'ll get back to you as soon as possible.', 
    fr: 'Avez-vous une question ? Remplissez le formulaire ci-dessous.', 
    ar: 'عندك شي سؤال؟ عمر هاد الفورم وغادي نجاوبوك دغيا.' 
  },
  sendMessage: { en: 'Send Message', fr: 'Envoyer', ar: 'صيفط الميساج' },
  messageLabel: { en: 'Message', fr: 'Message', ar: 'الميساج' },
  address: { en: 'Address', fr: 'Adresse', ar: 'العنوان' },
  
  // Feature Section
  qualityTitle: { en: 'Gallery Quality', fr: 'Qualité Galerie', ar: 'جودة عالية' },
  qualityDesc: { en: 'Museum-grade paper and archival inks.', fr: 'Papier de qualité musée.', ar: 'ورق ممتاز وحبر كيصبر بزاف' },
  deliveryTitle: { en: 'Secure Delivery', fr: 'Livraison Sécurisée', ar: 'توصيل مضمن' },
  deliveryDesc: { en: 'Reinforced packaging for maximum protection.', fr: 'Emballage renforcé.', ar: 'تغليف صحيح باش يوصلك داكشي هوا هداك' },
  exclusiveTitle: { en: 'Exclusive Designs', fr: 'Designs Exclusifs', ar: 'تصاميم حصرية' },
  exclusiveDesc: { en: 'Unique artworks designed by enthusiasts.', fr: 'Œuvres uniques.', ar: 'تصاميم فريدة كديرهم غير ل7يت' },

  // Customization
  customDesignTitle: { en: 'Custom Design?', fr: 'Design personnalisé ?', ar: 'بغيتي تصميم ديالك؟' },
  customDesignDesc: { 
    en: 'Contact us for a specific car or a unique artwork tailored just for you.', 
    fr: 'Contactez-nous pour une œuvre d\'art unique.', 
    ar: 'تواصل معنا إلى بغيتي شي طوموبيل معينة ولا تصميم خاص بيك بوهدك' 
  },
  contactUsNow: { en: 'Contact Us Now', fr: 'Contactez-nous', ar: 'تواصل معنا دابا' },
  customizeYourDesign: { en: 'Request Custom Art', fr: 'Personnaliser', ar: 'طلب تصميم خاص' },
  customizationRequest: { en: 'Customization Request', fr: 'Demande personnalisée', ar: 'طلب تصميم خاص' },
  carBrand: { en: 'Car Brand/Name', fr: 'Marque', ar: 'ماركة الطوموبيل' },
  carModel: { en: 'Car Model', fr: 'Modèle', ar: 'الموديل' },
  carYear: { en: 'Model Year', fr: 'Année', ar: 'العام' },
  submitRequest: { en: 'Submit Request', fr: 'Envoyer', ar: 'إرسال الطلب' },
  requestSuccess: { en: 'Request Sent Successfully!', fr: 'Demande envoyée !', ar: 'الطلب صيفطت بنجاح!' },
  requestSuccessDesc: { 
    en: 'We have received your custom request and will contact you soon.', 
    fr: 'Nous avons reçu votre demande et vous contacterons bientôt.', 
    ar: 'وصلنا الطلب ديالك، غادي نتصلو بيك فاقرب وقت باش نهضرو' 
  },
  
  // Footer & Misc
  connect: { en: 'Connect', fr: 'Contact', ar: 'تواصل معنا' },
  supportLabel: { en: 'Support', fr: 'Assistance', ar: 'المساعدة' },
  adminCustomOrders: { en: 'Custom Orders', fr: 'Commandes Perso', ar: 'الطلبات المخصصة' },
  orderId: { en: 'Order ID & Date', fr: 'ID Commande', ar: 'رقم الطلب' },
  customerDetails: { en: 'Customer Details', fr: 'Client', ar: 'معلومات الكليان' },
  actions: { en: 'Actions', fr: 'Actions', ar: 'تحكم' },
  status: { en: 'Status', fr: 'Statut', ar: 'الحالة' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('l7it-language') as Language;
    if (saved && ['en', 'fr', 'ar'].includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('l7it-language', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  const t = (key: string): string => {
    if (dictionary[key]) {
      return dictionary[key][language];
    }
    return key;
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
