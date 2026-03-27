import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import api from "../../api";
import heroBanner from "@/assets/hero-banner.jpg";
import hero1 from "@/assets/hero-1.png";
import hero2 from "@/assets/hero-2.png";

const staticSlides = [
  { image: heroBanner, key: "main" },
  { image: hero1, key: "hero1" },
  { image: hero2, key: "hero2" },
];

const HeroSection = () => {
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);
  const [heroData, setHeroData] = useState<any>(null);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await api.get("/api/home-sections");
        const hero = res.data.find((s: any) => s.id === "hero");
        if (hero && hero.enabled && hero.data) {
          setHeroData(hero.data);
        }
      } catch (err) {
        console.error("Failed to fetch hero section", err);
      }
    };
    fetchHero();
  }, []);

  const slides = heroData?.images?.length > 0 
    ? heroData.images.map((img: string, i: number) => ({ image: img, key: `dynamic-${i}` }))
    : staticSlides;

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative overflow-hidden">
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current].key}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt={heroData?.title2 || t("hero.title2")}
            className="w-full h-full object-cover"
            loading={current === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-foreground/50" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative container mx-auto px-4 lg:px-8 py-24 sm:py-32 lg:py-44">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block text-sm font-medium tracking-widest uppercase text-primary-foreground/80 mb-4"
          >
            {heroData?.badge || t("hero.badge")}
          </motion.span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6">
            {heroData?.title1 || t("hero.title1")}
            <br />
            <span className="italic">{heroData?.title2 || t("hero.title2")}</span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-foreground/80 font-body mb-8 max-w-lg">
            {heroData?.subtitle || t("hero.subtitle")}
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/#shop"
              className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-8 py-4 rounded-lg font-body font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              {heroData?.cta1 || t("hero.cta")} <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/#categories"
              className="inline-flex items-center gap-2 border border-primary-foreground/30 text-primary-foreground px-8 py-4 rounded-lg font-body font-semibold text-sm hover:bg-primary-foreground/10 transition-colors"
            >
              {heroData?.cta2 || t("hero.cta2")}
            </a>
          </div>
        </motion.div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/30 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/30 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === current
                ? "bg-primary-foreground w-8"
                : "bg-primary-foreground/40 hover:bg-primary-foreground/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
