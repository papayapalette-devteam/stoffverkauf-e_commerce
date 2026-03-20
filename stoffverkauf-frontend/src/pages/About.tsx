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
              {lang === "de" ? "Über Stoffverkauf Weber" : "About Stoffverkauf Weber"}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-muted-foreground leading-relaxed">
              {lang === "de"
                ? "Seit Jahren sind wir Ihr verlässlicher Partner für hochwertige italienische Designerstoffe. Unser Sortiment umfasst Flanell, Schurwolle, Jersey und vieles mehr — immer direkt aus den besten Webereien Italiens."
                : "For years, we've been your reliable partner for premium Italian designer fabrics. Our range includes flannel, virgin wool, jersey and much more — always directly from Italy's finest mills."}
            </motion.p>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 lg:py-24">
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
        </section>

        {/* Story */}
        <section className="bg-secondary py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-8">
              {lang === "de" ? "Unsere Geschichte" : "Our Story"}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed font-body">
              <p>
                {lang === "de"
                  ? "Stoffverkauf Weber wurde aus der Leidenschaft für hochwertige Textilien gegründet. Was als kleines Ladengeschäft in Oberursel begann, hat sich zu einem renommierten Anlaufpunkt für Schneider, Designer und Hobbyschneiderinnen entwickelt."
                  : "Stoffverkauf Weber was founded from a passion for premium textiles. What started as a small shop in Oberursel has grown into a renowned destination for tailors, designers, and hobby sewers."}
              </p>
              <p>
                {lang === "de"
                  ? "Wir reisen regelmäßig nach Italien, um die neuesten Trends und besten Qualitäten direkt von den Webereien zu sourced. Unser Ziel: Ihnen die beste Auswahl an Designerstoffen zu fairen Preisen zu bieten."
                  : "We regularly travel to Italy to source the latest trends and best qualities directly from the mills. Our goal: to offer you the finest selection of designer fabrics at fair prices."}
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
