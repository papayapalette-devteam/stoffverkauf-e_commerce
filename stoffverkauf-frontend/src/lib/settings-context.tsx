import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import api from "../../api";

export type GlobalSettings = {
  general: {
    storeName: string;
    email: string;
    phone: string;
    currency: string;
    language: string;
    address: string;
    vatNumber: string;
  };
  tax: {
    standardRate: number;
    reducedRate: number;
    showIncVat: boolean;
    showVatNotice: boolean;
    taxNumber: string;
    taxOffice: string;
  };
  appearance: {
    primaryColor: string;
    accentColor: string;
    displayFont: string;
    bodyFont: string;
    darkMode: boolean;
  };
  email: {
    orderConfirmations: boolean;
    shippingNotifications: boolean;
    reviewRequests: boolean;
    newsletterWelcome: boolean;
    abandonedCartReminder: boolean;
    senderEmail: string;
    abandonedCartDelay: number;
  };
  security: {
    forceSsl: boolean;
    showCookieBanner: boolean;
    maintenanceMode: boolean;
    twoFactorAuth: boolean;
  };
};

type SettingsContextType = {
  settings: GlobalSettings;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

const defaultSettings: GlobalSettings = {
  general: {
    storeName: "Stoffverkauf Weber",
    email: "info@stoffverkauf-weber.de",
    phone: "06171/53159",
    currency: "EUR (€)",
    language: "de",
    address: "Musterstraße 1, 61440 Oberursel",
    vatNumber: "DE123456789",
  },
  tax: {
    standardRate: 19,
    reducedRate: 7,
    showIncVat: true,
    showVatNotice: true,
    taxNumber: "DE123456789",
    taxOffice: "Finanzamt Bad Homburg",
  },
  appearance: {
    primaryColor: "#3E005E",
    accentColor: "#5600B2",
    displayFont: "Playfair Display",
    bodyFont: "DM Sans",
    darkMode: false,
  },
  email: {
    orderConfirmations: true,
    shippingNotifications: true,
    reviewRequests: false,
    newsletterWelcome: true,
    abandonedCartReminder: false,
    senderEmail: "noreply@stoffverkauf-weber.de",
    abandonedCartDelay: 2,
  },
  security: {
    forceSsl: true,
    showCookieBanner: true,
    maintenanceMode: false,
    twoFactorAuth: false,
  },
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/api/settings");
      if (res.data) {
        setSettings(res.data);
        applyAppearance(res.data.appearance);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setIsLoading(false);
    }
  };

  const hexToHSL = (hex: string): string | null => {
    // Remove # if present
    hex = hex.replace("#", "");
    if (hex.length !== 6) return null;

    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const applyAppearance = (appearance: GlobalSettings["appearance"]) => {
    if (!appearance) return;
    const root = document.documentElement;
    
    if (appearance.primaryColor) {
      const hsl = hexToHSL(appearance.primaryColor);
      if (hsl) {
        root.style.setProperty("--primary", hsl);
        // Ensure foreground is visible (white for dark primary, though usually primary is dark)
        root.style.setProperty("--primary-foreground", "0 0% 100%");
      }
    }
    
    if (appearance.accentColor) {
      const hsl = hexToHSL(appearance.accentColor);
      if (hsl) {
        root.style.setProperty("--accent", hsl);
        root.style.setProperty("--accent-foreground", "0 0% 100%");
      }
    }

    if (appearance.displayFont) {
        root.style.setProperty("--font-display", `'${appearance.displayFont}', Georgia, serif`);
    }

    if (appearance.bodyFont) {
        root.style.setProperty("--font-body", `'${appearance.bodyFont}', system-ui, sans-serif`);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, refresh: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
