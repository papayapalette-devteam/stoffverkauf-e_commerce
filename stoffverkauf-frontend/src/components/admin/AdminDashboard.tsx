import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { DollarSign, ShoppingBag, Users, Eye, ArrowUpRight, ArrowDownRight, TrendingUp, Calendar, Package, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import api from "../../../api";

interface Order {
  _id: string;
  createdAt: string;
  total: number;
  status: string;
}

interface ProductPerformance {
  name: string;
  sales: number;
  revenue: number;
  category: string;
}

const AdminDashboard = () => {
  const { lang } = useI18n();
  const de = lang === "de";

  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [analyticsRes, ordersRes] = await Promise.all([
        api.get("/api/order/admin/analytics", { params: { period: "7d" } }),
        api.get("/api/order/admin/all", { params: { page: 1, limit: 5 } })
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data);
      }
      if (ordersRes.data.success) {
        setRecentOrders(ordersRes.data.orders || []);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error(de ? "Fehler beim Laden der Dashboard-Daten" : "Failed to load dashboard metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [de]);

  // Fallback mock stats for Page Views (bypassed per request)
  const pageViewsVal = "45.821";
  const pageViewsChange = "—";
  const pageViewsUp = true;

  const stats = [
    { 
      label: de ? "Umsatz" : "Revenue", 
      value: analytics?.stats?.revenue?.value || "€0,00", 
      change: analytics?.stats?.revenue?.change || "0%", 
      up: analytics?.stats?.revenue?.up ?? true, 
      icon: DollarSign 
    },
    { 
      label: de ? "Bestellungen" : "Orders", 
      value: analytics?.stats?.orders?.value || "0", 
      change: analytics?.stats?.orders?.change || "0%", 
      up: analytics?.stats?.orders?.up ?? true, 
      icon: ShoppingBag 
    },
    { 
      label: de ? "Kunden" : "Customers", 
      value: analytics?.stats?.customers?.value || "0", 
      change: analytics?.stats?.customers?.change || "0%", 
      up: analytics?.stats?.customers?.up ?? true, 
      icon: Users 
    },
    { 
      label: de ? "Seitenaufrufe" : "Page Views", 
      value: pageViewsVal, 
      change: pageViewsChange, 
      up: pageViewsUp, 
      icon: Eye 
    },
  ];

  // Dynamic Chart Calculations
  const trend = analytics?.revenueTrend || [];
  const maxTrendVal = trend.length > 0 ? Math.max(...trend.map((t: any) => Number(t.value) || 0), 1) : 1;

  const topProducts: ProductPerformance[] = analytics?.topProducts || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {de ? "Dashboard Übersicht" : "Dashboard Overview"}
        </h2>
        <button
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="px-3.5 py-1.5 bg-secondary text-foreground text-xs font-semibold rounded-lg hover:bg-muted border border-border transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <Calendar className="w-3.5 h-3.5" />
          {de ? "Daten aktualisieren" : "Sync Data"}
        </button>
      </div>

      {/* Skeletons or Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.05 }} 
            className="bg-card rounded-xl border border-border p-5 shadow-card relative overflow-hidden"
          >
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="w-9 h-9 bg-secondary rounded-lg" />
                  <div className="w-12 h-4 bg-secondary rounded" />
                </div>
                <div className="w-20 h-7 bg-secondary rounded" />
                <div className="w-16 h-3 bg-secondary rounded" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-accent" />
                  </div>
                  {stat.change !== "—" && (
                    <span className={`text-xs font-semibold flex items-center gap-0.5 ${stat.up ? "text-green-500" : "text-destructive"}`}>
                      {stat.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Skeletons or Revenue Chart */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          {de ? "Umsatz der letzten 7 Tage" : "Revenue Last 7 Days"}
        </h3>
        
        {isLoading ? (
          <div className="h-48 flex items-end gap-3 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex-1 bg-secondary rounded-t-lg" style={{ height: `${20 + i * 10}%` }} />
            ))}
          </div>
        ) : trend.length === 0 ? (
          <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-lg text-muted-foreground text-sm">
            {de ? "Keine Umsatzdaten in diesem Zeitraum vorhanden" : "No revenue records found for this period"}
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-end gap-3 h-48 relative z-10">
              {trend.map((item: any, i: number) => {
                const pct = (Number(item.value) || 0) / maxTrendVal * 100;
                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                    className="flex-1 bg-accent/15 rounded-t-lg relative cursor-pointer hover:bg-accent/25 transition-colors"
                    style={{ height: "100%" }}
                  >
                    <motion.div 
                      initial={{ height: 0 }} 
                      animate={{ height: `${Math.max(pct, 4)}%` }} 
                      transition={{ delay: i * 0.04, duration: 0.5, ease: "easeOut" }} 
                      className="absolute inset-x-0 bottom-0 bg-accent rounded-t-lg" 
                    />
                  </div>
                );
              })}
            </div>
            
            {/* Popover Hover Tooltip */}
            <AnimatePresence>
              {hoveredBar !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-popover text-popover-foreground border border-border px-3.5 py-2.5 rounded-xl shadow-xl z-30 text-xs font-semibold min-w-44 text-center pointer-events-none flex flex-col gap-0.5"
                  style={{
                    left: `${((hoveredBar + 0.5) / trend.length) * 100}%`
                  }}
                >
                  <span className="text-muted-foreground text-[10px] font-medium block">
                    {trend[hoveredBar]?.label || ""}
                  </span>
                  <span className="text-foreground text-sm font-black">
                    {Number(trend[hoveredBar]?.value || 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-popover border-r border-b border-border rotate-45 -mt-1.5" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        <div className="flex justify-between mt-3 text-[10px] text-muted-foreground font-semibold uppercase px-1">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} className="w-8 h-3 bg-secondary rounded animate-pulse" />)
          ) : (
            trend.map((item: any, i: number) => <span key={i}>{item.label}</span>)
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-foreground">{de ? "Letzte Bestellungen" : "Recent Orders"}</h3>
            <span className="text-xs text-muted-foreground">({recentOrders.length} {de ? "gesamt" : "total"})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/35 text-muted-foreground font-semibold text-xs">
                  <th className="text-left p-4">{de ? "Bestell-Nr." : "Order ID"}</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">{de ? "Betrag" : "Amount"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4"><div className="w-16 h-4 bg-secondary rounded" /></td>
                      <td className="p-4"><div className="w-20 h-5 bg-secondary rounded-full" /></td>
                      <td className="p-4 text-right"><div className="w-14 h-4 bg-secondary rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-muted-foreground italic">
                      {de ? "Bisher keine Bestellungen vorhanden" : "No orders found in database"}
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-foreground text-xs">
                        {order._id ? order._id.substring(order._id.length - 8).toUpperCase() : ""}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          order.status === "delivered" ? "bg-green-500/10 text-green-600" :
                          order.status === "shipped" ? "bg-blue-500/10 text-blue-600" :
                          order.status === "cancelled" ? "bg-red-500/10 text-red-600" :
                          "bg-accent/10 text-accent"
                        }`}>{order.status}</span>
                      </td>
                      <td className="p-4 text-right font-black text-foreground text-xs">{Number(order.total || 0).toFixed(2)} €</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-foreground">{de ? "Bestseller (Top Produkte)" : "Bestselling Products"}</h3>
          </div>
          <div className="divide-y divide-border/60">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                  <div className="w-4 h-4 bg-secondary rounded" />
                  <div className="w-8 h-8 bg-secondary rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-4 bg-secondary rounded" />
                    <div className="w-16 h-3 bg-secondary rounded" />
                  </div>
                  <div className="w-12 h-4 bg-secondary rounded" />
                </div>
              ))
            ) : topProducts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground italic text-sm">
                {de ? "Keine verkauften Produkte vorhanden" : "No sold product records found"}
              </div>
            ) : (
              topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3.5 p-4 hover:bg-secondary/30 transition-colors">
                  <span className="text-xs font-black text-muted-foreground w-4 text-center">{i + 1}.</span>
                  <div className="w-8.5 h-8.5 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                      <span>{p.category}</span>
                      <span>•</span>
                      <span className="text-accent">{p.sales} {de ? "Verkäufe" : "sales"}</span>
                    </p>
                  </div>
                  <span className="text-xs font-black text-foreground">{Number(p.revenue || 0).toFixed(2)} €</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
