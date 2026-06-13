import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Plus, Trash2, Tag, Image as ImageIcon, Mail, ShoppingCart, Bell, Percent, Calendar, Users, Pencil, X, Search, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import api from "../../../api";
import axios from "axios";

interface Coupon {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  uses: number;
  maxUses: number;
  expires: string;
  active: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  active: boolean;
  color: string;
}

const mockBanners: Banner[] = [
  { id: "1", title: "Frühjahrskollektion 2026", subtitle: "Neue Stoffe eingetroffen!", cta: "Jetzt entdecken", active: true, color: "#3E005E" },
  { id: "2", title: "Kostenloser Versand", subtitle: "Ab 100€ Bestellwert", cta: "Zum Shop", active: true, color: "#5600B2" },
  { id: "3", title: "SALE — bis zu 30% Rabatt", subtitle: "Nur für kurze Zeit", cta: "Zum Angebot", active: false, color: "#924ED1" },
];

// const mockAbandoned = [
//   { id: "1", customer: "Gast (keine Anmeldung)", email: "gast1@email.de", items: 3, value: 189.70, time: "vor 2 Stunden", recovered: false },
//   { id: "2", customer: "Maria Schmidt", email: "maria.schmidt@email.de", items: 1, value: 79.90, time: "vor 5 Stunden", recovered: true },
//   { id: "3", customer: "Gast (keine Anmeldung)", email: "gast2@email.de", items: 2, value: 139.80, time: "vor 1 Tag", recovered: false },
//   { id: "4", customer: "Thomas Keller", email: "t.keller@email.de", items: 4, value: 319.60, time: "vor 2 Tagen", recovered: false },
// ];

const SearchableMultiSelect = ({
  options,
  selected,
  onChange,
  onSearch,
  placeholder,
  searchPlaceholder,
  async = false
}: any) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [localOptions, setLocalOptions] = useState(options);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (async && open) {
      const fetchOpts = async () => {
        setLoading(true);
        await onSearch(query, setLocalOptions);
        setLoading(false);
      };
      const t = setTimeout(fetchOpts, 300);
      return () => clearTimeout(t);
    } else if (!async) {
      setLocalOptions(options.filter((o: any) => o.name.toLowerCase().includes(query.toLowerCase())));
    }
  }, [query, async, open, options]);

  const toggleOption = (opt: any) => {
    if (selected.some((s: any) => s._id === opt._id)) {
      onChange(selected.filter((s: any) => s._id !== opt._id));
    } else {
      onChange([...selected, opt]);
    }
  };

  const removeOption = (id: string, e: any) => {
    e.stopPropagation();
    onChange(selected.filter((s: any) => s._id !== id));
  };

  return (
    <div className="relative w-full">
      <div 
        className="min-h-[42px] w-full px-3 py-2 bg-secondary/50 rounded-xl border border-border cursor-pointer flex flex-wrap gap-2 items-center"
        onClick={() => setOpen(!open)}
      >
        {selected.length === 0 && <span className="text-muted-foreground text-sm">{placeholder}</span>}
        {selected.map((s: any) => (
          <span key={s._id} className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
            {s.name}
            <button type="button" onClick={(e) => removeOption(s._id, e)} className="hover:bg-primary/20 rounded-full p-0.5 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="ml-auto text-muted-foreground"><ChevronDown className="w-4 h-4" /></div>
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-2 bg-card rounded-xl border border-border shadow-lg overflow-hidden flex flex-col max-h-64">
          <div className="p-3 border-b border-border flex items-center gap-2 sticky top-0 bg-card z-10">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input 
              autoFocus
              className="bg-transparent border-none outline-none text-sm w-full font-medium"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto p-2 space-y-1">
            {loading ? (
              <p className="p-3 text-sm text-muted-foreground text-center">Laden...</p>
            ) : localOptions.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground text-center">Keine Ergebnisse</p>
            ) : (
              localOptions.map((opt: any) => {
                const isSelected = selected.some((s: any) => s._id === opt._id);
                return (
                  <div 
                    key={opt._id} 
                    onClick={() => toggleOption(opt)}
                    className="flex items-center gap-3 p-2.5 hover:bg-secondary/80 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30 bg-background'}`}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span className="text-sm font-medium text-foreground">{opt.name}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
      
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
};

const AdminMarketing = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const [activeTab, setActiveTab] = useState<"coupons" | "banners" | "newsletter" | "abandoned">("coupons");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [totalActiveCoupons, setTotalActiveCoupons] = useState(0);
  const MAX_VISIBLE = 5;

  const [banners, setBanners] = useState(mockBanners);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  interface NewCoupon {
    _id?: string;
    code: string;
    type: "percent" | "fixed";
    value: number;
    minOrder: number;
    maxUses: number;
    expires: string;
    applicableProducts: any[];
    applicableCategories: any[];
  }
  const defaultCoupon: NewCoupon = { code: "", type: "percent", value: 10, minOrder: 0, maxUses: 100, expires: "", applicableProducts: [], applicableCategories: [] };
  const [newCoupon, setNewCoupon] = useState<NewCoupon>(defaultCoupon);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [togglingCouponIds, setTogglingCouponIds] = useState<string[]>([]);
  const [deletingCouponIds, setDeletingCouponIds] = useState<string[]>([]);
  
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const tabs = [
    { id: "coupons" as const, label: de ? "Gutscheine" : "Coupons", icon: Tag },
    { id: "banners" as const, label: "Banner", icon: ImageIcon },
    { id: "newsletter" as const, label: "Newsletter", icon: Mail },
    // { id: "abandoned" as const, label: de ? "Abgebrochene Warenkörbe" : "Abandoned Carts", icon: ShoppingCart },
  ];

  const getVisiblePages = () => {
    const pages = [];
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
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  // Fetch Coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const resp = await api.get("/api/coupon/get-coupons", {
        params: { page, limit }
      });
      // The backend now returns { coupons, pagination: { total, page, pages } }
      setCoupons(resp.data.coupons);
      if (resp.data.pagination) {
        setTotalPages(resp.data.pagination.pages);
        setTotalCoupons(resp.data.pagination.total);
        setTotalActiveCoupons(resp.data.pagination.totalActive);
      }
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
      toast.error(de ? "Fehler beim Laden der Gutscheine" : "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "coupons") {
      fetchCoupons();
      // Fetch categories for selection (products are fetched asynchronously on search)
      api.get("/api/category/get-categories").then(res => setCategoriesList(res.data.categories || [])).catch(() => {});
    }
  }, [activeTab, page, limit]);

  const searchProducts = async (query: string, setLocalOptions: any) => {
    try {
      const res = await api.get(`/api/products/get-product?search=${query}&limit=20`);
      setLocalOptions(res.data.products || []);
    } catch (err) {}
  };

  const handleCreateCoupon = async () => {
    if (!newCoupon.code) return;
    try {
      setSavingCoupon(true);
      const payload = {
        ...newCoupon,
        applicableProducts: newCoupon.applicableProducts.map(p => p._id),
        applicableCategories: newCoupon.applicableCategories.map(c => c._id)
      };
      const resp = await api.post("/api/coupon/save-coupon", payload);
      if (resp.data.success) {
        toast.success(resp.data.message);
        setShowCouponForm(false);
        setEditingCoupon(null);
        setNewCoupon(defaultCoupon);
        fetchCoupons();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0] || "Error saving coupon");
    } finally {
      setSavingCoupon(false);
    }
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setNewCoupon({
      _id: coupon._id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder,
      maxUses: coupon.maxUses,
      expires: coupon.expires || "",
      applicableProducts: coupon.applicableProducts || [],
      applicableCategories: coupon.applicableCategories || [],
    });
    setShowCouponForm(true);
  };

  const toggleCoupon = async (id: string) => {
    if (togglingCouponIds.includes(id)) return;
    try {
      setTogglingCouponIds(prev => [...prev, id]);
      const resp = await api.patch(`/api/coupon/toggle-coupon/${id}`);
      if (resp.data.success) {
        setCoupons(coupons.map(c => c._id === id ? { ...c, active: resp.data.active } : c));
        toast.success(de ? "Status aktualisiert" : "Status updated");
      }
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setTogglingCouponIds(prev => prev.filter(x => x !== id));
    }
  };

  const deleteCoupon = async (id: string, code: string) => {
    if (deletingCouponIds.includes(id)) return;
    try {
      setDeletingCouponIds(prev => [...prev, id]);
      const resp = await api.delete(`/api/coupon/delete-coupon/${id}`);
      if (resp.data.success) {
        setCoupons(coupons.filter(c => c._id !== id));
        toast.success(de ? `Gutschein "${code}" gelöscht` : `Coupon "${code}" deleted`);
      }
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeletingCouponIds(prev => prev.filter(x => x !== id));
      setDeleteConfirm(null);
    }
  };

  const toggleBanner = (id: string) => {
    setBanners(banners.map(b => b.id === id ? { ...b, active: !b.active } : b));
    toast.success(de ? "Banner aktualisiert" : "Banner updated");
  };

  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subscriberPage, setSubscriberPage] = useState(1);
  const [subscriberTotalPages, setSubscriberTotalPages] = useState(1);
  const [subscriberTotal, setSubscriberTotal] = useState(0);
  const [subLoading, setSubLoading] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState(false);

  const fetchSubscribers = async () => {
    try {
      setSubLoading(true);
      const resp = await api.get("/api/subscribe/get-subscribers", {
        params: { page: subscriberPage, limit: 10 }
      });
      setSubscribers(resp.data.subscribers || []);
      setSubscriberTotalPages(resp.data.totalPages || 1);
      setSubscriberTotal(resp.data.totalSubscribers || 0);
    } catch (err) {
      console.error("Failed to fetch subscribers:", err);
      toast.error(de ? "Fehler beim Laden der Abonnenten" : "Failed to load subscribers");
    } finally {
      setSubLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "newsletter") {
      fetchSubscribers();
    }
  }, [activeTab, subscriberPage]);

  const handleSendCampaign = async () => {
    if (!emailSubject || !emailBody) {
      toast.error(de ? "Betreff und Inhalt erforderlich" : "Subject and content required");
      return;
    }
    
    try {
      setSendingCampaign(true);
      const resp = await api.post("/api/subscribe/send-campaign", {
        subject: emailSubject,
        message: emailBody
      });
      
      if (resp.data.success) {
        toast.success(resp.data.message);
        setEmailSubject("");
        setEmailBody("");
      } else {
        toast.error(resp.data.error || "Failed to send campaign");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error sending campaign");
    } finally {
      setSendingCampaign(false);
    }
  };

  const handleRecoveryEmail = (email: string) => {
    toast.success(de ? `Warenkorbmail an ${email} gesendet` : `Cart recovery email sent to ${email}`);
  };

  const inputClass = "w-full px-4 py-2.5 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">
        {de ? "Marketing & Aktionen" : "Marketing & Promotions"}
      </h2>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* COUPONS */}
      {activeTab === "coupons" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 text-sm">
              <span className="text-muted-foreground">{de ? "Aktiv:" : "Active:"} <strong className="text-foreground">{totalActiveCoupons}</strong></span>
              <span className="text-muted-foreground">{de ? "Gesamt:" : "Total:"} <strong className="text-foreground">{totalCoupons}</strong></span>
            </div>
            <button
              onClick={() => {
                setShowCouponForm(!showCouponForm);
                if (!showCouponForm) {
                  setEditingCoupon(null);
                  setNewCoupon(defaultCoupon);
                }
              }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> {de ? "Neuer Gutschein" : "New Coupon"}
            </button>
          </div>

          {showCouponForm && (
            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <h3 className="font-display text-base font-bold text-foreground mb-4">
                {editingCoupon ? (de ? "Gutschein bearbeiten" : "Edit Coupon") : (de ? "Gutschein erstellen" : "Create Coupon")}
              </h3>
              <fieldset disabled={savingCoupon} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Gutscheincode" : "Coupon Code"}</label>
                  <input value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} placeholder="WEBER10" className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Rabatttyp" : "Discount Type"}</label>
                  <select value={newCoupon.type} onChange={e => setNewCoupon({ ...newCoupon, type: (e.target.value as "percent" | "fixed") })} className={inputClass}>
                    <option value="percent">{de ? "Prozent (%)" : "Percent (%)"}</option>
                    <option value="fixed">{de ? "Fester Betrag (€)" : "Fixed Amount (€)"}</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Rabattwert" : "Discount Value"}</label>
                  <input type="number" value={newCoupon.value} onChange={e => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Mindestbestellwert (€)" : "Min. Order (€)"}</label>
                  <input type="number" value={newCoupon.minOrder} onChange={e => setNewCoupon({ ...newCoupon, minOrder: Number(e.target.value) })} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Max. Verwendungen" : "Max. Uses"}</label>
                  <input type="number" value={newCoupon.maxUses} onChange={e => setNewCoupon({ ...newCoupon, maxUses: Number(e.target.value) })} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Ablaufdatum" : "Expires"}</label>
                  <input type="date" value={newCoupon.expires} onChange={e => setNewCoupon({ ...newCoupon, expires: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Für Kategorien (optional)" : "Applicable Categories (optional)"}</label>
                  <SearchableMultiSelect 
                    options={categoriesList} 
                    selected={newCoupon.applicableCategories} 
                    onChange={(selected: any) => setNewCoupon({...newCoupon, applicableCategories: selected})}
                    placeholder={de ? "Kategorien wählen..." : "Select categories..."}
                    searchPlaceholder={de ? "Suchen..." : "Search..."}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Für Produkte (optional)" : "Applicable Products (optional)"}</label>
                  <SearchableMultiSelect 
                    options={[]} 
                    selected={newCoupon.applicableProducts} 
                    onChange={(selected: any) => setNewCoupon({...newCoupon, applicableProducts: selected})}
                    onSearch={searchProducts}
                    placeholder={de ? "Produkte wählen..." : "Select products..."}
                    searchPlaceholder={de ? "Suchen..." : "Search..."}
                    async={true}
                  />
                </div>
              </fieldset>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCreateCoupon}
                  disabled={savingCoupon}
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingCoupon ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {de ? "Wird verarbeitet..." : "Processing..."}
                    </>
                  ) : (
                    editingCoupon ? (de ? "Speichern" : "Save") : (de ? "Erstellen" : "Create")
                  )}
                </button>
                <button
                  onClick={() => { setShowCouponForm(false); setEditingCoupon(null); }}
                  disabled={savingCoupon}
                  className="bg-secondary text-foreground px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {de ? "Abbrechen" : "Cancel"}
                </button>
              </div>
            </div>
          )}

          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Code" : "Code"}</th>
                    <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">{de ? "Rabatt" : "Discount"}</th>
                    <th className="text-left p-4 text-muted-foreground font-medium hidden lg:table-cell">{de ? "Mindestbestellwert" : "Min. Order"}</th>
                    <th className="text-left p-4 text-muted-foreground font-medium hidden xl:table-cell">{de ? "Gültig für" : "Applicable To"}</th>
                    <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">{de ? "Verwendungen" : "Uses"}</th>
                    <th className="text-left p-4 text-muted-foreground font-medium hidden lg:table-cell">{de ? "Ablauf" : "Expires"}</th>
                    <th className="text-center p-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Aktionen" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">{de ? "Lädt..." : "Loading..."}</td>
                    </tr>
                  ) : coupons.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">{de ? "Keine Gutscheine gefunden" : "No coupons found"}</td>
                    </tr>
                  ) : coupons.map(c => (
                    <tr key={c._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Percent className="w-3.5 h-3.5 text-accent" />
                          <span className="font-mono font-bold text-foreground">{c.code}</span>
                        </div>
                      </td>
                      <td className="p-4 text-foreground hidden md:table-cell">
                        {c.type === "percent" ? `${c.value}%` : `${c.value.toFixed(2)} €`}
                      </td>
                      <td className="p-4 text-muted-foreground hidden lg:table-cell">{c.minOrder > 0 ? `${c.minOrder} €` : "—"}</td>
                      <td className="p-4 text-muted-foreground hidden xl:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {c.applicableCategories?.map((cat: any) => (
                            <span key={cat._id} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                              <span className="opacity-60">{de ? "Kat:" : "Cat:"}</span>{cat.name}
                            </span>
                          ))}
                          {c.applicableProducts?.map((prod: any) => (
                            <span key={prod._id} className="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                              <span className="opacity-60">{de ? "Prod:" : "Prod:"}</span>{prod.name}
                            </span>
                          ))}
                          {(!c.applicableCategories?.length && !c.applicableProducts?.length) && (de ? "Alle (All)" : "All")}
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-foreground">{c.uses}</span>
                        <span className="text-muted-foreground">/{c.maxUses}</span>
                      </td>
                      <td className="p-4 text-muted-foreground hidden lg:table-cell">{c.expires || "—"}</td>
                      <td className="p-4 text-center">
                        <label className={`relative inline-flex items-center ${togglingCouponIds.includes(c._id) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                          <input
                            type="checkbox"
                            checked={c.active}
                            onChange={() => toggleCoupon(c._id)}
                            disabled={togglingCouponIds.includes(c._id)}
                            className="sr-only peer"
                          />
                          {togglingCouponIds.includes(c._id) ? (
                            <div className="w-9 h-5 flex items-center justify-center">
                              <svg className="animate-spin h-4 w-4 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          ) : (
                            <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-accent transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                          )}
                        </label>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(c)}
                            disabled={deletingCouponIds.includes(c._id) || togglingCouponIds.includes(c._id)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={de ? "Bearbeiten" : "Edit"}
                          >
                            <Pencil className="w-4 h-4 text-accent" />
                          </button>
                          {deleteConfirm === c._id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => deleteCoupon(c._id, c.code)}
                                disabled={deletingCouponIds.includes(c._id)}
                                className="px-2 py-1 bg-destructive text-destructive-foreground rounded text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                {deletingCouponIds.includes(c._id) ? (
                                  <svg className="animate-spin h-3.5 w-3.5 text-destructive-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (de ? "Ja" : "Yes")}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deletingCouponIds.includes(c._id)}
                                className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <X className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(c._id)}
                              disabled={deletingCouponIds.includes(c._id) || togglingCouponIds.includes(c._id)}
                              className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={de ? "Löschen" : "Delete"}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2 mt-4 p-4 justify-center">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-border rounded-lg disabled:opacity-50 text-sm font-medium hover:bg-secondary transition-colors"
              >
                {de ? "Zurück" : "Prev"}
              </button>

              {getVisiblePages().map((p, idx) =>
                p === "..." ? (
                  <span key={idx} className="px-2 py-1 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`px-3 py-1 border rounded-lg text-sm font-medium transition-colors ${
                      page === p 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-border rounded-lg disabled:opacity-50 text-sm font-medium hover:bg-secondary transition-colors"
              >
                {de ? "Weiter" : "Next"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* BANNERS */}
      {activeTab === "banners" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{de ? "Verwalten Sie Aktionsbanner und Slider auf der Startseite." : "Manage promotional banners and sliders on the homepage."}</p>
          <div className="grid grid-cols-1 gap-4">
            {banners.map(b => (
              <div key={b.id} className="bg-card rounded-xl border border-border p-5 shadow-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{ backgroundColor: b.color + "33", border: `2px solid ${b.color}55` }}>
                  <ImageIcon className="w-6 h-6 m-3" style={{ color: b.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{b.title}</p>
                  <p className="text-sm text-muted-foreground">{b.subtitle}</p>
                  <span className="text-xs text-accent font-medium">{de ? "CTA:" : "CTA:"} {b.cta}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={b.active} onChange={() => toggleBanner(b.id)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-accent transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${b.active ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                    {b.active ? (de ? "Aktiv" : "Active") : (de ? "Inaktiv" : "Inactive")}
                  </span>
                </div>
              </div>
            ))}
            <button className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-5 text-muted-foreground hover:text-foreground hover:border-accent transition-colors">
              <Plus className="w-5 h-5" />
              <span className="text-sm font-semibold">{de ? "Neues Banner erstellen" : "Create new banner"}</span>
            </button>
          </div>
        </div>
      )}

      {/* NEWSLETTER */}
      {activeTab === "newsletter" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: de ? "Abonnenten gesamt" : "Total Subscribers", value: subscriberTotal, icon: Users },
              { label: de ? "Aktive Abonnenten" : "Active Subscribers", value: subscriberTotal, icon: Bell },
              { label: de ? "Vorhandene Abonnenten" : "Subscribers Now", value: subscribers.length, icon: Mail },
              { label: de ? "Öffnungsrate (Ø)" : "Avg. Open Rate", value: "—", icon: Percent },
            ].map(s => (
              <div key={s.label} className="bg-card rounded-xl border border-border p-4 shadow-card">
                <s.icon className="w-5 h-5 text-accent mb-2" />
                <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Campaign Builder */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h3 className="font-display text-base font-bold text-foreground mb-4">{de ? "Kampagne erstellen" : "Create Campaign"}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{de ? "Betreff" : "Subject"}</label>
                <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder={de ? "z.B. Neue Stoffe eingetroffen!" : "e.g. New fabrics arrived!"} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{de ? "Nachricht" : "Message"}</label>
                <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={6} placeholder={de ? "Schreiben Sie Ihre Newsletter-Nachricht..." : "Write your newsletter message..."} className={inputClass + " resize-none"} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {de ? `Empfänger: ${subscriberTotal} aktive Abonnenten` : `Recipients: ${subscriberTotal} active subscribers`}
                </p>
                <button 
                  onClick={handleSendCampaign} 
                  disabled={sendingCampaign}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {sendingCampaign ? (
                    <span className="animate-pulse">{de ? "Wird gesendet..." : "Sending..."}</span>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" /> {de ? "Kampagne senden" : "Send Campaign"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Subscriber list */}
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-foreground">{de ? "Abonnentenliste" : "Subscriber List"}</h3>
              <button onClick={() => toast.success(de ? "Liste als CSV exportiert" : "List exported as CSV")} className="text-xs bg-secondary text-foreground px-3 py-1.5 rounded-lg font-semibold hover:bg-muted transition-colors">
                {de ? "CSV exportieren" : "Export CSV"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-4 text-muted-foreground font-medium">Email</th>
                    <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">{de ? "Datum" : "Date"}</th>
                    <th className="text-center p-4 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subLoading ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground">{de ? "Lädt..." : "Loading..."}</td>
                    </tr>
                  ) : subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground">{de ? "Keine Abonnenten gefunden" : "No subscribers found"}</td>
                    </tr>
                  ) : subscribers.map(s => (
                    <tr key={s._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4 text-foreground">{s.email}</td>
                      <td className="p-4 text-muted-foreground hidden md:table-cell">{new Date(s.createdAt).toLocaleDateString(de ? "de-DE" : "en-US")}</td>
                      <td className="p-4 text-center">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-green-500/10 text-green-600`}>
                          {de ? "Aktiv" : "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subscriber Pagination */}
            {subscriberTotalPages > 1 && (
              <div className="flex items-center gap-2 p-4 justify-center border-t border-border bg-secondary/20">
                <button
                  onClick={() => setSubscriberPage(prev => Math.max(prev - 1, 1))}
                  disabled={subscriberPage === 1}
                  className="px-3 py-1 border border-border rounded-lg disabled:opacity-50 text-sm font-medium hover:bg-secondary transition-colors"
                >
                  {de ? "Zurück" : "Prev"}
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-foreground">{subscriberPage}</span>
                  <span className="text-muted-foreground px-1">/</span>
                  <span className="text-sm text-muted-foreground">{subscriberTotalPages}</span>
                </div>
                <button
                  onClick={() => setSubscriberPage(prev => Math.min(prev + 1, subscriberTotalPages))}
                  disabled={subscriberPage === subscriberTotalPages}
                  className="px-3 py-1 border border-border rounded-lg disabled:opacity-50 text-sm font-medium hover:bg-secondary transition-colors"
                >
                  {de ? "Weiter" : "Next"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABANDONED CARTS */}
      {/* {activeTab === "abandoned" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: de ? "Abgebrochene Körbe" : "Abandoned Carts", value: mockAbandoned.length },
              { label: de ? "Potenzielle Einnahmen" : "Potential Revenue", value: `${mockAbandoned.filter(a => !a.recovered).reduce((s, a) => s + a.value, 0).toFixed(2)} €` },
              { label: de ? "Zurückgewonnen" : "Recovered", value: mockAbandoned.filter(a => a.recovered).length },
              { label: de ? "Rückgewinnungsrate" : "Recovery Rate", value: `${Math.round(mockAbandoned.filter(a => a.recovered).length / mockAbandoned.length * 100)}%` },
            ].map(s => (
              <div key={s.label} className="bg-card rounded-xl border border-border p-4 shadow-card">
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="p-5 border-b border-border">
              <p className="text-sm text-muted-foreground">{de ? "Senden Sie automatische Erinnerungs-E-Mails an Kunden mit abgebrochenen Warenkörben." : "Send automatic reminder emails to customers with abandoned carts."}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Kunde" : "Customer"}</th>
                    <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">{de ? "Artikel" : "Items"}</th>
                    <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Wert" : "Value"}</th>
                    <th className="text-left p-4 text-muted-foreground font-medium hidden lg:table-cell">{de ? "Zeit" : "Time"}</th>
                    <th className="text-center p-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Aktion" : "Action"}</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAbandoned.map(a => (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-foreground text-xs">{a.customer}</p>
                        <p className="text-muted-foreground text-xs">{a.email}</p>
                      </td>
                      <td className="p-4 text-muted-foreground hidden md:table-cell">{a.items} {de ? "Artikel" : "items"}</td>
                      <td className="p-4 text-right font-semibold text-foreground">{a.value.toFixed(2)} €</td>
                      <td className="p-4 text-muted-foreground text-xs hidden lg:table-cell">{a.time}</td>
                      <td className="p-4 text-center">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${a.recovered ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}>
                          {a.recovered ? (de ? "Zurückgewonnen" : "Recovered") : (de ? "Offen" : "Open")}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {!a.recovered && (
                          <button onClick={() => handleRecoveryEmail(a.email)} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap">
                            {de ? "E-Mail senden" : "Send Email"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default AdminMarketing;
