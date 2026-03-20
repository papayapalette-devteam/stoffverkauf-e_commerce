import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useI18n } from "@/lib/i18n";
import { usePageContent } from "@/lib/page-content";
import SEO from "@/components/SEO";

const AGB = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const { sections } = usePageContent("agb");

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={de ? "Allgemeine Geschäftsbedingungen" : "Terms and Conditions"} description={de ? "AGB von Stoffverkauf Weber — Vertragsschluss, Preise, Versand, Widerrufsrecht und mehr." : "Terms and conditions of Stoffverkauf Weber — contract, prices, shipping, withdrawal rights and more."} path="/agb" />
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">
            {de ? "Allgemeine Geschäftsbedingungen (AGB)" : "Terms and Conditions"}
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
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default AGB;
