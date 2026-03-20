import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useI18n, type TranslationKey } from "@/lib/i18n";

import productFlanellPremium from "@/assets/product-flanell-premium.jpg";
import productJerseyDesigner from "@/assets/product-jersey-designer.jpg";
import productLeinenDesigner from "@/assets/product-leinen-designer.jpg";
import productMantelDesigner from "@/assets/product-mantel-designer.jpg";

const CategoryShowcase = () => {
  const { t } = useI18n();

  const cats = [
    { img: productFlanellPremium, title: "cats.flanell" as TranslationKey, desc: "cats.flanell.desc" as TranslationKey, href: "/#shop" },
    { img: productJerseyDesigner, title: "cats.designer" as TranslationKey, desc: "cats.designer.desc" as TranslationKey, href: "/#shop" },
    { img: productLeinenDesigner, title: "cats.leinen" as TranslationKey, desc: "cats.leinen.desc" as TranslationKey, href: "/#shop" },
    { img: productMantelDesigner, title: "cats.mantel" as TranslationKey, desc: "cats.mantel.desc" as TranslationKey, href: "/#shop" },
  ];

  return (
    <section id="categories" className="py-16 lg:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
            {t("cats.title")}
          </h2>
          <p className="text-muted-foreground mt-3 font-body max-w-lg mx-auto">
            {t("cats.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cats.map((cat, i) => (
            <motion.a
              key={cat.title}
              href={cat.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-xl overflow-hidden aspect-[3/4] block"
            >
              <img
                src={cat.img}
                alt={t(cat.title)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-display text-xl font-bold text-primary-foreground mb-1">
                  {t(cat.title)}
                </h3>
                <p className="text-primary-foreground/70 text-sm font-body mb-3">
                  {t(cat.desc)}
                </p>
                <span className="inline-flex items-center gap-1 text-primary-foreground text-sm font-semibold font-body group-hover:gap-2 transition-all bg-accent/90 px-3 py-1.5 rounded-full">
                  {t("cats.browse")} <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
