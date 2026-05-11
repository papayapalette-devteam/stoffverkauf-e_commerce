import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Search, Eye, Truck, Package, CheckCircle, XCircle, Download, RefreshCcw, Mail, FileText, Clock, X, ChevronLeft, ChevronRight, Loader2, Printer, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import api from "../../../api";

const statusOptions = [
  { value: "processing", de: "In Bearbeitung", en: "Processing", color: "bg-accent/10 text-accent" },
  { value: "shipped", de: "Versandt", en: "Shipped", color: "bg-blue-500/10 text-blue-600" },
  { value: "delivered", de: "Zugestellt", en: "Delivered", color: "bg-green-500/10 text-green-600" },
  { value: "cancelled", de: "Storniert", en: "Cancelled", color: "bg-destructive/10 text-destructive" },
];

const AdminOrders = () => {
  const { lang } = useI18n();
  const de = lang === "de";

  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalOrdersStatusCount, setTotalOrdersStatusCount] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showRefundModal, setShowRefundModal] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  
  // Shipping Modal states
  const [shippingModalOrder, setShippingModalOrder] = useState<any | null>(null);
  const [shipWeight, setShipWeight] = useState("1");
  const [shipLength, setShipLength] = useState("30");
  const [shipWidth, setShipWidth] = useState("20");
  const [shipHeight, setShipHeight] = useState("5");


  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/api/order/admin/all?page=${currentPage}&limit=10&search=${search}&status=${statusFilter}`);
      if (res.data.success) {
        setOrders(res.data.orders);
        setTotalPages(res.data.totalPages);
        setTotalOrders(res.data.totalOrders);
        setTotalOrdersStatusCount(res.data.statusCounts);
      }
    } catch (err) {
      toast.error(de ? "Fehler beim Laden der Bestellungen" : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, search, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await api.patch(`/api/order/admin/${orderId}`, { status: newStatus });
      if (res.data.success) {
        const statusLabel = statusOptions.find((s) => s.value === newStatus);
        toast.success(`${orderId}: ${de ? statusLabel?.de : statusLabel?.en}`);
        fetchOrders();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleSendNotification = async (orderId: string) => {
    try {
      await api.post(`/api/order/admin/resend-confirmation`, { orderId });
      toast.success(de ? `Bestätigungs-Mail für ${orderId} gesendet` : `Confirmation email sent for ${orderId}`);
    } catch (err) {
      toast.error("Failed to send email");
    }
  };

  const handleDownloadInvoice = (orderId: string) => {
    window.open(`${api.defaults.baseURL}/api/order/document/${orderId}/invoice`, '_blank');
  };

  const handleDownloadPackingSlip = (orderId: string) => {
    window.open(`${api.defaults.baseURL}/api/order/document/${orderId}/packingslip`, '_blank');
  };

  const handleRefund = async () => {
    if (!refundAmount) { toast.error(de ? "Bitte Rückerstattungsbetrag eingeben" : "Please enter refund amount"); return; }
    try {
      const res = await api.post(`/api/order/admin/refund`, { 
        orderId: showRefundModal, 
        amount: parseFloat(refundAmount),
        reason: refundReason
      });
      if (res.data.success) {
        toast.success(de ? `Rückerstattung abgeschlossen` : `Refund completed`);
        setShowRefundModal(null);
        setRefundAmount("");
        setRefundReason("");
        fetchOrders();
      }
    } catch (err) {
      toast.error("Refund failed");
    }
  };

  const selected = selectedOrder ? orders.find((o) => o._id === selectedOrder) : null;

  const orderTimeline = [
    { status: de ? "Bestellt" : "Ordered", icon: Package, done: true, time: "10:23 Uhr" },
    { status: de ? "Bezahlt" : "Payment Confirmed", icon: CheckCircle, done: true, time: "10:24 Uhr" },
    { status: de ? "In Bearbeitung" : "Processing", icon: RefreshCcw, done: true, time: "11:05 Uhr" },
    { status: de ? "Versandt" : "Shipped", icon: Truck, done: selected?.status === "shipped" || selected?.status === "delivered", time: selected?.trackingNumber ? "14:30 Uhr" : "—" },
    { status: de ? "Zugestellt" : "Delivered", icon: CheckCircle, done: selected?.status === "delivered", time: selected?.status === "delivered" ? "Nächster Tag" : "—" },
  ];

  const handleShipped = (order: any) => {
    setShippingModalOrder(order);
  };

  const confirmShipping = async () => {
    if (!shippingModalOrder) return;
    const loadingToast = toast.loading(de ? "Versand wird vorbereitet..." : "Preparing shipment...");
    try {
      const resp = await api.post(`/api/order/order/${shippingModalOrder._id}/ship`, {
        weight: parseFloat(shipWeight),
        length: parseFloat(shipLength),
        width: parseFloat(shipWidth),
        height: parseFloat(shipHeight),
      });
      if (resp.data.success) {
        toast.success(de ? "Versand erfolgreich eingeleitet" : "Shipment initiated successfully", { id: loadingToast });
        setShippingModalOrder(null);
        fetchOrders();
      } else {
        toast.error(resp.data.message || "Shipping failed", { id: loadingToast });
      }
    } catch (err: any) {
      console.error("Error shipping order:", err);
      toast.error(err.response?.data?.message || (de ? "Fehler beim Versand" : "Error shipping order"), { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6">
      {/* Shipping Details Modal */}
      {shippingModalOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-foreground">{de ? "Versanddetails" : "Shipping Details"}: ...{shippingModalOrder._id.slice(-6)}</h3>
              <button onClick={() => setShippingModalOrder(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Gewicht (kg)" : "Weight (kg)"}</label>
                  <input type="number" step="0.1" value={shipWeight} onChange={e => setShipWeight(e.target.value)} className="w-full px-4 py-2 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Länge (cm)" : "Length (cm)"}</label>
                  <input type="number" value={shipLength} onChange={e => setShipLength(e.target.value)} className="w-full px-4 py-2 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Breite (cm)" : "Width (cm)"}</label>
                  <input type="number" value={shipWidth} onChange={e => setShipWidth(e.target.value)} className="w-full px-4 py-2 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Höhe (cm)" : "Height (cm)"}</label>
                  <input type="number" value={shipHeight} onChange={e => setShipHeight(e.target.value)} className="w-full px-4 py-2 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={confirmShipping} className="flex-1 bg-accent text-accent-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-accent/90">
                  {de ? "Label erstellen" : "Create Label"}
                </button>
                <button onClick={() => setShippingModalOrder(null)} className="flex-1 bg-secondary text-foreground py-2.5 rounded-lg text-sm font-semibold">
                  {de ? "Abbrechen" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          {de ? "Bestellungen" : "Orders"} <span className="text-muted-foreground font-body text-base">({totalOrders})</span>
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

<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {[
    {
      icon: Package,
      label: de ? "Gesamt" : "Total Orders",
      count: totalOrders || 0,
      color: "text-foreground",
    },
    {
      icon: Clock,
      label: de ? "In Bearbeitung" : "Processing",
      count: totalOrdersStatusCount.processing || 0,
      color: "text-yellow-500",
    },
    {
      icon: Truck,
      label: de ? "Versendet" : "Shipped",
      count: totalOrdersStatusCount.shipped || 0,
      color: "text-blue-500",
    },
    {
      icon: CheckCircle,
      label: de ? "Geliefert" : "Delivered",
      count: totalOrdersStatusCount.delivered || 0,
      color: "text-green-500",
    },
  ].map((s) => (
    <div
      key={s.label}
      className="bg-card rounded-xl border border-border p-4 shadow-card hover:shadow-md transition"
    >
      <s.icon className={`w-5 h-5 ${s.color} mb-2`} />

      <p className="font-display text-xl font-bold text-foreground">
        {s.count}
      </p>

      <p className="text-xs text-muted-foreground">
        {s.label}
      </p>
    </div>
  ))}
</div>

      {selected && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-foreground">{de ? "Bestelldetails" : "Order Details"}: {selected._id}</h3>
            <button onClick={() => setSelectedOrder(null)} className="text-sm text-muted-foreground hover:text-foreground p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleDownloadInvoice(selected._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-xs font-semibold hover:bg-muted transition-colors">
              <FileText className="w-3.5 h-3.5" /> {de ? "Rechnung (PDF)" : "Invoice (PDF)"}
            </button>
            <button onClick={() => handleDownloadPackingSlip(selected._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-xs font-semibold hover:bg-muted transition-colors">
              <Package className="w-3.5 h-3.5" /> {de ? "Packzettel" : "Packing Slip"}
            </button>
            <button onClick={() => handleSendNotification(selected._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-xs font-semibold hover:bg-muted transition-colors">
              <Mail className="w-3.5 h-3.5" /> {de ? "E-Mail senden" : "Send Email"}
            </button>
            <button onClick={() => setShowRefundModal(selected._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-xs font-semibold hover:bg-destructive/20 transition-colors">
              <RefreshCcw className="w-3.5 h-3.5" /> {de ? "Rückerstattung" : "Refund"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><p className="text-muted-foreground">{de ? "Datum" : "Date"}</p><p className="font-semibold text-foreground">{new Date(selected.createdAt).toLocaleDateString()}</p></div>
            <div><p className="text-muted-foreground">Status</p><p className="font-semibold text-foreground capitalize">{selected.status}</p></div>
            <div><p className="text-muted-foreground">{de ? "Artikel" : "Items"}</p><p className="font-semibold text-foreground">{selected.items.length}</p></div>
            <div><p className="text-muted-foreground">{de ? "Gesamt" : "Total"}</p><p className="font-semibold text-foreground">{selected.total.toFixed(2)} €</p></div>
            {selected.discount > 0 && (
              <div><p className="text-muted-foreground">{de ? "Rabatt" : "Discount"}</p><p className="font-semibold text-green-600">-{selected.discount.toFixed(2)} €</p></div>
            )}
          </div>

          {selected.trackingNumber && (
            <div className="bg-secondary/50 rounded-lg p-3 border border-border flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-foreground">{de ? "Trackingnummer:" : "Tracking:"} <strong className="font-mono">{selected.trackingNumber}</strong></span>
            </div>
          )}

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
            {selected.items.map((item: any, i: number) => (
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

<div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition">

  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-base font-semibold text-foreground">
      Customer Details
    </h3>
  </div>

  {/* Profile / Name */}
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
      {selected.shippingAddress?.firstName?.[0]}
      {selected.shippingAddress?.lastName?.[0]}
    </div>

    <div>
      <p className="font-semibold text-foreground">
        {selected.shippingAddress?.firstName}{" "}
        {selected.shippingAddress?.lastName}
      </p>
      <p className="text-xs text-muted-foreground">
        Shipping Information
      </p>
    </div>
  </div>

  {/* Details */}
  <div className="border-t border-border pt-4 space-y-3 text-sm">

    <div className="flex justify-between">
      <span className="text-muted-foreground">Address</span>
      <span className="text-foreground text-right max-w-[60%]">
        {selected.shippingAddress?.address}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-muted-foreground">City / ZIP</span>
      <span className="text-foreground">
        {selected.shippingAddress?.city} • {selected.shippingAddress?.zip}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-muted-foreground">Country</span>
      <span className="text-foreground">
        {selected.shippingAddress?.country}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-muted-foreground">Phone</span>
      <span className="text-foreground">
        {selected.shippingAddress?.phone}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-muted-foreground">Email</span>
      <span className="text-foreground text-right break-all max-w-[60%]">
        {selected.shippingAddress?.email}
      </span>
    </div>

    {selected.trackingNumber && (
      <div className="pt-4 mt-4 border-t border-border space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-semibold flex items-center gap-2">
            <Truck className="w-4 h-4 text-accent" /> Tracking
          </span>
          <a 
            href={`https://tracking.sendcloud.sc/forward?carrier=dhl_de&code=${selected.trackingNumber}&destination=${selected.shippingAddress?.zip}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent font-mono font-bold hover:underline flex items-center gap-1"
          >
            {selected.trackingNumber} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Label</span>
          <button 
            onClick={() => window.open(`${api.defaults.baseURL}/api/order/order/${selected._id}/label`, '_blank')}
            className="text-accent hover:underline flex items-center gap-1 font-semibold"
          >
            <Printer className="w-4 h-4" /> Download Label
          </button>
        </div>
      </div>
    )}

  </div>
</div>

        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      ) : (
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
                {orders.map((order) => (
                  <tr key={order._id} className={`border-b border-border last:border-0 hover:bg-secondary/30 transition-colors ${!order.viewedByAdmin ? 'bg-accent/5' : ''}`}>
                    <td className="p-4 font-medium text-foreground flex items-center gap-2">
                       ...{order._id.slice(-6)}
                       {!order.viewedByAdmin && (
                         <span className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">NEW</span>
                       )}
                    </td>
                    <td className="p-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString(de ? "de-DE" : "en-US")}</td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{order.items.length} {de ? "Artikel" : "items"}</td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        // onChange={(e) => handleStatusChange(order._id, e.target.value)}
                       onChange={(e) => {
                         const newStatus = e.target.value;
                         if (order.status !== "shipped" && newStatus === "shipped") {
                           handleShipped(order);
                         } else {
                           handleStatusChange(order._id, newStatus);
                         }
                       }}
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
                        <button 
                          onClick={async () => {
                            setSelectedOrder(order._id);
                            if (!order.viewedByAdmin) {
                              await api.patch(`/api/order/admin/${order._id}/view`);
                              fetchOrders();
                            }
                          }} 
                          className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Details" : "Details"}
                        >
                          <Eye className="w-4 h-4 text-accent" />
                        </button>
                        <button 
                          onClick={() => window.open(`${api.defaults.baseURL}/api/order/document/${order._id}/invoice`, '_blank')} 
                          className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Rechnung" : "Invoice"}
                        >
                          <Download className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => handleSendNotification(order._id)} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "E-Mail" : "Email"}>
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => setShowRefundModal(order._id)} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Rückerstattung" : "Refund"}>
                          <RefreshCcw className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {(order.status === "shipped" || order.status === "delivered") && (
                          <button 
                            onClick={() => window.open(`${api.defaults.baseURL}/api/order/order/${order._id}/label`, '_blank')} 
                            className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Versandetikett" : "Shipping Label"}
                          >
                            <Printer className="w-4 h-4 text-accent" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-secondary/30 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {de ? `Seite ${currentPage} von ${totalPages}` : `Page ${currentPage} of ${totalPages}`} ({totalOrders} {de ? "Bestellungen" : "orders"})
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border hover:bg-card disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border hover:bg-card disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
