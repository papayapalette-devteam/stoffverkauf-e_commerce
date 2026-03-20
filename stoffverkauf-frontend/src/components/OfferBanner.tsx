import { motion } from "framer-motion";
import { ArrowRight, Percent } from "lucide-react";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const OfferBanner = () => {
  const { t } = useI18n();

  return (
    <section className="py-10 lg:py-14">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/15 via-accent/5 to-accent/15 border border-accent/20"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-8 lg:px-12 lg:py-10">
            <div className="flex items-center gap-5">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                <Percent className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-display text-xl lg:text-2xl font-bold text-foreground">
                  {t("offer.title")}
                </h3>
                <p className="text-muted-foreground font-body text-sm mt-1 max-w-md">
                  {t("offer.desc")}
                </p>
              </div>
            </div>
            <a
              href="/#shop"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-7 py-3.5 rounded-lg font-body font-semibold text-sm hover:opacity-90 transition-opacity flex-shrink-0"
            >
              {t("offer.cta")} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OfferBanner;
