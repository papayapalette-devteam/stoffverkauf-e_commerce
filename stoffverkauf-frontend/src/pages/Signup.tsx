import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import SEO from "@/components/SEO";
import { toast } from "sonner";

const Signup = () => {
  const { lang } = useI18n();
  const { signup, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const de = lang === "de";
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isLoggedIn) {
    navigate("/profile", { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError(de ? "Bitte akzeptieren Sie die AGB." : "Please accept the terms and conditions.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = signup(firstName, lastName, email, password);
      setLoading(false);

      if (result.success) {
        toast.success(de ? "Konto erfolgreich erstellt!" : "Account created successfully!");
        navigate("/profile");
      } else {
        const messages: Record<string, string> = {
          name_required: de ? "Bitte geben Sie Ihren Vor- und Nachnamen ein." : "Please enter your first and last name.",
          invalid_email: de ? "Bitte geben Sie eine gültige E-Mail-Adresse ein." : "Please enter a valid email address.",
          password_short: de ? "Das Passwort muss mindestens 6 Zeichen lang sein." : "Password must be at least 6 characters.",
          email_exists: de ? "Diese E-Mail-Adresse ist bereits registriert." : "This email is already registered.",
        };
        setError(messages[result.error || ""] || (de ? "Ein Fehler ist aufgetreten." : "An error occurred."));
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={de ? "Registrieren" : "Create Account"} description={de ? "Erstellen Sie Ihr Konto bei Stoffverkauf Weber." : "Create your Stoffverkauf Weber account."} path="/signup" noIndex />
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {de ? "Konto erstellen" : "Create Account"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {de ? "Registrieren Sie sich für exklusive Vorteile" : "Sign up for exclusive benefits"}
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={de ? "Vorname" : "First name"}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body"
                />
              </div>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={de ? "Nachname" : "Last name"}
                required
                className="w-full px-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body"
              />
            </div>
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
                placeholder={de ? "Passwort (min. 6 Zeichen)" : "Password (min. 6 characters)"}
                required
                minLength={6}
                className="w-full pl-11 pr-12 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent font-body"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password strength indicator */}
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      password.length >= level * 3
                        ? level <= 1 ? "bg-destructive" : level <= 2 ? "bg-amber-500" : "bg-green-500"
                        : "bg-border"
                    }`}
                  />
                ))}
              </div>
              {password.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {password.length < 6
                    ? (de ? "Zu kurz" : "Too short")
                    : password.length < 9
                    ? (de ? "Ausreichend" : "Fair")
                    : (de ? "Stark" : "Strong")}
                </p>
              )}
            </div>

            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="rounded border-border mt-1"
              />
              <span>
                {de
                  ? <>Ich akzeptiere die <Link to="/agb" className="text-accent hover:underline">AGB</Link> und <Link to="/datenschutz" className="text-accent hover:underline">Datenschutzerklärung</Link></>
                  : <>I agree to the <Link to="/agb" className="text-accent hover:underline">Terms</Link> and <Link to="/datenschutz" className="text-accent hover:underline">Privacy Policy</Link></>}
              </span>
            </label>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading
                ? (de ? "Wird erstellt..." : "Creating account...")
                : (de ? "Registrieren" : "Create Account")}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {de ? "Bereits ein Konto?" : "Already have an account?"}{" "}
            <Link to="/login" className="text-accent font-semibold hover:underline">
              {de ? "Anmelden" : "Sign In"}
            </Link>
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
