import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import SEO from "@/components/SEO";
import { toast } from "sonner";

const Login = () => {
  const { lang } = useI18n();
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const de = lang === "de";
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isLoggedIn) {
    navigate("/profile", { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(async() => {
      const result = await login(email, password);

      setLoading(false);

      if (result.success) {
        toast.success(de ? "Erfolgreich angemeldet!" : "Successfully signed in!");
        navigate("/profile");
      } else {
        const messages: Record<string, string> = {
          invalid_email: de ? "Bitte geben Sie eine gültige E-Mail-Adresse ein." : "Please enter a valid email address.",
          invalid_credentials: de ? "E-Mail oder Passwort ist falsch." : "Invalid email or password.",
        };
        setError(messages[result.error || ""] || (de ? "Ein Fehler ist aufgetreten." : "An error occurred."));
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={de ? "Anmelden" : "Sign In"} description={de ? "Melden Sie sich bei Ihrem Stoffverkauf Weber Konto an." : "Sign in to your Stoffverkauf Weber account."} path="/login" noIndex />
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {de ? "Willkommen zurück" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {de ? "Melden Sie sich in Ihrem Konto an" : "Sign in to your account"}
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={de ? "E-Mail-Adresse" : "Email address"}
                required
                className="w-full pl-11 pr-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={de ? "Passwort" : "Password"}
                required
                minLength={6}
                className="w-full pl-11 pr-12 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="rounded border-border" />
                {de ? "Angemeldet bleiben" : "Remember me"}
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading
                ? (de ? "Wird angemeldet..." : "Signing in...")
                : (de ? "Anmelden" : "Sign In")}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">{de ? "oder" : "or"}</span>
              </div>
            </div>

            <button className="w-full border border-border bg-background text-foreground py-3 rounded-lg font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-2 mb-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {de ? "Mit Google anmelden" : "Sign in with Google"}
            </button>

            <p className="text-sm text-muted-foreground">
              {de ? "Noch kein Konto?" : "Don't have an account?"}{" "}
              <Link to="/signup" className="text-accent font-semibold hover:underline">
                {de ? "Registrieren" : "Sign Up"}
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
