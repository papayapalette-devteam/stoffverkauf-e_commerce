import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CreditCard, BarChart3, Facebook, Code, Copy, Check, ExternalLink, ShoppingCart, Truck, Euro, Shield, Package, Unplug } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "admin_integrations";

const loadSaved = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveFields = (keys: Record<string, string>) => {
  const data = loadSaved();
  Object.entries(keys).forEach(([k, v]) => {
    if (v) data[k] = v;
    else delete data[k];
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const clearFieldKeys = (...keys: string[]) => {
  const data = loadSaved();
  keys.forEach((k) => delete data[k]);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

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

  const saved = loadSaved();

  const [ga4Id, setGa4Id] = useState(saved.ga4Id || "");
  const [fbPixelId, setFbPixelId] = useState(saved.fbPixelId || "");
  const [shopifyDomain, setShopifyDomain] = useState(saved.shopifyDomain || "");
  const [shopifyToken, setShopifyToken] = useState(saved.shopifyToken || "");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const [stripeKey, setStripeKey] = useState(saved.stripeKey || "");
  const [stripeSecret, setStripeSecret] = useState(saved.stripeSecret || "");
  const [stripeMode, setStripeMode] = useState<"test" | "live">((saved.stripeMode as "test" | "live") || "test");
  const [paypalClientId, setPaypalClientId] = useState(saved.paypalClientId || "");
  const [paypalSecret, setPaypalSecret] = useState(saved.paypalSecret || "");
  const [paypalMode, setPaypalMode] = useState<"sandbox" | "live">((saved.paypalMode as "sandbox" | "live") || "sandbox");
  const [klarnaUser, setKlarnaUser] = useState(saved.klarnaUser || "");
  const [klarnaPass, setKlarnaPass] = useState(saved.klarnaPass || "");
  const [klarnaMode, setKlarnaMode] = useState<"playground" | "production">((saved.klarnaMode as "playground" | "production") || "playground");

  const [dhlApiKey, setDhlApiKey] = useState(saved.dhlApiKey || "");
  const [dhlSecret, setDhlSecret] = useState(saved.dhlSecret || "");
  const [dhlAccountNumber, setDhlAccountNumber] = useState(saved.dhlAccountNumber || "");
  const [dpdToken, setDpdToken] = useState(saved.dpdToken || "");
  const [dpdDepotNumber, setDpdDepotNumber] = useState(saved.dpdDepotNumber || "");
  const [hermesApiKey, setHermesApiKey] = useState(saved.hermesApiKey || "");
  const [hermesPartnerId, setHermesPartnerId] = useState(saved.hermesPartnerId || "");

  const [expanded, setExpanded] = useState<string | null>(null);

  const copySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
    toast.success(de ? "Code kopiert" : "Code copied");
  };

  const disconnect = (keys: string[], resetFns: Array<(v: string) => void>) => {
    clearFieldKeys(...keys);
    resetFns.forEach((fn) => fn(""));
    toast.success(de ? "Verbindung getrennt & API-Schlüssel entfernt" : "Disconnected & API keys removed");
  };

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
      onSave: () => { saveFields({ stripeKey, stripeSecret, stripeMode }); toast.success(de ? "Stripe API-Schlüssel gespeichert" : "Stripe API keys saved"); },
      onDisconnect: () => disconnect(["stripeKey", "stripeSecret", "stripeMode"], [setStripeKey, setStripeSecret]),
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
      name: "PayPal",
      icon: Euro,
      desc: de ? "PayPal-Zahlungen, Ratenzahlung, PayPal Express Checkout" : "PayPal payments, installments, Express Checkout",
      status: paypalClientId ? "connected" : "disconnected",
      onSave: () => { saveFields({ paypalClientId, paypalSecret, paypalMode }); toast.success(de ? "PayPal API-Schlüssel gespeichert" : "PayPal API keys saved"); },
      onDisconnect: () => disconnect(["paypalClientId", "paypalSecret", "paypalMode"], [setPaypalClientId, setPaypalSecret]),
      fields: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <label className="text-sm font-medium text-foreground">{de ? "Modus" : "Mode"}</label>
            <select value={paypalMode} onChange={(e) => setPaypalMode(e.target.value as "sandbox" | "live")} className={selectClass}>
              <option value="sandbox">Sandbox</option>
              <option value="live">Live</option>
            </select>
            {paypalMode === "sandbox" && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">Sandbox</span>}
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Client ID</label>
            <input value={paypalClientId} onChange={(e) => setPaypalClientId(e.target.value)} placeholder="AxxxxxxxxxxxB" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Client Secret</label>
            <input value={paypalSecret} onChange={(e) => setPaypalSecret(e.target.value)} type="password" placeholder="ExxxxxxxxxxxD" className={inputClass} />
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            <a href="https://developer.paypal.com/dashboard/" target="_blank" rel="noopener" className="underline">{de ? "PayPal Developer Dashboard öffnen" : "Open PayPal Developer Dashboard"}</a>
          </p>
        </div>
      ),
    },
    {
      id: "klarna",
      name: "Klarna",
      icon: Shield,
      desc: de ? "Sofortüberweisung, Rechnung, Ratenkauf" : "Instant transfer, invoice, installments",
      status: klarnaUser ? "connected" : "disconnected",
      onSave: () => { saveFields({ klarnaUser, klarnaPass, klarnaMode }); toast.success(de ? "Klarna API-Schlüssel gespeichert" : "Klarna API keys saved"); },
      onDisconnect: () => disconnect(["klarnaUser", "klarnaPass", "klarnaMode"], [setKlarnaUser, setKlarnaPass]),
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
      onSave: () => { saveFields({ dhlApiKey, dhlSecret, dhlAccountNumber }); toast.success(de ? "DHL API-Schlüssel gespeichert" : "DHL API keys saved"); },
      onDisconnect: () => disconnect(["dhlApiKey", "dhlSecret", "dhlAccountNumber"], [setDhlApiKey, setDhlSecret, setDhlAccountNumber]),
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
      onSave: () => { saveFields({ dpdToken, dpdDepotNumber }); toast.success(de ? "DPD API-Schlüssel gespeichert" : "DPD API keys saved"); },
      onDisconnect: () => disconnect(["dpdToken", "dpdDepotNumber"], [setDpdToken, setDpdDepotNumber]),
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
      onSave: () => { saveFields({ hermesApiKey, hermesPartnerId }); toast.success(de ? "Hermes API-Schlüssel gespeichert" : "Hermes API keys saved"); },
      onDisconnect: () => disconnect(["hermesApiKey", "hermesPartnerId"], [setHermesApiKey, setHermesPartnerId]),
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
      onSave: () => { saveFields({ shopifyDomain, shopifyToken }); toast.success(de ? "Shopify API-Schlüssel gespeichert" : "Shopify API keys saved"); },
      onDisconnect: () => disconnect(["shopifyDomain", "shopifyToken"], [setShopifyDomain, setShopifyToken]),
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
      onSave: () => { saveFields({ ga4Id }); toast.success(de ? "GA4 Measurement ID gespeichert" : "GA4 Measurement ID saved"); },
      onDisconnect: () => disconnect(["ga4Id"], [setGa4Id]),
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
      onSave: () => { saveFields({ fbPixelId }); toast.success(de ? "Facebook Pixel ID gespeichert" : "Facebook Pixel ID saved"); },
      onDisconnect: () => disconnect(["fbPixelId"], [setFbPixelId]),
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
