import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";
import api from "../../api";
import { toast } from "sonner";

export const ADMIN_SESSION_KEY = "weber_admin_session";
export const ADMIN_TOKEN_KEY = "weber_admin_token";

export const isAdminAuthenticated = () => {
  try {
    return !!localStorage.getItem("token");
  } catch {
    return false;
  }
};

export const adminLogout = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  delete api.defaults.headers.common["Authorization"];
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const de = lang === "de";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/user/login", { email, password });
      
      if (res.data.success) {
        if (res.data.user.role !== 'admin') {
           setError(de ? "Zugriff verweigert. Nur Administratoren." : "Access denied. Admins only.");
           setLoading(false);
           return;
        }

        const token = res.data.token;
        localStorage.setItem("token", token);
        localStorage.setItem(ADMIN_SESSION_KEY, "true");
        
        // Set authorization header for future requests
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
        toast.success(de ? "Erfolgreich angemeldet" : "Logged in successfully");
        navigate("/admin");
      } else {
        setError(de ? "Ungültige Anmeldedaten." : "Invalid credentials.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || (de ? "Fehler beim Anmelden." : "Login failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SEO title={de ? "Admin-Anmeldung" : "Admin Login"} description={de ? "Admin-Anmeldung für Stoffverkauf Weber" : "Admin login for Stoffverkauf Weber"} path="/admin/login" noIndex />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">{de ? "Admin-Anmeldung" : "Admin Login"}</h1>
          <p className="text-sm text-muted-foreground mt-1">Stoffverkauf Weber — {de ? "Verwaltung" : "Administration"}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5 shadow-card">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{de ? "E-Mail-Adresse" : "Email"}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.de"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{de ? "Passwort" : "Password"}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (de ? "Anmelden..." : "Logging in...") : (de ? "Anmelden" : "Log in")}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
