import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CreditCard, Truck, CheckCircle2, ShieldCheck, MapPin, Loader2, Download, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";
import api from "../../api";
import { toast } from "sonner";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from "@/lib/auth-context";

const steps = [
  { id: "shipping", iconDe: "Versand", iconEn: "Shipping" },
  { id: "payment", iconDe: "Zahlung", iconEn: "Payment" },
  { id: "review", iconDe: "Überprüfen", iconEn: "Review" },
];

const Checkout = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paypalOptions, setPaypalOptions] = useState<any>(null);
  const [isPaypalConfigLoading, setIsPaypalConfigLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    street: "",
    zipCode: "",
    city: "",
    phone: user?.phone?.toString() || "",
    email: user?.email || "",
    paymentMethod: "paypal"
  });

  useEffect(() => {
    const fetchPaypalConfig = async () => {
      try {
        const res = await api.get('/api/integration/paypal');
        if (res.data.success && res.data.integration.isActive) {
          // Check if Client ID exists. If not, use 'sb' for sandbox as a fallback to at least show the buttons.
          const clientId = res.data.integration.data.paypalClientId || 'sb';
          setPaypalOptions({
            "client-id": clientId,
            currency: "EUR",
            intent: "capture"
          });
          console.log("PayPal Config loaded:", clientId);
        } else {
            // Fallback for demo if no integration is active
            setPaypalOptions({
                "client-id": 'sb',
                currency: "EUR",
                intent: "capture"
              });
        }
      } catch (err) {
        console.error("PayPal config error:", err);
        // Ensure we still have basic buttons for testing
        setPaypalOptions({ "client-id": "sb", currency: "EUR" });
      } finally {
        setIsPaypalConfigLoading(false);
      }
    };
    fetchPaypalConfig();
  }, []);

  const shipping = total >= 100 ? 0 : 5.90;
  const grandTotal = total + shipping;

  const validateFields = () => {
    if (step === 0) {
      if (!formData.firstName || !formData.lastName || !formData.street || !formData.city) {
        toast.error(de ? "Bitte füllen Sie alle Pflichtfelder aus" : "Please fill all required fields");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateFields()) {
      setStep(Math.min(2, step + 1));
    }
  };

  const handleCreateOrder = async () => {
    try {
      const orderData = {
        user: user?._id,
        items: items.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: grandTotal,
        paymentMethod: formData.paymentMethod,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.street,
          zip: formData.zipCode,
          city: formData.city,
          phone: formData.phone,
          email: formData.email,
          country: "Germany"
        }
      };

      const res = await api.post('/api/order', orderData);
      if (res.data.success) {
        return res.data.order;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Order creation failed");
      return null;
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    const order = await handleCreateOrder();
    if (order) {
      setOrderId(order._id);
      setOrderPlaced(true);
      clearCart();
      toast.success(de ? "Vielen Dank für Ihre Bestellung!" : "Thank you for your order!");
    }
    setIsSubmitting(false);
  };

  const downloadInvoice = () => {
    window.open(`${api.defaults.baseURL}/api/order/${orderId}/invoice`, '_blank');
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg bg-card border border-border p-10 rounded-3xl shadow-xl">
            <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-8 animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-accent" />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              {de ? "Erfolg!" : "Success!"}
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              {de ? "Ihre Bestellung wurde erfolgreich aufgegeben." : "Your order has been placed successfully."}
            </p>
            <p className="text-sm font-mono text-accent mb-10 bg-accent/5 py-2 px-4 rounded-full inline-block">
              {de ? `BESTELL-NR: ${orderId}` : `ORDER ID: ${orderId}`}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={downloadInvoice} className="bg-accent text-accent-foreground px-8 py-3.5 rounded-xl font-bold hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20">
                <Download className="w-5 h-5" />
                {de ? "Rechnung laden" : "Get Invoice"}
              </button>
              <Link to="/orders" className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center">
                {de ? "Bestellungen ansehen" : "View Orders"}
              </Link>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title={de ? "Kasse" : "Checkout"} description={de ? "Schließen Sie Ihren Einkauf ab." : "Complete your purchase."} path="/checkout" noIndex />
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {de ? "Zurück zum Warenkorb" : "Back to Cart"}
          </Link>

          {/* New Modern Stepper */}
          <div className="relative mb-16 flex justify-between max-w-2xl mx-auto">
             <div className="absolute top-5 left-0 w-full h-0.5 bg-border -z-10" />
             <div className={`absolute top-5 left-0 h-0.5 bg-accent transition-all duration-500 -z-10`} style={{ width: `${(step / (steps.length - 1)) * 100}%` }} />
             {steps.map((s, i) => (
                <div key={s.id} className="flex flex-col items-center gap-3">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                     i <= step ? "bg-background border-accent text-accent shadow-[0_0_15px_rgba(var(--accent),0.3)]" : "bg-background border-border text-muted-foreground"
                   }`}>
                     {i < step ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-bold">{i + 1}</span>}
                   </div>
                   <span className={`text-xs font-bold uppercase tracking-widest ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                     {de ? s.iconDe : s.iconEn}
                   </span>
                </div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="shipping" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
                    <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                        <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                        <MapPin className="w-6 h-6 text-accent" />
                        {de ? "Wohin soll die Reise gehen?" : "Where should it be shipped?"}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Vorname</label>
                            <input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="Max" className="w-full px-5 py-3.5 bg-secondary/50 rounded-xl border border-border focus:ring-2 focus:ring-accent outline-none transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Nachname</label>
                            <input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Mustermann" className="w-full px-5 py-3.5 bg-secondary/50 rounded-xl border border-border focus:ring-2 focus:ring-accent outline-none transition-all" />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Straße & Hausnummer</label>
                            <input value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} placeholder="Beispielstraße 123" className="w-full px-5 py-3.5 bg-secondary/50 rounded-xl border border-border focus:ring-2 focus:ring-accent outline-none transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Postleitzahl</label>
                            <input value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} placeholder="12345" className="w-full px-5 py-3.5 bg-secondary/50 rounded-xl border border-border focus:ring-2 focus:ring-accent outline-none transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Stadt</label>
                            <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Berlin" className="w-full px-5 py-3.5 bg-secondary/50 rounded-xl border border-border focus:ring-2 focus:ring-accent outline-none transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">E-Mail</label>
                            <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="max@example.com" className="w-full px-5 py-3.5 bg-secondary/50 rounded-xl border border-border focus:ring-2 focus:ring-accent outline-none transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Telefon (Optional)</label>
                            <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+49 123 456789" className="w-full px-5 py-3.5 bg-secondary/50 rounded-xl border border-border focus:ring-2 focus:ring-accent outline-none transition-all" />
                        </div>
                        </div>
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="payment" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
                    <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                        <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-accent" />
                        {de ? "Wie möchten Sie bezahlen?" : "Payment Method"}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { id: "paypal", label: "PayPal", desc: de ? "Schnell & Sicher" : "Fast & Secure", color: "bg-blue-500" },
                            { id: "card", label: de ? "Kreditkarte" : "Credit Card", desc: "Stripe Payment", color: "bg-indigo-500" },
                            { id: "klarna", label: "Klarna", desc: "Buy now, pay later", color: "bg-pink-400" },
                        ].map((method) => (
                            <label key={method.id} className={`flex flex-col p-5 border-2 rounded-2xl cursor-pointer transition-all hover:border-accent ${formData.paymentMethod === method.id ? "border-accent bg-accent/5" : "border-border"}`}>
                            <input type="radio" name="payment" checked={formData.paymentMethod === method.id} onChange={() => setFormData({...formData, paymentMethod: method.id})} className="sr-only" />
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl ${method.color} flex items-center justify-center text-white`}>
                                   {method.id === 'paypal' ? <span className="font-bold italic">P</span> : <CreditCard className="w-5 h-5" />}
                                </div>
                                {formData.paymentMethod === method.id && <CheckCircle2 className="w-5 h-5 text-accent" />}
                            </div>
                            <p className="font-bold text-foreground">{method.label}</p>
                            <p className="text-xs text-muted-foreground">{method.desc}</p>
                            </label>
                        ))}
                        </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="review" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
                    <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                        <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-accent" />
                        {de ? "Zusammenfassung prüfen" : "Summary Review"}
                        </h2>
                        <div className="space-y-5">
                        {items.map((item) => (
                            <div key={item._id} className="flex items-center gap-5 p-4 bg-secondary/30 rounded-2xl border border-border/50">
                            <img src={item.images[0]} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                            <div className="flex-1">
                                <p className="font-bold text-foreground">{item.name}</p>
                                <p className="text-sm text-muted-foreground">{item.quantity}x {item.price.toFixed(2)} €</p>
                            </div>
                            <p className="font-bold text-foreground">{(item.price * item.quantity).toFixed(2)} €</p>
                            </div>
                        ))}
                        </div>

                        <div className="mt-8 p-6 bg-accent/5 border border-accent/20 rounded-2xl grid grid-cols-2 gap-8">
                           <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{de ? "Lieferung an" : "Shipping to"}</p>
                              <p className="text-sm font-bold text-foreground leading-relaxed">
                                 {formData.firstName} {formData.lastName}<br />
                                 {formData.street}<br />
                                 {formData.zipCode} {formData.city}
                              </p>
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{de ? "Zahlung via" : "Payment via"}</p>
                              <p className="text-sm font-bold text-accent uppercase">{formData.paymentMethod}</p>
                           </div>
                        </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between mt-10">
                <button onClick={() => setStep(Math.max(0, step - 1))} className={`flex items-center gap-2 font-bold px-6 py-3 rounded-xl border border-border transition-all hover:bg-secondary ${step === 0 ? "opacity-0 pointer-events-none" : ""}`}>
                  <ArrowLeft className="w-5 h-5" /> {de ? "Zurück" : "Back"}
                </button>
                
                {step < 2 ? (
                  <button onClick={handleNext} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                    {de ? "Weiter zum nächsten Schritt" : "Next Step"} <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="flex-1 max-w-sm ml-auto">
                  {formData.paymentMethod === "paypal" ? (
                    isPaypalConfigLoading ? (
                        <div className="h-12 w-full bg-secondary animate-pulse rounded-xl" />
                    ) : paypalOptions ? (
                        <PayPalScriptProvider options={paypalOptions}>
                        <PayPalButtons 
                            style={{ layout: "horizontal", height: 50, color: 'gold', shape: 'rect' }}
                            createOrder={async () => {
                            const order = await handleCreateOrder();
                            if (!order) return "";
                            const res = await api.post('/api/order/paypal/create', { orderId: order._id });
                            setOrderId(order._id);
                            return res.data.paypalOrderId;
                            }}
                            onApprove={async (data) => {
                            const res = await api.post('/api/order/paypal/capture', { paypalOrderId: data.orderID, orderId: orderId });
                            if (res.data.success) {
                                setOrderPlaced(true);
                                clearCart();
                                toast.success(de ? "Zahlung erfolgreich!" : "Payment successful!");
                            }
                            }}
                            onError={(err) => {
                                console.error("PayPal Error:", err);
                                toast.error(de ? "Fehler bei PayPal" : "PayPal error");
                            }}
                        />
                        </PayPalScriptProvider>
                    ) : (
                        <button onClick={handlePlaceOrder} className="w-full bg-destructive text-destructive-foreground px-8 py-4 rounded-xl font-bold shadow-lg">PayPal Config Missing</button>
                    )
                  ) : (
                    <button onClick={handlePlaceOrder} disabled={isSubmitting} className="w-full bg-accent text-accent-foreground px-8 py-4 rounded-xl font-bold hover:bg-accent/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/30">
                       {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                       {de ? "Jetzt kaufen (Kostenpflichtig)" : "Complete Purchase"}
                    </button>
                  )}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-card rounded-2xl border border-border p-8 shadow-sm space-y-6 sticky top-28">
                <h3 className="font-display text-xl font-bold text-foreground">{de ? "Einkaufswagen" : "Your Order"}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{de ? "Zwischensumme" : "Subtotal"}</span>
                    <span className="font-bold text-foreground">{total.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{de ? "Versandkosten" : "Shipping"}</span>
                    <span className="font-bold text-foreground">{shipping === 0 ? "0,00 €" : `${shipping.toFixed(2)} €`}</span>
                  </div>
                  {shipping === 0 && <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">{de ? "Versandkostenfreie Lieferung!" : "Free Shipping applied!"}</p>}
                  <div className="pt-4 border-t border-border flex justify-between">
                    <span className="font-display text-lg font-bold text-foreground">{de ? "Gesamtbetrag" : "Grand Total"}</span>
                    <span className="font-display text-2xl font-black text-accent">{grandTotal.toFixed(2)} €</span>
                  </div>
                </div>
                
                <div className="space-y-3 pt-6">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="w-4 h-4 text-green-500" /> {de ? "Sichere SSL-Verschlüsselung" : "Secure SSL Encryption"}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Truck className="w-4 h-4 text-accent" /> {de ? "Lieferung in 2-3 Werktagen" : "Delivery in 2-3 business days"}
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
