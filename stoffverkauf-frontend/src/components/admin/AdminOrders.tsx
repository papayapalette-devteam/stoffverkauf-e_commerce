import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { mockOrders } from "@/lib/mock-data";
import { Search, Eye, Truck, Package, CheckCircle, XCircle, Download, RefreshCcw, Mail, FileText, Clock, X } from "lucide-react";
import { toast } from "sonner";

const statusOptions = [
  { value: "processing", de: "In Bearbeitung", en: "Processing", color: "bg-accent/10 text-accent" },
  { value: "shipped", de: "Versandt", en: "Shipped", color: "bg-blue-500/10 text-blue-600" },
  { value: "delivered", de: "Zugestellt", en: "Delivered", color: "bg-green-500/10 text-green-600" },
  { value: "cancelled", de: "Storniert", en: "Cancelled", color: "bg-destructive/10 text-destructive" },
];

const AdminOrders = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showRefundModal, setShowRefundModal] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const filtered = mockOrders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    const statusLabel = statusOptions.find((s) => s.value === newStatus);
    toast.success(`${orderId}: ${de ? statusLabel?.de : statusLabel?.en}`);
  };

  const handleSendNotification = (orderId: string) => {
    toast.success(de ? `E-Mail-Benachrichtigung für ${orderId} gesendet` : `Email notification sent for ${orderId}`);
  };

  const handleDownloadInvoice = (orderId: string) => {
    toast.success(de ? `Rechnung für ${orderId} wird generiert...` : `Invoice for ${orderId} generating...`);
  };

  const handleDownloadPackingSlip = (orderId: string) => {
    toast.success(de ? `Packzettel für ${orderId} wird generiert...` : `Packing slip for ${orderId} generating...`);
  };

  const handleRefund = () => {
    if (!refundAmount) { toast.error(de ? "Bitte Rückerstattungsbetrag eingeben" : "Please enter refund amount"); return; }
    toast.success(de ? `Rückerstattung von ${parseFloat(refundAmount).toFixed(2)} € für ${showRefundModal} eingeleitet` : `Refund of ${parseFloat(refundAmount).toFixed(2)} € initiated for ${showRefundModal}`);
    setShowRefundModal(null);
    setRefundAmount("");
    setRefundReason("");
  };

  const selected = selectedOrder ? mockOrders.find((o) => o.id === selectedOrder) : null;

  const orderTimeline = [
    { status: de ? "Bestellt" : "Ordered", icon: Package, done: true, time: "10:23 Uhr" },
    { status: de ? "Bezahlt" : "Payment Confirmed", icon: CheckCircle, done: true, time: "10:24 Uhr" },
    { status: de ? "In Bearbeitung" : "Processing", icon: RefreshCcw, done: true, time: "11:05 Uhr" },
    { status: de ? "Versandt" : "Shipped", icon: Truck, done: selected?.status === "shipped" || selected?.status === "delivered", time: selected?.trackingNumber ? "14:30 Uhr" : "—" },
    { status: de ? "Zugestellt" : "Delivered", icon: CheckCircle, done: selected?.status === "delivered", time: selected?.status === "delivered" ? "Nächster Tag" : "—" },
  ];

  return (
    <div className="space-y-6">
      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-foreground">{de ? "Rückerstattung" : "Refund"}: {showRefundModal}</h3>
              <button onClick={() => setShowRefundModal(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{de ? "Rückerstattungsbetrag (€)" : "Refund Amount (€)"}</label>
                <input type="number" step="0.01" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{de ? "Grund" : "Reason"}</label>
                <select value={refundReason} onChange={e => setRefundReason(e.target.value)} className="w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="">{de ? "Bitte wählen..." : "Please select..."}</option>
                  <option value="defective">{de ? "Defekter Artikel" : "Defective item"}</option>
                  <option value="wrong_item">{de ? "Falscher Artikel geliefert" : "Wrong item delivered"}</option>
                  <option value="customer_request">{de ? "Kundenwunsch" : "Customer request"}</option>
                  <option value="not_received">{de ? "Nicht erhalten" : "Not received"}</option>
                  <option value="other">{de ? "Sonstiges" : "Other"}</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleRefund} className="flex-1 bg-destructive text-destructive-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-destructive/90">
                  {de ? "Rückerstattung einleiten" : "Process Refund"}
                </button>
                <button onClick={() => setShowRefundModal(null)} className="flex-1 bg-secondary text-foreground py-2.5 rounded-lg text-sm font-semibold">
                  {de ? "Abbrechen" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {de ? "Bestellungen" : "Orders"} <span className="text-muted-foreground font-body text-base">({mockOrders.length})</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={de ? "Bestell-Nr. suchen..." : "Search order..."} className="pl-10 pr-4 py-2 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent w-44" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent">
            <option value="all">{de ? "Alle Status" : "All Status"}</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{de ? s.de : s.en}</option>
            ))}
          </select>
          <button onClick={() => toast.success(de ? "Bestellungen als CSV exportiert" : "Orders exported as CSV")} className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-muted-foreground hover:text-foreground rounded-lg text-sm font-semibold transition-colors">
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Package, label: de ? "In Bearbeitung" : "Processing", count: mockOrders.filter((o) => o.status === "processing").length, color: "text-accent" },
          { icon: Truck, label: de ? "Versandt" : "Shipped", count: mockOrders.filter((o) => o.status === "shipped").length, color: "text-blue-500" },
          { icon: CheckCircle, label: de ? "Zugestellt" : "Delivered", count: mockOrders.filter((o) => o.status === "delivered").length, color: "text-green-500" },
          { icon: XCircle, label: de ? "Storniert" : "Cancelled", count: mockOrders.filter((o) => o.status === "cancelled").length, color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4 shadow-card">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="font-display text-xl font-bold text-foreground">{s.count}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Order Detail */}
      {selected && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-foreground">{de ? "Bestelldetails" : "Order Details"}: {selected.id}</h3>
            <button onClick={() => setSelectedOrder(null)} className="text-sm text-muted-foreground hover:text-foreground p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleDownloadInvoice(selected.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-xs font-semibold hover:bg-muted transition-colors">
              <FileText className="w-3.5 h-3.5" /> {de ? "Rechnung (PDF)" : "Invoice (PDF)"}
            </button>
            <button onClick={() => handleDownloadPackingSlip(selected.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-xs font-semibold hover:bg-muted transition-colors">
              <Package className="w-3.5 h-3.5" /> {de ? "Packzettel" : "Packing Slip"}
            </button>
            <button onClick={() => handleSendNotification(selected.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-xs font-semibold hover:bg-muted transition-colors">
              <Mail className="w-3.5 h-3.5" /> {de ? "E-Mail senden" : "Send Email"}
            </button>
            <button onClick={() => setShowRefundModal(selected.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-xs font-semibold hover:bg-destructive/20 transition-colors">
              <RefreshCcw className="w-3.5 h-3.5" /> {de ? "Rückerstattung" : "Refund"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><p className="text-muted-foreground">{de ? "Datum" : "Date"}</p><p className="font-semibold text-foreground">{selected.date}</p></div>
            <div><p className="text-muted-foreground">Status</p><p className="font-semibold text-foreground capitalize">{selected.status}</p></div>
            <div><p className="text-muted-foreground">{de ? "Artikel" : "Items"}</p><p className="font-semibold text-foreground">{selected.items.length}</p></div>
            <div><p className="text-muted-foreground">{de ? "Gesamt" : "Total"}</p><p className="font-semibold text-foreground">{selected.total.toFixed(2)} €</p></div>
          </div>

          {selected.trackingNumber && (
            <div className="bg-secondary/50 rounded-lg p-3 border border-border flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-foreground">{de ? "Trackingnummer:" : "Tracking:"} <strong className="font-mono">{selected.trackingNumber}</strong></span>
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-accent" /> {de ? "Bestellverlauf" : "Order Timeline"}</p>
            <div className="flex items-start gap-0 overflow-x-auto pb-2">
              {orderTimeline.map((step, i) => (
                <div key={i} className="flex flex-col items-center flex-1 min-w-[80px]">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${step.done ? "bg-green-500" : "bg-muted"}`}>
                    <step.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  {i < orderTimeline.length - 1 && (
                    <div className={`h-0.5 w-full ${step.done ? "bg-green-500" : "bg-muted"} -mt-3.5 mb-3.5 translate-x-1/2`} />
                  )}
                  <p className="text-[10px] text-center text-foreground font-medium mt-2 leading-tight">{step.status}</p>
                  <p className="text-[9px] text-muted-foreground">{step.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            {selected.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="text-foreground">{item.name} × {item.quantity}</span>
                <span className="text-muted-foreground">{(item.price * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-border font-semibold text-foreground">
              <span>{de ? "Gesamt" : "Total"}</span>
              <span>{selected.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Bestell-Nr." : "Order #"}</th>
                <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Datum" : "Date"}</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">{de ? "Artikel" : "Items"}</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Betrag" : "Amount"}</th>
                <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Aktionen" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{order.id}</td>
                  <td className="p-4 text-muted-foreground">{new Date(order.date).toLocaleDateString(de ? "de-DE" : "en-US")}</td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">{order.items.length} {de ? "Artikel" : "items"}</td>
                  <td className="p-4">
                    <select
                      defaultValue={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {statusOptions.map((s) => (
                        <option key={s.value} value={s.value}>{de ? s.de : s.en}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-right font-semibold text-foreground">{order.total.toFixed(2)} €</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setSelectedOrder(order.id)} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Details" : "Details"}>
                        <Eye className="w-4 h-4 text-accent" />
                      </button>
                      <button onClick={() => handleDownloadInvoice(order.id)} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Rechnung" : "Invoice"}>
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleSendNotification(order.id)} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "E-Mail" : "Email"}>
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => setShowRefundModal(order.id)} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Rückerstattung" : "Refund"}>
                        <RefreshCcw className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
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

export default AdminOrders;
