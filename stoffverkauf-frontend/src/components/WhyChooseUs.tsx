import { motion } from "framer-motion";
import { MapPin, BadgeCheck, Phone, Truck } from "lucide-react";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const WhyChooseUs = () => {
  const { t } = useI18n();

  const items = [
    { icon: MapPin, title: "why.italy.title" as TranslationKey, desc: "why.italy.desc" as TranslationKey },
    { icon: BadgeCheck, title: "why.quality.title" as TranslationKey, desc: "why.quality.desc" as TranslationKey },
    { icon: Phone, title: "why.advice.title" as TranslationKey, desc: "why.advice.desc" as TranslationKey },
    { icon: Truck, title: "why.shipping.title" as TranslationKey, desc: "why.shipping.desc" as TranslationKey },
  ];

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
            {t("why.title")}
          </h2>
          <p className="text-muted-foreground mt-3 font-body max-w-lg mx-auto">
            {t("why.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-5">
                <item.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                {t(item.title)}
              </h3>
              <p className="text-muted-foreground text-sm font-body leading-relaxed">
                {t(item.desc)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
