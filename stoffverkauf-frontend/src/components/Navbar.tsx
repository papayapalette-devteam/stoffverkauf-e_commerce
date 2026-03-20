import { useState } from "react";
import { ShoppingBag, Search, Menu, X, User, Globe, Heart, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/lib/cart-context";
import { useI18n } from "@/lib/i18n";
import { useWishlist } from "@/lib/wishlist-context";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import SearchOverlay from "./SearchOverlay";

const Navbar = () => {
  const { itemCount, setIsCartOpen } = useCart();
  const { t, lang, setLang } = useI18n();
  const { items: wishlistItems } = useWishlist();
  const { user, isLoggedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { label: t("nav.kategorien"), href: "/#kategorien" },
    { label: t("nav.bestseller"), href: "/#bestseller" },
    { label: t("nav.stoffe"), href: "/#stoffe" },
    { label: t("nav.angebote"), href: "/#angebote" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Top info bar */}
          <div className="hidden lg:flex items-center justify-between text-xs text-muted-foreground py-1.5 border-b border-border">
            <span>{t("nav.topbar.contact")}</span>
            <div className="flex items-center gap-4">
              <span>{t("nav.topbar.shipping")}</span>
              <button
                onClick={() => setLang(lang === "de" ? "en" : "de")}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border hover:bg-secondary transition-colors font-semibold"
                aria-label="Switch language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{lang === "de" ? "EN" : "DE"}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between h-16 lg:h-20">
            <button
              className="lg:hidden p-2 -ml-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="font-display text-lg lg:text-2xl font-bold tracking-tight text-foreground">
              Stoffverkauf<span className="text-gradient-accent"> Weber</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2 lg:gap-4">
              <button
                onClick={() => setLang(lang === "de" ? "en" : "de")}
                className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Switch language"
              >
                <Globe className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link to="/wishlist" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <Link to={isLoggedIn ? "/profile" : "/login"} className="hidden lg:flex items-center gap-1.5 p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label={t("nav.account")}>
                {isLoggedIn && user ? (
                  <span className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                ) : (
                  <User className="w-5 h-5" />
                )}
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t("cart.title")}
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-border bg-background"
            >
              <nav className="flex flex-col py-4 px-4 gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  to={isLoggedIn ? "/profile" : "/login"}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" /> {isLoggedIn ? (user?.firstName || t("nav.account")) : t("nav.account")}
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
