import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Tag, 
  Copy, 
  Check, 
  Calendar, 
  Info, 
  Percent, 
  Gift, 
  ShoppingBag, 
  HelpCircle,
  Scissors
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";
import api from "../../api";

interface Coupon {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  uses: number;
  maxUses: number;
  expires: string;
  active: boolean;
}

const Offers = () => {
  const { t, lang } = useI18n();
  const de = lang === "de";

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveCoupons = async () => {
      try {
        setLoading(true);
        // We set limit to 100 to make sure we fetch all coupons
        const resp = await api.get("/api/coupon/get-coupons", {
          params: { limit: 100 }
        });
        
        if (resp.data && resp.data.coupons) {
          const today = new Date().toISOString().split("T")[0];
          
          // Client-side filtering of active and non-expired coupons
          const activeOnly = resp.data.coupons.filter((c: Coupon) => {
            const isCouponActive = c.active === true;
            const isNotExpired = !c.expires || c.expires >= today;
            const hasRemainingUses = c.uses < c.maxUses;
            return isCouponActive && isNotExpired && hasRemainingUses;
          });
          
          setCoupons(activeOnly);
        }
      } catch (err) {
        console.error("Failed to load offers:", err);
        toast.error(
          de 
            ? "Fehler beim Laden der aktuellen Angebote. Bitte versuchen Sie es später noch einmal." 
            : "Failed to load current offers. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCoupons();
  }, [de]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(
      de 
        ? `Gutscheincode "${code}" in die Zwischenablage kopiert!` 
        : `Coupon code "${code}" copied to clipboard!`
    );
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent/20 selection:text-foreground">
      <SEO
        title={de ? "Aktuelle Angebote & Gutscheine" : "Current Offers & Coupons"}
        description={
          de 
            ? "Entdecken Sie exklusive Angebote und Gutscheincodes von Stoffverkauf Weber. Sparen Sie bei hochwertigen italienischen Designerstoffen." 
            : "Discover exclusive deals and coupon codes from Stoffverkauf Weber. Save on premium Italian designer fabrics."
        }
        path="/offers"
      />
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-hero-gradient py-16 lg:py-24 border-b border-border">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 lg:px-8 text-center relative z-10 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-semibold text-xs uppercase tracking-wider mb-5"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>{de ? "Exklusive Aktionen" : "Exclusive Promotions"}</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight"
            >
              {de ? "Unsere aktuellen Angebote" : "Our Current Offers"}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-base lg:text-lg text-muted-foreground leading-relaxed font-body max-w-2xl mx-auto"
            >
              {de
                ? "Sichern Sie sich erstklassige italienische Modestoffe zu unschlagbaren Preisen. Kopieren Sie einfach den Gutscheincode und lösen Sie ihn direkt an der Kasse ein."
                : "Secure first-class Italian fashion fabrics at unbeatable prices. Simply copy the coupon code and apply it directly at checkout."}
            </motion.p>
          </div>
        </section>

        {/* Coupons List Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            {loading ? (
              /* Loading Skeleton */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-card rounded-2xl border border-border p-6 h-64 animate-pulse flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="h-6 w-1/3 bg-muted rounded-full" />
                      <div className="h-10 w-2/3 bg-muted rounded" />
                      <div className="h-4 w-1/2 bg-muted rounded" />
                    </div>
                    <div className="h-10 w-full bg-muted rounded-lg" />
                  </div>
                ))}
              </div>
            ) : coupons.length === 0 ? (
              /* Empty State */
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto text-center py-12 px-6 bg-card rounded-2xl border border-border shadow-soft"
              >
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-5 text-muted-foreground">
                  <Tag className="w-8 h-8" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {de ? "Aktuell keine Gutscheine verfügbar" : "No coupons available right now"}
                </h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed mb-6">
                  {de
                    ? "Momentan gibt es keine aktiven Rabattcodes. Schauen Sie bald wieder vorbei oder abonnieren Sie unseren Newsletter, um kein Angebot zu verpassen!"
                    : "There are currently no active discount codes. Check back soon or subscribe to our newsletter to never miss a promotion!"}
                </p>
                <a 
                  href="/#stoffe" 
                  className="inline-flex items-center justify-center w-full px-5 py-3 rounded-lg bg-primary text-primary-foreground font-body font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  {de ? "Stoffe durchstöbern" : "Browse Fabrics"}
                </a>
              </motion.div>
            ) : (
              /* Coupon Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {coupons.map((coupon, index) => {
                    const isCopied = copiedCode === coupon.code;
                    return (
                      <motion.div
                        key={coupon._id}
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                        className="group relative bg-card hover:bg-card/85 rounded-2xl border border-border hover:border-accent/40 shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[260px]"
                      >
                        {/* Premium Decorative Scissors Notch */}
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none px-0">
                          <div className="w-4 h-8 bg-background border-r border-border rounded-r-full -ml-px group-hover:border-accent/40 transition-colors" />
                          <div className="w-full border-t border-dashed border-border group-hover:border-accent/25 transition-colors mx-2" />
                          <div className="w-4 h-8 bg-background border-l border-border rounded-l-full -mr-px group-hover:border-accent/40 transition-colors" />
                        </div>

                        {/* Top half of coupon */}
                        <div className="p-6 pb-4">
                          <div className="flex justify-between items-start gap-4">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent uppercase tracking-wider">
                              <Tag className="w-3 h-3" />
                              {de ? "Gutschein" : "Coupon"}
                            </span>
                            
                            {coupon.expires && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                                <Calendar className="w-3.5 h-3.5" />
                                {de ? `Gültig bis: ${coupon.expires}` : `Expires: ${coupon.expires}`}
                              </span>
                            )}
                          </div>

                          <div className="mt-4">
                            <h3 className="font-display text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight flex items-baseline gap-1">
                              {coupon.type === "percent" ? (
                                <>
                                  {coupon.value}
                                  <span className="text-2xl font-bold text-accent">%</span>
                                </>
                              ) : (
                                <>
                                  {coupon.value}
                                  <span className="text-2xl font-bold text-accent">€</span>
                                </>
                              )}
                              <span className="text-sm font-semibold text-muted-foreground ml-2 uppercase font-body tracking-wider">
                                {de ? "Rabatt" : "Off"}
                              </span>
                            </h3>
                            
                            <p className="text-sm font-body text-muted-foreground mt-2">
                              {coupon.minOrder > 0 ? (
                                de 
                                  ? `Mindestbestellwert: ${coupon.minOrder.toFixed(2)} €` 
                                  : `Minimum order value: €${coupon.minOrder.toFixed(2)}`
                              ) : (
                                de ? "Kein Mindestbestellwert" : "No minimum order"
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Bottom half of coupon */}
                        <div className="p-6 pt-4 relative z-10">
                          <div className="flex flex-col gap-3">
                            {/* Monospaced code box */}
                            <div className="relative overflow-hidden flex items-center justify-between border-2 border-dashed border-accent/25 rounded-xl px-4 py-3 bg-accent/[0.03] group-hover:bg-accent/[0.05] transition-colors">
                              <span className="font-mono text-lg font-bold text-foreground tracking-wider select-all">
                                {coupon.code}
                              </span>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Scissors className="w-4 h-4 text-accent/30 pointer-events-none" />
                              </div>
                            </div>

                            {/* Action Button */}
                            <button
                              onClick={() => handleCopyCode(coupon.code)}
                              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-body font-bold text-sm shadow-sm transition-all duration-200 ${
                                isCopied
                                  ? "bg-emerald-600 text-white shadow-emerald-600/10"
                                  : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-soft"
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span>{de ? "Kopiert!" : "Copied!"}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span>{de ? "Code kopieren" : "Copy Code"}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>

        {/* How to use & T&C Guide Section */}
        <section className="bg-secondary/40 py-16 lg:py-24 border-t border-border">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-12">
              {de ? "So einfach lösen Sie Ihren Gutschein ein" : "How to easily redeem your coupon"}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: Copy,
                  title: de ? "Code kopieren" : "Copy the Code",
                  desc: de 
                    ? "Wählen Sie einen passenden Rabatt aus und kopieren Sie den Code mit einem Klick auf die Zwischenablage." 
                    : "Select a suitable offer above and copy the code to your clipboard with a single click."
                },
                {
                  step: "02",
                  icon: ShoppingBag,
                  title: de ? "Stoffe einkaufen" : "Shop Premium Fabrics",
                  desc: de 
                    ? "Legen Sie Ihre gewünschten italienischen Stoffe (als Meterware) in Ihren Warenkorb." 
                    : "Add your desired premium Italian fabrics (by the meter) to your shopping cart."
                },
                {
                  step: "03",
                  icon: Check,
                  title: de ? "Im Checkout einlösen" : "Apply at Checkout",
                  desc: de 
                    ? "Tragen Sie den Code im Bestellvorgang (Kasse) in das Gutscheinfeld ein. Der Rabatt wird sofort abgezogen." 
                    : "Enter the code into the coupon field during checkout. Your discount will be applied instantly."
                }
              ].map((item, idx) => (
                <div key={idx} className="relative flex flex-col items-center text-center p-6 bg-card rounded-2xl border border-border/80 shadow-soft">
                  <span className="absolute top-4 right-6 font-display font-bold text-3xl text-accent/10 select-none">
                    {item.step}
                  </span>
                  
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4">
                    <item.icon className="w-5 h-5" />
                  </div>
                  
                  <h3 className="font-display font-bold text-base text-foreground mb-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed font-body">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Terms block */}
            <div className="mt-16 bg-card rounded-2xl border border-border p-6 lg:p-8">
              <div className="flex gap-3.5">
                <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display font-bold text-sm text-foreground mb-2">
                    {de ? "Wichtige Einlösebedingungen & Hinweise" : "Important Coupon Terms & General Information"}
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-muted-foreground font-body leading-relaxed">
                    <li>{de ? "Pro Bestellung kann nur ein Gutscheincode eingelöst werden." : "Only one coupon code can be applied per order."}</li>
                    <li>{de ? "Die Gutscheine gelten für das gesamte Sortiment, sofern nicht anders angegeben." : "Coupons apply to the entire range of fabrics unless specified otherwise."}</li>
                    <li>{de ? "Einige Gutscheine setzen einen Mindestbestellwert voraus, der exklusive Versandkosten berechnet wird." : "Some coupons require a minimum order value, which is calculated excluding shipping fees."}</li>
                    <li>{de ? "Der Rabattwert kann nicht in bar ausgezahlt oder nachträglich auf bereits getätigte Bestellungen angerechnet werden." : "Discounts cannot be redeemed for cash or applied retroactively to already placed orders."}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Offers;
