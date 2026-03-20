import { motion } from "framer-motion";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";

const Wishlist = () => {
  const { lang } = useI18n();
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={lang === "de" ? "Wunschliste" : "Wishlist"} description={lang === "de" ? "Ihre gespeicherten Lieblingsstoffe bei Stoffverkauf Weber." : "Your saved favorite fabrics at Stoffverkauf Weber."} path="/wishlist" noIndex />
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {lang === "de" ? "Meine Wunschliste" : "My Wishlist"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {items.length} {lang === "de" ? "Artikel" : "items"}
          </p>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 text-muted mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                {lang === "de" ? "Ihre Wunschliste ist leer" : "Your wishlist is empty"}
              </h2>
              <p className="text-muted-foreground mb-6 text-sm">
                {lang === "de" ? "Speichern Sie Ihre Lieblingsstoffe für später" : "Save your favorite fabrics for later"}
              </p>
              <Link to="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-block">
                {lang === "de" ? "Stoffe entdecken" : "Explore Fabrics"}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border overflow-hidden shadow-card group"
                >
                  <Link to={`/product/${item._id}`} className="block aspect-square overflow-hidden">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                    <p className="font-bold text-foreground">{item.price.toFixed(2)} €</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addItem(item)}
                        className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {lang === "de" ? "In den Warenkorb" : "Add to Cart"}
                      </button>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="p-2 border border-border rounded-lg text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Wishlist;
