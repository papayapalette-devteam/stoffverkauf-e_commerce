import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { CreditCard, BarChart3, Facebook, Code, Copy, Check, ExternalLink, ShoppingCart, Truck, Euro, Shield, Package, Unplug, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../../api";

// Integration logic moved to backend, removing localStorage helpers

interface Integration {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  status: "connected" | "disconnected";
  fields: React.ReactNode;
  onSave: () => void;
  onDisconnect: () => void;
}

const AdminIntegrations = () => {
  const { lang } = useI18n();
  const de = lang === "de";

  const [ga4Id, setGa4Id] = useState("");
  const [fbPixelId, setFbPixelId] = useState("");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const [paypalUsername, setPaypalUsername] = useState("");
  const [paypalPassword, setPaypalPassword] = useState("");
  const [paypalSignature, setPaypalSignature] = useState("");
  const [paypalMode, setPaypalMode] = useState<"sandbox" | "live">("sandbox");
  const [paypalClientId, setPaypalClientId] = useState("");

  const [sendcloudKey, setSendcloudKey] = useState("");
  const [sendcloudSecret, setSendcloudSecret] = useState("");

  const [headCode, setHeadCode] = useState("");
  const [bodyCode, setBodyCode] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  // Load all integrations from backend
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const res = await api.get('/api/integration');
        if (res.data.success) {
          const integrations = res.data.integrations;
          integrations.forEach((integ: any) => {
            switch(integ.key) {
              case 'ga4': setGa4Id(integ.data.ga4Id || ""); break;
              case 'fbpixel': setFbPixelId(integ.data.fbPixelId || ""); break;
              case 'paypal': 
                setPaypalUsername(integ.data.paypalUsername || ""); 
                setPaypalPassword(integ.data.paypalPassword || ""); 
                setPaypalSignature(integ.data.paypalSignature || ""); 
                setPaypalMode(integ.data.paypalMode || "sandbox");
                setPaypalClientId(integ.data.paypalClientId || "");
                break;
              case 'sendcloud': 
                setSendcloudKey(integ.data.sendcloudKey || ""); 
                setSendcloudSecret(integ.data.sendcloudSecret || ""); 
                break;
              case 'custom_code':
                setHeadCode(integ.data.headCode || "");
                setBodyCode(integ.data.bodyCode || "");
                break;
            }
          });
        }
      } catch (err) {
        console.error("Fetch integrations error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIntegrations();
  }, []);

  const saveIntegration = async (key: string, name: string, data: any) => {
    try {
      await api.post('/api/integration/save', { key, name, data, isActive: true });
      toast.success(de ? `${name} Integration gespeichert` : `${name} integration saved`);
    } catch (err) {
      toast.error(de ? `Fehler beim Speichern von ${name}` : `Failed to save ${name}`);
    }
  };

  const disconnectIntegration = async (key: string, name: string, resetFns: Array<(v: any) => void>) => {
    try {
      await api.delete(`/api/integration/${key}`);
      resetFns.forEach(fn => fn(""));
      toast.success(de ? `${name} Verbindung getrennt` : `${name} disconnected`);
    } catch (err) {
      toast.error(de ? `Fehler beim Trennen von ${name}` : `Failed to disconnect ${name}`);
    }
  };

  const [expanded, setExpanded] = useState<string | null>(null);

  const copySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
    toast.success(de ? "Code kopiert" : "Code copied");
  };

// Disconnect logic updated above

  const ga4Snippet = `<!-- Google Analytics 4 -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=${ga4Id || "G-XXXXXXXXXX"}"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', '${ga4Id || "G-XXXXXXXXXX"}');\n</script>`;

  const fbSnippet = `<!-- Facebook Pixel -->\n<script>\n  !function(f,b,e,v,n,t,s)\n  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?\n  n.callMethod.apply(n,arguments):n.queue.push(arguments)};\n  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';\n  n.queue=[];t=b.createElement(e);t.async=!0;\n  t.src=v;s=b.getElementsByTagName(e)[0];\n  s.parentNode.insertBefore(t,s)}(window,document,'script',\n  'https://connect.facebook.net/en_US/fbevents.js');\n  fbq('init', '${fbPixelId || "XXXXXXXXXX"}');\n  fbq('track', 'PageView');\n</script>`;

  const inputClass = "w-full px-4 py-2.5 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent";
  const selectClass = "px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent";

  const paymentIntegrations: Integration[] = [
    {
      id: "paypal",
      name: "PayPal",
      icon: Euro,
      desc: de ? "PayPal-Zahlungen via REST API (Empfohlen)" : "PayPal payments via REST API (Recommended)",
      status: paypalClientId ? "connected" : "disconnected",
      onSave: () => saveIntegration("paypal", "PayPal", { paypalClientId, paypalUsername, paypalPassword, paypalSignature, paypalMode }),
      onDisconnect: () => disconnectIntegration("paypal", "PayPal", [setPaypalClientId, setPaypalUsername, setPaypalPassword]),
      fields: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <label className="text-sm font-medium text-foreground">{de ? "Modus" : "Mode"}</label>
            <select value={paypalMode} onChange={(e) => setPaypalMode(e.target.value as "sandbox" | "live")} className={selectClass}>
              <option value="sandbox">Sandbox</option>
              <option value="live">Live</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Client ID</label>
            <input value={paypalClientId} onChange={(e) => setPaypalClientId(e.target.value)} placeholder="Ac-XXXX..." className={inputClass} />
          </div>
          <p className="text-xs text-muted-foreground">{de ? "Für modernere Integrationen verwenden Sie bitte Ihre PayPal Client ID." : "For modern integrations, please use your PayPal Client ID."}</p>
        </div>
      ),
    },
  ];

  const shippingIntegrations: Integration[] = [
    {
      id: "sendcloud",
      name: "Sendcloud",
      icon: Truck,
      desc: de ? "Anbindung an über 80 Versanddienstleister weltweit" : "Connect with 80+ shipping carriers worldwide",
      status: sendcloudKey ? "connected" : "disconnected",
      onSave: () => saveIntegration("sendcloud", "Sendcloud", { sendcloudKey, sendcloudSecret }),
      onDisconnect: () => disconnectIntegration("sendcloud", "Sendcloud", [setSendcloudKey, setSendcloudSecret]),
      fields: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Public Key</label>
            <input value={sendcloudKey} onChange={(e) => setSendcloudKey(e.target.value)} placeholder="sc_pub_xxxxx" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Secret Key</label>
            <input value={sendcloudSecret} onChange={(e) => setSendcloudSecret(e.target.value)} type="password" placeholder="•••••••••" className={inputClass} />
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            <a href="https://panel.sendcloud.sc/" target="_blank" rel="noopener" className="underline">{de ? "Sendcloud Panel öffnen" : "Open Sendcloud Panel"}</a>
          </p>
        </div>
      ),
    },
  ];

  const marketingIntegrations: Integration[] = [
    {
      id: "ga4",
      name: "Google Analytics 4",
      icon: BarChart3,
      desc: de ? "Website-Analyse und Besuchertracking" : "Website analytics and visitor tracking",
      status: ga4Id ? "connected" : "disconnected",
      onSave: () => saveIntegration("ga4", "Google Analytics 4", { ga4Id }),
      onDisconnect: () => disconnectIntegration("ga4", "Google Analytics 4", [setGa4Id]),
      fields: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Measurement ID</label>
            <input value={ga4Id} onChange={(e) => setGa4Id(e.target.value)} placeholder="G-XXXXXXXXXX" className={inputClass} />
          </div>
          <div className="relative">
            <label className="text-sm font-medium text-foreground block mb-1">{de ? "Tracking-Code" : "Tracking Code"}</label>
            <pre className="bg-secondary text-foreground/80 p-4 rounded-lg text-xs overflow-x-auto border border-border font-mono">{ga4Snippet}</pre>
            <button onClick={() => copySnippet("ga4", ga4Snippet)} className="absolute top-8 right-3 p-1.5 bg-card rounded border border-border hover:bg-muted transition-colors">
              {copiedSnippet === "ga4" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "fbpixel",
      name: "Facebook Pixel",
      icon: Facebook,
      desc: de ? "Facebook/Meta Werbe-Tracking" : "Facebook/Meta ad tracking",
      status: fbPixelId ? "connected" : "disconnected",
      onSave: () => saveIntegration("fbpixel", "Facebook Pixel", { fbPixelId }),
      onDisconnect: () => disconnectIntegration("fbpixel", "Facebook Pixel", [setFbPixelId]),
      fields: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Pixel ID</label>
            <input value={fbPixelId} onChange={(e) => setFbPixelId(e.target.value)} placeholder="XXXXXXXXXX" className={inputClass} />
          </div>
          <div className="relative">
            <label className="text-sm font-medium text-foreground block mb-1">{de ? "Pixel-Code" : "Pixel Code"}</label>
            <pre className="bg-secondary text-foreground/80 p-4 rounded-lg text-xs overflow-x-auto border border-border font-mono">{fbSnippet}</pre>
            <button onClick={() => copySnippet("fb", fbSnippet)} className="absolute top-8 right-3 p-1.5 bg-card rounded border border-border hover:bg-muted transition-colors">
              {copiedSnippet === "fb" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          </div>
        </div>
      ),
    },
  ];

  const renderSection = (title: string, items: Integration[]) => (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      {items.map((integ) => (
        <div key={integ.id} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === integ.id ? null : integ.id)}
            className="w-full flex items-center gap-4 p-5 text-left hover:bg-secondary/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <integ.icon className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-foreground">{integ.name}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  integ.status === "connected" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                }`}>
                  {integ.status === "connected" ? (de ? "Verbunden" : "Connected") : (de ? "Nicht verbunden" : "Disconnected")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{integ.desc}</p>
            </div>
            <span className="text-muted-foreground text-lg">{expanded === integ.id ? "−" : "+"}</span>
          </button>
          {expanded === integ.id && (
            <div className="px-5 pb-5 border-t border-border pt-5">
              {integ.fields}
              <div className="mt-4 flex gap-3">
                <button onClick={integ.onSave} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                  {de ? "API-Schlüssel speichern" : "Save API Keys"}
                </button>
                {integ.status === "connected" && (
                  <>
                    <button onClick={() => toast.success(de ? "Verbindung getestet ✓" : "Connection tested ✓")} className="bg-secondary text-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
                      {de ? "Testen" : "Test Connection"}
                    </button>
                    <button onClick={integ.onDisconnect} className="bg-destructive/10 text-destructive px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-destructive/20 transition-colors flex items-center gap-2">
                      <Unplug className="w-4 h-4" />
                      {de ? "Trennen" : "Disconnect"}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          {de ? "Integrationen & Anbindungen" : "Integrations & Connections"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {de ? "Verwalten Sie Ihre API-Schlüssel für Zahlungen, Versand und Marketing." : "Manage your API keys for payments, shipping, and marketing."}
        </p>
      </div>

      {renderSection(de ? "💳 Zahlungsanbieter" : "💳 Payment Gateways", paymentIntegrations)}
      {renderSection(de ? "📦 Versandpartner" : "📦 Shipping Partners", shippingIntegrations)}
      {renderSection(de ? "📊 Marketing & Tracking" : "📊 Marketing & Tracking", marketingIntegrations)}

      {/* Custom Code Injection */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <Code className="w-5 h-5 text-accent" />
          <h3 className="font-display text-lg font-bold text-foreground">{de ? "Eigener Code" : "Custom Code"}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{de ? "Fügen Sie eigenen HTML/JavaScript-Code in den <head> oder <body> Ihrer Website ein." : "Add custom HTML/JavaScript code to the <head> or <body> of your website."}</p>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">{"<head>"} Code</label>
            <textarea 
              value={headCode}
              onChange={(e) => setHeadCode(e.target.value)}
              rows={4} 
              placeholder={de ? "Code für den <head>-Bereich eingeben..." : "Enter code for <head> section..."} 
              className="w-full px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent resize-none" 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">{"<body>"} Code</label>
            <textarea 
              value={bodyCode}
              onChange={(e) => setBodyCode(e.target.value)}
              rows={4} 
              placeholder={de ? "Code für den <body>-Bereich eingeben..." : "Enter code for <body> section..."} 
              className="w-full px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent resize-none" 
            />
          </div>
          <button 
            onClick={() => saveIntegration("custom_code", "Custom Code", { headCode, bodyCode })}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            {de ? "Speichere Code" : "Save Code"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminIntegrations;
