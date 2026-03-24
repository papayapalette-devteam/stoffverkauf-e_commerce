import { useEffect, useState } from "react";
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
import api from "../../api"

const Profile = () => {
  const { lang } = useI18n();
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const de = lang === "de";
  const [activeTab, setActiveTab] = useState("profile");

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [formData, setFormData] = useState({
  firstName:"",
  lastName:"",
  email: "",
  phone:"",
  address:"",
});

useEffect(() => {
  if (isEditOpen) {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone:user?.phone ? String(user.phone) : "",
      address: user?.address || "",
    });
  }
}, [isEditOpen, user]);

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};


const handleSave = async () => {
  try {
    const res = await api.put("api/user/update-user", {
      ...formData,
      phone: formData.phone ? Number(formData.phone) : null,
    });

    const data = res.data;

    if (!data.success) {
      // Backend might send an error message
      throw new Error(data.error || "Update failed");
    }

    toast.success("Profile updated!");
    setIsEditOpen(false);

  } catch (err) {
    // Axios error with response
    if (err.response && err.response.data && err.response.data.error) {
      toast.error(err.response.data.error);
    } 
    // Generic error message
    else {
      toast.error(err.message || "Update failed");
    }
  }
};

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
                      <button onClick={() => setIsEditOpen(true)} className="flex items-center gap-2 text-sm text-accent hover:underline">
                        <Edit3 className="w-4 h-4" />
                        {de ? "Bearbeiten" : "Edit"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[
                        { icon: User, label: de ? "Name" : "Name", value: `${user.firstName} ${user.lastName}` },
                        { icon: Mail, label: "E-Mail", value: user.email },
                        { icon: Phone, label: de ? "Telefon" : "Phone", value:user.phone },
                        { icon: MapPin, label: de ? "Adresse" : "Address", value: user.address },
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

        {isEditOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-card rounded-xl p-6 w-full max-w-md shadow-lg">
      <h2 className="text-lg font-semibold mb-4">
        {de ? "Profil bearbeiten" : "Edit Profile"}
      </h2>

    <div className="space-y-4">
  <input
    type="text"
    name="firstName"
    value={formData.firstName}
    onChange={handleChange}
    placeholder="First Name"
    className="w-full border rounded-lg px-3 py-2"
  />

  <input
    type="text"
    name="lastName"
    value={formData.lastName}
    onChange={handleChange}
    placeholder="Last Name"
    className="w-full border rounded-lg px-3 py-2"
  />

  <input
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    placeholder="Email"
    className="w-full border rounded-lg px-3 py-2"
  />

  <input
    type="tel"   // ✅ fix هنا
    name="phone"
    value={formData.phone}
    onChange={handleChange}
    placeholder="Phone"
    className="w-full border rounded-lg px-3 py-2"
  />

  <input
    type="text"
    name="address"
    value={formData.address}
    onChange={handleChange}
    placeholder="Address"
    className="w-full border rounded-lg px-3 py-2"
  />
</div>

      <div className="flex justify-end gap-3 mt-6">
        <button
         
          className="px-4 py-2 text-sm rounded-lg border"
        >
          {de ? "Abbrechen" : "Cancel"}
        </button>
        <button
           onClick={handleSave}
          className="px-4 py-2 text-sm rounded-lg bg-primary text-white"
        >
          {de ? "Speichern" : "Save"}
        </button>
      </div>
    </div>
  </div>
)}

      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Profile;
