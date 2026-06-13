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
  Scissors,
  Sparkles,
  ShoppingBasket
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
  applicableProducts?: any[];
  applicableCategories?: any[];
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
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent/20 selection:text-foreground overflow-hidden">
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
      
      <main className="flex-1 relative">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-primary/5 via-accent/5 to-transparent -z-10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -z-10 mix-blend-screen" />
        <div className="absolute top-40 left-0 w-[30rem] h-[30rem] bg-accent/20 blur-[120px] rounded-full -z-10 mix-blend-screen" />

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8 text-center relative z-10 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 text-accent font-bold text-xs uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(var(--accent),0.2)]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{de ? "Exklusive Aktionen" : "Exclusive Promotions"}</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="font-display text-5xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground to-muted-foreground mb-6 leading-[1.1] pb-2"
            >
              {de ? "Sparen Sie bei Ihrem nächsten Stoffkauf" : "Save on your next fabric purchase"}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-lg lg:text-xl text-muted-foreground leading-relaxed font-body max-w-2xl mx-auto"
            >
              {de
                ? "Sichern Sie sich erstklassige italienische Modestoffe zu unschlagbaren Preisen. Entdecken Sie unten unsere aktuellen Rabattcodes."
                : "Secure first-class Italian fashion fabrics at unbeatable prices. Discover our current discount codes below."}
            </motion.p>
          </div>
        </section>

        {/* Coupons List Section */}
        <section className="pb-24 lg:pb-32 relative z-10">
          <div className="container mx-auto px-4 lg:px-8">
            {loading ? (
              /* Loading Skeleton */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-card/50 rounded-[2rem] border border-border p-8 h-80 animate-pulse flex flex-col justify-between backdrop-blur-sm">
                    <div className="space-y-6">
                      <div className="h-8 w-1/3 bg-muted rounded-full" />
                      <div className="h-14 w-2/3 bg-muted rounded-xl" />
                      <div className="h-4 w-1/2 bg-muted rounded" />
                    </div>
                    <div className="h-12 w-full bg-muted rounded-xl" />
                  </div>
                ))}
              </div>
            ) : coupons.length === 0 ? (
              /* Empty State */
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg mx-auto text-center py-16 px-8 bg-gradient-to-b from-card/80 to-card border border-border shadow-2xl shadow-black/5 rounded-[3rem] backdrop-blur-xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
                <div className="w-24 h-24 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full animate-pulse" />
                  <Gift className="w-12 h-12 text-accent relative z-10" />
                </div>
                <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4">
                  {de ? "Aktuell keine Gutscheine" : "No coupons available"}
                </h3>
                <p className="text-base text-muted-foreground font-body leading-relaxed mb-8">
                  {de
                    ? "Schauen Sie bald wieder vorbei oder abonnieren Sie unseren Newsletter, um das nächste große Angebot nicht zu verpassen!"
                    : "Check back soon or subscribe to our newsletter so you don't miss the next big offer!"}
                </p>
                <a 
                  href="/#stoffe" 
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl bg-foreground text-background font-body font-bold text-base hover:scale-105 hover:shadow-xl hover:shadow-foreground/20 transition-all duration-300"
                >
                  <ShoppingBasket className="w-5 h-5" />
                  {de ? "Stoffe durchstöbern" : "Browse Fabrics"}
                </a>
              </motion.div>
            ) : (
              /* Coupon Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <AnimatePresence mode="popLayout">
                  {coupons.map((coupon, index) => {
                    const isCopied = copiedCode === coupon.code;
                    const hasRestrictions = (coupon.applicableCategories && coupon.applicableCategories.length > 0) || (coupon.applicableProducts && coupon.applicableProducts.length > 0);

                    return (
                      <motion.div
                        key={coupon._id}
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ delay: index * 0.1, duration: 0.5, type: "spring", stiffness: 80 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="group relative bg-card rounded-[2rem] border border-border shadow-xl shadow-black/5 transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[300px]"
                      >
                        {/* Decorative Background Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Premium Decorative Scissors Notch */}
                        <div className="absolute left-0 right-0 top-[60%] -translate-y-1/2 flex items-center justify-between pointer-events-none px-0 z-20">
                          <div className="w-6 h-12 bg-background border-r border-border rounded-r-full -ml-px shadow-[inset_4px_0_10px_rgba(0,0,0,0.03)]" />
                          <div className="w-full border-t-[3px] border-dotted border-border/60 mx-4" />
                          <div className="w-6 h-12 bg-background border-l border-border rounded-l-full -mr-px shadow-[inset_-4px_0_10px_rgba(0,0,0,0.03)]" />
                        </div>

                        {/* Top half of coupon */}
                        <div className="p-8 pb-10 relative z-10 bg-gradient-to-br from-secondary/40 to-transparent">
                          <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-start gap-4">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-accent/10 text-xs font-bold text-accent uppercase tracking-widest">
                                <Tag className="w-3.5 h-3.5" />
                                {de ? "Gutschein" : "Coupon"}
                              </span>
                              
                              {coupon.expires && (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary/80 text-xs text-muted-foreground font-semibold">
                                  <Calendar className="w-3.5 h-3.5 text-foreground/60" />
                                  {de ? `Bis ${new Date(coupon.expires).toLocaleDateString("de-DE")}` : `Until ${new Date(coupon.expires).toLocaleDateString()}`}
                                </span>
                              )}
                            </div>

                            <div>
                              <h3 className="font-display text-5xl font-black text-foreground tracking-tight flex items-baseline gap-1 mt-2">
                                {coupon.type === "percent" ? (
                                  <>
                                    <span className="bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">{coupon.value}</span>
                                    <span className="text-3xl font-extrabold text-accent">%</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">{coupon.value}</span>
                                    <span className="text-3xl font-extrabold text-accent">€</span>
                                  </>
                                )}
                                <span className="text-base font-bold text-muted-foreground ml-2 uppercase font-body tracking-wider">
                                  {de ? "Rabatt" : "Off"}
                                </span>
                              </h3>
                              
                              <p className="text-sm font-semibold text-muted-foreground mt-3 flex items-center gap-1.5">
                                <ShoppingBag className="w-4 h-4" />
                                {coupon.minOrder > 0 ? (
                                  de 
                                    ? `Mindestbestellwert: ${coupon.minOrder.toFixed(2)} €` 
                                    : `Min. order: €${coupon.minOrder.toFixed(2)}`
                                ) : (
                                  de ? "Kein Mindestbestellwert" : "No minimum order"
                                )}
                              </p>
                            </div>

                            {/* Restrictions Display */}
                            {hasRestrictions && (
                              <div className="mt-2 pt-4 border-t border-border/50">
                                <p className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">{de ? "Gültig für:" : "Valid for:"}</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {coupon.applicableCategories?.map((cat: any) => (
                                    <span key={cat._id} className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1">
                                      <span className="opacity-70 font-normal">{de ? "Kategorie:" : "Category:"}</span>
                                      {cat.name}
                                    </span>
                                  ))}
                                  {coupon.applicableProducts?.map((prod: any) => (
                                    <span key={prod._id} className="bg-secondary border border-border text-secondary-foreground px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1">
                                      <span className="opacity-70 font-normal">{de ? "Produkt:" : "Product:"}</span>
                                      {prod.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom half of coupon */}
                        <div className="p-8 pt-10 relative z-10 bg-card rounded-b-[2rem]">
                          <div className="flex flex-col gap-4">
                            {/* Monospaced code box */}
                            <div className="relative overflow-hidden flex items-center justify-between border-2 border-dashed border-accent/30 rounded-2xl px-5 py-4 bg-accent/[0.04] group-hover:bg-accent/[0.08] transition-colors">
                              <span className="font-mono text-xl font-black text-foreground tracking-widest select-all">
                                {coupon.code}
                              </span>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Scissors className="w-5 h-5 text-accent/40 pointer-events-none -rotate-45" />
                              </div>
                            </div>

                            {/* Action Button */}
                            <button
                              onClick={() => handleCopyCode(coupon.code)}
                              className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-body font-bold text-sm shadow-lg transition-all duration-300 ${
                                isCopied
                                  ? "bg-emerald-500 text-white shadow-emerald-500/25 scale-[0.98]"
                                  : "bg-foreground text-background hover:scale-[1.02] hover:shadow-foreground/20"
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-5 h-5" />
                                  <span>{de ? "Kopiert!" : "Copied!"}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-5 h-5" />
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
