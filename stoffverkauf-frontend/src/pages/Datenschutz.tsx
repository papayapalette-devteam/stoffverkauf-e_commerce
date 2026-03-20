import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useI18n } from "@/lib/i18n";
import { usePageContent } from "@/lib/page-content";
import SEO from "@/components/SEO";

const Datenschutz = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const { sections } = usePageContent("datenschutz");

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={de ? "Datenschutzerklärung" : "Privacy Policy"} description={de ? "Datenschutzerklärung von Stoffverkauf Weber gemäß DSGVO." : "Privacy policy of Stoffverkauf Weber according to GDPR."} path="/datenschutz" />
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">
            {de ? "Datenschutzerklärung" : "Privacy Policy"}
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

export default Datenschutz;
