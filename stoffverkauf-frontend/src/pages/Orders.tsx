import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Truck, CheckCircle2, Clock, XCircle, ChevronRight, Loader2, Download, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "../../api";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";
import { toast } from "sonner";

const statusConfig: any = {
  processing: { icon: Clock, color: "text-accent", bgColor: "bg-accent/10", de: "In Bearbeitung", en: "Processing" },
  shipped: { icon: Truck, color: "text-blue-500", bgColor: "bg-blue-500/10", de: "Versandt", en: "Shipped" },
  delivered: { icon: CheckCircle2, color: "text-green-500", bgColor: "bg-green-500/10", de: "Zugestellt", en: "Delivered" },
  cancelled: { icon: XCircle, color: "text-destructive", bgColor: "bg-destructive/10", de: "Storniert", en: "Cancelled" },
};

const Orders = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id) return;
      try {
        const res = await api.get(`/api/order/my/${user?._id}`);
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error("Fetch orders error:", err);
        toast.error(de ? "Fehler beim Laden der Bestellungen" : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleDownloadInvoice = (orderId: string) => {
    window.open(`${api.defaults.baseURL}/api/order/${orderId}/invoice`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title={de ? "Meine Bestellungen" : "My Orders"} description={de ? "Verfolgen Sie Ihre Bestellungen bei Stoffverkauf Weber." : "Track your orders at Stoffverkauf Weber."} path="/orders" noIndex />
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {de ? "Meine Bestellungen" : "My Orders"}
            </h1>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
               <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
               <p className="text-muted-foreground">{de ? "Bestellungen werden geladen..." : "Loading orders..."}</p>
             </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-border px-6">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold text-foreground mb-2">{de ? "Keine Bestellungen gefunden" : "No orders found"}</h3>
              <p className="text-muted-foreground mb-6">{de ? "Sie haben noch keine Bestellungen aufgegeben." : "You haven't placed any orders yet."}</p>
              <button onClick={() => window.location.href = "/"} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                {de ? "Jetzt shoppen" : "Shop now"}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, i) => {
                const status = statusConfig[order.status] || statusConfig.processing;
                const StatusIcon = status.icon;
                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-start gap-4">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status.bgColor}`}>
                             <StatusIcon className={`w-6 h-6 ${status.color}`} />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0.5">#{order._id.slice(-8)}</p>
                              <h3 className="font-bold text-foreground text-lg">{de ? status.de : status.en}</h3>
                              <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString(de ? "de-DE" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button 
                            onClick={() => handleDownloadInvoice(order._id)}
                            className="flex items-center gap-2 bg-secondary text-foreground px-4 py-2 rounded-xl text-sm font-bold hover:bg-muted transition-colors border border-border"
                           >
                             <Download className="w-4 h-4" /> {de ? "Rechnung" : "Invoice"}
                           </button>
                        </div>
                      </div>

                      <div className="space-y-3 bg-secondary/30 rounded-xl p-4 mb-6">
                        {order.items.map((item: any, j: number) => (
                          <div key={j} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center font-bold text-xs text-muted-foreground">
                                 {item.quantity}
                               </div>
                               <span className="text-foreground font-medium">{item.name}</span>
                            </div>
                            <span className="text-foreground font-bold">{(item.price * item.quantity).toFixed(2)} €</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-dashed border-border">
                        <div className="flex items-center gap-6">
                           <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5 font-bold">{de ? "Gesamtsumme" : "Total Amount"}</p>
                              <p className="text-xl font-bold text-foreground">{order.total.toFixed(2)} €</p>
                           </div>
                           {order.trackingNumber && (
                              <div className="hidden sm:block">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5 font-bold">{de ? "Sendungsverfolgung" : "Tracking"}</p>
                                <p className="text-sm font-mono text-accent">{order.trackingNumber}</p>
                              </div>
                           )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                           {order.paymentMethod === 'paypal' ? 'PayPal' : order.paymentMethod} • {order.isPaid ? (de ? 'Bezahlt' : 'Paid') : (de ? 'Ausstehend' : 'Pending')}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
