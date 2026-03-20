import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CreditCard, Truck, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";

const steps = [
  { id: "shipping", iconDe: "Versand", iconEn: "Shipping" },
  { id: "payment", iconDe: "Zahlung", iconEn: "Payment" },
  { id: "review", iconDe: "Überprüfen", iconEn: "Review" },
];

const Checkout = () => {
  const { lang } = useI18n();
  const { items, total } = useCart();
  const [step, setStep] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const shipping = total >= 100 ? 0 : 5.90;
  const tax = (total + shipping) * 0.19;
  const grandTotal = total + shipping + tax;

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-accent" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-3">
              {lang === "de" ? "Bestellung aufgegeben!" : "Order Placed!"}
            </h1>
            <p className="text-muted-foreground mb-2">
              {lang === "de" ? "Bestellnummer: ORD-2026-004" : "Order number: ORD-2026-004"}
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              {lang === "de"
                ? "Sie erhalten eine Bestätigungs-E-Mail mit Ihren Bestelldetails."
                : "You'll receive a confirmation email with your order details."}
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/orders" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                {lang === "de" ? "Bestellung verfolgen" : "Track Order"}
              </Link>
              <Link to="/" className="border border-border px-6 py-3 rounded-lg font-semibold text-foreground hover:bg-secondary transition-colors">
                {lang === "de" ? "Weiter einkaufen" : "Continue Shopping"}
              </Link>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={lang === "de" ? "Zur Kasse" : "Checkout"} description={lang === "de" ? "Schließen Sie Ihre Bestellung bei Stoffverkauf Weber ab." : "Complete your order at Stoffverkauf Weber."} path="/checkout" noIndex />
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            {lang === "de" ? "Zurück zum Shop" : "Back to Shop"}
          </Link>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                  {lang === "de" ? s.iconDe : s.iconEn}
                </span>
                {i < steps.length - 1 && <div className={`w-12 h-0.5 ${i < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-accent" />
                      {lang === "de" ? "Lieferadresse" : "Shipping Address"}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input placeholder={lang === "de" ? "Vorname" : "First name"} className="px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body" />
                      <input placeholder={lang === "de" ? "Nachname" : "Last name"} className="px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body" />
                      <input placeholder={lang === "de" ? "Straße & Hausnr." : "Street address"} className="sm:col-span-2 px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body" />
                      <input placeholder={lang === "de" ? "PLZ" : "ZIP code"} className="px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body" />
                      <input placeholder={lang === "de" ? "Stadt" : "City"} className="px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body" />
                      <input placeholder={lang === "de" ? "Telefon" : "Phone"} className="px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body" />
                      <input placeholder="E-Mail" className="px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body" />
                    </div>
                    <div className="mt-4 bg-secondary/50 rounded-lg p-4 flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{lang === "de" ? "Versand" : "Shipping"}</p>
                        <p className="text-xs text-muted-foreground">
                          {total >= 100
                            ? (lang === "de" ? "Kostenloser Versand (ab 100 €)" : "Free shipping (orders over €100)")
                            : (lang === "de" ? "Standardversand: 5,90 €" : "Standard shipping: €5.90")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-accent" />
                      {lang === "de" ? "Zahlungsmethode" : "Payment Method"}
                    </h2>
                    <div className="space-y-3 mb-6">
                      {[
                        { id: "card", label: lang === "de" ? "Kreditkarte" : "Credit Card", desc: "Visa, Mastercard, AMEX" },
                        { id: "paypal", label: "PayPal", desc: "paypal@example.com" },
                        { id: "klarna", label: "Klarna", desc: lang === "de" ? "Rechnung / Ratenkauf" : "Invoice / Installments" },
                        { id: "sepa", label: "SEPA", desc: lang === "de" ? "Lastschrift" : "Direct Debit" },
                      ].map((method) => (
                        <label key={method.id} className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                          <input type="radio" name="payment" defaultChecked={method.id === "card"} className="text-accent" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{method.label}</p>
                            <p className="text-xs text-muted-foreground">{method.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <input placeholder={lang === "de" ? "Kartennummer" : "Card number"} className="w-full px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body" />
                      <div className="grid grid-cols-2 gap-4">
                        <input placeholder="MM / YY" className="px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body" />
                        <input placeholder="CVC" className="px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 text-accent" />
                      {lang === "de" ? "SSL-verschlüsselte Zahlung" : "SSL encrypted payment"}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                      {lang === "de" ? "Bestellung überprüfen" : "Review Order"}
                    </h2>
                    <div className="space-y-4 mb-6">
                      {items.map((item) => (
                        <div key={item._id} className="flex items-center gap-4">
                          <img src={item.images[0]} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-secondary" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.quantity}x {item.price.toFixed(2)} €</p>
                          </div>
                          <p className="font-semibold text-foreground">{(item.price * item.quantity).toFixed(2)} €</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{lang === "de" ? "Lieferadresse" : "Shipping address"}</span>
                        <span>Musterstraße 1, 61440 Oberursel</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{lang === "de" ? "Zahlung" : "Payment"}</span>
                        <span>Visa •••• 4242</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border border-border text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {lang === "de" ? "Zurück" : "Back"}
                </button>
                {step < 2 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(step + 1)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    {lang === "de" ? "Weiter" : "Continue"}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setOrderPlaced(true)}
                    className="flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3 rounded-lg font-bold hover:bg-accent/90 transition-colors"
                  >
                    {lang === "de" ? "Zahlungspflichtig bestellen" : "Place Binding Order"}
                    <CheckCircle2 className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Order summary sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 shadow-card sticky top-28">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">
                  {lang === "de" ? "Zusammenfassung" : "Summary"}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{lang === "de" ? "Zwischensumme" : "Subtotal"}</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{lang === "de" ? "Versand" : "Shipping"}</span>
                    <span>{shipping === 0 ? (lang === "de" ? "Kostenlos" : "Free") : `${shipping.toFixed(2)} €`}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{lang === "de" ? "MwSt. (19%)" : "VAT (19%)"}</span>
                    <span>{tax.toFixed(2)} €</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground">
                    <span>{lang === "de" ? "Gesamt" : "Total"}</span>
                    <span>{grandTotal.toFixed(2)} €</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-secondary/50 rounded-lg text-xs text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                  {lang === "de" ? "Sichere Zahlung & kostenlose Rückgabe" : "Secure payment & free returns"}
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
