import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { BarChart3, TrendingUp, Eye, ShoppingBag, Users, DollarSign, ArrowUpRight, ArrowDownRight, Monitor, Smartphone, Download, AlertTriangle, Package } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "../../../api";

const AdminAnalytics = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const [period, setPeriod] = useState("7d");
  const [activeReport, setActiveReport] = useState<"overview" | "inventory" | "tax">("overview");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/order/admin/analytics", {
          params: { period }
        });
        if (res.data.success) {
          setData(res.data);
        } else {
          toast.error(de ? "Fehler beim Laden der Analysedaten" : "Failed to load analytics data");
        }
      } catch (err: any) {
        console.error("Error fetching analytics:", err);
        toast.error(de ? "Fehler beim Laden der Analysedaten" : "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    if (activeReport === "overview") {
      fetchAnalytics();
    }
  }, [period, activeReport, de]);

  const stats = [
    {
      label: de ? "Umsatz" : "Revenue",
      value: data ? data.stats.revenue.value : "€0,00",
      change: data ? data.stats.revenue.change : "0%",
      up: data ? data.stats.revenue.up : true,
      icon: DollarSign,
      loading: loading
    },
    {
      label: de ? "Bestellungen" : "Orders",
      value: data ? data.stats.orders.value : "0",
      change: data ? data.stats.orders.change : "0%",
      up: data ? data.stats.orders.up : true,
      icon: ShoppingBag,
      loading: loading
    },
    {
      label: de ? "Kunden" : "Customers",
      value: data ? data.stats.customers.value : "0",
      change: data ? data.stats.customers.change : "0%",
      up: data ? data.stats.customers.up : true,
      icon: Users,
      loading: loading
    },
    {
      label: de ? "Seitenaufrufe" : "Page Views",
      value: "45.821",
      change: "N/A",
      up: true,
      icon: Eye,
      loading: false
    },
  ];

  const topProducts = data?.topProducts || [];
  const categoryPerformance = data?.categoryPerformance || [];

  const revenueData: Record<string, number[]> = {
    "7d": [65, 42, 78, 55, 90, 72, 85],
    "30d": [65, 42, 78, 55, 90, 72, 85, 60, 95, 70, 88, 75, 92, 68, 80, 62, 77, 83, 59, 91, 74, 86, 67, 79, 93, 61, 84, 76, 88, 71],
    "90d": [65, 42, 78, 55, 90, 72, 85, 60, 95, 70, 88, 75],
    "365d": [820, 650, 910, 780, 1020, 890, 960, 840, 1100, 870, 930, 1050],
  };

  const topPages = [
    { path: "/", views: 12450, name: de ? "Startseite" : "Homepage" },
    { path: "/product/1", views: 3210, name: "Schurwolle Flanell" },
    { path: "/product/5", views: 2890, name: "Premium Flanell" },
    { path: "/about", views: 1560, name: de ? "Über uns" : "About Us" },
    { path: "/blog", views: 1230, name: "Blog" },
  ];

  const devices = [
    { type: "Desktop", icon: Monitor, pct: 58 },
    { type: "Mobile", icon: Smartphone, pct: 35 },
    { type: de ? "Tablet" : "Tablet", icon: Monitor, pct: 7 },
  ];

  const lowStockProducts = [
    { name: "Designer Bouclé Meterware", stock: 2, unit: "m", threshold: 5 },
    { name: "Pailletten Walkstoff", stock: 1, unit: "m", threshold: 5 },
    { name: "Elastik Samt Dunkelblau", stock: 3, unit: "m", threshold: 10 },
    { name: "Spitze Designer Premium", stock: 0, unit: "m", threshold: 5 },
  ];

  const taxReport = [
    { period: "Jan 2026", grossRevenue: 4210.50, netRevenue: 3538.24, vat: 672.26, vatRate: 19 },
    { period: "Feb 2026", grossRevenue: 3890.20, netRevenue: 3269.08, vat: 621.12, vatRate: 19 },
    { period: "Dez 2025", grossRevenue: 5120.80, netRevenue: 4303.19, vat: 817.61, vatRate: 19 },
  ];

  const currentData = revenueData[period] || revenueData["7d"];

  const handleExport = (format: "csv" | "pdf") => {
    toast.success(de ? `Bericht als ${format.toUpperCase()} exportiert` : `Report exported as ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {de ? "Analyse & Berichte" : "Analytics & Reports"}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: "7d", label: de ? "7 Tage" : "7 Days" },
            { id: "30d", label: de ? "30 Tage" : "30 Days" },
            { id: "90d", label: de ? "90 Tage" : "90 Days" },
            { id: "365d", label: de ? "1 Jahr" : "1 Year" },
          ].map((p) => (
            <button key={p.id} onClick={() => setPeriod(p.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${period === p.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {p.label}
            </button>
          ))}
          <div className="flex gap-1 ml-1">
            <button onClick={() => handleExport("csv")} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-muted-foreground hover:text-foreground rounded-lg text-xs font-semibold transition-colors">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button onClick={() => handleExport("pdf")} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-muted-foreground hover:text-foreground rounded-lg text-xs font-semibold transition-colors">
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-2">
        {[
          { id: "overview" as const, label: de ? "Übersicht" : "Overview" },
          { id: "inventory" as const, label: de ? "Lagerbestand" : "Inventory" },
          { id: "tax" as const, label: de ? "Steuer & Zahlung" : "Tax & Payment" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveReport(tab.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeReport === tab.id ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeReport === "overview" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border border-border p-5 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-accent" />
                  </div>
                  {stat.loading ? (
                    <div className="h-4 w-12 bg-secondary animate-pulse rounded" />
                  ) : (
                    stat.change !== "N/A" && (
                      <span className={`text-xs font-semibold flex items-center gap-0.5 ${stat.up ? "text-green-500" : "text-destructive"}`}>
                        {stat.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {stat.change}
                      </span>
                    )
                  )}
                </div>
                {stat.loading ? (
                  <div className="space-y-2 mt-2 animate-pulse">
                    <div className="h-8 w-24 bg-secondary rounded" />
                    <div className="h-3 w-16 bg-secondary rounded" />
                  </div>
                ) : (
                  <>
                    <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              {de ? "Umsatzverlauf" : "Revenue Trend"}
            </h3>
            {loading ? (
              <div className="flex items-end gap-1 h-48 overflow-hidden">
                {Array.from({ length: period === "7d" ? 7 : period === "30d" ? 30 : 12 }).map((_, i) => (
                  <div key={i} className="flex-1 bg-secondary animate-pulse rounded-t-lg" style={{ height: `${20 + Math.random() * 60}%` }} />
                ))}
              </div>
            ) : !data || !data.revenueTrend || data.revenueTrend.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                {de ? "Keine Umsatzdaten vorhanden" : "No revenue data available"}
              </div>
            ) : (
              <div className="flex items-end gap-1 h-48 overflow-hidden">
                {(() => {
                  const trendList = data.revenueTrend || [];
                  const maxValue = trendList.length > 0 ? Math.max(...trendList.map((d: any) => Number(d.value) || 0), 1) : 1;
                  return trendList.map((item: any, i: number) => {
                    const heightPct = ((Number(item.value) || 0) / maxValue) * 100;
                    const displayHeight = Math.max(heightPct, 4);
                    return (
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${displayHeight}%` }} transition={{ delay: i * 0.01, duration: 0.3 }} className="flex-1 bg-accent/10 rounded-t-lg relative group cursor-pointer min-w-[8px]">
                        <div className="absolute inset-x-0 bottom-0 bg-accent rounded-t-lg transition-all group-hover:opacity-80" style={{ height: `100%` }} />
                        {/* Floating tooltip */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover border border-border text-popover-foreground text-[10px] px-2 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none flex flex-col items-center">
                          <span className="font-medium text-muted-foreground">{item.label}</span>
                          <span className="text-accent font-bold">€{Number(item.value || 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </motion.div>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-card rounded-xl border border-border shadow-card">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-foreground">{de ? "Top Produkte" : "Top Products"}</h3>
                <button onClick={() => handleExport("csv")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
              </div>
              <div className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-4 bg-secondary rounded" />
                        <div className="space-y-1">
                          <div className="h-4 w-40 bg-secondary rounded" />
                          <div className="h-3 w-20 bg-secondary rounded" />
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="h-4 w-16 ml-auto bg-secondary rounded" />
                        <div className="h-3 w-12 ml-auto bg-secondary rounded" />
                      </div>
                    </div>
                  ))
                ) : topProducts.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {de ? "Keine Verkaufsdaten in diesem Zeitraum" : "No sales data in this period"}
                  </div>
                ) : (
                  topProducts.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                        <div>
                          <span className="text-sm font-medium text-foreground block">{p.name}</span>
                          <span className="text-xs text-muted-foreground">{p.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">€{Number(p.revenue || 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="text-xs text-muted-foreground">{p.sales || 0} {de ? "Verkäufe" : "sales"}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Category Performance */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <h3 className="font-display text-base font-bold text-foreground mb-4">{de ? "Kategorie-Performance" : "Category Performance"}</h3>
                <div className="space-y-3">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2 animate-pulse py-1">
                        <div className="flex items-center justify-between">
                          <div className="h-4 w-20 bg-secondary rounded" />
                          <div className="h-4 w-32 bg-secondary rounded" />
                        </div>
                        <div className="h-2 w-full bg-secondary rounded" />
                      </div>
                    ))
                  ) : categoryPerformance.length === 0 ? (
                    <div className="py-4 text-center text-muted-foreground text-xs">
                      {de ? "Keine Kategoriedaten vorhanden" : "No category data available"}
                    </div>
                  ) : (
                    categoryPerformance.map((c: any) => (
                      <div key={c.name} className="group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{c.name}</span>
                          <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                            €{Number(c.revenue || 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · {c.orders || 0} {de ? "Bestellungen" : "orders"}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ duration: 0.5, ease: "easeOut" }} className="h-full bg-accent rounded-full" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Devices */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card">
                <h3 className="font-display text-base font-bold text-foreground mb-4">{de ? "Geräte & Seitenaufrufe" : "Devices & Page Views"}</h3>
                <div className="space-y-3">
                  {devices.map((d) => (
                    <div key={d.type} className="flex items-center gap-3">
                      <d.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground w-16">{d.type}</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${d.pct}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-foreground w-10 text-right">{d.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-card rounded-xl border border-border shadow-card">
            <div className="p-5 border-b border-border">
              <h3 className="font-display text-base font-bold text-foreground">{de ? "Meistbesuchte Seiten" : "Top Pages"}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Seite" : "Page"}</th>
                    <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">{de ? "Pfad" : "Path"}</th>
                    <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Aufrufe" : "Views"}</th>
                  </tr>
                </thead>
                <tbody>
                  {topPages.map((p, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">{p.name}</td>
                      <td className="p-4 text-muted-foreground font-mono text-xs hidden md:table-cell">{p.path}</td>
                      <td className="p-4 text-right font-semibold text-foreground">{p.views.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeReport === "inventory" && (
        <div className="space-y-4">
          {/* Low Stock Alert */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-700">{de ? "Lagerwarnung" : "Low Stock Warning"}</p>
              <p className="text-xs text-amber-600">{de ? `${lowStockProducts.length} Produkte haben niedrigen oder keinen Lagerbestand.` : `${lowStockProducts.length} products have low or no stock.`}</p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-foreground">{de ? "Lagerbestand — Warnungen" : "Inventory — Alerts"}</h3>
              <button onClick={() => handleExport("csv")} className="flex items-center gap-1 text-xs bg-secondary text-foreground px-3 py-1.5 rounded-lg font-semibold hover:bg-muted">
                <Download className="w-3.5 h-3.5" /> {de ? "Exportieren" : "Export"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Produkt" : "Product"}</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Lagerbestand" : "Stock"}</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Warnschwelle" : "Threshold"}</th>
                    <th className="text-center p-4 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`font-bold ${p.stock === 0 ? "text-destructive" : "text-amber-600"}`}>
                          {p.stock} {p.unit}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{p.threshold} {p.unit}</td>
                      <td className="p-4 text-center">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.stock === 0 ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600"}`}>
                          {p.stock === 0 ? (de ? "Ausverkauft" : "Out of Stock") : (de ? "Niedriger Bestand" : "Low Stock")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReport === "tax" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-foreground">{de ? "Steuer- & Umsatzbericht" : "Tax & Revenue Report"}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleExport("csv")} className="flex items-center gap-1 text-xs bg-secondary text-foreground px-3 py-1.5 rounded-lg font-semibold hover:bg-muted">
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button onClick={() => handleExport("pdf")} className="flex items-center gap-1 text-xs bg-secondary text-foreground px-3 py-1.5 rounded-lg font-semibold hover:bg-muted">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Zeitraum" : "Period"}</th>
                    <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Bruttoumsatz" : "Gross Revenue"}</th>
                    <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Nettoumsatz" : "Net Revenue"}</th>
                    <th className="text-right p-4 text-muted-foreground font-medium">{de ? "MwSt. (19%)" : "VAT (19%)"}</th>
                  </tr>
                </thead>
                <tbody>
                  {taxReport.map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4 font-semibold text-foreground">{r.period}</td>
                      <td className="p-4 text-right text-foreground">{r.grossRevenue.toFixed(2)} €</td>
                      <td className="p-4 text-right text-foreground">{r.netRevenue.toFixed(2)} €</td>
                      <td className="p-4 text-right font-semibold text-accent">{r.vat.toFixed(2)} €</td>
                    </tr>
                  ))}
                  <tr className="bg-secondary/50 font-bold">
                    <td className="p-4 text-foreground">{de ? "Gesamt" : "Total"}</td>
                    <td className="p-4 text-right text-foreground">{taxReport.reduce((s, r) => s + r.grossRevenue, 0).toFixed(2)} €</td>
                    <td className="p-4 text-right text-foreground">{taxReport.reduce((s, r) => s + r.netRevenue, 0).toFixed(2)} €</td>
                    <td className="p-4 text-right text-accent">{taxReport.reduce((s, r) => s + r.vat, 0).toFixed(2)} €</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
