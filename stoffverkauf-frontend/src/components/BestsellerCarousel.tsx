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
      const resp = await api.get("/api/products/get-product-by-badge/Bestseller", {
        params: { page, limit },
      });

      // Update products state
      setproducts(resp.data.products || []);
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
}, [page, limit]);

  return (
  <section className="py-16 lg:py-24">
  <div className="container mx-auto px-4 lg:px-8">

    {/* Header */}
    <div className="flex items-end justify-between mb-10">
      <div>
        <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
          {t("best.title")}
        </h2>
        <p className="text-muted-foreground mt-2 font-body">
          {t("best.subtitle")}
        </p>
      </div>

      {/* Arrows (only mobile scroll) */}
      <div className="hidden sm:flex gap-2 lg:hidden">
        <button
          onClick={() => scroll("left")}
          className="p-2.5 rounded-full border border-border bg-card hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="p-2.5 rounded-full border border-border bg-card hover:bg-secondary transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-foreground" />
        </button>
      </div>
    </div>

    {/* MOBILE → SCROLL | DESKTOP → GRID */}
    <div
      ref={scrollRef}
      className="
        flex gap-5 overflow-x-auto pb-4 -mx-4 px-4
        lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:mx-0 lg:px-0
        scrollbar-hide
      "
    >
      {products.map((product, i) => {
        const wishlisted = isInWishlist(product._id);

        return (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="
              w-[220px] sm:w-[240px] flex-shrink-0 snap-start
              lg:w-full group
            "
          >
            {/* IMAGE */}
            <Link
              to={`/product/${product._id}`}
              className="block relative aspect-square rounded-xl overflow-hidden bg-secondary mb-3"
            >
              <img
                src={product.images?.[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              {/* Badge */}
              {product.badge && (
                <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  {t(`badge.${product.badge}` as TranslationKey)}
                </span>
              )}

              {/* Wishlist */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  toggleItem(product);
                  toast(
                    wishlisted
                      ? lang === "de"
                        ? "Von Wunschliste entfernt"
                        : "Removed from wishlist"
                      : lang === "de"
                      ? "Zur Wunschliste hinzugefügt"
                      : "Added to wishlist",
                    { description: product.name }
                  );
                }}
                className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
                  wishlisted
                    ? "bg-destructive text-destructive-foreground opacity-100"
                    : "bg-background/80 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    wishlisted ? "fill-current" : ""
                  }`}
                />
              </motion.button>

              {/* Add to Cart */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  addItem(product);
                  toast(
                    lang === "de"
                      ? "In den Warenkorb gelegt"
                      : "Added to cart",
                    { description: product.name }
                  );
                }}
                className="absolute bottom-3 right-3 bg-primary text-primary-foreground p-3 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 shadow-elevated"
              >
                <ShoppingBag className="w-4 h-4" />
              </motion.button>
            </Link>

            {/* CONTENT */}
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
                    {product.salePrice || product.price} €
                  </p>

                  {product.salePrice && (
                    <p className="text-xs text-muted-foreground line-through">
                      {product.price.toFixed(2)} €
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 text-muted-foreground">
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                  <span className="text-xs font-medium">
                    {product.rating}
                  </span>
                  <span className="text-xs">
                    ({product.reviews})
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground">
                {product.width ? `${product.width} · ` : ""}
                {t("product.perMeter")} ·{" "}
                {lang === "de" ? "inkl. MwSt." : "incl. VAT"} ·{" "}
                {lang === "de"
                  ? "zzgl. Versandkosten"
                  : "plus shipping"}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>

    {/* PAGINATION */}
    <div
      className="flex items-center gap-2 mt-6"
      style={{ display: totalPages <= 1 ? "none" : "flex" }}
    >
      <button
        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        disabled={page === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>

      {getVisiblePages().map((p, idx) =>
        p === "..." ? (
          <span key={idx} className="px-2 py-1 text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => setPage(p as number)}
            className={`px-3 py-1 border rounded ${
              page === p ? "bg-[#5C00B3] text-white" : ""
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() =>
          setPage((prev) => Math.min(prev + 1, totalPages))
        }
        disabled={page === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
</section>
  );
};

export default BestsellerCarousel;
