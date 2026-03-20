import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesBar from "@/components/FeaturesBar";
import CategoryShowcase from "@/components/CategoryShowcase";
import BestsellerCarousel from "@/components/BestsellerCarousel";
import ProductGrid from "@/components/ProductGrid";
import WhyChooseUs from "@/components/WhyChooseUs";
import OfferBanner from "@/components/OfferBanner";
import Testimonials from "@/components/Testimonials";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SEO from "@/components/SEO";

const Index = () => {
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

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Stoffverkauf Weber | Italienische Modestoffe"
        description="Hochwertige italienische Modestoffe als Meterware. Schurwolle, Jersey, Viskose und mehr — für Ihre individuelle Garderobe."
        path="/"
        jsonLd={jsonLd}
      />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesBar />
        <section id="kategorien">
          <CategoryShowcase />
        </section>
        <section id="bestseller">
          <BestsellerCarousel />
        </section>
        <section id="stoffe">
          <ProductGrid />
        </section>
        <section id="angebote">
          <OfferBanner />
        </section>
        <WhyChooseUs />
        <Testimonials />
        <NewsletterSection />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Index;
