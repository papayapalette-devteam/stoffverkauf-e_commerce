import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import api from "../../api"

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { t } = useI18n();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email) return;

  try {
    const res = await api.post("/api/subscribe/add-subscribers", { email }); // ✅ use api.post

    const data = res.data;

    if (!data.success) {
      toast.error(data.error || "Subscription failed");
      return;
    }

    setSubmitted(true);
    toast.success("Subscribed successfully!");
  } catch (err: any) {
    // Axios errors usually have response data
    const message = err?.response?.data?.error || "Subscription failed. Try again later.";
    toast.error(message);
  }
};

  return (
    <section className="bg-primary text-primary-foreground py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8 text-center max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
            {t("news.title")}
          </h2>
          <p className="text-primary-foreground/70 font-body mb-8">
            {t("news.subtitle")}
          </p>
          {submitted ? (
            <p className="text-accent font-semibold font-body">{t("news.success")}</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder={t("news.placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 px-4 py-3 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-body font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                {t("news.submit")} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
