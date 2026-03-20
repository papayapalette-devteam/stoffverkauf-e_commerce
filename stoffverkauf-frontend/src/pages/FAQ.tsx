import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";
import { usePageContent } from "@/lib/page-content";
import SEO from "@/components/SEO";

const FAQ = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const { sections } = usePageContent("faq");

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={de ? "Häufig gestellte Fragen" : "FAQ"}
        description={de ? "Antworten auf häufig gestellte Fragen zu Stoffen, Versand, Rückgabe und Zahlungsmethoden bei Stoffverkauf Weber." : "Answers to frequently asked questions about fabrics, shipping, returns and payment methods at Stoffverkauf Weber."}
        path="/faq"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: sections.map((s) => ({
            "@type": "Question",
            name: de ? s.titleDe : s.titleEn,
            acceptedAnswer: { "@type": "Answer", text: de ? s.contentDe : s.contentEn },
          })),
        }}
      />
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              {de ? "Häufig gestellte Fragen" : "Frequently Asked Questions"}
            </h1>
            <p className="text-muted-foreground">
              {de ? "Finden Sie Antworten auf die häufigsten Fragen" : "Find answers to the most common questions"}
            </p>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-2">
            {sections.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <AccordionItem value={s.id} className="bg-card rounded-xl border border-border px-6 shadow-card">
                  <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                    {de ? s.titleDe : s.titleEn}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {de ? s.contentDe : s.contentEn}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>

          <div className="mt-12 text-center bg-secondary rounded-xl p-8">
            <h3 className="font-display text-lg font-bold text-foreground mb-2">
              {de ? "Noch Fragen?" : "Still have questions?"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {de ? "Kontaktieren Sie uns direkt" : "Contact us directly"}
            </p>
            <a href="/contact" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-block text-sm">
              {de ? "Kontakt aufnehmen" : "Get in Touch"}
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default FAQ;
