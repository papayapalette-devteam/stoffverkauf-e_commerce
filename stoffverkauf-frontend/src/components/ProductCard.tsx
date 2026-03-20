import { motion } from "framer-motion";
import { ShoppingBag, Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { Product } from "@/lib/cart-context";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useI18n, type TranslationKey } from "@/lib/i18n";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps): JSX.Element => {
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const { t, lang } = useI18n();
  const wishlisted = isInWishlist(product._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group"
    >
      <Link to={`/product/${product._id}`} className="block relative aspect-square rounded-xl overflow-hidden bg-secondary mb-3">
        <img
           src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            {t(`badge.${product.badge}` as TranslationKey)}
          </span>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.preventDefault(); toggleItem(product); toast(wishlisted ? (lang === "de" ? "Von Wunschliste entfernt" : "Removed from wishlist") : (lang === "de" ? "Zur Wunschliste hinzugefügt" : "Added to wishlist"), { description: product.name }); }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
            wishlisted
              ? "bg-destructive text-destructive-foreground opacity-100"
              : "bg-background/80 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => { e.preventDefault(); addItem(product); toast(lang === "de" ? "In den Warenkorb gelegt" : "Added to cart", { description: product.name }); }}
          className="absolute bottom-3 right-3 bg-primary text-primary-foreground p-3 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 shadow-elevated"
          aria-label={`${product.name} ${t("product.addToCart")}`}
        >
          <ShoppingBag className="w-4 h-4" />
        </motion.button>
      </Link>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {t(`cat.${product.category}` as TranslationKey)}
        </p>
        <h3 className="font-body font-semibold text-foreground text-sm lg:text-base">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body font-bold text-foreground">
              {product.salePrice} €
            </p>
            {product.salePrice && (
              <p className="text-xs text-muted-foreground line-through">
                {product.price.toFixed(2)} €
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="w-3.5 h-3.5 fill-accent text-accent" />
            <span className="text-xs font-medium">{product.rating}</span>
            <span className="text-xs">({product.reviews})</span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          {product.width ? `${product.width} · ` : ""}{t("product.perMeter")}
          {" · "}{lang === "de" ? "inkl. MwSt." : "incl. VAT"}
          {" · "}{lang === "de" ? "zzgl. Versandkosten" : "plus shipping"}
        </p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
