import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Edit3, Package, Heart, Settings, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import SEO from "@/components/SEO";
import { toast } from "sonner";

const Profile = () => {
  const { lang } = useI18n();
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const de = lang === "de";
  const [activeTab, setActiveTab] = useState("profile");

  if (!isLoggedIn || !user) {
    navigate("/login", { replace: true });
    return null;
  }

  const handleLogout = () => {
    logout();
    toast.success(de ? "Erfolgreich abgemeldet." : "Successfully signed out.");
    navigate("/");
  };

  const tabs = [
    { id: "profile", label: de ? "Profil" : "Profile", icon: User },
    { id: "orders", label: de ? "Bestellungen" : "Orders", icon: Package },
    { id: "wishlist", label: de ? "Wunschliste" : "Wishlist", icon: Heart },
    { id: "settings", label: de ? "Einstellungen" : "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={de ? "Mein Konto" : "My Account"} description={de ? "Verwalten Sie Ihr Konto bei Stoffverkauf Weber." : "Manage your Stoffverkauf Weber account."} path="/profile" noIndex />
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">
            {de ? "Mein Konto" : "My Account"}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                    <span className="font-display text-2xl font-bold text-accent">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">{user.firstName} {user.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
                <button
                  onClick={handleLogout}
                  className="mt-4 w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {de ? "Abmelden" : "Sign Out"}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border p-6 lg:p-8 shadow-card"
              >
                {activeTab === "profile" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-xl font-bold text-foreground">
                        {de ? "Persönliche Daten" : "Personal Details"}
                      </h2>
                      <button className="flex items-center gap-2 text-sm text-accent hover:underline">
                        <Edit3 className="w-4 h-4" />
                        {de ? "Bearbeiten" : "Edit"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[
                        { icon: User, label: de ? "Name" : "Name", value: `${user.firstName} ${user.lastName}` },
                        { icon: Mail, label: "E-Mail", value: user.email },
                        { icon: Phone, label: de ? "Telefon" : "Phone", value: "—" },
                        { icon: MapPin, label: de ? "Adresse" : "Address", value: "—" },
                      ].map((field) => (
                        <div key={field.label} className="flex items-start gap-3">
                          <field.icon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">{field.label}</p>
                            <p className="text-sm font-medium text-foreground">{field.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "orders" && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">
                      {de ? "Ihre Bestellungen" : "Your Orders"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {de ? "Alle Bestellungen auf einen Blick" : "All orders at a glance"}
                    </p>
                    <Link to="/orders" className="text-accent font-semibold hover:underline text-sm">
                      {de ? "Bestellverlauf ansehen →" : "View order history →"}
                    </Link>
                  </div>
                )}

                {activeTab === "wishlist" && (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">
                      {de ? "Ihre Wunschliste" : "Your Wishlist"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {de ? "Merken Sie sich Ihre Lieblingsstoffe" : "Save your favorite fabrics"}
                    </p>
                    <Link to="/wishlist" className="text-accent font-semibold hover:underline text-sm">
                      {de ? "Wunschliste ansehen →" : "View wishlist →"}
                    </Link>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="space-y-6">
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {de ? "Einstellungen" : "Settings"}
                    </h2>
                    {[
                      { label: de ? "E-Mail-Benachrichtigungen" : "Email notifications", checked: true },
                      { label: "Newsletter", checked: true },
                      { label: de ? "SMS-Benachrichtigungen" : "SMS notifications", checked: false },
                    ].map((setting) => (
                      <label key={setting.label} className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-sm text-foreground">{setting.label}</span>
                        <input type="checkbox" defaultChecked={setting.checked} className="rounded border-border" />
                      </label>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Profile;
