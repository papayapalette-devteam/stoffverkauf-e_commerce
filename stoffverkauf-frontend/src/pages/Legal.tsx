import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useI18n } from "@/lib/i18n";
import { usePageContent } from "@/lib/page-content";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const Legal = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const { sections } = usePageContent("legal");

  const legalPages = [
    { path: "/agb", labelDe: "AGB", labelEn: "Terms & Conditions" },
    { path: "/impressum", labelDe: "Impressum", labelEn: "Imprint" },
    { path: "/datenschutz", labelDe: "Datenschutz", labelEn: "Privacy Policy" },
    { path: "/widerruf", labelDe: "Widerrufsbelehrung", labelEn: "Cancellation Policy" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={de ? "Rechtliches" : "Legal"} description={de ? "Rechtliche Informationen von Stoffverkauf Weber." : "Legal information of Stoffverkauf Weber."} path="/legal" />
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">
            {de ? "Rechtliches" : "Legal"}
          </h1>
          <div className="prose prose-stone max-w-none space-y-6 text-muted-foreground font-body">
            {sections.map((s) => (
              <section key={s.id}>
                <h2 className="font-display text-xl font-bold text-foreground mb-3">
                  {de ? s.titleDe : s.titleEn}
                </h2>
                <p className="whitespace-pre-line">{de ? s.contentDe : s.contentEn}</p>
              </section>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {legalPages.map((p) => (
              <Link key={p.path} to={p.path} className="bg-card rounded-xl border border-border p-5 hover:bg-secondary/30 transition-colors shadow-card">
                <p className="text-sm font-semibold text-foreground">{de ? p.labelDe : p.labelEn}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">{p.path}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Legal;
