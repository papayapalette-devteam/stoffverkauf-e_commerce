import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Search, Eye, CheckCircle, XCircle, Clock, RotateCcw, Package, X, Truck } from "lucide-react";
import { toast } from "sonner";

interface ReturnRequest {
  id: string;
  orderId: string;
  date: string;
  customer: string;
  items: { name: string; quantity: number; price: number }[];
  reason: string;
  status: "pending" | "approved" | "rejected" | "received" | "refunded";
  refundAmount: number;
  notes?: string;
}

const mockReturns: ReturnRequest[] = [
  {
    id: "RET-2026-001",
    orderId: "ORD-2026-001",
    date: "2026-02-18",
    customer: "Maria Schmidt",
    items: [{ name: "Schurwolle Flanell Mittelblau", quantity: 1, price: 79.90 }],
    reason: "Farbe weicht ab",
    status: "pending",
    refundAmount: 79.90,
  },
  {
    id: "RET-2026-002",
    orderId: "ORD-2026-002",
    date: "2026-02-20",
    customer: "Thomas Keller",
    items: [{ name: "Premium Schurwolle Flanell", quantity: 1, price: 99.90 }],
    reason: "Defekter Artikel",
    status: "approved",
    refundAmount: 99.90,
    notes: "Kunde sendet Fotos des Defekts.",
  },
  {
    id: "RET-2026-003",
    orderId: "ORD-2026-003",
    date: "2026-02-22",
    customer: "Anna Bauer",
    items: [{ name: "Pailletten Walkstoff", quantity: 2, price: 59.90 }],
    reason: "Kundenwunsch",
    status: "received",
    refundAmount: 119.80,
  },
  {
    id: "RET-2026-004",
    orderId: "ORD-2026-001",
    date: "2026-02-25",
    customer: "Klaus Meier",
    items: [{ name: "Flanell Stretch", quantity: 1, price: 79.90 }],
    reason: "Falscher Artikel geliefert",
    status: "refunded",
    refundAmount: 79.90,
  },
  {
    id: "RET-2026-005",
    orderId: "ORD-2026-003",
    date: "2026-02-27",
    customer: "Petra Wagner",
    items: [{ name: "Designer Mantelstoff", quantity: 1, price: 69.90 }],
    reason: "Nicht wie beschrieben",
    status: "rejected",
    refundAmount: 0,
    notes: "Meterware ist vom Umtausch ausgeschlossen.",
  },
];

const statusConfig = [
  { value: "pending", de: "Ausstehend", en: "Pending", color: "bg-yellow-500/10 text-yellow-600" },
  { value: "approved", de: "Genehmigt", en: "Approved", color: "bg-blue-500/10 text-blue-600" },
  { value: "received", de: "Erhalten", en: "Received", color: "bg-accent/10 text-accent" },
  { value: "refunded", de: "Erstattet", en: "Refunded", color: "bg-green-500/10 text-green-600" },
  { value: "rejected", de: "Abgelehnt", en: "Rejected", color: "bg-destructive/10 text-destructive" },
];

const AdminReturns = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReturn, setSelectedReturn] = useState<string | null>(null);
  const [returns, setReturns] = useState(mockReturns);

  const filtered = returns.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch = r.id.toLowerCase().includes(q) || r.orderId.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selected = selectedReturn ? returns.find((r) => r.id === selectedReturn) : null;

  const handleStatusChange = (returnId: string, newStatus: string) => {
    setReturns((prev) => prev.map((r) => r.id === returnId ? { ...r, status: newStatus as ReturnRequest["status"] } : r));
    const label = statusConfig.find((s) => s.value === newStatus);
    toast.success(`${returnId}: ${de ? label?.de : label?.en}`);
  };

  const handleApprove = (id: string) => {
    handleStatusChange(id, "approved");
    toast.success(de ? `Retoure ${id} genehmigt` : `Return ${id} approved`);
  };

  const handleReject = (id: string) => {
    handleStatusChange(id, "rejected");
    toast.success(de ? `Retoure ${id} abgelehnt` : `Return ${id} rejected`);
  };

  const handleMarkRefunded = (id: string) => {
    handleStatusChange(id, "refunded");
    const ret = returns.find((r) => r.id === id);
    toast.success(de ? `${ret?.refundAmount.toFixed(2)} € erstattet für ${id}` : `${ret?.refundAmount.toFixed(2)} € refunded for ${id}`);
  };

  const counts = {
    pending: returns.filter((r) => r.status === "pending").length,
    approved: returns.filter((r) => r.status === "approved").length,
    received: returns.filter((r) => r.status === "received").length,
    refunded: returns.filter((r) => r.status === "refunded").length,
    rejected: returns.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {de ? "Retouren" : "Returns"}{" "}
          <span className="text-muted-foreground font-body text-base">({returns.length})</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={de ? "Retoure/Bestell-Nr. suchen..." : "Search return/order..."}
              className="pl-10 pr-4 py-2 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent w-52"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">{de ? "Alle Status" : "All Status"}</option>
            {statusConfig.map((s) => (
              <option key={s.value} value={s.value}>{de ? s.de : s.en}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: Clock, label: de ? "Ausstehend" : "Pending", count: counts.pending, color: "text-yellow-500" },
          { icon: CheckCircle, label: de ? "Genehmigt" : "Approved", count: counts.approved, color: "text-blue-500" },
          { icon: Package, label: de ? "Erhalten" : "Received", count: counts.received, color: "text-accent" },
          { icon: RotateCcw, label: de ? "Erstattet" : "Refunded", count: counts.refunded, color: "text-green-500" },
          { icon: XCircle, label: de ? "Abgelehnt" : "Rejected", count: counts.rejected, color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4 shadow-card">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="font-display text-xl font-bold text-foreground">{s.count}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Return Detail */}
      {selected && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-foreground">
              {de ? "Retoure-Details" : "Return Details"}: {selected.id}
            </h3>
            <button onClick={() => setSelectedReturn(null)} className="text-sm text-muted-foreground hover:text-foreground p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{de ? "Bestellung" : "Order"}</p>
              <p className="font-semibold text-foreground">{selected.orderId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{de ? "Kunde" : "Customer"}</p>
              <p className="font-semibold text-foreground">{selected.customer}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{de ? "Datum" : "Date"}</p>
              <p className="font-semibold text-foreground">{new Date(selected.date).toLocaleDateString(de ? "de-DE" : "en-US")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig.find((s) => s.value === selected.status)?.color}`}>
                {de ? statusConfig.find((s) => s.value === selected.status)?.de : statusConfig.find((s) => s.value === selected.status)?.en}
              </span>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-3 border border-border">
            <p className="text-sm text-muted-foreground mb-1">{de ? "Retourengrund" : "Return Reason"}</p>
            <p className="text-sm font-medium text-foreground">{selected.reason}</p>
          </div>

          {selected.notes && (
            <div className="bg-secondary/50 rounded-lg p-3 border border-border">
              <p className="text-sm text-muted-foreground mb-1">{de ? "Anmerkungen" : "Notes"}</p>
              <p className="text-sm text-foreground">{selected.notes}</p>
            </div>
          )}

          <div className="border-t border-border pt-4">
            {selected.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="text-foreground">{item.name} × {item.quantity}</span>
                <span className="text-muted-foreground">{(item.price * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-border font-semibold text-foreground">
              <span>{de ? "Erstattungsbetrag" : "Refund Amount"}</span>
              <span>{selected.refundAmount.toFixed(2)} €</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {selected.status === "pending" && (
              <>
                <button onClick={() => handleApprove(selected.id)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
                  <CheckCircle className="w-4 h-4" /> {de ? "Genehmigen" : "Approve"}
                </button>
                <button onClick={() => handleReject(selected.id)} className="flex items-center gap-1.5 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:bg-destructive/90 transition-colors">
                  <XCircle className="w-4 h-4" /> {de ? "Ablehnen" : "Reject"}
                </button>
              </>
            )}
            {selected.status === "approved" && (
              <button onClick={() => handleStatusChange(selected.id, "received")} className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors">
                <Package className="w-4 h-4" /> {de ? "Als erhalten markieren" : "Mark as Received"}
              </button>
            )}
            {selected.status === "received" && (
              <button onClick={() => handleMarkRefunded(selected.id)} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                <RotateCcw className="w-4 h-4" /> {de ? "Erstattung durchführen" : "Process Refund"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Returns Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Retoure-Nr." : "Return #"}</th>
                <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Bestell-Nr." : "Order #"}</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">{de ? "Kunde" : "Customer"}</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden lg:table-cell">{de ? "Grund" : "Reason"}</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Betrag" : "Amount"}</th>
                <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Aktionen" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ret) => {
                const statusInfo = statusConfig.find((s) => s.value === ret.status);
                return (
                  <tr key={ret.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{ret.id}</td>
                    <td className="p-4 text-muted-foreground">{ret.orderId}</td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{ret.customer}</td>
                    <td className="p-4 text-muted-foreground hidden lg:table-cell truncate max-w-[160px]">{ret.reason}</td>
                    <td className="p-4">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo?.color}`}>
                        {de ? statusInfo?.de : statusInfo?.en}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold text-foreground">{ret.refundAmount.toFixed(2)} €</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedReturn(ret.id)} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Details" : "Details"}>
                          <Eye className="w-4 h-4 text-accent" />
                        </button>
                        {ret.status === "pending" && (
                          <>
                            <button onClick={() => handleApprove(ret.id)} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Genehmigen" : "Approve"}>
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            </button>
                            <button onClick={() => handleReject(ret.id)} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Ablehnen" : "Reject"}>
                              <XCircle className="w-4 h-4 text-destructive" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    {de ? "Keine Retouren gefunden." : "No returns found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReturns;
