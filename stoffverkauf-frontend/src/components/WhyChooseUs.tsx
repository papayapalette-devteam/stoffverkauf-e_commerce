
import { motion } from "framer-motion";
import {
  MapPin,
  BadgeCheck,
  Phone,
  Truck,
  Award,
  Users,
  Target,
  Tv
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

const WhyChooseUs = () => {
  const { lang } = useI18n();

 const items = [ 
  { icon: Award, title: lang === "de" ? "35+ Jahre Erfahrung mit italienischen Designerstoffen" : "35+ Years of Expertise in Italian Designer Fabrics", }, 
  { icon: MapPin, title: lang === "de" ? "Exklusiver Zugang zu Haute-Couture-Materialien" : "Exclusive Access to Haute Couture Materials", }, 
  { icon: BadgeCheck, title: lang === "de" ? "Qualität zuerst – Wir vertrauen nur Premium-Stoffen" : "Quality First – We Trust Only Premium Fabrics", }, 
  { icon: Truck, title: lang === "de" ? "Onlineshop & bundesweiter Versandhandel" : "Online Shop & Nationwide Mail Order Service", }, 
  { icon: Phone, title: lang === "de" ? "Persönliche Farbberatung – Finden Sie Ihren Typ (Frühling, Sommer, Herbst, Winter)" : "Personal Color Consultation – Find Your Type (Spring, Summer, Autumn, Winter)", }, 
  { icon: Target, title: lang === "de" ? "Spezialisiert auf hochwertige Meterware" : "Specialized in High-Quality Meter Ware", }, 
  { icon: Users, title: lang === "de" ? "Käufer aus ganz Deutschland besuchen uns in Oberursel" : "Buyers from All Across Germany Visit Us in Oberursel", }, 
  { icon: Tv, title: lang === "de" ? "Betriebssystem auf Rhein-Main TV für unser 25-jähriges Jubiläum" : "Featured on Rhein-Main TV for Our 25th Anniversary", }, 
];

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
            {lang === "de"
              ? "Warum bei Stoffverkauf Weber kaufen?"
              : "Why Choose Stoffverkauf Weber?"}
          </h2>

          <p className="text-muted-foreground mt-4 font-body max-w-3xl mx-auto leading-relaxed">
            {lang === "de"
              ? "Wir beraten Sie gerne, welche Farben zu Ihnen passen. Sind Sie ein Frühling-, Sommer-, Herbst- oder Wintertyp? Lassen Sie sich begeistern!"
              : "We personally advise you on which colors suit you best. Are you a Spring, Summer, Autumn, or Winter type? Let us inspire you!"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-5">
                <item.icon className="w-6 h-6 text-accent" />
              </div>

              {/* <h3 className="font-display text-lg font-bold text-foreground mb-3">
                {item.title}
              </h3> */}

              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.title}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

