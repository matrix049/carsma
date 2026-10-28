import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono, Anybody, Changa } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ConditionalShell from "@/components/ConditionalShell";
import MetaPageTracker from "@/components/MetaPageTracker";
import SiteTracker from "@/components/SiteTracker";
import { LEGACY_POLYFILLS } from "@/lib/legacyPolyfills";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, INSTAGRAM_URL, KEYWORDS, SITE_NAME, SITE_URL, WHATSAPP_PHONE } from "@/lib/seo";

const CLARITY_PROJECT_ID = "wkug7mu05f";
const META_PIXEL_ID = "1634924527624582";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Anybody — variable display face; the 50–150 width axis lets headlines
// stretch like they're doing 300 km/h.
const anybody = Anybody({
  variable: "--font-anybody",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

// Changa — sporty Kufi face for Arabic / Darija copy
const changa = Changa({
  variable: "--font-changa",
  subsets: ["arabic", "latin"],
  display: "swap",
});

// JetBrains Mono — industrial terminal feel for kicker labels and edition numbers
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: "%s · L7IT" },
  description: DEFAULT_DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "L7IT · الحيط",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    locale: "fr_MA",
    alternateLocale: ["ar_MA", "en_US"],
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "L7IT car wall art on a wall" }],
  },
  twitter: { card: "summary_large_image", title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, images: ["/og.jpg"] },
  robots: { index: true, follow: true },
};

/** Who we are, for Google: an online shop in Salé that ships across Morocco. */
const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: SITE_NAME,
  alternateName: "L7IT · الحيط",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  image: `${SITE_URL}/og.jpg`,
  description: DEFAULT_DESCRIPTION,
  telephone: WHATSAPP_PHONE,
  address: { "@type": "PostalAddress", addressLocality: "Salé", addressCountry: "MA" },
  areaServed: { "@type": "Country", name: "Morocco" },
  paymentAccepted: "Cash on delivery",
  currenciesAccepted: "MAD",
  sameAs: [INSTAGRAM_URL],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} ${anybody.variable} ${changa.variable} h-full antialiased`}
    >
      <head>
        {/* Must stay first: back-fills built-ins for older phones before any app code runs. */}
        <script dangerouslySetInnerHTML={{ __html: LEGACY_POLYFILLS }} />
        <Script id="ms-clarity" strategy="afterInteractive">
          {`
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
          `}
        </Script>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-asphalt text-chalk font-inter">
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_LD) }} />
        <MetaPageTracker />
        <SiteTracker />
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <ConditionalShell>{children}</ConditionalShell>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
