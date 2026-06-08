import { motion } from "framer-motion";
import { Award, Heart, Leaf, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";

const About = () => {
  const { lang } = useI18n();

  const values = [
    { icon: Award, title: lang === "de" ? "Qualität" : "Quality", desc: lang === "de" ? "Nur die besten Stoffe aus Italien" : "Only the finest fabrics from Italy" },
    { icon: Heart, title: lang === "de" ? "Leidenschaft" : "Passion", desc: lang === "de" ? "Stoff ist unser Leben" : "Fabric is our life" },
    { icon: Leaf, title: lang === "de" ? "Nachhaltigkeit" : "Sustainability", desc: lang === "de" ? "Verantwortungsvolle Beschaffung" : "Responsible sourcing" },
    { icon: Users, title: lang === "de" ? "Service" : "Service", desc: lang === "de" ? "Persönliche Beratung" : "Personal consultation" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={lang === "de" ? "Über uns" : "About Us"}
        description={lang === "de" ? "Erfahren Sie mehr über Stoffverkauf Weber — Ihr Partner für hochwertige italienische Designerstoffe." : "Learn more about Stoffverkauf Weber — your partner for premium Italian designer fabrics."}
        path="/about"
      />
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-hero-gradient py-20 lg:py-28">
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {lang === "de" ? "ÜBER UNS" : "ABOUT US"}
            </motion.h1>
            {/* <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-muted-foreground leading-relaxed">
              {lang === "de"
                ? "Seit Jahren sind wir Ihr verlässlicher Partner für hochwertige italienische Designerstoffe. Unser Sortiment umfasst Flanell, Schurwolle, Jersey und vieles mehr — immer direkt aus den besten Webereien Italiens."
                : "For years, we've been your reliable partner for premium Italian designer fabrics. Our range includes flannel, virgin wool, jersey and much more — always directly from Italy's finest mills."}
            </motion.p> */}
          </div>
        </section>

        {/* Values */}
        {/* <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
              {lang === "de" ? "Unsere Werte" : "Our Values"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl border border-border p-6 text-center shadow-card"
                >
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <v.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}

        {/* Story */}
<section className="bg-secondary py-16 lg:py-24">
  <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
    {/* <h2 className="font-display text-3xl font-bold text-foreground text-center mb-8">
      {lang === "de" ? "Über Stoffverkauf Weber" : "About Stoffverkauf Weber"}
    </h2> */}

    <div className="space-y-6 text-muted-foreground leading-relaxed font-body">
      <p>
        {lang === "de"
          ? 'Seit mehr als 35 Jahren führen wir ein weitreichendes Sortiment an original italienischen Designerstoffen und internationalen Modestoffen. Unsere Kollektionen werden zweimal jährlich in Mailand, Paris, New York und London präsentiert.'
          : 'For more than 35 years, we have offered an extensive range of original Italian designer fabrics and international fashion fabrics. Our collections are presented twice yearly in Milan, Paris, New York, and London.'}
      </p>

      <p>
        {lang === "de"
          ? 'Unsere Devise: "Lieber weniger, dafür gute Qualität" – Wir sind spezialisiert auf hochwertige Meterware für Bekleidung, Haute-Couture-Stoffe und exklusive Designerstoffe aus Überproduktion.'
          : 'Our Philosophy: "Less but better quality" – We specialize in high-quality meter fabrics for clothing, haute couture materials, and exclusive designer fabrics from overproduction.'}
      </p>

      <div>
        <h3 className="font-semibold text-foreground mb-3">
          {lang === "de" ? "✨ Was Wir Bieten:" : "✨ What We Offer:"}
        </h3>

        <ul className="space-y-2 list-disc pl-5">
          {lang === "de" ? (
            <>
              <li>Italienische Haute-Couture-Stoffe</li>
              <li>Exklusive Designerstoffe (Jacquard, Seide, Wolle, Kaschmir)</li>
              <li>Französische Spitzen und Applikationen</li>
              <li>Baumwolle, Leinen, Viskose und Microfaser-Stoffe</li>
              <li>Nähzubehör, Schnitte und Kurzwaren</li>
            </>
          ) : (
            <>
              <li>Italian haute couture fabrics</li>
              <li>Exclusive designer fabrics (jacquard, silk, wool, cashmere)</li>
              <li>French lace and appliqués</li>
              <li>Cotton, linen, viscose, and microfiber fabrics</li>
              <li>Sewing accessories, patterns, and haberdashery</li>
            </>
          )}
        </ul>
      </div>

      <p>
        {lang === "de"
          ? "📍 Unser Standort in 61440 Oberursel zieht Käufer aus ganz Deutschland an."
          : "📍 Our location in 61440 Oberursel attracts buyers from all across Germany."}
      </p>

      <p>
        {lang === "de"
          ? "📺 Zu unserem 25-jährigen Jubiläum hat Rhein-Main TV eine Reportage über uns gemacht."
          : "📺 At our 25th anniversary, Rhein-Main TV created a special reportage about our story."}
      </p>

      <p className="font-medium text-foreground text-lg">
        {lang === "de"
          ? "Schön, dass Sie uns gefunden haben. Lassen Sie sich begeistern!"
          : "Beautiful that you've found us. Let us inspire you!"}
      </p>
    </div>
  </div>
</section>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default About;
