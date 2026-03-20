import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";

const Contact = () => {
  const { lang } = useI18n();
  const [submitted, setSubmitted] = useState(false);

  const info = [
    { icon: Phone, label: lang === "de" ? "Telefon" : "Phone", value: "06171/53159" },
    { icon: Mail, label: "E-Mail", value: "info@stoffverkauf-weber.de" },
    { icon: MapPin, label: lang === "de" ? "Adresse" : "Address", value: "Oberursel, Deutschland" },
    { icon: Clock, label: lang === "de" ? "Öffnungszeiten" : "Hours", value: lang === "de" ? "Mo-Fr: 10-18 Uhr, Sa: 10-14 Uhr" : "Mon-Fri: 10am-6pm, Sat: 10am-2pm" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={lang === "de" ? "Kontakt" : "Contact"}
        description={lang === "de" ? "Kontaktieren Sie Stoffverkauf Weber — Telefon, E-Mail oder Kontaktformular. Wir beraten Sie gerne." : "Contact Stoffverkauf Weber — phone, email or contact form. We're happy to help."}
        path="/contact"
      />
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              {lang === "de" ? "Kontakt" : "Contact Us"}
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {lang === "de"
                ? "Haben Sie Fragen zu unseren Stoffen? Wir beraten Sie gerne persönlich."
                : "Have questions about our fabrics? We're happy to help personally."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact info */}
            <div className="lg:col-span-2 space-y-4">
              {info.map((item) => (
                <div key={item.label} className="flex items-start gap-4 bg-card rounded-xl border border-border p-5 shadow-card">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
                  <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    {lang === "de" ? "Nachricht gesendet!" : "Message Sent!"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {lang === "de" ? "Wir melden uns innerhalb von 24 Stunden bei Ihnen." : "We'll get back to you within 24 hours."}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input placeholder={lang === "de" ? "Name" : "Name"} required className="px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body" />
                    <input type="email" placeholder="E-Mail" required className="px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body" />
                  </div>
                  <input placeholder={lang === "de" ? "Betreff" : "Subject"} className="w-full px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body" />
                  <textarea placeholder={lang === "de" ? "Ihre Nachricht..." : "Your message..."} rows={5} required className="w-full px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body resize-none" />
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                    <Send className="w-4 h-4" />
                    {lang === "de" ? "Nachricht senden" : "Send Message"}
                  </motion.button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Contact;
