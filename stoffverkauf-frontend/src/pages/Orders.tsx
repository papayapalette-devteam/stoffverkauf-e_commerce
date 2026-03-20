import { motion } from "framer-motion";
import { Package, Truck, CheckCircle2, Clock, XCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { mockOrders } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";

const statusConfig = {
  processing: { icon: Clock, color: "text-accent", bgColor: "bg-accent/10", de: "In Bearbeitung", en: "Processing" },
  shipped: { icon: Truck, color: "text-blue-500", bgColor: "bg-blue-500/10", de: "Versandt", en: "Shipped" },
  delivered: { icon: CheckCircle2, color: "text-green-500", bgColor: "bg-green-500/10", de: "Zugestellt", en: "Delivered" },
  cancelled: { icon: XCircle, color: "text-destructive", bgColor: "bg-destructive/10", de: "Storniert", en: "Cancelled" },
};

const Orders = () => {
  const { lang } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={lang === "de" ? "Meine Bestellungen" : "My Orders"} description={lang === "de" ? "Verfolgen Sie Ihre Bestellungen bei Stoffverkauf Weber." : "Track your orders at Stoffverkauf Weber."} path="/orders" noIndex />
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">
            {lang === "de" ? "Meine Bestellungen" : "My Orders"}
          </h1>

          <div className="space-y-4">
            {mockOrders.map((order, i) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-6 shadow-card"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="font-semibold text-foreground">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString(lang === "de" ? "de-DE" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bgColor} ${status.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {lang === "de" ? status.de : status.en}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, j) => (
                      <div key={j} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                        <span className="text-foreground font-medium">{(item.price * item.quantity).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-foreground">{order.total.toFixed(2)} €</span>
                      {order.trackingNumber && (
                        <span className="text-xs text-muted-foreground">
                          {lang === "de" ? "Sendung:" : "Tracking:"} {order.trackingNumber}
                        </span>
                      )}
                    </div>
                    <Link to={`/orders/${order.id}`} className="flex items-center gap-1 text-sm text-accent font-semibold hover:underline">
                      {lang === "de" ? "Details" : "Details"}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Timeline for shipped/processing */}
                  {(order.status === "shipped" || order.status === "processing") && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        {["ordered", "confirmed", "shipped", "delivered"].map((s, idx) => {
                          const isActive = (order.status === "processing" && idx <= 1) || (order.status === "shipped" && idx <= 2);
                          return (
                            <div key={s} className="flex items-center gap-2 flex-1">
                              <div className={`w-3 h-3 rounded-full shrink-0 ${isActive ? "bg-accent" : "bg-border"}`} />
                              {idx < 3 && <div className={`h-0.5 flex-1 ${isActive ? "bg-accent" : "bg-border"}`} />}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">{lang === "de" ? "Bestellt" : "Ordered"}</span>
                        <span className="text-[10px] text-muted-foreground">{lang === "de" ? "Bestätigt" : "Confirmed"}</span>
                        <span className="text-[10px] text-muted-foreground">{lang === "de" ? "Versandt" : "Shipped"}</span>
                        <span className="text-[10px] text-muted-foreground">{lang === "de" ? "Zugestellt" : "Delivered"}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Orders;
