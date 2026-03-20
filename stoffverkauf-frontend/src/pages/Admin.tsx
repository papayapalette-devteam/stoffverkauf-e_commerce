import { useState, useEffect } from "react";
import { LayoutDashboard, Package, ShoppingBag, BarChart3, FileText, Settings, Plug, ChevronLeft, ChevronRight, LogOut, Users, Megaphone, RotateCcw, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isAdminAuthenticated, adminLogout } from "./AdminLogin";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminContent from "@/components/admin/AdminContent";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminIntegrations from "@/components/admin/AdminIntegrations";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminCustomers from "@/components/admin/AdminCustomers";
import AdminMarketing from "@/components/admin/AdminMarketing";
import AdminReturns from "@/components/admin/AdminReturns";
import AdminCategories from "@/components/admin/AdminCategories";

const Admin = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  if (!isAdminAuthenticated()) return null;

  const navItems = [
    { id: "dashboard", label: de ? "Übersicht" : "Dashboard", icon: LayoutDashboard },
    { id: "products", label: de ? "Produkte" : "Products", icon: Package },
    { id: "categories", label: de ? "Kategorien" : "Categories", icon: FolderOpen },
    { id: "orders", label: de ? "Bestellungen" : "Orders", icon: ShoppingBag },
    { id: "returns", label: de ? "Retouren" : "Returns", icon: RotateCcw },
    { id: "customers", label: de ? "Kunden" : "Customers", icon: Users },
    { id: "analytics", label: de ? "Analyse" : "Analytics", icon: BarChart3 },
    { id: "marketing", label: de ? "Marketing" : "Marketing", icon: Megaphone },
    { id: "content", label: de ? "Inhalte" : "Content", icon: FileText },
    { id: "integrations", label: de ? "Integrationen" : "Integrations", icon: Plug },
    { id: "settings", label: de ? "Einstellungen" : "Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard": return <AdminDashboard />;
      case "products": return <AdminProducts />;
      case "categories": return <AdminCategories />;
      case "orders": return <AdminOrders />;
      case "returns": return <AdminReturns />;
      case "customers": return <AdminCustomers />;
      case "analytics": return <AdminAnalytics />;
      case "marketing": return <AdminMarketing />;
      case "content": return <AdminContent />;
      case "integrations": return <AdminIntegrations />;
      case "settings": return <AdminSettings />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <SEO title="Admin Dashboard" description="Stoffverkauf Weber Admin Dashboard" path="/admin" noIndex />

      {/* Sidebar */}
      <aside className={`flex-shrink-0 bg-card border-r border-border flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!collapsed && (
            <Link to="/" className="font-display text-lg font-bold text-foreground hover:text-accent transition-colors">
              Weber Admin
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors ml-auto">
            {collapsed ? <ChevronRight className="w-4 h-4 text-muted-foreground" /> : <ChevronLeft className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{de ? "Zurück zum Shop" : "Back to Shop"}</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            title={collapsed ? (de ? "Abmelden" : "Logout") : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{de ? "Abmelden" : "Logout"}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Admin;
