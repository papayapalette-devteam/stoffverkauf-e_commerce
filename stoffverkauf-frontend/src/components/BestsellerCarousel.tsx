import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star, ShoppingBag, Heart } from "lucide-react";
import { products } from "@/lib/products";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../../api";
import axios from "axios";

const BestsellerCarousel = () => {
  const { t, lang } = useI18n();
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const scrollRef = useRef<HTMLDivElement>(null);




  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

    // ------------------- FETCH Products -------------------
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const MAX_VISIBLE = 5;

const getVisiblePages = () => {
  const pages = [];

  let start = Math.max(1, page - Math.floor(MAX_VISIBLE / 2));
  let end = start + MAX_VISIBLE - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - MAX_VISIBLE + 1);
  }

  // Always show first page
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("...");
  }

  // Middle pages
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Always show last page
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  return pages;
};

interface ProductForm {
  _id:string;
  name: string;
  price: number;
  salePrice: number;
  category: string;
  badge: string;
  width: string;
  inStock: boolean;
  stockQty: string;
  composition: string;
  description: string;
  images:string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  variants: ProductVariant[];
  rating:number;
  reviews:number
}

interface ProductVariant {
  color: string;
  pattern: string;
  size: string;
  stock: number;
}

const [products, setproducts] = useState<ProductForm[]>([]);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const resp = await api.get("api/products/get-product-by-badge/Bestseller", {
        params: { page, limit },
      });

      // Update products state
      setproducts(resp.data.products || []); // ensure always an array
      setTotalPages(resp.data.totalPages || 1);

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to fetch products");
      } else {
        toast.error("An unexpected error occurred while fetching products");
        console.error(err);
      }
    }
  };

  fetchProducts();
}, [page, limit]); // no activeCategory here

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
              {t("best.title")}
            </h2>
            <p className="text-muted-foreground mt-2 font-body">
              {t("best.subtitle")}
            </p>
          </div>
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2.5 rounded-full border border-border bg-card hover:bg-secondary transition-colors"
              aria-label="Previous"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2.5 rounded-full border border-border bg-card hover:bg-secondary transition-colors"
              aria-label="Next"
            >
              <ArrowRight className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="min-w-[260px] sm:min-w-[280px] lg:min-w-[300px] snap-start flex-shrink-0 group"
            >
              <Link to={`/product/${product._id}`} className="block relative aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-secondary">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-full font-body">
                    {t(`badge.${product.badge}` as TranslationKey)}
                  </span>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.preventDefault(); const wasIn = isInWishlist(product._id); toggleItem(product); toast(wasIn ? (lang === "de" ? "Von Wunschliste entfernt" : "Removed from wishlist") : (lang === "de" ? "Zur Wunschliste hinzugefügt" : "Added to wishlist"), { description: product.name }); }}
                  className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
                    isInWishlist(product._id)
                      ? "bg-destructive text-destructive-foreground opacity-100"
                      : "bg-background/80 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  }`}
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product._id) ? "fill-current" : ""}`} />
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
              <h3 className="font-body font-semibold text-sm text-foreground truncate">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {product.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                    <span className="text-xs text-muted-foreground font-body">
                      {product.rating}
                    </span>
                  </div>
                )}
                <span className="text-sm font-bold text-foreground font-body">
                  {product.price.toFixed(2).replace(".", ",")} €
                </span>
                <span className="text-xs text-muted-foreground font-body">
                  {t("product.perMeter")}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestsellerCarousel;
