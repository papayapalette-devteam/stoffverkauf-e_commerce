import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Search, Eye, Mail, Phone, MapPin, X, Calendar } from "lucide-react";
import api from "../../../api";
import axios from "axios";
import { toast } from "sonner";

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

interface Order {
  _id: string;
  createdAt: string;
  total: number;
  status: string;
}

const AdminCustomers = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  
  // Customers List State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Customer Detail / Orders State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Fetch Customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/user/get-all-customers", {
        params: { page, limit, search }
      });
      if (res.data.success) {
        setCustomers(res.data.customers);
        setTotalCustomers(res.data.totalCustomers);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error(err);
      toast.error(de ? "Fehler beim Laden der Kunden" : "Error loading customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  // Fetch Specific User Orders
  const handleViewOrders = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setOrdersLoading(true);
    setCustomerOrders([]);
    try {
      const res = await api.get(`/api/order/my/${customer._id}`);
      if (res.data.success) {
        setCustomerOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
      toast.error(de ? "Fehler beim Laden der Bestellungen" : "Error loading orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    const MAX_VISIBLE = 5;
    let start = Math.max(1, page - Math.floor(MAX_VISIBLE / 2));
    let end = start + MAX_VISIBLE - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - MAX_VISIBLE + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }
    for (let i = start; i <= end; i++) {
        if(i > 0) pages.push(i);
    }
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {de ? "Kunden" : "Customers"}{" "}
          <span className="text-muted-foreground font-body text-base">({totalCustomers})</span>
        </h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={de ? "Kunde suchen..." : "Search customer..."}
              className="pl-10 pr-4 py-2 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent w-52"
            />
          </div>
        </div>
      </div>

      {/* Customer Detail Detail / Orders View */}
      {selectedCustomer && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedCustomer.email}</p>
            </div>
            <button onClick={() => setSelectedCustomer(null)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" /> {selectedCustomer.phone || (de ? "Keine Telefonnummer" : "No phone")}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" /> {selectedCustomer.address || (de ? "Keine Adresse" : "No address")}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <Calendar className="w-4 h-4" /> 
              {de ? "Registriert am:" : "Registered on:"} {new Date(selectedCustomer.createdAt).toLocaleDateString(de ? "de-DE" : "en-US")}
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">
                {de ? "Bestellhistorie" : "Order History"} {customerOrders.length > 0 && `(${customerOrders.length})`}
            </h4>
            {ordersLoading ? (
               <div className="text-center py-4 text-muted-foreground">Loading orders...</div>
            ) : customerOrders.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {customerOrders.map((o) => (
                  <div key={o._id} className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded-lg text-sm">
                    <span className="font-medium text-foreground">{o._id.substring(o._id.length - 8).toUpperCase()}</span>
                    <span className="text-muted-foreground">{new Date(o.createdAt).toLocaleDateString(de ? "de-DE" : "en-US")}</span>
                    <span className={`capitalize px-2 py-0.5 rounded-full text-xs font-semibold ${
                      o.status === "delivered" ? "bg-green-500/10 text-green-600" : 
                      o.status === "cancelled" ? "bg-red-500/10 text-red-600" : 
                      "bg-blue-500/10 text-blue-600"
                    }`}>
                        {o.status}
                    </span>
                    <span className="font-semibold text-foreground">{o.total.toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            ) : (
                <div className="text-center py-4 text-muted-foreground italic">
                    {de ? "Keine Bestellungen gefunden" : "No orders found for this customer"}
                </div>
            )}
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-muted-foreground font-medium">
                <th className="text-left p-4">{de ? "Kunde" : "Customer"}</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4 hidden md:table-cell">{de ? "Telefon" : "Phone"}</th>
                <th className="text-left p-4 hidden lg:table-cell font-body">{de ? "Adresse" : "Address"}</th>
                <th className="text-left p-4 hidden lg:table-cell">{de ? "Erstellt am" : "Created At"}</th>
                <th className="text-right p-4">{de ? "Aktionen" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading customers...</td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                    <tr key={c._id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">{c.firstName} {c.lastName}</td>
                      <td className="p-4 text-muted-foreground text-xs">{c.email}</td>
                      <td className="p-4 text-muted-foreground hidden md:table-cell">{c.phone || "-"}</td>
                      <td className="p-4 text-muted-foreground hidden lg:table-cell max-w-xs truncate overflow-hidden">{c.address || "-"}</td>
                      <td className="p-4 text-muted-foreground hidden lg:table-cell">
                        {new Date(c.createdAt).toLocaleDateString(de ? "de-DE" : "en-US")}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                            onClick={() => handleViewOrders(c)} 
                            className="p-2 hover:bg-secondary rounded-lg transition-colors group"
                            title={de ? "Bestellungen ansehen" : "View orders"}
                        >
                          <Eye className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-muted-foreground">
            {de ? "Seite" : "Page"} <span className="font-semibold text-foreground">{page}</span> {de ? "von" : "of"} <span className="font-semibold text-foreground">{totalPages}</span>
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-xs border border-border rounded-md hover:bg-secondary disabled:opacity-50 transition-colors"
          >
            {de ? "Zurück" : "Prev"}
          </button>
          
          <div className="flex items-center gap-1 mx-2">
            {getVisiblePages().map((p, idx) => (
              p === "..." ? (
                <span key={`dots-${idx}`} className="px-2 text-muted-foreground">...</span>
              ) : (
                <button
                  key={`page-${p}`}
                  onClick={() => setPage(p as number)}
                  className={`w-7 h-7 flex items-center justify-center text-xs rounded-md transition-colors ${
                    page === p ? "bg-accent text-accent-foreground font-bold" : "hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  {p}
                </button>
              )
            ))}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-xs border border-border rounded-md hover:bg-secondary disabled:opacity-50 transition-colors"
          >
            {de ? "Weiter" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
