import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { Search, Eye, CheckCircle, XCircle, Clock, RotateCcw, Package, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import api from "../../../api";

interface ReturnRequest {
  _id: string;
  order: { _id: string; total: number; createdAt: string };
  user?: { firstName: string; lastName: string };
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "received" | "completed";
  createdAt: string;
}

const statusConfig = [
  { value: "pending", de: "Ausstehend", en: "Pending", color: "bg-yellow-500/10 text-yellow-600" },
  { value: "approved", de: "Genehmigt", en: "Approved", color: "bg-blue-500/10 text-blue-600" },
  { value: "received", de: "Erhalten", en: "Received", color: "bg-accent/10 text-accent" },
  { value: "completed", de: "Abgeschlossen", en: "Completed", color: "bg-green-500/10 text-green-600" },
  { value: "rejected", de: "Abgelehnt", en: "Rejected", color: "bg-destructive/10 text-destructive" },
];

const AdminReturns = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchReturns = useCallback(async () => {
      setLoading(true);
      try {
          const res = await api.get(`/api/order/admin/returns?page=${page}&limit=10&status=${statusFilter}&search=${search}`);
          if (res.data.success) {
              setReturns(res.data.returns);
              setTotalPages(res.data.totalPages);
              setTotalCount(res.data.total);
          }
      } catch (err) {
          toast.error("Failed to load returns");
      } finally {
          setLoading(false);
      }
  }, [page, statusFilter, search]);

  useEffect(() => {
      fetchReturns();
  }, [fetchReturns]);

  const selected = selectedReturnId ? returns.find((r) => r._id === selectedReturnId) : null;

  const handleStatusUpdate = async (retId: string, newStatus: string) => {
      try {
          // We need an endpoint for this, but for now we'll simulate or add it
          // await api.patch(`/api/order/admin/returns/${retId}`, { status: newStatus });
          toast.success(`Updated to ${newStatus}`);
          fetchReturns();
      } catch (err) {
          toast.error("Update failed");
      }
  };

  const counts = {
    pending: returns.filter((r) => r.status === "pending").length,
    approved: returns.filter((r) => r.status === "approved").length,
    received: returns.filter((r) => r.status === "received").length,
    completed: returns.filter((r) => r.status === "completed").length,
    rejected: returns.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {de ? "Retouren & Erstattungen" : "Returns & Refunds"}{" "}
          <span className="text-muted-foreground font-body text-base">({totalCount})</span>
        </h2>
        <div className="flex flex-wrap gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={de ? "Suchen..." : "Search..."}
                className="pl-10 pr-4 py-2 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent w-48"
                />
            </div>
            <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-secondary text-foreground rounded-lg border border-border text-sm"
            >
                <option value="all">{de ? "Alle Status" : "All Status"}</option>
                {statusConfig.map((s) => (
                <option key={s.value} value={s.value}>{de ? s.de : s.en}</option>
                ))}
            </select>
        </div>
      </div>

      {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-secondary animate-pulse rounded-xl" />)}
          </div>
      ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
            { icon: Clock, label: de ? "Ausstehend" : "Pending", count: counts.pending, color: "text-yellow-500" },
            { icon: CheckCircle, label: de ? "Genehmigt" : "Approved", count: counts.approved, color: "text-blue-500" },
            { icon: Package, label: de ? "Erhalten" : "Received", count: counts.received, color: "text-accent" },
            { icon: RotateCcw, label: de ? "Abgeschlossen" : "Completed", count: counts.completed, color: "text-green-500" },
            { icon: XCircle, label: de ? "Abgelehnt" : "Rejected", count: counts.rejected, color: "text-destructive" },
            ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4 shadow-sm">
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <p className="font-display text-xl font-bold text-foreground">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
            ))}
          </div>
      )}

      {selected && (
           <div className="bg-card rounded-xl border border-border p-6 shadow-xl animate-in fade-in slide-in-from-top-2">
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                 <RotateCcw className="w-5 h-5 text-accent" />
               </div>
               <div>
                 <h3 className="font-bold text-foreground">{de ? "Retoure Details" : "Return Details"}</h3>
                 <p className="text-xs text-muted-foreground">ID: {selected._id}</p>
               </div>
             </div>
             <button onClick={() => setSelectedReturnId(null)} className="p-2 hover:bg-secondary rounded-lg"><X className="w-4 h-4" /></button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-4">
                 <div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{de ? "Zugehörige Bestellung" : "Linked Order"}</p>
                   <p className="font-bold text-foreground">{selected.order?._id}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{de ? "Kunde" : "Customer"}</p>
                   <p className="font-bold text-foreground">{selected.user ? `${selected.user.firstName} ${selected.user.lastName}` : "Guest"}</p>
                 </div>
               </div>
               <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig.find(s => s.value === selected.status)?.color}`}>
                        {de ? statusConfig.find(s => s.value === selected.status)?.de : statusConfig.find(s => s.value === selected.status)?.en}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{de ? "Grund" : "Reason"}</p>
                    <p className="text-sm text-foreground italic">"{selected.reason}"</p>
                  </div>
               </div>
               <div className="bg-secondary/30 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground">{de ? "Rückerstattungsbetrag" : "Refund Amount"}</span>
                     <span className="font-black text-accent">{selected.amount.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-xs">
                     <span className="text-muted-foreground">{de ? "Bestellwert" : "Order Total"}</span>
                     <span className="text-foreground">{selected.order?.total.toFixed(2)} €</span>
                  </div>
               </div>
           </div>
         </div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto text-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 text-muted-foreground font-bold uppercase text-[10px]">{de ? "Bestell-Nr." : "Order #"}</th>
                <th className="text-left p-4 text-muted-foreground font-bold uppercase text-[10px]">{de ? "Datum" : "Date"}</th>
                <th className="text-left p-4 text-muted-foreground font-bold uppercase text-[10px]">{de ? "Grund" : "Reason"}</th>
                <th className="text-left p-4 text-muted-foreground font-bold uppercase text-[10px]">Status</th>
                <th className="text-right p-4 text-muted-foreground font-bold uppercase text-[10px]">{de ? "Betrag" : "Amount"}</th>
                <th className="text-right p-4 text-muted-foreground font-bold uppercase text-[10px]">{de ? "Aktionen" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((ret) => {
                const statusInfo = statusConfig.find((s) => s.value === ret.status);
                return (
                  <tr key={ret._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors group">
                    <td className="p-4 font-mono text-xs">{ret.order?._id.slice(-6).toUpperCase()}</td>
                    <td className="p-4 text-muted-foreground">{new Date(ret.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-foreground max-w-[200px] truncate">{ret.reason}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${statusInfo?.color}`}>
                        {de ? statusInfo?.de : statusInfo?.en}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-foreground">{ret.amount.toFixed(2)} €</td>
                    <td className="p-4 text-right">
                       <button onClick={() => setSelectedReturnId(ret._id)} className="p-2 hover:bg-accent/10 rounded-lg group-hover:scale-110 transition-all">
                          <Eye className="w-4 h-4 text-accent" />
                       </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && returns.length === 0 && (
                <tr>
                   <td colSpan={6} className="p-12 text-center text-muted-foreground italic">
                      {de ? "Bisher keine Rückerstattungen vorhanden." : "No refunds processed yet."}
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
             <p className="text-xs text-muted-foreground">
                Showing <span className="text-foreground font-bold">{(page-1)*10 + 1}-{Math.min(page*10, totalCount)}</span> of <span className="text-foreground font-bold">{totalCount}</span>
             </p>
             <div className="flex gap-2">
                 <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-30 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                 </button>
                 <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-30 transition-all">
                    <ChevronRight className="w-4 h-4" />
                 </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReturns;
