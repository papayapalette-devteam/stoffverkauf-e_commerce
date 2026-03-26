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
  const [shopifyDomain, setShopifyDomain] = useState("");
  const [shopifyToken, setShopifyToken] = useState("");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const [stripeKey, setStripeKey] = useState("");
  const [stripeSecret, setStripeSecret] = useState("");
  const [stripeMode, setStripeMode] = useState<"test" | "live">("test");
  const [paypalUsername, setPaypalUsername] = useState("");
  const [paypalPassword, setPaypalPassword] = useState("");
  const [paypalSignature, setPaypalSignature] = useState("");
  const [paypalMode, setPaypalMode] = useState<"sandbox" | "live">("sandbox");
  const [klarnaUser, setKlarnaUser] = useState("");
  const [klarnaPass, setKlarnaPass] = useState("");
  const [klarnaMode, setKlarnaMode] = useState<"playground" | "production">("playground");

  const [dhlApiKey, setDhlApiKey] = useState("");
  const [dhlSecret, setDhlSecret] = useState("");
  const [dhlAccountNumber, setDhlAccountNumber] = useState("");
  const [dpdToken, setDpdToken] = useState("");
  const [dpdDepotNumber, setDpdDepotNumber] = useState("");
  const [hermesApiKey, setHermesApiKey] = useState("");
  const [hermesPartnerId, setHermesPartnerId] = useState("");

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
              case 'ga4': setGa4Id(integ.data.ga4Id); break;
              case 'fbpixel': setFbPixelId(integ.data.fbPixelId); break;
              case 'shopify': setShopifyDomain(integ.data.shopifyDomain); setShopifyToken(integ.data.shopifyToken); break;
              case 'stripe': setStripeKey(integ.data.stripeKey); setStripeSecret(integ.data.stripeSecret); setStripeMode(integ.data.stripeMode); break;
              case 'paypal': setPaypalUsername(integ.data.paypalUsername); setPaypalPassword(integ.data.paypalPassword); setPaypalSignature(integ.data.paypalSignature); setPaypalMode(integ.data.paypalMode); break;
              case 'klarna': setKlarnaUser(integ.data.klarnaUser); setKlarnaPass(integ.data.klarnaPass); setKlarnaMode(integ.data.klarnaMode); break;
              case 'dhl': setDhlApiKey(integ.data.dhlApiKey); setDhlSecret(integ.data.dhlSecret); setDhlAccountNumber(integ.data.dhlAccountNumber); break;
              case 'dpd': setDpdToken(integ.data.dpdToken); setDpdDepotNumber(integ.data.dpdDepotNumber); break;
              case 'hermes': setHermesApiKey(integ.data.hermesApiKey); setHermesPartnerId(integ.data.hermesPartnerId); break;
            }
          });
        }
      } catch (err) {
        console.error("Fetch integrations error:", err);
        toast.error("Failed to load integrations");
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
      id: "stripe",
      name: "Stripe",
      icon: CreditCard,
      desc: de ? "Kreditkarten, SEPA-Lastschrift, Apple Pay, Google Pay" : "Credit cards, SEPA direct debit, Apple Pay, Google Pay",
      status: stripeKey ? "connected" : "disconnected",
      onSave: () => saveIntegration("stripe", "Stripe", { stripeKey, stripeSecret, stripeMode }),
      onDisconnect: () => disconnectIntegration("stripe", "Stripe", [setStripeKey, setStripeSecret]),
      fields: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <label className="text-sm font-medium text-foreground">{de ? "Modus" : "Mode"}</label>
            <select value={stripeMode} onChange={(e) => setStripeMode(e.target.value as "test" | "live")} className={selectClass}>
              <option value="test">{de ? "Testmodus" : "Test Mode"}</option>
              <option value="live">{de ? "Live-Modus" : "Live Mode"}</option>
            </select>
            {stripeMode === "test" && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">{de ? "Testmodus aktiv" : "Test mode active"}</span>}
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Publishable Key</label>
            <input value={stripeKey} onChange={(e) => setStripeKey(e.target.value)} placeholder="pk_test_xxxxx" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Secret Key</label>
            <input value={stripeSecret} onChange={(e) => setStripeSecret(e.target.value)} type="password" placeholder="sk_test_xxxxx" className={inputClass} />
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 border border-border">
            <p className="text-xs text-muted-foreground">{de ? "Unterstützte Zahlungsmethoden: Kreditkarten (Visa, Mastercard, Amex), SEPA-Lastschrift, Giropay, Apple Pay, Google Pay, Klarna via Stripe." : "Supported: Credit cards (Visa, Mastercard, Amex), SEPA, Giropay, Apple Pay, Google Pay, Klarna via Stripe."}</p>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener" className="underline">{de ? "Stripe Dashboard öffnen" : "Open Stripe Dashboard"}</a>
          </p>
        </div>
      ),
    },
    {
      id: "paypal",
      name: "PayPal (Classic API)",
      icon: Euro,
      desc: de ? "PayPal-Zahlungen via Classic API (NVP/SOAP)" : "PayPal payments via Classic API (NVP/SOAP)",
      status: paypalUsername ? "connected" : "disconnected",
      onSave: () => saveIntegration("paypal", "PayPal", { paypalUsername, paypalPassword, paypalSignature, paypalMode }),
      onDisconnect: () => disconnectIntegration("paypal", "PayPal", [setPaypalUsername, setPaypalPassword, setPaypalSignature]),
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
            <label className="text-sm font-medium text-foreground block mb-1">API Username</label>
            <input value={paypalUsername} onChange={(e) => setPaypalUsername(e.target.value)} placeholder="name_api1.example.com" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">API Password</label>
            <input value={paypalPassword} onChange={(e) => setPaypalPassword(e.target.value)} type="password" placeholder="M6BG6FZR9CMHREV4" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Signature</label>
            <input value={paypalSignature} onChange={(e) => setPaypalSignature(e.target.value)} type="password" placeholder="AiPC9Bjk..." className={inputClass} />
          </div>
        </div>
      ),
    },
    {
      id: "klarna",
      name: "Klarna",
      icon: Shield,
      desc: de ? "Sofortüberweisung, Rechnung, Ratenkauf" : "Instant transfer, invoice, installments",
      status: klarnaUser ? "connected" : "disconnected",
      onSave: () => saveIntegration("klarna", "Klarna", { klarnaUser, klarnaPass, klarnaMode }),
      onDisconnect: () => disconnectIntegration("klarna", "Klarna", [setKlarnaUser, setKlarnaPass]),
      fields: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <label className="text-sm font-medium text-foreground">{de ? "Umgebung" : "Environment"}</label>
            <select value={klarnaMode} onChange={(e) => setKlarnaMode(e.target.value as "playground" | "production")} className={selectClass}>
              <option value="playground">Playground</option>
              <option value="production">Production</option>
            </select>
            {klarnaMode === "playground" && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">Playground</span>}
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">API Username (UID)</label>
            <input value={klarnaUser} onChange={(e) => setKlarnaUser(e.target.value)} placeholder="K123456_abcdefg" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">API Password</label>
            <input value={klarnaPass} onChange={(e) => setKlarnaPass(e.target.value)} type="password" placeholder="•••••••••" className={inputClass} />
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            <a href="https://portal.klarna.com/" target="_blank" rel="noopener" className="underline">{de ? "Klarna Merchant Portal öffnen" : "Open Klarna Merchant Portal"}</a>
          </p>
        </div>
      ),
    },
  ];

  const shippingIntegrations: Integration[] = [
    {
      id: "dhl",
      name: "DHL",
      icon: Truck,
      desc: de ? "Versandetiketten & Sendungsverfolgung" : "Shipping labels & tracking",
      status: dhlApiKey ? "connected" : "disconnected",
      onSave: () => saveIntegration("dhl", "DHL", { dhlApiKey, dhlSecret, dhlAccountNumber }),
      onDisconnect: () => disconnectIntegration("dhl", "DHL", [setDhlApiKey, setDhlSecret, setDhlAccountNumber]),
      fields: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">API Key (App ID)</label>
            <input value={dhlApiKey} onChange={(e) => setDhlApiKey(e.target.value)} placeholder="dhl_api_xxxxx" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">API Secret</label>
            <input value={dhlSecret} onChange={(e) => setDhlSecret(e.target.value)} type="password" placeholder="•••••••••" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">{de ? "Geschäftskundennummer (EKP)" : "Business Customer Number (EKP)"}</label>
            <input value={dhlAccountNumber} onChange={(e) => setDhlAccountNumber(e.target.value)} placeholder="1234567890" className={inputClass} />
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            <a href="https://entwickler.dhl.de/" target="_blank" rel="noopener" className="underline">{de ? "DHL Entwicklerportal öffnen" : "Open DHL Developer Portal"}</a>
          </p>
        </div>
      ),
    },
    {
      id: "dpd",
      name: "DPD",
      icon: Package,
      desc: de ? "Paketversand mit Predict-Service" : "Parcel shipping with Predict service",
      status: dpdToken ? "connected" : "disconnected",
      onSave: () => saveIntegration("dpd", "DPD", { dpdToken, dpdDepotNumber }),
      onDisconnect: () => disconnectIntegration("dpd", "DPD", [setDpdToken]),
      fields: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">API Token</label>
            <input value={dpdToken} onChange={(e) => setDpdToken(e.target.value)} type="password" placeholder="dpd_token_xxxxx" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">{de ? "Depotnummer" : "Depot Number"}</label>
            <input value={dpdDepotNumber} onChange={(e) => setDpdDepotNumber(e.target.value)} placeholder="0198" className={inputClass} />
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            <a href="https://esolutions.dpd.com/" target="_blank" rel="noopener" className="underline">{de ? "DPD eSolutions öffnen" : "Open DPD eSolutions"}</a>
          </p>
        </div>
      ),
    },
    {
      id: "hermes",
      name: "Hermes",
      icon: Truck,
      desc: de ? "Hermes Versand mit Paketshop-Netzwerk" : "Hermes shipping with parcel shop network",
      status: hermesApiKey ? "connected" : "disconnected",
      onSave: () => saveIntegration("hermes", "Hermes", { hermesApiKey, hermesPartnerId }),
      onDisconnect: () => disconnectIntegration("hermes", "Hermes", [setHermesApiKey]),
      fields: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">API Key</label>
            <input value={hermesApiKey} onChange={(e) => setHermesApiKey(e.target.value)} type="password" placeholder="hermes_api_xxxxx" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Partner ID</label>
            <input value={hermesPartnerId} onChange={(e) => setHermesPartnerId(e.target.value)} placeholder="HER-xxxxx" className={inputClass} />
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            <a href="https://www.myhermes.de/business/" target="_blank" rel="noopener" className="underline">{de ? "Hermes Business öffnen" : "Open Hermes Business"}</a>
          </p>
        </div>
      ),
    },
  ];

  const marketingIntegrations: Integration[] = [
    {
      id: "shopify",
      name: "Shopify",
      icon: ShoppingCart,
      desc: de ? "E-Commerce & Zahlungsabwicklung über Shopify" : "E-commerce & payment processing via Shopify",
      status: shopifyDomain ? "connected" : "disconnected",
      onSave: () => saveIntegration("shopify", "Shopify", { shopifyDomain, shopifyToken }),
      onDisconnect: () => disconnectIntegration("shopify", "Shopify", [setShopifyDomain, setShopifyToken]),
      fields: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">{de ? "Shopify-Domain" : "Shopify Domain"}</label>
            <input value={shopifyDomain} onChange={(e) => setShopifyDomain(e.target.value)} placeholder="your-store.myshopify.com" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Storefront Access Token</label>
            <input value={shopifyToken} onChange={(e) => setShopifyToken(e.target.value)} type="password" placeholder="shpat_xxxxx" className={inputClass} />
          </div>
          <p className="text-xs text-muted-foreground">{de ? "Erstellen Sie einen Storefront Access Token in Ihrem Shopify Admin unter Apps > Entwicklung." : "Create a Storefront Access Token in your Shopify Admin under Apps > Development."}</p>
        </div>
      ),
    },
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
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            <a href="https://analytics.google.com" target="_blank" rel="noopener" className="underline">{de ? "Google Analytics öffnen" : "Open Google Analytics"}</a>
          </p>
        </div>
      ),
    },
    {
      id: "fbpixel",
      name: "Facebook Pixel",
      icon: Facebook,
      desc: de ? "Facebook/Meta Werbe-Tracking und Conversion-Optimierung" : "Facebook/Meta ad tracking and conversion optimization",
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
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener" className="underline">{de ? "Facebook Events Manager öffnen" : "Open Facebook Events Manager"}</a>
          </p>
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
            <textarea rows={4} placeholder={de ? "Code für den <head>-Bereich eingeben..." : "Enter code for <head> section..."} className="w-full px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">{"<body>"} Code</label>
            <textarea rows={4} placeholder={de ? "Code für den <body>-Bereich eingeben..." : "Enter code for <body> section..."} className="w-full px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
          </div>
          <button onClick={() => toast.success(de ? "Code gespeichert" : "Code saved")} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
            {de ? "Speichern" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminIntegrations;
