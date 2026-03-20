import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Plus, Trash2, Tag, Image as ImageIcon, Mail, ShoppingCart, Bell, Percent, Calendar, Users } from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  uses: number;
  maxUses: number;
  expires: string;
  active: boolean;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  active: boolean;
  color: string;
}

interface Subscriber {
  id: string;
  email: string;
  date: string;
  status: "active" | "unsubscribed";
}

const mockCoupons: Coupon[] = [
  { id: "1", code: "WEBER10", type: "percent", value: 10, minOrder: 50, uses: 34, maxUses: 100, expires: "2026-03-31", active: true },
  { id: "2", code: "SOMMER20", type: "percent", value: 20, minOrder: 100, uses: 12, maxUses: 50, expires: "2026-06-30", active: true },
  { id: "3", code: "NEU5EUR", type: "fixed", value: 5, minOrder: 30, uses: 8, maxUses: 200, expires: "2026-12-31", active: false },
];

const mockBanners: Banner[] = [
  { id: "1", title: "Frühjahrskollektion 2026", subtitle: "Neue Stoffe eingetroffen!", cta: "Jetzt entdecken", active: true, color: "#3E005E" },
  { id: "2", title: "Kostenloser Versand", subtitle: "Ab 100€ Bestellwert", cta: "Zum Shop", active: true, color: "#5600B2" },
  { id: "3", title: "SALE — bis zu 30% Rabatt", subtitle: "Nur für kurze Zeit", cta: "Zum Angebot", active: false, color: "#924ED1" },
];

const mockSubscribers: Subscriber[] = [
  { id: "1", email: "maria.schmidt@email.de", date: "2026-02-01", status: "active" },
  { id: "2", email: "t.keller@email.de", date: "2026-01-15", status: "active" },
  { id: "3", email: "anna.braun@email.de", date: "2026-01-20", status: "active" },
  { id: "4", email: "petra.w@email.de", date: "2025-12-10", status: "active" },
  { id: "5", email: "s.hoffmann@email.de", date: "2025-11-05", status: "unsubscribed" },
  { id: "6", email: "k.mueller@email.de", date: "2025-10-20", status: "unsubscribed" },
];

const mockAbandoned = [
  { id: "1", customer: "Gast (keine Anmeldung)", email: "gast1@email.de", items: 3, value: 189.70, time: "vor 2 Stunden", recovered: false },
  { id: "2", customer: "Maria Schmidt", email: "maria.schmidt@email.de", items: 1, value: 79.90, time: "vor 5 Stunden", recovered: true },
  { id: "3", customer: "Gast (keine Anmeldung)", email: "gast2@email.de", items: 2, value: 139.80, time: "vor 1 Tag", recovered: false },
  { id: "4", customer: "Thomas Keller", email: "t.keller@email.de", items: 4, value: 319.60, time: "vor 2 Tagen", recovered: false },
];

const AdminMarketing = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const [activeTab, setActiveTab] = useState<"coupons" | "banners" | "newsletter" | "abandoned">("coupons");
  const [coupons, setCoupons] = useState(mockCoupons);
  const [banners, setBanners] = useState(mockBanners);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState<{ code: string; type: "percent" | "fixed"; value: number; minOrder: number; maxUses: number; expires: string }>({ code: "", type: "percent", value: 10, minOrder: 0, maxUses: 100, expires: "" });
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const tabs = [
    { id: "coupons" as const, label: de ? "Gutscheine" : "Coupons", icon: Tag },
    { id: "banners" as const, label: "Banner", icon: ImageIcon },
    { id: "newsletter" as const, label: "Newsletter", icon: Mail },
    { id: "abandoned" as const, label: de ? "Abgebrochene Warenkörbe" : "Abandoned Carts", icon: ShoppingCart },
  ];

  const handleCreateCoupon = () => {
    if (!newCoupon.code) return;
    setCoupons([...coupons, { id: Date.now().toString(), ...newCoupon, uses: 0, active: true }]);
    toast.success(de ? `Gutschein "${newCoupon.code}" erstellt` : `Coupon "${newCoupon.code}" created`);
    setShowCouponForm(false);
    setNewCoupon({ code: "", type: "percent", value: 10, minOrder: 0, maxUses: 100, expires: "" });
  };

  const toggleCoupon = (id: string) => {
    setCoupons(coupons.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const deleteCoupon = (id: string, code: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
    toast.success(de ? `Gutschein "${code}" gelöscht` : `Coupon "${code}" deleted`);
  };

  const toggleBanner = (id: string) => {
    setBanners(banners.map(b => b.id === id ? { ...b, active: !b.active } : b));
    toast.success(de ? "Banner aktualisiert" : "Banner updated");
  };

  const handleSendCampaign = () => {
    if (!emailSubject || !emailBody) {
      toast.error(de ? "Betreff und Inhalt erforderlich" : "Subject and content required");
      return;
    }
    toast.success(de ? `Kampagne an ${mockSubscribers.filter(s => s.status === "active").length} Empfänger gesendet` : `Campaign sent to ${mockSubscribers.filter(s => s.status === "active").length} recipients`);
    setEmailSubject("");
    setEmailBody("");
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
              <span className="text-muted-foreground">{de ? "Aktiv:" : "Active:"} <strong className="text-foreground">{coupons.filter(c => c.active).length}</strong></span>
              <span className="text-muted-foreground">{de ? "Gesamt:" : "Total:"} <strong className="text-foreground">{coupons.length}</strong></span>
            </div>
            <button
              onClick={() => setShowCouponForm(!showCouponForm)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> {de ? "Neuer Gutschein" : "New Coupon"}
            </button>
          </div>

          {showCouponForm && (
            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <h3 className="font-display text-base font-bold text-foreground mb-4">{de ? "Gutschein erstellen" : "Create Coupon"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleCreateCoupon} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">{de ? "Erstellen" : "Create"}</button>
                <button onClick={() => setShowCouponForm(false)} className="bg-secondary text-foreground px-6 py-2.5 rounded-lg text-sm font-semibold">{de ? "Abbrechen" : "Cancel"}</button>
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
                    <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">{de ? "Verwendungen" : "Uses"}</th>
                    <th className="text-left p-4 text-muted-foreground font-medium hidden lg:table-cell">{de ? "Ablauf" : "Expires"}</th>
                    <th className="text-center p-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Aktionen" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
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
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-foreground">{c.uses}</span>
                        <span className="text-muted-foreground">/{c.maxUses}</span>
                      </td>
                      <td className="p-4 text-muted-foreground hidden lg:table-cell">{c.expires || "—"}</td>
                      <td className="p-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={c.active} onChange={() => toggleCoupon(c.id)} className="sr-only peer" />
                          <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-accent transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                        </label>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => deleteCoupon(c.id, c.code)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
              { label: de ? "Abonnenten gesamt" : "Total Subscribers", value: mockSubscribers.length, icon: Users },
              { label: de ? "Aktive Abonnenten" : "Active Subscribers", value: mockSubscribers.filter(s => s.status === "active").length, icon: Bell },
              { label: de ? "Abgemeldet" : "Unsubscribed", value: mockSubscribers.filter(s => s.status === "unsubscribed").length, icon: Mail },
              { label: de ? "Öffnungsrate (Ø)" : "Avg. Open Rate", value: "24.3%", icon: Percent },
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
                  {de ? `Empfänger: ${mockSubscribers.filter(s => s.status === "active").length} aktive Abonnenten` : `Recipients: ${mockSubscribers.filter(s => s.status === "active").length} active subscribers`}
                </p>
                <button onClick={handleSendCampaign} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                  <Mail className="w-4 h-4" /> {de ? "Kampagne senden" : "Send Campaign"}
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
                  {mockSubscribers.map(s => (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4 text-foreground">{s.email}</td>
                      <td className="p-4 text-muted-foreground hidden md:table-cell">{new Date(s.date).toLocaleDateString(de ? "de-DE" : "en-US")}</td>
                      <td className="p-4 text-center">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.status === "active" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                          {s.status === "active" ? (de ? "Aktiv" : "Active") : (de ? "Abgemeldet" : "Unsubscribed")}
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

      {/* ABANDONED CARTS */}
      {activeTab === "abandoned" && (
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
      )}
    </div>
  );
};

export default AdminMarketing;
