import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/lib/cart-context";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, total, itemCount } = useCart();
  const { t } = useI18n();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-foreground" />
                <h2 className="font-display text-lg font-bold text-foreground">
                  {t("cart.title")} ({itemCount})
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t("cart.close")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground font-body">{t("cart.empty")}</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 text-sm font-semibold text-accent hover:underline"
                  >
                    {t("cart.continue")}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex gap-4"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-body font-semibold text-sm text-foreground truncate">
                          {item.name}
                        </h3>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {t(`cat.${item.category}` as TranslationKey)} · {t("product.perMeter")}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 bg-secondary rounded-lg">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label={t("cart.decrease")}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-semibold text-foreground w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label={t("cart.increase")}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="font-body font-bold text-sm text-foreground">
                            {(item.salePrice * item.quantity).toFixed(2)} €
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="self-start p-1 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={t("cart.remove")}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-body">{t("cart.subtotal")}</span>
                  <span className="font-body font-bold text-lg text-foreground">{total.toFixed(2)} €</span>
                </div>
                <p className="text-xs text-muted-foreground">{t("cart.shippingNote")}</p>
                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-body font-semibold text-sm hover:opacity-90 transition-opacity block text-center"
                >
                  {t("cart.checkout")} — {total.toFixed(2)} €
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
