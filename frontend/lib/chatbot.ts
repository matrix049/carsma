/**
 * Chat assistant — built-in content and instant answers.
 *
 * The common questions (colours, prices, delivery, sizes, 2D/3D, custom
 * pieces…) are answered right here, instantly and without using the AI
 * quota. Anything else goes to the backend (/api/chat), which answers from
 * the same shop rules (backend/src/services/shopKnowledge.ts) — keep the two
 * in sync when a policy changes.
 */
import { brandOf, findBrand } from '@/lib/brands';

export type ChatLang = 'darija' | 'fr' | 'en' | 'ar';

export const CHAT_LANGUAGES: { id: ChatLang; label: string; sub: string; rtl: boolean }[] = [
  { id: 'darija', label: 'الدارجة', sub: 'Darija', rtl: true },
  { id: 'fr', label: 'Français', sub: 'French', rtl: false },
  { id: 'en', label: 'English', sub: 'English', rtl: false },
  { id: 'ar', label: 'العربية', sub: 'Arabic', rtl: true },
];

export type TopicId =
  | 'custom'
  | 'colors'
  | 'price'
  | 'delivery'
  | 'payment'
  | 'size'
  | 'style'
  | 'returns'
  | 'hang'
  | 'location'
  | 'order'
  | 'howto'
  | 'human'
  | 'greet'
  | 'thanks';

/** Quick-question chips, in display order. */
export const CHIP_TOPICS = ['custom', 'price', 'colors', 'delivery', 'size', 'style', 'human'] as const;
export type ChipTopic = (typeof CHIP_TOPICS)[number];

export type FlowStep = 'item' | 'side' | 'style' | 'color' | 'otherColor';

interface Strings {
  subtitle: string;
  hello: string;
  placeholder: string;
  typing: string;
  slow: string;
  newChat: string;
  send: string;
  chips: Record<ChipTopic, string>;
  answers: Record<Exclude<TopicId, 'custom'>, string> & { priceNoInfo: string; fallback: string };
  flow: {
    intro: string;
    item: string;
    side: string;
    sides: [string, string, string, string];
    style: string;
    styles: [string, string, string];
    color: string;
    colors: [string, string, string];
    otherColor: string;
    summary: string;
    labels: { item: string; side: string; style: string; color: string };
    deposit: string;
    sendToTeam: string;
    edit: string;
    other: string;
  };
  handoff: {
    offer: string;
    button: string;
    title: string;
    name: string;
    phone: string;
    note: string;
    submit: string;
    sending: string;
    cancel: string;
    done: string;
    error: string;
  };
  viewPiece: string;
}

export const STRINGS: Record<ChatLang, Strings> = {
  darija: {
    subtitle: 'متصل · 24/7',
    hello: 'مرحبا بيك ف L7IT 👋 سولني على أي حاجة: الثمن، التوصيل، الألوان، ولا طوموبيل خاصة بيك.',
    placeholder: 'كتب سؤالك هنا…',
    typing: 'كنكتب…',
    slow: 'غير شوية…',
    newChat: 'محادثة جديدة',
    send: 'صيفط',
    chips: {
      custom: 'ديرو ليا طوموبيلتي',
      price: 'شحال الثمن؟',
      colors: 'الألوان',
      delivery: 'التوصيل والخلاص',
      size: 'المقاس والمادة',
      style: '2D ولا 3D؟',
      human: 'نهضر مع الفريق',
    },
    answers: {
      colors: 'الكحل والبيض ديما ممكنين ✅. شي لون آخر خاص الفريق يتأكد واش ممكن، ومن بعد كنجاوبوك.',
      price: 'القطع ديال الكاتالوغ ما بين {min} و {max} درهم، والثمن مكتوب على كل لوحة. الطلبات الخاصة كيتحدد ثمنها حسب التصميم، المقاس، و 2D ولا 3D.',
      priceNoInfo: 'الثمن مكتوب على كل لوحة ف الكاراج. الطلبات الخاصة كيتحدد ثمنها حسب التصميم، المقاس، و 2D ولا 3D.',
      delivery: 'كنوصلو لكاع مدن المغرب ف 24 ساعة حتى 3 أيام، والتوصيل فابور 🚚. كيوصلك رقم التتبع ملي تخرج الكوموند.',
      payment: 'القطع ديال الكاتالوغ كتخلصها ملي توصلك، ما كتخلص والو قبل. القطع الخاصة لي ماكايناش ف الكاتالوغ كنطلبو فيها تسبيق جزئي (ماشي الثمن كامل).',
      size: 'المقاس العادي 120×35 سم، وكاين حتى 120×50 سم. مصنوعة من Alucobond 3 مم بطباعة UV، مثقوبة وواجدة للتعليق بلا إطار.',
      style: '2D هي الأرخص. 3D فيها عمق وخدمة كثر، داكشي علاش ثمنها كثر. بجوج كيبانو زوينين ف الحيط 😉',
      returns: 'كل لوحة كتصاوب خصيصا ليك، داكشي علاش ما كنقبلوش الإرجاع. سولنا على أي حاجة قبل ما تكوموندي.',
      hang: 'اللوحة كتجي مثقوبة وواجدة للتعليق، ما محتاجاش إطار. بعدها من الشمس والرطوبة ونقيها بشيفون ناشف.',
      location: 'الستوديو ديالنا ف سلا، وكنوصلو لكاع المغرب. تقدر تكوموندي من السيت ولا ف الواتساب.',
      order: 'ما نقدرش نشوف الكوموندات من هنا. صيفط لينا سميتك ورقمك والفريق يتأكد ليك، ولا كلمنا ف الواتساب.',
      howto: 'ساهلة: زيد اللوحة للسلة ف السيت، دوز للكوموند (السمية، التيليفون، العنوان والمدينة) وخلص ملي توصلك. ولا كوموندي معانا ف الواتساب.',
      human: 'واخا! صيفط لينا سميتك ورقمك والفريق يتاصل بيك.',
      greet: 'وعليكم السلام 👋 كيفاش نقدر نعاونك؟',
      thanks: 'بلا جميل 🙏 إلا بغيتي شي حاجة أخرى، أنا هنا.',
      fallback: 'سمحلي، ما قدرتش نجاوب دابا. تقدر تصيفط سؤالك للفريق ولا تكلمنا ف الواتساب.',
    },
    flow: {
      intro: 'أكيد نقدرو 💪 نديرو أي حاجة: طوموبيل، لوغو، طيارة… غير جاوبني على شي أسئلة صغار.',
      item: 'شنو بغيتي نديرو ليك؟ كتب الطوموبيل، الموديل والعام (مثلا: Golf 7 R 2018)، ولا وصف اللوغو.',
      side: 'منين بغيتي تبان؟',
      sides: ['من القدام', 'من الجنب', 'من اللور', 'نصحوني'],
      style: '2D ولا 3D؟ 2D هي الأرخص، و 3D غالية شوية حيت فيها خدمة كثر.',
      styles: ['2D', '3D', 'نصحوني'],
      color: 'شنو اللون؟ الكحل والبيض ديما ممكنين، الألوان الأخرى خاص الفريق يتأكد منها.',
      colors: ['كحل', 'بيض', 'لون آخر'],
      otherColor: 'شمن لون بغيتي؟',
      summary: 'ها الطلب ديالك:',
      labels: { item: 'الطلب', side: 'الجهة', style: 'النوع', color: 'اللون' },
      deposit: 'ملاحظة: القطع الخاصة لي ماكايناش ف الكاتالوغ كنطلبو فيها تسبيق جزئي قبل ما نبداو.',
      sendToTeam: 'صيفط للفريق',
      edit: 'بدل',
      other: 'سؤال آخر',
    },
    handoff: {
      offer: 'بغيتي نصيفط هاد المحادثة للفريق باش يجاوبوك؟',
      button: 'صيفط للفريق',
      title: 'صيفط للفريق',
      name: 'السمية',
      phone: 'التيليفون',
      note: 'زيد شي حاجة (اختياري)',
      submit: 'صيفط',
      sending: 'كنصيفط…',
      cancel: 'رجوع',
      done: 'وصلنا الطلب ديالك ✅ الفريق غادي يتاصل بيك قريب.',
      error: 'وقع مشكل، عاود جرب ولا كلمنا ف الواتساب.',
    },
    viewPiece: 'شوف',
  },
  fr: {
    subtitle: 'En ligne · 24/7',
    hello: 'Bienvenue chez L7IT 👋 Posez-moi vos questions : prix, livraison, couleurs ou une voiture sur mesure.',
    placeholder: 'Écrivez votre question…',
    typing: 'En train d’écrire…',
    slow: 'Encore un instant…',
    newChat: 'Nouvelle discussion',
    send: 'Envoyer',
    chips: {
      custom: 'Ma voiture sur mesure',
      price: 'Prix',
      colors: 'Couleurs',
      delivery: 'Livraison & paiement',
      size: 'Taille & matière',
      style: '2D ou 3D ?',
      human: 'Parler à l’équipe',
    },
    answers: {
      colors: 'Le noir et le blanc sont toujours possibles ✅. Pour une autre couleur, l’équipe doit vérifier si c’est faisable, puis on vous répond.',
      price: 'Les pièces du catalogue sont entre {min} et {max} MAD, le prix est indiqué sur chaque pièce. Pour le sur-mesure, le prix dépend du design, de la taille et du 2D/3D.',
      priceNoInfo: 'Le prix est indiqué sur chaque pièce du Garage. Pour le sur-mesure, il dépend du design, de la taille et du 2D/3D.',
      delivery: 'Livraison dans toutes les villes du Maroc en 24 h à 3 jours, gratuite 🚚. Vous recevez un numéro de suivi à l’expédition.',
      payment: 'Les pièces du catalogue se paient à la livraison, rien à payer avant. Pour le sur-mesure hors catalogue, on demande une avance partielle (pas le prix complet).',
      size: 'Taille standard 120 × 35 cm, aussi en 120 × 50 cm. Alucobond 3 mm imprimé UV, prépercé et prêt à accrocher, sans cadre.',
      style: 'Le 2D est le moins cher. Le 3D a du relief et demande plus de travail, donc il coûte plus cher.',
      returns: 'Chaque pièce est fabriquée sur commande, nous n’acceptons donc pas les retours. Posez-nous vos questions avant de commander.',
      hang: 'La pièce arrive prépercée, prête à accrocher, sans cadre. Évitez le soleil direct et l’humidité ; nettoyez avec un chiffon sec.',
      location: 'Notre studio est à Salé et nous livrons partout au Maroc. Commandez sur le site ou sur WhatsApp.',
      order: 'Je ne peux pas voir les commandes ici. Envoyez votre nom et numéro à l’équipe et elle vérifiera, ou écrivez-nous sur WhatsApp.',
      howto: 'C’est simple : ajoutez la pièce au panier sur le site, passez commande (nom, téléphone, adresse, ville) et payez à la livraison. Ou commandez sur WhatsApp.',
      human: 'Avec plaisir ! Laissez votre nom et numéro, l’équipe vous contacte.',
      greet: 'Bonjour 👋 Comment puis-je vous aider ?',
      thanks: 'Avec plaisir 🙏 Je reste là si vous avez une autre question.',
      fallback: 'Désolé, je ne peux pas répondre pour le moment. Envoyez votre question à l’équipe ou écrivez-nous sur WhatsApp.',
    },
    flow: {
      intro: 'Bien sûr 💪 On fait tout : voiture, logo, avion… Quelques petites questions :',
      item: 'Qu’est-ce qu’on vous fait ? Écrivez la voiture, le modèle et l’année (ex. Golf 7 R 2018), ou décrivez le logo.',
      side: 'Quel côté ?',
      sides: ['De face', 'De profil', 'De l’arrière', 'Conseillez-moi'],
      style: '2D ou 3D ? Le 2D est moins cher, le 3D coûte plus car il demande plus de travail.',
      styles: ['2D', '3D', 'Conseillez-moi'],
      color: 'Quelle couleur ? Le noir et le blanc sont toujours possibles ; les autres couleurs sont à confirmer par l’équipe.',
      colors: ['Noir', 'Blanc', 'Autre couleur'],
      otherColor: 'Quelle couleur souhaitez-vous ?',
      summary: 'Votre demande :',
      labels: { item: 'Demande', side: 'Côté', style: 'Style', color: 'Couleur' },
      deposit: 'À noter : pour les pièces sur mesure hors catalogue, on demande une avance partielle avant de commencer.',
      sendToTeam: 'Envoyer à l’équipe',
      edit: 'Modifier',
      other: 'Autre question',
    },
    handoff: {
      offer: 'Voulez-vous que j’envoie cette conversation à l’équipe ?',
      button: 'Envoyer à l’équipe',
      title: 'Envoyer à l’équipe',
      name: 'Nom',
      phone: 'Téléphone',
      note: 'Ajouter un détail (facultatif)',
      submit: 'Envoyer',
      sending: 'Envoi…',
      cancel: 'Retour',
      done: 'Demande bien reçue ✅ L’équipe vous contactera très vite.',
      error: 'Un problème est survenu. Réessayez ou écrivez-nous sur WhatsApp.',
    },
    viewPiece: 'Voir',
  },
  en: {
    subtitle: 'Online · 24/7',
    hello: 'Welcome to L7IT 👋 Ask me anything: prices, delivery, colours or a custom car.',
    placeholder: 'Type your question…',
    typing: 'Typing…',
    slow: 'Just a moment…',
    newChat: 'New chat',
    send: 'Send',
    chips: {
      custom: 'Make my car',
      price: 'Prices',
      colors: 'Colours',
      delivery: 'Delivery & payment',
      size: 'Size & material',
      style: '2D or 3D?',
      human: 'Talk to the team',
    },
    answers: {
      colors: 'Black and white are always possible ✅. For any other colour, the team checks if it can be done and gets back to you.',
      price: 'Catalogue pieces are {min}–{max} MAD; the price is on each piece. Custom work is priced on the design, size and 2D/3D.',
      priceNoInfo: 'The price is shown on each piece in the Garage. Custom work is priced on the design, size and 2D/3D.',
      delivery: 'We deliver to every city in Morocco in 24 hours to 3 days, free 🚚. You get a tracking number when it ships.',
      payment: 'Catalogue pieces are paid cash on delivery — nothing upfront. Custom pieces outside the catalogue need a partial advance payment (not the full price).',
      size: 'Standard size is 120 × 35 cm, also 120 × 50 cm. 3 mm Alucobond with UV print, pre-drilled and ready to hang — no frame needed.',
      style: '2D is the cheaper option. 3D has real depth and takes more work, so it costs more.',
      returns: 'Every piece is made to order, so we can’t accept returns. Ask us anything before you order.',
      hang: 'It arrives pre-drilled and ready to hang, no frame needed. Keep it out of direct sun and moisture; wipe with a soft dry cloth.',
      location: 'Our studio is in Salé and we deliver anywhere in Morocco. Order on the website or on WhatsApp.',
      order: 'I can’t see orders from here. Send your name and number to the team and they’ll check it, or message us on WhatsApp.',
      howto: 'Easy: add the piece to your cart on the site, check out (name, phone, address, city) and pay when it arrives. Or order with us on WhatsApp.',
      human: 'Sure! Leave your name and number and the team will contact you.',
      greet: 'Hi 👋 How can I help?',
      thanks: 'You’re welcome 🙏 I’m here if you need anything else.',
      fallback: 'Sorry, I can’t answer right now. Send your question to the team or message us on WhatsApp.',
    },
    flow: {
      intro: 'Of course 💪 We make anything: cars, logos, planes… A few quick questions:',
      item: 'What should we make? Write the car, model and year (e.g. Golf 7 R 2018), or describe the logo.',
      side: 'Which side?',
      sides: ['Front', 'Side', 'Rear', 'Not sure, advise me'],
      style: '2D or 3D? 2D is cheaper; 3D costs more because it takes more work.',
      styles: ['2D', '3D', 'Advise me'],
      color: 'Which colour? Black and white are always possible; other colours need a check by the team.',
      colors: ['Black', 'White', 'Another colour'],
      otherColor: 'Which colour would you like?',
      summary: 'Your request:',
      labels: { item: 'Item', side: 'Side', style: 'Style', color: 'Colour' },
      deposit: 'Note: custom pieces outside the catalogue need a partial advance payment before we start.',
      sendToTeam: 'Send to the team',
      edit: 'Edit',
      other: 'Ask something else',
    },
    handoff: {
      offer: 'Want me to send this conversation to the team?',
      button: 'Send to the team',
      title: 'Send to the team',
      name: 'Name',
      phone: 'Phone',
      note: 'Add a detail (optional)',
      submit: 'Send',
      sending: 'Sending…',
      cancel: 'Back',
      done: 'Request received ✅ The team will contact you soon.',
      error: 'Something went wrong. Try again or message us on WhatsApp.',
    },
    viewPiece: 'View',
  },
  ar: {
    subtitle: 'متصل · 24/7',
    hello: 'مرحبًا بك في L7IT 👋 اسألني عن الأسعار، التوصيل، الألوان أو تصميم سيارة خاصة.',
    placeholder: 'اكتب سؤالك…',
    typing: 'يكتب…',
    slow: 'لحظة من فضلك…',
    newChat: 'محادثة جديدة',
    send: 'إرسال',
    chips: {
      custom: 'صمموا سيارتي',
      price: 'الأسعار',
      colors: 'الألوان',
      delivery: 'التوصيل والدفع',
      size: 'المقاس والمادة',
      style: '2D أم 3D؟',
      human: 'التحدث مع الفريق',
    },
    answers: {
      colors: 'اللونان الأسود والأبيض متاحان دائمًا ✅. أي لون آخر يحتاج تأكيد الفريق أولًا ثم نرد عليك.',
      price: 'أسعار قطع الكتالوج بين {min} و{max} درهم، والسعر مكتوب على كل قطعة. أما التصاميم الخاصة فيُحدد سعرها حسب التصميم والمقاس و2D أو 3D.',
      priceNoInfo: 'السعر مكتوب على كل قطعة في المعرض. أما التصاميم الخاصة فيُحدد سعرها حسب التصميم والمقاس و2D أو 3D.',
      delivery: 'نوصل إلى جميع مدن المغرب خلال 24 ساعة إلى 3 أيام، والتوصيل مجاني 🚚. يصلك رقم التتبع عند الشحن.',
      payment: 'قطع الكتالوج تُدفع عند الاستلام دون أي دفعة مسبقة. أما القطع الخاصة خارج الكتالوج فتتطلب دفعة مسبقة جزئية (وليس السعر كاملًا).',
      size: 'المقاس القياسي 120 × 35 سم، ومتوفر أيضًا 120 × 50 سم. لوح ألوكوبوند 3 مم بطباعة UV، مثقوب وجاهز للتعليق دون إطار.',
      style: '2D هو الخيار الأرخص. 3D فيه عمق حقيقي ويتطلب عملًا أكثر، لذلك سعره أعلى.',
      returns: 'كل قطعة تُصنع حسب الطلب، لذلك لا نقبل الإرجاع. اسألنا قبل الطلب.',
      hang: 'تصل القطعة مثقوبة وجاهزة للتعليق دون إطار. أبعدها عن الشمس المباشرة والرطوبة، ونظفها بقطعة قماش جافة.',
      location: 'الاستوديو في سلا، ونوصل لكل المغرب. اطلب من الموقع أو عبر واتساب.',
      order: 'لا أستطيع رؤية الطلبات من هنا. أرسل اسمك ورقمك للفريق ليتحقق، أو راسلنا عبر واتساب.',
      howto: 'الأمر سهل: أضف القطعة إلى السلة في الموقع، أكمل الطلب (الاسم، الهاتف، العنوان، المدينة) وادفع عند الاستلام. أو اطلب عبر واتساب.',
      human: 'بكل سرور! اترك اسمك ورقمك وسيتصل بك الفريق.',
      greet: 'وعليكم السلام 👋 كيف يمكنني مساعدتك؟',
      thanks: 'على الرحب والسعة 🙏 أنا هنا إن احتجت أي شيء.',
      fallback: 'عذرًا، لا أستطيع الإجابة الآن. أرسل سؤالك للفريق أو راسلنا عبر واتساب.',
    },
    flow: {
      intro: 'بالتأكيد 💪 نصنع أي شيء: سيارات، شعارات، طائرات… بضعة أسئلة سريعة:',
      item: 'ماذا تريد أن نصنع لك؟ اكتب السيارة والموديل والسنة (مثال: Golf 7 R 2018)، أو صف الشعار.',
      side: 'من أي جهة؟',
      sides: ['من الأمام', 'من الجانب', 'من الخلف', 'انصحوني'],
      style: '2D أم 3D؟ 2D أرخص، و3D أغلى لأنه يتطلب عملًا أكثر.',
      styles: ['2D', '3D', 'انصحوني'],
      color: 'ما اللون؟ الأسود والأبيض متاحان دائمًا، والألوان الأخرى تحتاج تأكيد الفريق.',
      colors: ['أسود', 'أبيض', 'لون آخر'],
      otherColor: 'ما اللون الذي تريده؟',
      summary: 'طلبك:',
      labels: { item: 'الطلب', side: 'الجهة', style: 'النوع', color: 'اللون' },
      deposit: 'ملاحظة: القطع الخاصة خارج الكتالوج تتطلب دفعة مسبقة جزئية قبل البدء.',
      sendToTeam: 'أرسل للفريق',
      edit: 'تعديل',
      other: 'سؤال آخر',
    },
    handoff: {
      offer: 'هل تريد أن أرسل هذه المحادثة إلى الفريق؟',
      button: 'أرسل للفريق',
      title: 'أرسل للفريق',
      name: 'الاسم',
      phone: 'الهاتف',
      note: 'أضف تفصيلًا (اختياري)',
      submit: 'إرسال',
      sending: 'جارٍ الإرسال…',
      cancel: 'رجوع',
      done: 'وصلنا طلبك ✅ سيتصل بك الفريق قريبًا.',
      error: 'حدث خطأ. حاول مجددًا أو راسلنا عبر واتساب.',
    },
    viewPiece: 'عرض',
  },
};

/** Built-in answer for a topic ({min}/{max} filled from the live catalogue). */
export function topicAnswer(lang: ChatLang, topic: Exclude<TopicId, 'custom'>, prices?: { min: number; max: number }): string {
  const a = STRINGS[lang].answers;
  if (topic === 'price') {
    if (!prices) return a.priceNoInfo;
    return a.price.replace('{min}', String(prices.min)).replace('{max}', String(prices.max));
  }
  return a[topic];
}

/* -------------------------------------------------------------------------- *
 * Intent matching
 *
 * Latin-script keywords (Darija "3arabizi", French, English) are matched as
 * whole words. Arabic-script keywords are matched per word after removing the
 * usual attached prefixes (و ف ب ك ل + ال): plain entries must match exactly,
 * entries ending in * match the start of the word, and entries with a space
 * are phrases matched anywhere.
 * -------------------------------------------------------------------------- */

export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Latin accents
    .replace(/[ً-ٰٟـ]/g, '') // Arabic marks, hamza seats, tatweel
    .replace(/[ٕٔ]/g, '')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface TopicRule {
  latin?: RegExp;
  arabic?: string[];
}

const RULES: Record<TopicId, TopicRule> = {
  custom: {
    latin:
      /\b(t9d?ro|t9adro|tqd?ro|tkdro|dir(ou|o|u)? ?(li|lia|lya|liya|lina|lik)|tdir(ou|o|u)|tsawb(ou|o|u)|sawb(ou|o|u)|tsayb(ou|o|u)|nsayb(ou|o|u)|custom|personnalis\w*|sur mesure|can you (make|do|create|print)|make (me|my)|do my|my own|ma voiture|mon logo|my logo|faire (ma|mon|un|une)|realiser|logo|logos|avion|plane|helico\w*|moto)\b/,
    arabic: ['تقدرو', 'تقدروا', 'ديرو', 'ديروا', 'ديرولي', 'ديرلي', 'تصاوبو', 'صاوبو', 'تصوبو', 'نصوبو', 'لوغو', 'لوجو', 'شعار*', 'طياره', 'طوموبيلتي', 'سيارتي', 'تصميم خاص', 'حسب الطلب', 'موطور', 'تصنعو', 'تصممو'],
  },
  colors: {
    latin:
      /\b(colou?rs?|couleurs?|coleur|lon|loun|lwn|lwan|alwan|lka7el|ka7el|k7el|k7al|byed|byad|bayd|noir|blanc|black|white|rouge|red|a7mer|l7mer|7mer|bleu|blue|zr9|zre9|zra9|vert|green|khdr|khder|jaune|yellow|sfer|gold|dore|silver|argent|rose|pink|orange)\b/,
    arabic: ['لون*', 'الوان', 'اكحل', 'كحل', 'كحله', 'ابيض', 'بيض', 'بيضه', 'احمر', 'حمر', 'حمره', 'ازرق', 'زرق', 'زرقه', 'اخضر', 'خضر', 'اصفر', 'صفر', 'ذهبي', 'فضي', 'وردي', 'رمادي'],
  },
  price: {
    latin: /\b(ch7al|chhal|chal|bch7al|bchhal|taman|tamane|tamn|thaman|prix|combien|price|prices|pricing|how much|cost|costs|tarifs?|flous|flouss)\b/,
    arabic: ['شحال', 'بشحال', 'ثمن*', 'تمن*', 'اثمن*', 'سعر*', 'اسعار', 'بكم', 'تكلفه'],
  },
  delivery: {
    latin:
      /\b(livraison|livrez|livrer|delivery|deliver|delivered|shipping|ship|tawsil|twsil|touwsil|tw?sl\w*|katwsl\w*|katwsel\w*|expedition|envoi|casa|casablanca|marrakech|agadir|tanger|fes|oujda|laayoune|layoune|dakhla|meknes|kenitra|tetouan|nador|ville|villes|city|cities)\b/,
    arabic: ['توصيل', 'توصلو*', 'كتوصلو*', 'وصلو*', 'شحن', 'ليفريزون', 'مدينه', 'مدن', 'عيون', 'داخله', 'اكادير', 'مراكش', 'طنجه', 'فاس', 'وجده', 'كازا', 'مكناس', 'قنيطره', 'تطوان', 'ناظور'],
  },
  payment: {
    latin: /\b(khlas|khles|nkhles|nkhless|paiement|payer|paie|payment|pay|cash|cod|avance|acompte|advance|deposit|tasbi9|tsbi9|carte|card|virement)\b/,
    arabic: ['خلاص', 'نخلص', 'كنخلص', 'دفع*', 'تسبيق', 'عربون', 'كاش', 'بطاقه'],
  },
  size: {
    latin:
      /\b(9yas|9ias|qyas|qiyas|l9yas|taille|tailles|size|sizes|dimensions?|format|cm|kbir|kbira|sghir|sghira|grand|petit|large|small|big|matiere|materiau|material|alucobond|aluminium|aluminum|qualite|quality|jawda|impression|print|canvas|toile|bois|wood|metal)\b/,
    arabic: ['قياس*', 'مقاس*', 'حجم', 'كبير*', 'صغير*', 'ماده', 'جوده', 'طباعه', 'الومنيوم', 'خشب', 'حديد'],
  },
  style: {
    latin: /\b(3d|2d|relief|depth|profondeur|tridimension\w*)\b/,
    arabic: ['ثلاثي*', 'ثنائي*', 'ابعاد'],
  },
  returns: {
    latin: /\b(retour|retourner|return|returns|refund|rembours\w*|rja3|nrja3|nrje3|echange|exchange)\b/,
    arabic: ['ارجاع', 'ترجيع', 'استرجاع', 'نرجع*', 'نبدل*', 'تبديل', 'استبدال'],
  },
  hang: {
    latin: /\b(accroch\w*|hang|hanging|mount|mounting|install\w*|fixer|fixation|cadre|frame|t3la9|n3al9\w*|3la9|entretien|care|clean|nettoy\w*)\b/,
    arabic: ['تعليق', 'نعلق*', 'كنعلق*', 'اطار', 'تثبيت', 'نظافه', 'نقي*'],
  },
  location: {
    latin: /\b(adresse|address|where are you|ou etes vous|localisation|location|showroom|magasin|boutique|blasa|fin kayn\w*|fin ntoma|sale|rabat)\b/,
    arabic: ['عنوان', 'محل', 'حانوت', 'فين كاينين', 'فين انتوما', 'اين انتم', 'سلا', 'رباط'],
  },
  order: {
    latin: /\b(commande dyali|commande dial|ma commande|my order|order status|suivi|tracking|track|fin wslat|wslat|wsalt|colis|statut)\b/,
    arabic: ['الكوموند ديالي', 'وصلات', 'طلبيتي', 'طلبي', 'طلبيه', 'تتبع'],
  },
  howto: {
    latin: /\b(kifach ncommandi|kifach nchri|kifach ntlb|ncommandi|nchri|comment commander|comment acheter|how (do i|to) (order|buy)|acheter|buy)\b/,
    arabic: ['نكوموندي', 'نشري', 'كيفاش نطلب', 'كيف اطلب', 'كيفيه الطلب', 'كيف اشتري'],
  },
  human: {
    latin: /\b(team|equipe|humain|human|person|agent|someone|quelqu un|chi wa7ed|chi 7ed|nhder|nhdr|ntkalm|call|appel\w*|telephone|numero|number|whatsapp|wtsp|instagram|insta)\b/,
    arabic: ['نهضر', 'نتكلم', 'فريق', 'شي واحد', 'رقم', 'واتساب', 'نتاصل', 'اتصل', 'تيليفون'],
  },
  greet: {
    latin: /^(salam|slm|salam alikom|salam alaykoum|salam 3alikom|assalamu alaykum|bonjour|bonsoir|salut|hello|hi|hey|ahlan|marhba)( .*)?$/,
    arabic: ['سلام', 'السلام عليكم', 'مرحبا', 'اهلا', 'صباح الخير', 'مساء الخير'],
  },
  thanks: {
    latin: /\b(merci|shukran|choukran|chokran|thanks|thank you|thx|baraka|lah ykhlik|allah yhfdk)\b/,
    arabic: ['شكرا', 'الله يخليك', 'الله يحفظك', 'بارك الله فيك', 'مشكور'],
  },
};

const PREFIX = /^(?:و|ف|ب|ك|ل)?(?:ال|ل)?/;

function matchesArabic(words: string[], text: string, entries: string[]): boolean {
  return entries.some((entry) => {
    if (entry.includes(' ')) return text.includes(entry);
    const stem = entry.endsWith('*');
    const key = stem ? entry.slice(0, -1) : entry;
    return words.some((w) => {
      const bare = w.replace(PREFIX, '');
      return stem ? w.startsWith(key) || bare.startsWith(key) : w === key || bare === key;
    });
  });
}

/** Topics a message is about, in rule order. */
export function matchTopics(message: string): TopicId[] {
  const text = normalise(message);
  if (!text) return [];
  const words = text.split(' ');
  const found = (Object.keys(RULES) as TopicId[]).filter((topic) => {
    const rule = RULES[topic];
    return (rule.latin?.test(text) ?? false) || (rule.arabic ? matchesArabic(words, text, rule.arabic) : false);
  });

  // "Can you deliver…" uses the same verb as "can you make…": a practical
  // question wins over the custom-request flow.
  const practical: TopicId[] = ['price', 'delivery', 'payment', 'size', 'returns', 'location', 'order', 'howto'];
  if (found.includes('custom') && found.some((t) => practical.includes(t))) {
    return found.filter((t) => t !== 'custom');
  }
  // An order-status question isn't a question about where the studio is.
  if (found.includes('order')) return found.filter((t) => t !== 'location');
  return found;
}

/** Does the message name a car, a brand or a model (e.g. "golf 7 r", "bmw")? */
export function mentionsCar(message: string): boolean {
  if (brandOf({ name: message })) return true;
  return normalise(message)
    .split(' ')
    .some((w) => w.length >= 3 && !!findBrand(w));
}

export type LocalPlan =
  | { kind: 'flow'; prefillItem?: string; lead?: Exclude<TopicId, 'custom'>[] }
  | { kind: 'answer'; topics: Exclude<TopicId, 'custom'>[] }
  | { kind: 'ai'; fallback: Exclude<TopicId, 'custom'>[] };

/**
 * Decide how to handle a typed message: answer instantly from the built-in
 * topics, start the custom-request questions, or ask the AI. Short, clear
 * questions are answered locally; long or car-specific ones go to the AI
 * (which can also suggest matching pieces).
 */
export function planReply(message: string): LocalPlan {
  const topics = matchTopics(message);
  const plain = topics.filter((t): t is Exclude<TopicId, 'custom'> => t !== 'custom');
  const words = normalise(message).split(' ').filter(Boolean).length;
  const car = mentionsCar(message);

  if (topics.includes('custom')) {
    return { kind: 'flow', prefillItem: car ? message.trim() : undefined, lead: plain.includes('colors') ? ['colors'] : undefined };
  }
  if (!plain.length || words > 14) return { kind: 'ai', fallback: plain.slice(0, 2) };
  // "ch7al bmw" — the AI can quote that brand's pieces; keep built-ins as fallback.
  if (car && !plain.every((t) => t === 'greet' || t === 'thanks')) return { kind: 'ai', fallback: plain.slice(0, 2) };
  // A greeting followed by a real question: answer the question.
  const useful = plain.filter((t) => t !== 'greet' && t !== 'thanks');
  return { kind: 'answer', topics: (useful.length ? useful : plain).slice(0, 3) };
}
