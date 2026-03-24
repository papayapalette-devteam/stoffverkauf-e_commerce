import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Lang = "de" | "en";

const translations = {
  // Navbar
  "nav.kategorien": { de: "Kategorien", en: "Premium" },
  "nav.bestseller": { de: "Bestseller", en: "Bestsellers" },
  "nav.stoffe": { de: "Stoffe", en: "Fabrics" },
  "nav.angebote": { de: "Angebote", en: "Offers" },
  "nav.search": { de: "Stoffe suchen...", en: "Search fabrics..." },
  "nav.account": { de: "Konto", en: "Account" },
  "nav.topbar.contact": { de: "Tel: 06171/53159 · info@stoffverkauf-weber.de", en: "Phone: 06171/53159 · info@stoffverkauf-weber.de" },
  "nav.topbar.shipping": { de: "Kostenloser Versand ab 100 €", en: "Free shipping over €100" },

  // Hero
  "hero.badge": { de: "40 Jahre Stoffverkauf Weber", en: "40 Years of Stoffverkauf Weber" },
  "hero.title1": { de: "Italienische", en: "Italian" },
  "hero.title2": { de: "Modestoffe", en: "Fashion Fabrics" },
  "hero.subtitle": {
    de: "Hochwertige italienische Modestoffe als Meterware. Schurwolle, Jersey, Viskose und mehr — für Ihre individuelle Garderobe.",
    en: "Premium Italian fashion fabrics by the meter. Wool, jersey, viscose and more — for your unique wardrobe.",
  },
  "hero.cta": { de: "Jetzt einkaufen", en: "Shop Now" },
  "hero.cta2": { de: "Stoffe entdecken", en: "Explore Fabrics" },

  // Features
  "feat.shipping": { de: "Versand Deutschland", en: "Shipping Germany" },
  "feat.shipping.desc": { de: "Versichert 7,99 € · Unversichert 5,90 €", en: "Insured €7.99 · Uninsured €5.90" },
  "feat.payment": { de: "Versand Ausland", en: "International Shipping" },
  "feat.payment.desc": { de: "Versichert 16,00 €", en: "Insured €16.00" },
  "feat.samples": { de: "5 Stoffmuster", en: "5 Fabric Samples" },
  "feat.samples.desc": { de: "5,00 € — wird bei Bestellung verrechnet", en: "€5.00 — credited with your order" },
  "feat.support": { de: "Beratung", en: "Consultation" },
  "feat.support.desc": { de: "Tel: 06171/53159", en: "Phone: 06171/53159" },

  // Product Grid
  "grid.title": { de: "Unsere Stoffe", en: "Our Fabrics" },
  "grid.subtitle": { de: "Hochwertige italienische Stoffe als Meterware", en: "Premium Italian fabrics by the meter" },

  // Categories
  "cat.Alle": { de: "Alle", en: "All" },
  "cat.Flanell": { de: "Flanell", en: "Flannel" },
  "cat.Schurwolle": { de: "Schurwolle", en: "Virgin Wool" },
  "cat.Designer": { de: "Designer", en: "Designer" },
  "cat.Angebot": { de: "Angebot", en: "Sale" },
  "cat.Leinen": { de: "Leinen", en: "Linen" },
  "cat.Strickstoffe": { de: "Strickstoffe", en: "Knit Fabrics" },
  "cat.Walkstoffe": { de: "Walkstoffe", en: "Boiled Wool" },
  "cat.Mantel & Jackenstoffe": { de: "Mantel & Jackenstoffe", en: "Coat & Jacket Fabrics" },
  "cat.Baumwollstoffe": { de: "Baumwollstoffe", en: "Cotton Fabrics" },
  "cat.Jersey": { de: "Jersey", en: "Jersey" },
  "cat.Bouclé": { de: "Bouclé", en: "Bouclé" },
  "cat.Spitzenstoffe": { de: "Spitzenstoffe", en: "Lace Fabrics" },
  "cat.Viskose": { de: "Viskose", en: "Viscose" },

  // Fabric type filters
  "fabric.Designerstoffe": { de: "Designerstoffe", en: "Designer Fabrics" },
  "fabric.Italienische Stoffe": { de: "Italienische Stoffe", en: "Italian Fabrics" },
  "fabric.Angebote": { de: "Angebote", en: "Offers" },
  "fabric.Futterstoffe": { de: "Futterstoffe", en: "Lining Fabrics" },
  "fabric.Italienische Seide": { de: "Italienische Seide", en: "Italian Silk" },
  "fabric.Italienischer Jersey": { de: "Italienischer Jersey", en: "Italian Jersey" },
  "fabric.Italienisches Leinen": { de: "Italienisches Leinen", en: "Italian Linen" },
  "fabric.Italienische Schurwolle": { de: "Italienische Schurwolle", en: "Italian Virgin Wool" },
  "fabric.Elegante-Stoffe": { de: "Elegante-Stoffe", en: "Elegant Fabrics" },
  "fabric.Pailletten & Perlen": { de: "Pailletten & Perlen", en: "Sequins & Beads" },
  "fabric.Spitzenstoffe": { de: "Spitzenstoffe", en: "Lace Fabrics" },
  "fabric.Jacquard-Stoffe": { de: "Jacquard-Stoffe", en: "Jacquard Fabrics" },
  "fabric.Bouclé & Tweed": { de: "Bouclé & Tweed", en: "Bouclé & Tweed" },
  "fabric.Kleider & Blusenstoffe": { de: "Kleider & Blusenstoffe", en: "Dress & Blouse Fabrics" },
  "fabric.Strickstoffe": { de: "Strickstoffe", en: "Knit Fabrics" },
  "fabric.Mantel & Jackenstoffe": { de: "Mantel & Jackenstoffe", en: "Coat & Jacket Fabrics" },
  "fabric.Pelzimitationen": { de: "Pelzimitationen", en: "Faux Fur" },
  "fabric.Cashmere": { de: "Cashmere", en: "Cashmere" },
  "fabric.Walkstoffe": { de: "Walkstoffe", en: "Boiled Wool" },
  "fabric.Wollfilz": { de: "Wollfilz", en: "Wool Felt" },
  "fabric.T-Shirtstoffe": { de: "T-Shirtstoffe", en: "T-Shirt Fabrics" },
  "fabric.Stretchstoffe": { de: "Stretchstoffe", en: "Stretch Fabrics" },
  "fabric.Baumwollstoffe": { de: "Baumwollstoffe", en: "Cotton Fabrics" },
  "fabric.Stickereistoffe": { de: "Stickereistoffe", en: "Embroidery Fabrics" },
  "fabric.Leder & Lederimitat": { de: "Leder & Lederimitat", en: "Leather & Faux Leather" },
  "fabric.Westfalenstoffe": { de: "Westfalenstoffe", en: "Westfalen Fabrics" },

  // Product badges
  "badge.Bestseller": { de: "Bestseller", en: "Best Seller" },
  "badge.Premium": { de: "Premium", en: "Premium" },
  "badge.Angebot": { de: "Angebot", en: "Sale" },
  "badge.Neu": { de: "Neu", en: "New" },

  // Product card
  "product.perMeter": { de: "pro Meter", en: "per meter" },
  "product.addToCart": { de: "in den Warenkorb", en: "Add to cart" },

  // Cart
  "cart.title": { de: "Warenkorb", en: "Cart" },
  "cart.empty": { de: "Ihr Warenkorb ist leer", en: "Your cart is empty" },
  "cart.continue": { de: "Weiter einkaufen", en: "Continue Shopping" },
  "cart.subtotal": { de: "Zwischensumme", en: "Subtotal" },
  "cart.shippingNote": {
    de: "Versandkosten und Steuern werden an der Kasse berechnet",
    en: "Shipping and taxes calculated at checkout",
  },
  "cart.checkout": { de: "Zur Kasse", en: "Checkout" },
  "cart.close": { de: "Warenkorb schließen", en: "Close cart" },
  "cart.decrease": { de: "Menge verringern", en: "Decrease quantity" },
  "cart.increase": { de: "Menge erhöhen", en: "Increase quantity" },
  "cart.remove": { de: "Artikel entfernen", en: "Remove item" },

  // Newsletter
  "news.title": { de: "Nichts verpassen!", en: "Stay in the Loop!" },
  "news.subtitle": {
    de: "Melden Sie sich für unseren Newsletter an und erhalten Sie exklusive Angebote, neue Stoffe und Inspirationen.",
    en: "Sign up for our newsletter and get exclusive deals, new fabrics and inspiration.",
  },
  "news.placeholder": { de: "Ihre E-Mail-Adresse", en: "Your email address" },
  "news.submit": { de: "Anmelden", en: "Subscribe" },
  "news.success": {
    de: "✓ Sie sind angemeldet! Prüfen Sie bald Ihren Posteingang.",
    en: "✓ You're subscribed! Check your inbox soon.",
  },

  // Footer
  "footer.desc": {
    de: "Hochwertige italienische Modestoffe als Meterware. Qualität seit 40 Jahren.",
    en: "Premium Italian fashion fabrics by the meter. Quality for 40 years.",
  },
  "footer.products": { de: "Produkte", en: "Products" },
  "footer.about": { de: "Über uns", en: "About Us" },
  "footer.service": { de: "Service", en: "Service" },
  "footer.legal": { de: "Rechtliches", en: "Legal" },
  "footer.rights": { de: "Alle Rechte vorbehalten.", en: "All rights reserved." },

  // Footer links
  "footer.stoffe": { de: "Stoffe", en: "Fabrics" },
  "footer.kategorien": { de: "Kategorien", en: "Categories" },
  "footer.bestseller": { de: "Bestseller", en: "Bestsellers" },
  "footer.angebote": { de: "Angebote", en: "Offers" },
  "footer.ueberuns": { de: "Über uns", en: "About Us" },
  "footer.kontakt": { de: "Kontakt", en: "Contact" },
  "footer.naehkurse": { de: "Nähkurse", en: "Sewing Courses" },
  "footer.stoffkiste": { de: "Stoffkiste", en: "Fabric Box" },
  "footer.versand": { de: "Versandbedingungen", en: "Shipping Terms" },
  "footer.stoffmuster": { de: "Stoffmuster", en: "Fabric Samples" },
  "footer.rueckgabe": { de: "Rückgabe", en: "Returns" },
  "footer.faq": { de: "FAQ", en: "FAQ" },
  "footer.agb": { de: "AGB", en: "Terms & Conditions" },
  "footer.impressum": { de: "Impressum", en: "Imprint" },
  "footer.datenschutz": { de: "Datenschutz", en: "Privacy Policy" },

  // Bestseller
  "best.title": { de: "Unsere Bestseller", en: "Our Bestsellers" },
  "best.subtitle": { de: "Die beliebtesten Stoffe unserer Kunden", en: "Our customers' most popular fabrics" },

  // Category Showcase
  "cats.title": { de: "Entdecken Sie unsere Stoffwelten", en: "Explore Our Fabric Worlds" },
  "cats.subtitle": { de: "Finden Sie den perfekten Stoff für Ihr nächstes Projekt", en: "Find the perfect fabric for your next project" },
  "cats.flanell": { de: "Flanell & Schurwolle", en: "Flannel & Wool" },
  "cats.flanell.desc": { de: "Feinste italienische Wollstoffe", en: "Finest Italian wool fabrics" },
  "cats.designer": { de: "Designerstoffe", en: "Designer Fabrics" },
  "cats.designer.desc": { de: "Exklusive Couture-Qualität", en: "Exclusive couture quality" },
  "cats.leinen": { de: "Leinen & Viskose", en: "Linen & Viscose" },
  "cats.leinen.desc": { de: "Natürlich & sommerlich leicht", en: "Natural & light for summer" },
  "cats.mantel": { de: "Mantel & Jacken", en: "Coat & Jacket" },
  "cats.mantel.desc": { de: "Schwere Qualität für Herbst/Winter", en: "Heavy quality for autumn/winter" },
  "cats.browse": { de: "Entdecken", en: "Browse" },

  // Testimonials
  "test.title": { de: "Das sagen unsere Kunden", en: "What Our Customers Say" },
  "test.subtitle": { de: "Über 1.000 zufriedene Kunden vertrauen auf unsere Qualität", en: "Over 1,000 satisfied customers trust our quality" },
  "test.1.text": { de: "Die Qualität der Schurwolle ist herausragend. Mein Schneider war begeistert von dem Stoff — so etwas findet man in Deutschland selten.", en: "The virgin wool quality is outstanding. My tailor was thrilled — you rarely find this in Germany." },
  "test.1.name": { de: "Monika S.", en: "Monika S." },
  "test.1.loc": { de: "München", en: "Munich" },
  "test.2.text": { de: "Schnelle Lieferung und der Flanell war sogar noch schöner als auf den Bildern. Bestelle hier seit Jahren regelmäßig.", en: "Fast delivery and the flannel was even more beautiful than in the photos. I've been ordering here regularly for years." },
  "test.2.name": { de: "Petra K.", en: "Petra K." },
  "test.2.loc": { de: "Hamburg", en: "Hamburg" },
  "test.3.text": { de: "Die telefonische Beratung ist Gold wert. Man merkt, dass echte Stoffkenner am Werk sind. Absolute Empfehlung!", en: "The phone consultation is invaluable. You can tell real fabric experts are at work. Absolute recommendation!" },
  "test.3.name": { de: "Thomas W.", en: "Thomas W." },
  "test.3.loc": { de: "Frankfurt", en: "Frankfurt" },

  // Offer Banner
  "offer.title": { de: "Bis zu 30 % auf ausgewählte Designerstoffe", en: "Up to 30% off selected designer fabrics" },
  "offer.desc": { de: "Entdecken Sie unsere aktuellen Angebote — hochwertige italienische Stoffe zu reduzierten Preisen. Nur solange der Vorrat reicht!", en: "Discover our current offers — premium Italian fabrics at reduced prices. While stocks last!" },
  "offer.cta": { de: "Angebote entdecken", en: "View Offers" },

  // Why Choose Us
  "why.title": { de: "Warum Stoffverkauf Weber?", en: "Why Stoffverkauf Weber?" },
  "why.subtitle": { de: "Seit 40 Jahren Ihr Spezialist für hochwertige Meterware", en: "Your specialist for premium fabrics for 40 years" },
  "why.italy.title": { de: "Italienische Modestoffe", en: "Italian Fashion Fabrics" },
  "why.italy.desc": { de: "Wir bieten hochwertige italienische Modestoffe als Meterware — für beste Qualität und faire Preise.", en: "We offer premium Italian fashion fabrics by the meter — for the best quality and fair prices." },
  "why.quality.title": { de: "Geprüfte Qualität", en: "Verified Quality" },
  "why.quality.desc": { de: "Jeder Stoff wird von unseren Experten persönlich geprüft, bevor er in unser Sortiment aufgenommen wird. Nur das Beste kommt in den Verkauf.", en: "Every fabric is personally inspected by our experts before it enters our range. Only the best makes it to sale." },
  "why.advice.title": { de: "Persönliche Beratung", en: "Personal Advice" },
  "why.advice.desc": { de: "Unsere erfahrenen Stoffberater helfen Ihnen telefonisch oder per E-Mail, den perfekten Stoff für Ihr Projekt zu finden.", en: "Our experienced fabric consultants help you find the perfect fabric for your project by phone or email." },
  "why.shipping.title": { de: "Schneller Versand", en: "Fast Shipping" },
  "why.shipping.desc": { de: "Bestellungen werden innerhalb von 1-2 Werktagen versandt. Ab 100 € Bestellwert liefern wir deutschlandweit versandkostenfrei.", en: "Orders are shipped within 1-2 business days. Free shipping Germany-wide on orders over €100." },

  // Product Detail
  "detail.composition": { de: "Zusammensetzung", en: "Composition" },
  "detail.width": { de: "Stoffbreite", en: "Fabric Width" },
  "detail.weight": { de: "Gewicht", en: "Weight" },
  "detail.care": { de: "Pflegehinweise", en: "Care Instructions" },
  "detail.description": { de: "Beschreibung", en: "Description" },
  "detail.addToCart": { de: "In den Warenkorb", en: "Add to Cart" },
  "detail.orderSample": { de: "Stoffmuster bestellen", en: "Order Fabric Sample" },
  "detail.sampleNote": { de: "5 Stoffmuster Ihrer Wahl 5,00 € — bei anschließender Bestellung werden die 5 € verrechnet oder zurücküberwiesen", en: "5 fabric samples of your choice €5.00 — credited or refunded with a subsequent order" },
  "detail.back": { de: "Zurück zum Shop", en: "Back to Shop" },
  "detail.perMeter": { de: "pro Meter", en: "per meter" },
  "detail.meters": { de: "Meter", en: "Meters" },
  "detail.sampleAdded": { de: "Stoffmuster wurde hinzugefügt", en: "Fabric sample added to cart" },
  "detail.specs": { de: "Technische Details", en: "Technical Details" },
  "detail.related": { de: "Ähnliche Stoffe", en: "Similar Fabrics" },
} as const;

export type TranslationKey = keyof typeof translations;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function detectLanguage(): Lang {
  // Check localStorage first
  const saved = localStorage.getItem("lang");
  if (saved === "de" || saved === "en") return saved;

  // Auto-detect from browser locale
  const browserLang = navigator.language || (navigator as any).userLanguage || "";
  if (browserLang.startsWith("de")) return "de";
  return "en";
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(detectLanguage);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
    document.documentElement.lang = l;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: TranslationKey): string => {
      const entry = translations[key];
      return entry?.[lang] ?? key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
