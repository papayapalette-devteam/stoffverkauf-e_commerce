import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const Testimonials = () => {
  const { t } = useI18n();

  const reviews = [1, 2, 3].map((i) => ({
    text: t(`test.${i}.text` as TranslationKey),
    name: t(`test.${i}.name` as TranslationKey),
    loc: t(`test.${i}.loc` as TranslationKey),
  }));

  return (
    <section className="py-16 lg:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
            {t("test.title")}
          </h2>
          <p className="text-muted-foreground mt-3 font-body">
            {t("test.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card rounded-xl p-6 shadow-card relative"
            >
              <Quote className="w-8 h-8 text-accent/20 absolute top-4 right-4" />
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground font-body text-sm leading-relaxed mb-5">
                „{r.text}"
              </p>
              <div className="border-t border-border pt-4">
                <p className="font-semibold text-sm text-foreground font-body">{r.name}</p>
                <p className="text-xs text-muted-foreground font-body">{r.loc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
