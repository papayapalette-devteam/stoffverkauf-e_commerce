import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Store, Globe, Palette, Mail, Truck, Shield, Bell, Users, Receipt, CreditCard, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface UserRole {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  active: boolean;
}

const mockUsers: UserRole[] = [
  { id: "1", name: "Admin Weber", email: "info@stoffverkauf-weber.de", role: "admin", active: true },
  { id: "2", name: "Max Mustermann", email: "max@stoffverkauf-weber.de", role: "editor", active: true },
  { id: "3", name: "Erika Muster", email: "erika@stoffverkauf-weber.de", role: "viewer", active: false },
];

const AdminSettings = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const [activeTab, setActiveTab] = useState<"general" | "shipping" | "appearance" | "email" | "security" | "tax" | "roles">("general");
  const [users, setUsers] = useState(mockUsers);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "viewer" as UserRole["role"] });

  const tabs = [
    { id: "general" as const, label: de ? "Allgemein" : "General", icon: Store },
    { id: "shipping" as const, label: de ? "Versand" : "Shipping", icon: Truck },
    { id: "tax" as const, label: de ? "Steuer" : "Tax", icon: Receipt },
    { id: "appearance" as const, label: de ? "Erscheinungsbild" : "Appearance", icon: Palette },
    { id: "email" as const, label: "E-Mail", icon: Mail },
    { id: "roles" as const, label: de ? "Benutzer & Rollen" : "Users & Roles", icon: Users },
    { id: "security" as const, label: de ? "Sicherheit" : "Security", icon: Shield },
  ];

  const save = () => toast.success(de ? "Einstellungen gespeichert" : "Settings saved");

  const inputClass = "w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent";

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) { toast.error(de ? "Name und E-Mail erforderlich" : "Name and email required"); return; }
    setUsers([...users, { id: Date.now().toString(), ...newUser, active: true }]);
    toast.success(de ? `${newUser.name} hinzugefügt` : `${newUser.name} added`);
    setShowAddUser(false);
    setNewUser({ name: "", email: "", role: "viewer" });
  };

  const toggleUser = (id: string) => setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
  const removeUser = (id: string, name: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast.success(de ? `${name} entfernt` : `${name} removed`);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">
        {de ? "Einstellungen" : "Settings"}
      </h2>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className={`bg-card rounded-xl border border-border p-6 shadow-card ${activeTab !== "roles" ? "max-w-2xl" : ""}`}>
        {activeTab === "general" && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">{de ? "Shop-Informationen" : "Store Information"}</h3>
            {[
              { label: de ? "Shop-Name" : "Store Name", defaultValue: "Stoffverkauf Weber" },
              { label: "E-Mail", defaultValue: "info@stoffverkauf-weber.de" },
              { label: de ? "Telefon" : "Phone", defaultValue: "06171/53159" },
            ].map(f => (
              <div key={f.label}>
                <label className="text-sm font-medium text-foreground block mb-1">{f.label}</label>
                <input defaultValue={f.defaultValue} className={inputClass} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{de ? "Währung" : "Currency"}</label>
                <select className={inputClass}><option>EUR (€)</option><option>USD ($)</option><option>CHF (CHF)</option></select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{de ? "Sprache" : "Language"}</label>
                <select defaultValue={lang} className={inputClass}><option value="de">Deutsch</option><option value="en">English</option></select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Adresse" : "Address"}</label>
              <textarea defaultValue="Musterstraße 1, 61440 Oberursel" rows={2} className={inputClass + " resize-none"} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "MwSt.-Nr." : "VAT Number"}</label>
              <input defaultValue="DE123456789" className={inputClass} />
            </div>
            <button onClick={save} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">{de ? "Speichern" : "Save"}</button>
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">{de ? "Versandeinstellungen" : "Shipping Settings"}</h3>
            {[
              { label: de ? "Kostenloser Versand ab (€)" : "Free shipping threshold (€)", defaultValue: "100", type: "number" },
              { label: de ? "Standard-Versandkosten (€)" : "Standard shipping cost (€)", defaultValue: "5.90", type: "number", step: "0.01" },
              { label: de ? "Lieferzeit (Werktage)" : "Delivery time (business days)", defaultValue: "1-2", type: "text" },
            ].map(f => (
              <div key={f.label}>
                <label className="text-sm font-medium text-foreground block mb-1">{f.label}</label>
                <input defaultValue={f.defaultValue} type={f.type} step={f.step} className={inputClass} />
              </div>
            ))}
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-accent" />
              <label className="text-sm text-foreground">{de ? "Internationaler Versand aktiviert" : "International shipping enabled"}</label>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Internationaler Versand (€)" : "International shipping (€)"}</label>
              <input defaultValue="14.90" type="number" step="0.01" className={inputClass} />
            </div>

            <h4 className="font-semibold text-foreground pt-2">{de ? "Versandmethoden" : "Shipping Methods"}</h4>
            {[
              { name: "DHL Standard", time: de ? "1-2 Werktage" : "1-2 business days", price: "5.90 €", active: true },
              { name: "DHL Express", time: de ? "Nächster Werktag" : "Next business day", price: "12.90 €", active: true },
              { name: de ? "Abholung vor Ort" : "Local Pickup", time: "—", price: "0.00 €", active: false },
            ].map(m => (
              <div key={m.name} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-semibold text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.time} · {m.price}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={m.active} className="sr-only peer" />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-accent transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
            <button onClick={save} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">{de ? "Speichern" : "Save"}</button>
          </div>
        )}

        {activeTab === "tax" && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">{de ? "Steuereinstellungen" : "Tax Settings"}</h3>
            <div className="bg-secondary/50 rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground">{de ? "Alle Preise inkl. MwSt. gemäß deutschem Steuerrecht." : "All prices include VAT according to German tax law."}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Standard-MwSt.-Satz (%)" : "Standard VAT Rate (%)"}</label>
              <input defaultValue="19" type="number" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Ermäßigter MwSt.-Satz (%)" : "Reduced VAT Rate (%)"}</label>
              <input defaultValue="7" type="number" className={inputClass} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-accent" />
              <label className="text-sm text-foreground">{de ? "Preise inkl. MwSt. anzeigen" : "Show prices including VAT"}</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-accent" />
              <label className="text-sm text-foreground">{de ? 'MwSt.-Hinweis "inkl. MwSt." anzeigen' : 'Show VAT notice "incl. VAT"'}</label>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Steuernummer" : "Tax Number"}</label>
              <input defaultValue="DE123456789" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Finanzamt" : "Tax Office"}</label>
              <input defaultValue="Finanzamt Bad Homburg" className={inputClass} />
            </div>
            <button onClick={save} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">{de ? "Speichern" : "Save"}</button>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">{de ? "Erscheinungsbild" : "Appearance"}</h3>
            {[
              { label: de ? "Primärfarbe" : "Primary Color", defaultValue: "#3E005E" },
              { label: de ? "Akzentfarbe" : "Accent Color", defaultValue: "#5600B2" },
            ].map(f => (
              <div key={f.label}>
                <label className="text-sm font-medium text-foreground block mb-1">{f.label}</label>
                <div className="flex gap-3">
                  <input type="color" defaultValue={f.defaultValue} className="w-10 h-10 rounded border border-border cursor-pointer" />
                  <input defaultValue={f.defaultValue} className={inputClass + " font-mono"} />
                </div>
              </div>
            ))}
            {[
              { label: de ? "Schriftart (Display)" : "Display Font", options: ["Playfair Display", "Merriweather", "Lora", "Cormorant Garamond"] },
              { label: de ? "Schriftart (Body)" : "Body Font", options: ["DM Sans", "Inter", "Open Sans", "Nunito Sans"] },
            ].map(f => (
              <div key={f.label}>
                <label className="text-sm font-medium text-foreground block mb-1">{f.label}</label>
                <select className={inputClass}>{f.options.map(o => <option key={o}>{o}</option>)}</select>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 accent-accent" />
              <label className="text-sm text-foreground">{de ? "Dark Mode aktivieren" : "Enable dark mode"}</label>
            </div>
            <button onClick={save} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">{de ? "Speichern" : "Save"}</button>
          </div>
        )}

        {activeTab === "email" && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">{de ? "E-Mail Einstellungen" : "Email Settings"}</h3>
            {[
              { label: de ? "Bestellbestätigungen senden" : "Send order confirmations", checked: true },
              { label: de ? "Versandbenachrichtigungen senden" : "Send shipping notifications", checked: true },
              { label: de ? "Bewertungsanfragen senden" : "Send review requests", checked: false },
              { label: de ? "Newsletter-Willkommens-E-Mail" : "Newsletter welcome email", checked: true },
              { label: de ? "Warenkorbabbruch-Erinnerung" : "Abandoned cart reminder", checked: false },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3">
                <input type="checkbox" defaultChecked={f.checked} className="w-4 h-4 accent-accent" />
                <label className="text-sm text-foreground">{f.label}</label>
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Absender-E-Mail" : "Sender Email"}</label>
              <input defaultValue="noreply@stoffverkauf-weber.de" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Verzögerung Warenkorbabbruch (Stunden)" : "Abandoned Cart Delay (hours)"}</label>
              <input defaultValue="2" type="number" className={inputClass} />
            </div>
            <button onClick={save} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">{de ? "Speichern" : "Save"}</button>
          </div>
        )}

        {activeTab === "roles" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-lg font-bold text-foreground">{de ? "Benutzer & Rollen" : "Users & Roles"}</h3>
              <button onClick={() => setShowAddUser(!showAddUser)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> {de ? "Benutzer hinzufügen" : "Add User"}
              </button>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 border border-border space-y-2">
              <p className="text-xs font-semibold text-foreground">{de ? "Rollenbeschreibungen:" : "Role Descriptions:"}</p>
              {[
                { role: "admin", desc: de ? "Vollzugriff auf alle Bereiche" : "Full access to all areas" },
                { role: "editor", desc: de ? "Produkte & Inhalte bearbeiten, Bestellungen ansehen" : "Edit products & content, view orders" },
                { role: "viewer", desc: de ? "Nur Lesezugriff" : "Read-only access" },
              ].map(r => (
                <div key={r.role} className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${r.role === "admin" ? "bg-primary/10 text-primary" : r.role === "editor" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{r.role}</span>
                  <span className="text-muted-foreground">{r.desc}</span>
                </div>
              ))}
            </div>

            {showAddUser && (
              <div className="bg-card rounded-xl border border-border p-4">
                <h4 className="font-semibold text-foreground mb-3 text-sm">{de ? "Neuer Benutzer" : "New User"}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">{de ? "Name" : "Name"}</label>
                    <input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Email</label>
                    <input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} type="email" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">{de ? "Rolle" : "Role"}</label>
                    <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole["role"] })} className={inputClass}>
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-3">
                  <button onClick={handleAddUser} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90">{de ? "Hinzufügen" : "Add"}</button>
                  <button onClick={() => setShowAddUser(false)} className="bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-semibold">{de ? "Abbrechen" : "Cancel"}</button>
                </div>
              </div>
            )}

            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Name" : "Name"}</th>
                    <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">Email</th>
                    <th className="text-center p-4 text-muted-foreground font-medium">{de ? "Rolle" : "Role"}</th>
                    <th className="text-center p-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Aktionen" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">{u.name}</td>
                      <td className="p-4 text-muted-foreground hidden md:table-cell">{u.email}</td>
                      <td className="p-4 text-center">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.role === "admin" ? "bg-primary/10 text-primary" : u.role === "editor" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={u.active} onChange={() => toggleUser(u.id)} disabled={u.role === "admin"} className="sr-only peer" />
                          <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-accent transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full disabled:opacity-50" />
                        </label>
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== "admin" && (
                          <button onClick={() => removeUser(u.id, u.name)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">{de ? "Sicherheit" : "Security"}</h3>
            {[
              { label: de ? "SSL erzwingen" : "Force SSL", checked: true },
              { label: de ? "Cookie-Banner anzeigen" : "Show cookie banner", checked: true },
              { label: de ? "Wartungsmodus aktivieren" : "Enable maintenance mode", checked: false },
              { label: de ? "Zwei-Faktor-Authentifizierung (2FA)" : "Two-Factor Authentication (2FA)", checked: false },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3">
                <input type="checkbox" defaultChecked={f.checked} className="w-4 h-4 accent-accent" />
                <label className="text-sm text-foreground">{f.label}</label>
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Admin-Passwort ändern" : "Change admin password"}</label>
              <input type="password" placeholder="••••••••" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Passwort bestätigen" : "Confirm password"}</label>
              <input type="password" placeholder="••••••••" className={inputClass} />
            </div>
            <button onClick={save} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">{de ? "Speichern" : "Save"}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
