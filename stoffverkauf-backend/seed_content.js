const mongoose = require("mongoose");
const Page = require("./Modals/Pages/page");
const HomeSection = require("./Modals/HomeSections/homeSection");
require("dotenv").config();

const defaultPages = [
  { id: "service", nameDe: "Service", nameEn: "Service", path: "/service", sections: [] },
  { id: "shipping", nameDe: "Versandbedingungen", nameEn: "Shipping Terms", path: "/shipping", sections: [] },
  { id: "samples", nameDe: "Stoffmuster", nameEn: "Fabric Samples", path: "/samples", sections: [] },
  { id: "returns", nameDe: "Rückgabe", nameEn: "Returns", path: "/returns", sections: [] },
  { id: "faq", nameDe: "FAQ", nameEn: "FAQ", path: "/faq", sections: [] },
  { id: "legal", nameDe: "Rechtliches", nameEn: "Legal", path: "/legal", sections: [] },
  { id: "agb", nameDe: "AGB", nameEn: "Terms & Conditions", path: "/agb", sections: [] },
  { id: "impressum", nameDe: "Impressum", nameEn: "Imprint", path: "/impressum", sections: [] },
  { id: "datenschutz", nameDe: "Datenschutz", nameEn: "Privacy Policy", path: "/datenschutz", sections: [] },
  { id: "widerruf", nameDe: "Widerrufsbelehrung", nameEn: "Cancellation Policy", path: "/widerruf", sections: [] },
];

const mockSections = [
  { id: "hero", type: "hero", title: "Hero Banner", enabled: true },
  { id: "features", type: "features", title: "Features Bar", enabled: true },
  { id: "categories", type: "categories", title: "Category Showcase", enabled: true },
  { id: "bestseller", type: "carousel", title: "Bestseller Carousel", enabled: true },
  { id: "products", type: "grid", title: "Product Grid", enabled: true },
  { id: "offer", type: "banner", title: "Offer Banner", enabled: true },
  { id: "why", type: "info", title: "Why Choose Us", enabled: true },
  { id: "testimonials", type: "testimonials", title: "Testimonials", enabled: true },
  { id: "newsletter", type: "newsletter", title: "Newsletter", enabled: true },
];

async function seed() {
  await mongoose.connect(process.env.URL);
  console.log("Connected to DB");

  for (const page of defaultPages) {
    await Page.findOneAndUpdate({ id: page.id }, page, { upsert: true, new: true });
    console.log(`Seeded page: ${page.id}`);
  }

  for (const section of mockSections) {
    await HomeSection.findOneAndUpdate({ id: section.id }, section, { upsert: true, new: true });
    console.log(`Seeded home section: ${section.id}`);
  }

  console.log("Seeding complete");
  mongoose.connection.close();
}

seed();
