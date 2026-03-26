import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesBar from "@/components/FeaturesBar";
import BestsellerCarousel from "@/components/BestsellerCarousel";
import ProductGrid from "@/components/ProductGrid";
import WhyChooseUs from "@/components/WhyChooseUs";
import OfferBanner from "@/components/OfferBanner";
import Testimonials from "@/components/Testimonials";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SEO from "@/components/SEO";
import PremiumSellerCarousel from "@/components/PremiumSeller";
import { useHomeSections } from "@/lib/home-sections";

const Index = () => {
  const { sections, isLoading } = useHomeSections();

  const isEnabled = (id: string) => {
    const section = sections.find((s) => s.id === id);
    return section ? section.enabled : true; // default to true if not found yet
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Stoffverkauf Weber",
    description: "Hochwertige italienische Modestoffe als Meterware.",
    url: "https://www.stoffverkauf-weber.de",
    telephone: "06171/53159",
    email: "info@stoffverkauf-weber.de",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Musterstraße 1",
      addressLocality: "Oberursel",
      postalCode: "61440",
      addressCountry: "DE",
    },
  };

  if (isLoading) {
      return null; // Or a loader
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Stoffverkauf Weber | Italienische Modestoffe"
        description="Hochwertige italienische Modestoffe als Meterware. Schurwolle, Jersey, Viskose and mehr — für Ihre individuelle Garderobe."
        path="/"
        jsonLd={jsonLd}
      />
      <Navbar />
      <main className="flex-1">
        {isEnabled("hero") && <HeroSection />}
        {isEnabled("features") && <FeaturesBar />}
        {isEnabled("categories") && (
            <section id="kategorien">
              <PremiumSellerCarousel />
            </section>
        )}
        {isEnabled("bestseller") && (
            <section id="bestseller">
              <BestsellerCarousel />
            </section>
        )}
        {isEnabled("products") && (
            <section id="stoffe">
              <ProductGrid />
            </section>
        )}
        {isEnabled("offer") && (
            <section id="angebote">
              <OfferBanner />
            </section>
        )}
        {isEnabled("why") && <WhyChooseUs />}
        {isEnabled("testimonials") && <Testimonials />}
        {isEnabled("newsletter") && <NewsletterSection />}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Index;
