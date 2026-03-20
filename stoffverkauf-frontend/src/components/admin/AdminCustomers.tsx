import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Search, Eye, Mail, Phone, MapPin, ShoppingBag, X, UserPlus } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  status: "active" | "inactive";
  orders: { id: string; date: string; total: number; status: string }[];
}

const mockCustomers: Customer[] = [
  {
    id: "C001", name: "Maria Schmidt", email: "maria.schmidt@email.de", phone: "+49 170 1234567",
    city: "München", totalOrders: 12, totalSpent: 2340.80, lastOrder: "2026-02-15", status: "active",
    orders: [
      { id: "ORD-2026-001", date: "2026-02-15", total: 399.50, status: "delivered" },
      { id: "ORD-2026-008", date: "2026-01-20", total: 189.90, status: "delivered" },
      { id: "ORD-2025-042", date: "2025-12-10", total: 549.00, status: "delivered" },
    ],
  },
  {
    id: "C002", name: "Thomas Keller", email: "t.keller@email.de", phone: "+49 151 9876543",
    city: "Berlin", totalOrders: 5, totalSpent: 890.50, lastOrder: "2026-02-10", status: "active",
    orders: [
      { id: "ORD-2026-002", date: "2026-02-10", total: 99.90, status: "shipped" },
      { id: "ORD-2026-005", date: "2026-01-05", total: 259.80, status: "delivered" },
    ],
  },
  {
    id: "C003", name: "Anna Braun", email: "anna.braun@email.de", phone: "+49 160 5551234",
    city: "Hamburg", totalOrders: 8, totalSpent: 1560.20, lastOrder: "2026-01-28", status: "active",
    orders: [
      { id: "ORD-2026-003", date: "2026-01-28", total: 309.50, status: "processing" },
      { id: "ORD-2025-039", date: "2025-11-15", total: 420.00, status: "delivered" },
    ],
  },
  {
    id: "C004", name: "Klaus Müller", email: "k.mueller@email.de", phone: "+49 172 3334455",
    city: "Frankfurt", totalOrders: 2, totalSpent: 179.80, lastOrder: "2025-11-20", status: "inactive",
    orders: [
      { id: "ORD-2025-028", date: "2025-11-20", total: 99.90, status: "delivered" },
      { id: "ORD-2025-015", date: "2025-09-05", total: 79.90, status: "delivered" },
    ],
  },
  {
    id: "C005", name: "Petra Weber", email: "petra.w@email.de", phone: "+49 175 6667788",
    city: "Köln", totalOrders: 15, totalSpent: 3210.40, lastOrder: "2026-02-16", status: "active",
    orders: [
      { id: "ORD-2026-004", date: "2026-02-16", total: 459.70, status: "processing" },
      { id: "ORD-2026-007", date: "2026-02-01", total: 189.90, status: "delivered" },
      { id: "ORD-2026-006", date: "2026-01-12", total: 339.80, status: "delivered" },
    ],
  },
  {
    id: "C006", name: "Stefan Hoffmann", email: "s.hoffmann@email.de", phone: "+49 163 1112233",
    city: "Stuttgart", totalOrders: 3, totalSpent: 450.00, lastOrder: "2026-01-05", status: "active",
    orders: [
      { id: "ORD-2026-009", date: "2026-01-05", total: 150.00, status: "delivered" },
    ],
  },
];

const AdminCustomers = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = mockCustomers.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const activeCount = mockCustomers.filter((c) => c.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {de ? "Kunden" : "Customers"}{" "}
          <span className="text-muted-foreground font-body text-base">({mockCustomers.length})</span>
        </h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={de ? "Kunde suchen..." : "Search customer..."}
              className="pl-10 pr-4 py-2 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent w-52"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">{de ? "Alle" : "All"}</option>
            <option value="active">{de ? "Aktiv" : "Active"}</option>
            <option value="inactive">{de ? "Inaktiv" : "Inactive"}</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: de ? "Gesamt Kunden" : "Total Customers", value: mockCustomers.length },
          { label: de ? "Aktive Kunden" : "Active Customers", value: activeCount },
          { label: de ? "Gesamtumsatz" : "Total Revenue", value: `${totalRevenue.toFixed(2)} €` },
          { label: de ? "Ø Bestellwert" : "Avg Order Value", value: `${(totalRevenue / mockCustomers.reduce((s, c) => s + c.totalOrders, 0)).toFixed(2)} €` },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4 shadow-card">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">{selectedCustomer.name}</h3>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${selectedCustomer.status === "active" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                {selectedCustomer.status === "active" ? (de ? "Aktiv" : "Active") : (de ? "Inaktiv" : "Inactive")}
              </span>
            </div>
            <button onClick={() => setSelectedCustomer(null)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4" /> {selectedCustomer.email}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4" /> {selectedCustomer.phone}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" /> {selectedCustomer.city}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-muted-foreground">{de ? "Bestellungen" : "Orders"}</p><p className="font-semibold text-foreground">{selectedCustomer.totalOrders}</p></div>
            <div><p className="text-muted-foreground">{de ? "Umsatz" : "Revenue"}</p><p className="font-semibold text-foreground">{selectedCustomer.totalSpent.toFixed(2)} €</p></div>
            <div><p className="text-muted-foreground">{de ? "Letzte Bestellung" : "Last Order"}</p><p className="font-semibold text-foreground">{new Date(selectedCustomer.lastOrder).toLocaleDateString(de ? "de-DE" : "en-US")}</p></div>
          </div>
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">{de ? "Bestellhistorie" : "Order History"}</h4>
            <div className="space-y-2">
              {selectedCustomer.orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded-lg text-sm">
                  <span className="font-medium text-foreground">{o.id}</span>
                  <span className="text-muted-foreground">{new Date(o.date).toLocaleDateString(de ? "de-DE" : "en-US")}</span>
                  <span className="capitalize text-muted-foreground">{o.status}</span>
                  <span className="font-semibold text-foreground">{o.total.toFixed(2)} €</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Kunde" : "Customer"}</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">Email</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden lg:table-cell">{de ? "Stadt" : "City"}</th>
                <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Bestellungen" : "Orders"}</th>
                <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Umsatz" : "Revenue"}</th>
                <th className="text-center p-4 text-muted-foreground font-medium">Status</th>
                <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Aktionen" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{c.name}</td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">{c.email}</td>
                  <td className="p-4 text-muted-foreground hidden lg:table-cell">{c.city}</td>
                  <td className="p-4 text-right text-foreground">{c.totalOrders}</td>
                  <td className="p-4 text-right font-semibold text-foreground">{c.totalSpent.toFixed(2)} €</td>
                  <td className="p-4 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${c.status === "active" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                      {c.status === "active" ? (de ? "Aktiv" : "Active") : (de ? "Inaktiv" : "Inactive")}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => setSelectedCustomer(c)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-accent" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
