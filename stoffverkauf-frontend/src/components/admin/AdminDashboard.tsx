import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { mockOrders } from "@/lib/mock-data";
import { products } from "@/lib/products";
import { DollarSign, ShoppingBag, Users, Eye, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const { lang } = useI18n();
  const de = lang === "de";

  const stats = [
    { label: de ? "Umsatz" : "Revenue", value: "€12,847", change: "+12.5%", up: true, icon: DollarSign },
    { label: de ? "Bestellungen" : "Orders", value: "156", change: "+8.2%", up: true, icon: ShoppingBag },
    { label: de ? "Kunden" : "Customers", value: "2,341", change: "+15.3%", up: true, icon: Users },
    { label: de ? "Seitenaufrufe" : "Page Views", value: "45,821", change: "-2.1%", up: false, icon: Eye },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">
        {de ? "Dashboard" : "Dashboard"}
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-accent" />
              </div>
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${stat.up ? "text-green-500" : "text-destructive"}`}>
                {stat.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {stat.change}
              </span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          {de ? "Umsatz der letzten 7 Tage" : "Revenue Last 7 Days"}
        </h3>
        <div className="flex items-end gap-3 h-48">
          {[65, 42, 78, 55, 90, 72, 85].map((h, i) => (
            <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.05, duration: 0.4 }} className="flex-1 bg-accent/20 rounded-t-lg relative group cursor-pointer">
              <div className="absolute inset-x-0 bottom-0 bg-accent rounded-t-lg" style={{ height: `${h}%` }} />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">€{Math.round(h * 18.5)}</div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          {(de ? ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).map((d) => <span key={d}>{d}</span>)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-display text-base font-bold text-foreground">{de ? "Letzte Bestellungen" : "Recent Orders"}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium text-xs">{de ? "Nr." : "#"}</th>
                  <th className="text-left p-3 text-muted-foreground font-medium text-xs">Status</th>
                  <th className="text-right p-3 text-muted-foreground font-medium text-xs">{de ? "Betrag" : "Amount"}</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="p-3 font-medium text-foreground text-xs">{order.id}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        order.status === "delivered" ? "bg-green-500/10 text-green-600" :
                        order.status === "shipped" ? "bg-blue-500/10 text-blue-600" : "bg-accent/10 text-accent"
                      }`}>{order.status}</span>
                    </td>
                    <td className="p-3 text-right font-semibold text-foreground text-xs">{order.total.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-display text-base font-bold text-foreground">{de ? "Top Produkte" : "Top Products"}</h3>
          </div>
          <div className="divide-y divide-border">
            {products.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors">
                <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover bg-secondary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.category}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{p.price.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
