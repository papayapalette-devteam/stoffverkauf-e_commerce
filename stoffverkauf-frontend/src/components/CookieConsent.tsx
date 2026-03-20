import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Settings, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

const COOKIE_KEY = "cookie_consent";

interface CookiePrefs {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsent = () => {
  const { lang } = useI18n();
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const accept = (all: boolean) => {
    const consent = all
      ? { necessary: true, analytics: true, marketing: true }
      : prefs;
    localStorage.setItem(COOKIE_KEY, JSON.stringify(consent));
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ necessary: true, analytics: false, marketing: false }));
    setVisible(false);
  };

  const de = lang === "de";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="bg-card border border-border rounded-2xl shadow-elevated p-6">
              <div className="flex items-start gap-4">
                <Cookie className="w-6 h-6 text-accent shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {de ? "Cookie-Einstellungen" : "Cookie Settings"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {de
                      ? "Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung zu bieten. Einige sind notwendig, andere helfen uns, die Website zu verbessern. Weitere Informationen finden Sie in unserer "
                      : "We use cookies to provide you with the best experience. Some are necessary, others help us improve the website. Learn more in our "}
                    <Link to="/datenschutz" className="text-accent underline">
                      {de ? "Datenschutzerklärung" : "Privacy Policy"}
                    </Link>.
                  </p>

                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-4"
                      >
                        <div className="space-y-3 border-t border-border pt-4">
                          <label className="flex items-center gap-3 cursor-not-allowed">
                            <input type="checkbox" checked disabled className="accent-accent" />
                            <div>
                              <span className="text-sm font-semibold text-foreground">
                                {de ? "Notwendige Cookies" : "Necessary Cookies"}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {de
                                  ? "Erforderlich für die Grundfunktionen der Website."
                                  : "Required for basic website functionality."}
                              </p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={prefs.analytics}
                              onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                              className="accent-accent"
                            />
                            <div>
                              <span className="text-sm font-semibold text-foreground">
                                {de ? "Analyse-Cookies" : "Analytics Cookies"}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {de
                                  ? "Helfen uns, die Nutzung der Website zu verstehen."
                                  : "Help us understand how the website is used."}
                              </p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={prefs.marketing}
                              onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
                              className="accent-accent"
                            />
                            <div>
                              <span className="text-sm font-semibold text-foreground">
                                {de ? "Marketing-Cookies" : "Marketing Cookies"}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {de
                                  ? "Werden für personalisierte Werbung verwendet."
                                  : "Used for personalized advertising."}
                              </p>
                            </div>
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => accept(true)}
                      className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {de ? "Alle akzeptieren" : "Accept All"}
                    </button>
                    <button
                      onClick={reject}
                      className="border border-border text-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      {de ? "Nur notwendige" : "Necessary Only"}
                    </button>
                    {showDetails ? (
                      <button
                        onClick={() => accept(false)}
                        className="border border-border text-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        {de ? "Auswahl speichern" : "Save Selection"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowDetails(true)}
                        className="text-muted-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:text-foreground transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        {de ? "Einstellungen" : "Settings"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
