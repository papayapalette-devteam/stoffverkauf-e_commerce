const mongoose = require("mongoose");
const BlogPost = require("../Modals/Blog/blog");
const Page = require("../Modals/Pages/page");
const HomeSection = require("../Modals/HomeSections/homeSection");

async function seed() {
  await mongoose.connect("mongodb://localhost:27017/stoffverkauf", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("Connected to MongoDB...");

  // 1. Add some Blog Posts
  await BlogPost.deleteMany({});
  const blogs = [
    {
      title: "Die Trends für den Frühling 2026",
      status: "published",
      date: new Date().toISOString(),
      excerpt: "Entdecken Sie die neuesten Farben und Muster für die kommende Saison.",
      content: "## Frühlingstrends\n\nIn diesem Jahr dreht sich alles um Pastelltöne und florale Muster. Italienische Designer setzen auf leichte Seide und hochwertige Baumwolle.\n\n## Warum Seide?\n\nSeide ist nicht nur edel, sondern auch klimaregulierend.",
      category: "Trends",
      readTime: 5,
      image: "https://images.unsplash.com/photo-1524230572899-a752b3835840?q=80&w=800"
    },
    {
      title: "Nähen für Anfänger: Die 5 besten Tipps",
      status: "published",
      date: new Date().toISOString(),
      excerpt: "So gelingen Ihre ersten Nähprojekte garantiert.",
      content: "## Tipp 1: Die richtige Nadel\n\nWählen Sie die Nadel passend zum Stoff aus. Für Jersey benötigen Sie eine Ballpoint-Nadel.\n\n## Tipp 2: Langsam starten\n\nÜberstürzen Sie nichts und nehmen Sie sich Zeit für die Vorbereitung.",
      category: "Anleitungen",
      readTime: 8,
      image: "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=800"
    }
  ];
  await BlogPost.insertMany(blogs);

  // 2. Add/Update Pages
  await Page.deleteMany({});
  const pageData = [
    {
      id: "service",
      path: "/service",
      nameDe: "Service",
      nameEn: "Service",
      sections: [
        { id: "s1", titleDe: "Persönliche Beratung", contentDe: "Wir beraten Sie gerne...", titleEn: "Personal Advice", contentEn: "We advise you..." }
      ]
    },
    {
      id: "faq",
      path: "/faq",
      nameDe: "FAQ",
      nameEn: "FAQ",
      sections: [
        { id: "f1", titleDe: "Häufige Fragen", contentDe: "Hier finden Sie Antworten...", titleEn: "Common Questions", contentEn: "Find answers here..." }
      ]
    },
    {
      id: "impressum",
      path: "/impressum",
      nameDe: "Impressum",
      nameEn: "Imprint",
      sections: [
        { id: "i1", titleDe: "Angaben gemäß § 5 TMG", contentDe: "Stoffverkauf Weber\nInhaber: Max Weber\nMusterstraße 1\n61440 Oberursel", titleEn: "Information according to § 5 TMG", contentEn: "Stoffverkauf Weber\nOwner: Max Weber\nSample Street 1\n61440 Oberursel" }
      ]
    },
    {
      id: "datenschutz",
      path: "/datenschutz",
      nameDe: "Datenschutz",
      nameEn: "Privacy Policy",
      sections: [
        { id: "d1", titleDe: "Datenschutzerklärung", contentDe: "Ihre Daten sind bei uns sicher...", titleEn: "Privacy Policy", contentEn: "Your data is safe with us..." }
      ]
    },
    {
      id: "agb",
      path: "/agb",
      nameDe: "AGB",
      nameEn: "Terms & Conditions",
      sections: [
        { id: "a1", titleDe: "Geltungsbereich", contentDe: "Diese AGB gelten für alle Bestellungen...", titleEn: "Scope", contentEn: "These terms apply to all orders..." }
      ]
    },
    {
      id: "widerruf",
      path: "/widerruf",
      nameDe: "Widerruf",
      nameEn: "Cancellation",
      sections: [
        { id: "w1", titleDe: "Widerrufsrecht", contentDe: "Sie haben das Recht, binnen vierzehn Tagen...", titleEn: "Right of Withdrawal", contentEn: "You have the right to withdraw..." }
      ]
    },
    {
      id: "returns",
      path: "/returns",
      nameDe: "Rückgabe",
      nameEn: "Returns",
      sections: [
        { id: "r1", titleDe: "Rückgaberichtlinien", contentDe: "So senden Sie Ihre Artikel zurück...", titleEn: "Return Policy", contentEn: "How to return your items..." }
      ]
    },
    {
      id: "samples",
      path: "/samples",
      nameDe: "Stoffmuster",
      nameEn: "Fabric Samples",
      sections: [
        { id: "sm1", titleDe: "Musterbestellung", contentDe: "Bestellen Sie bis zu 5 Muster gratis...", titleEn: "Sample Order", contentEn: "Order up to 5 samples for free..." }
      ]
    },
    {
      id: "shipping",
      path: "/shipping",
      nameDe: "Versand",
      nameEn: "Shipping",
      sections: [
        { id: "sh1", titleDe: "Versandkosten", contentDe: "Wir versenden mit DHL...", titleEn: "Shipping Costs", contentEn: "We ship with DHL..." }
      ]
    }
  ];
  await Page.insertMany(pageData);
  console.log("All pages seeded!");

  // 3. Home Sections
  await HomeSection.deleteMany({});
  const homeSections = [
    { id: "hero", type: "hero", title: "Hero Banner", enabled: true },
    { id: "features", type: "bar", title: "Features Bar", enabled: true },
    { id: "categories", type: "carousel", title: "Categories Carousel", enabled: true },
    { id: "bestseller", type: "carousel", title: "Bestseller Carousel", enabled: true },
    { id: "products", type: "grid", title: "Product Grid", enabled: true },
    { id: "offer", type: "banner", title: "Offer Banner", enabled: true },
    { id: "why", type: "section", title: "Why Choose Us", enabled: true },
    { id: "testimonials", type: "section", title: "Testimonials", enabled: true },
    { id: "newsletter", type: "section", title: "Newsletter Section", enabled: true }
  ];
  await HomeSection.insertMany(homeSections);
  console.log("Home sections seeded!");

  await mongoose.disconnect();
}

seed();
