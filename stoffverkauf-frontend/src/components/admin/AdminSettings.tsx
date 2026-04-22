import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Store, Globe, Palette, Mail, Shield, Bell, Users, Receipt, CreditCard, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../../api";

interface UserRole {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  active: boolean;
}

const AdminSettings = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const [activeTab, setActiveTab] = useState<"general" | "appearance" | "email" | "security" | "tax" | "roles">("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState<any>({
    general: { storeName: "", email: "", phone: "", currency: "EUR (€)", language: "de", address: "", vatNumber: "" },
    tax: { standardRate: 19, reducedRate: 7, showIncVat: true, showVatNotice: true, taxNumber: "", taxOffice: "" },
    appearance: { primaryColor: "#3E005E", accentColor: "#5600B2", displayFont: "Playfair Display", bodyFont: "DM Sans", darkMode: false },
    email: { orderConfirmations: true, shippingNotifications: true, reviewRequests: false, newsletterWelcome: true, abandonedCartReminder: false, senderEmail: "", abandonedCartDelay: 2 },
    security: { forceSsl: true, showCookieBanner: true, maintenanceMode: false, twoFactorAuth: false }
  });

  const [users, setUsers] = useState<any[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", password: "" });

  useEffect(() => {
    fetchSettings();
    fetchAdmins();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/settings");
      if (res.data) {
        setSettings((prev: any) => ({
          ...prev,
          ...res.data,
          general: { ...prev.general, ...res.data.general },
          tax: { ...prev.tax, ...res.data.tax },
          appearance: { ...prev.appearance, ...res.data.appearance },
          email: { ...prev.email, ...res.data.email },
          security: { ...prev.security, ...res.data.security }
        }));
      }
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await api.get("/api/user/admins");
      if (res.data.success) {
        setUsers(res.data.admins);
      }
    } catch (err) {
      console.error("Failed to fetch admins", err);
    }
  };

  const addUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password) {
      toast.error(de ? "Bitte füllen Sie alle Felder aus" : "Please fill in all fields");
      return;
    }
    try {
      const res = await api.post("/api/user/admins", newUser);
      if (res.data.success) {
        toast.success(de ? "Admin hinzugefügt" : "Admin added");
        setShowAddUser(false);
        setNewUser({ firstName: "", lastName: "", email: "", password: "" });
        fetchAdmins();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error === "email_exists" 
        ? (de ? "E-Mail bereits vergeben" : "Email already exists")
        : "Failed to add admin");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm(de ? "Benutzer wirklich löschen?" : "Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/api/user/admins/${id}`);
      toast.success(de ? "Benutzer gelöscht" : "User deleted");
      fetchAdmins();
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const tabs = [
    { id: "general" as const, label: de ? "Allgemein" : "General", icon: Store },
    { id: "tax" as const, label: de ? "Steuer" : "Tax", icon: Receipt },
    { id: "appearance" as const, label: de ? "Erscheinungsbild" : "Appearance", icon: Palette },
    { id: "email" as const, label: "E-Mail", icon: Mail },
    { id: "roles" as const, label: de ? "Benutzer & Rollen" : "Users & Roles", icon: Users },
    { id: "security" as const, label: de ? "Sicherheit" : "Security", icon: Shield },
  ];

  const handleUpdate = (category: string, field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const save = async () => {
    try {
      setSaving(true);
      await api.put("/api/settings", settings);
      toast.success(de ? "Einstellungen gespeichert" : "Settings saved");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent";

  if (loading) {
     return <div className="flex items-center justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  const SaveButton = () => (
    <div className="pt-6 mt-6 border-t border-border flex justify-end">
      <button 
        onClick={save} 
        disabled={saving}
        className="bg-primary text-primary-foreground px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {de ? "Änderungen speichern" : "Save Changes"}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {de ? "Einstellungen" : "Settings"}
        </h2>
      </div>

      <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl overflow-x-auto w-fit">
        {tabs.map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? "bg-primary text-primary-foreground shadow-md scale-105" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className={`bg-card rounded-xl border border-border p-6 shadow-card ${activeTab !== "roles" ? "max-w-2xl" : ""}`}>
        {activeTab === "general" && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">{de ? "Shop-Informationen" : "Store Information"}</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{de ? "Shop-Name" : "Store Name"}</label>
                <input value={settings.general.storeName || ""} onChange={e => handleUpdate("general", "storeName", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">E-Mail</label>
                <input value={settings.general.email || ""} onChange={e => handleUpdate("general", "email", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{de ? "Telefon" : "Phone"}</label>
                <input value={settings.general.phone || ""} onChange={e => handleUpdate("general", "phone", e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{de ? "Währung" : "Currency"}</label>
                <select value={settings.general.currency} onChange={e => handleUpdate("general", "currency", e.target.value)} className={inputClass}>
                  <option>EUR (€)</option>
                  <option>USD ($)</option>
                  <option>CHF (CHF)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{de ? "Sprache" : "Language"}</label>
                <select value={settings.general.language} onChange={e => handleUpdate("general", "language", e.target.value)} className={inputClass}>
                  <option value="de">Deutsch</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Adresse" : "Address"}</label>
              <textarea value={settings.general.address || ""} onChange={e => handleUpdate("general", "address", e.target.value)} rows={2} className={inputClass + " resize-none"} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "MwSt.-Nr." : "VAT Number"}</label>
              <input value={settings.general.vatNumber || ""} onChange={e => handleUpdate("general", "vatNumber", e.target.value)} className={inputClass} />
            </div>
            <SaveButton />
          </div>
        )}

        {activeTab === "tax" && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">{de ? "Steuereinstellungen" : "Tax Settings"}</h3>
            <div className="bg-secondary/50 rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground">{de ? "Konfigurieren Sie Umsatzsteuersätze und rechtliche Hinweise." : "Configure VAT rates and legal notices."}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Standard-MwSt.-Satz (%)" : "Standard VAT Rate (%)"}</label>
              <input value={settings.tax.standardRate || 0} onChange={e => handleUpdate("tax", "standardRate", Number(e.target.value))} type="number" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Ermäßigter MwSt.-Satz (%)" : "Reduced VAT Rate (%)"}</label>
              <input value={settings.tax.reducedRate || 0} onChange={e => handleUpdate("tax", "reducedRate", Number(e.target.value))} type="number" className={inputClass} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={!!settings.tax.showIncVat} onChange={e => handleUpdate("tax", "showIncVat", e.target.checked)} className="w-4 h-4 accent-accent" />
              <label className="text-sm text-foreground">{de ? "Preise inkl. MwSt. anzeigen" : "Show prices including VAT"}</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={!!settings.tax.showVatNotice} onChange={e => handleUpdate("tax", "showVatNotice", e.target.checked)} className="w-4 h-4 accent-accent" />
              <label className="text-sm text-foreground">{de ? 'MwSt.-Hinweis "inkl. MwSt." anzeigen' : 'Show VAT notice "incl. VAT"'}</label>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Steuernummer" : "Tax Number"}</label>
              <input value={settings.tax.taxNumber || ""} onChange={e => handleUpdate("tax", "taxNumber", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Finanzamt" : "Tax Office"}</label>
              <input value={settings.tax.taxOffice || ""} onChange={e => handleUpdate("tax", "taxOffice", e.target.value)} className={inputClass} />
            </div>
            <SaveButton />
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">{de ? "Erscheinungsbild" : "Appearance"}</h3>
            {[
              { label: de ? "Primärfarbe" : "Primary Color", key: "primaryColor" },
              { label: de ? "Akzentfarbe" : "Accent Color", key: "accentColor" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm font-medium text-foreground block mb-1">{f.label}</label>
                <div className="flex gap-3">
                  <input type="color" value={settings.appearance[f.key] || "#000000"} onChange={e => handleUpdate("appearance", f.key, e.target.value)} className="w-10 h-10 rounded border border-border cursor-pointer shrink-0" />
                  <input value={settings.appearance[f.key] || ""} onChange={e => handleUpdate("appearance", f.key, e.target.value)} className={inputClass + " font-mono"} />
                </div>
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Schriftart (Display)" : "Display Font"}</label>
              <select value={settings.appearance.displayFont} onChange={e => handleUpdate("appearance", "displayFont", e.target.value)} className={inputClass}>
                {["Playfair Display", "Merriweather", "Lora", "Cormorant Garamond"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Schriftart (Body)" : "Body Font"}</label>
              <select value={settings.appearance.bodyFont} onChange={e => handleUpdate("appearance", "bodyFont", e.target.value)} className={inputClass}>
                {["DM Sans", "Inter", "Open Sans", "Nunito Sans"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={!!settings.appearance.darkMode} onChange={e => handleUpdate("appearance", "darkMode", e.target.checked)} className="w-4 h-4 accent-accent" />
              <label className="text-sm text-foreground">{de ? "Dark Mode aktivieren" : "Enable dark mode"}</label>
            </div>
            <SaveButton />
          </div>
        )}

        {activeTab === "email" && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">{de ? "E-Mail Einstellungen" : "Email Settings"}</h3>
            {[
              { label: de ? "Bestellbestätigungen senden" : "Send order confirmations", key: "orderConfirmations" },
              { label: de ? "Versandbenachrichtigungen senden" : "Send shipping notifications", key: "shippingNotifications" },
              { label: de ? "Bewertungsanfragen senden" : "Send review requests", key: "reviewRequests" },
              { label: de ? "Newsletter-Willkommens-E-Mail" : "Newsletter welcome email", key: "newsletterWelcome" },
              { label: de ? "Warenkorbabbruch-Erinnerung" : "Abandoned cart reminder", key: "abandonedCartReminder" },
            ].map(f => (
              <div key={f.key} className="flex items-center gap-3">
                <input type="checkbox" checked={!!settings.email[f.key]} onChange={e => handleUpdate("email", f.key, e.target.checked)} className="w-4 h-4 accent-accent" />
                <label className="text-sm text-foreground">{f.label}</label>
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Absender-E-Mail" : "Sender Email"}</label>
              <input value={settings.email.senderEmail || ""} onChange={e => handleUpdate("email", "senderEmail", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Verzögerung Warenkorbabbruch (Stunden)" : "Abandoned Cart Delay (hours)"}</label>
              <input value={settings.email.abandonedCartDelay || 0} onChange={e => handleUpdate("email", "abandonedCartDelay", Number(e.target.value))} type="number" className={inputClass} />
            </div>
            <SaveButton />
          </div>
        )}

        {activeTab === "roles" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">{de ? "Benutzer & Rollen" : "Users & Roles"}</h3>
                <p className="text-sm text-muted-foreground">{de ? "Verwalten Sie Ihr Team und deren Zugriffsrechte." : "Manage your team and their access rights."}</p>
              </div>
              <button 
                onClick={() => setShowAddUser(true)}
                className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-accent/90 transition-colors"
              >
                <Plus className="w-4 h-4" /> {de ? "Benutzer hinzufügen" : "Add User"}
              </button>
            </div>

            <div className="space-y-3">
              {users.map((u: any) => (
                <div key={u._id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{u.firstName} {u.lastName}</h4>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider">
                      {u.role}
                    </span>
                    <button 
                      onClick={() => deleteUser(u._id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                  <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{de ? "Keine zusätzlichen Administratoren gefunden." : "No additional administrators found."}</p>
                </div>
              )}
            </div>

            {showAddUser && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-elevated">
                  <h3 className="font-display text-xl font-bold mb-4">{de ? "Neuen Admin hinzufügen" : "Add New Admin"}</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Vorname</label>
                        <input className={inputClass} value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Nachname</label>
                        <input className={inputClass} value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">E-Mail</label>
                      <input className={inputClass} type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Passwort</label>
                      <input className={inputClass} type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button onClick={() => setShowAddUser(false)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-secondary transition-colors">
                        {de ? "Abbrechen" : "Cancel"}
                      </button>
                      <button onClick={addUser} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                        {de ? "Hinzufügen" : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">{de ? "Sicherheit" : "Security"}</h3>
            {[
              { label: de ? "SSL erzwingen" : "Force SSL", key: "forceSsl" },
              { label: de ? "Cookie-Banner anzeigen" : "Show cookie banner", key: "showCookieBanner" },
              { label: de ? "Wartungsmodus aktivieren" : "Enable maintenance mode", key: "maintenanceMode" },
              { label: de ? "Zwei-Faktor-Authentifizierung (2FA)" : "Two-Factor Authentication (2FA)", key: "twoFactorAuth" },
            ].map(f => (
              <div key={f.key} className="flex items-center gap-3">
                <input type="checkbox" checked={!!settings.security[f.key]} onChange={e => handleUpdate("security", f.key, e.target.checked)} className="w-4 h-4 accent-accent" />
                <label className="text-sm text-foreground">{f.label}</label>
              </div>
            ))}
            <SaveButton />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
