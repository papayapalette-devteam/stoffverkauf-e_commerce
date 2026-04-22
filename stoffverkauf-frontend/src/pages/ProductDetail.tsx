import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingBag,
  Star,
  Ruler,
  Weight,
  Layers,
  Scissors,
  ShieldCheck,
  ZoomIn,
  MessageSquare,
  Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import { mockReviews } from "@/lib/mock-data";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import SEO from "@/components/SEO";
import api from "../../api";
import axios from "axios";
import { toast } from "sonner";

// Care icons
const careIcons: Record<string, string> = {
  "Chemische Reinigung": "🧴",
  "Nicht bleichen": "🚫",
  "Bügeln Stufe 2": "🔥",
  "Bügeln Stufe 1-2": "🔥",
  "Nicht im Trockner trocknen": "❌",
  "Handwäsche bei 30°C": "🫧",
  "Handwäsche möglich bei 30°C": "🫧",
  "Nicht bügeln": "🚫",
  "Chemische Reinigung empfohlen": "🧴",
  "Nur chemische Reinigung": "🧴",
  "Bügeln Stufe 2 mit Tuch": "🔥",
  "Liegend trocknen": "📏",
};

// TypeScript types
interface ProductVariant {
  color: string;
  pattern: string;
  size: string;
  stock: number;
}

interface ProductForm {
  _id: string;
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
  images: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  variants: ProductVariant[];
  rating: number;
  reviews: number;
}

interface ProductDetails {
  description: string;
  sampleAvailable?: boolean;
  samplePrice?: number;
  composition?: string;
  width?: string;
  weight?: string;
  careInstructions?: string[];
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const { t, lang } = useI18n();
  const de = lang === "de";

  const [meters, setMeters] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [panPos, setPanPos] = useState({ x: 50, y: 50 });
  const [product, setProduct] = useState<ProductForm | null>(null);
  const [details, setDetails] = useState<ProductDetails | null>(null);

  const [productFeedbacks, setProductFeedbacks] = useState<any[]>([]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFeedbacks = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/api/feedback/product/${id}`);
      if (res.data.success) {
        setProductFeedbacks(res.data.feedbacks);
      }
    } catch (err) {
      console.error("Fetch feedbacks error:", err);
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    // Check if standard user is logged in (from some state or context)
    // We already have useCart, useWishlist. 
    // What about useAuth?
    // I noticed useAuth was available in context. Let's try to add it.
    
    setIsSubmitting(true);
    try {
      const res = await api.post('/api/feedback', {
        productId: id,
        rating: userRating,
        comment: userComment
      });
      if (res.data.success) {
        toast.success(de ? "Danke! Ihr Feedback wird nach der Prüfung veröffentlicht." : "Thank you! Your feedback will be published after review.");
        setUserComment("");
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error(de ? "Bitte loggen Sie sich ein, um eine Bewertung abzugeben." : "Please login to leave a review.");
      } else {
        toast.error(err.response?.data?.message || "Failed to submit feedback");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Fetch product by ID
  const fetchProductById = async (id: string) => {
    try {
      const response = await api.get(`/api/products/get-product-by-id/${id}`);
      const data: ProductForm = response.data;
      setProduct(data);

      setDetails({
        description: data.description || "",
        composition: data.composition,
        width: data.width,
        weight: data.width,
        careInstructions: [], // replace with real care instructions if available
        sampleAvailable: true, // example
        samplePrice: 5, // example
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to fetch product");
      } else {
        toast.error("An unexpected error occurred while fetching product");
        console.error(err);
      }
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductById(id);
      fetchFeedbacks();
    }
  }, [id]);


  
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

const [relatedProducts, setRelatedProducts] = useState<ProductForm[]>([]);
useEffect(() => {
  const fetchProducts = async () => {
    if(product.category)
    {
    try {
      // Fetch products by category
      const resp = await api.get(`/api/products/get-product-by-category/${product.category}`, {
        params: { page, limit },
      });

      // Update products state
      setRelatedProducts(resp.data.products || []); // always an array
      setTotalPages(resp.data.totalPages || 1);

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to fetch products");
      } else {
        toast.error("An unexpected error occurred while fetching products");
        console.error(err);
      }
    }
  }
  };

  fetchProducts();
}, [product, page, limit]);




  if (!product || !details) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">
              {lang === "de" ? "Produkt nicht gefunden" : "Product not found"}
            </h1>
            <Link to="/" className="text-primary underline">{t("detail.back")}</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }




  // ===== Fixed handleAddToCart =====
  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < meters; i++) {
      addItem({
        ...product, // include all required fields
        images: product.images.length ? [product.images[0]] : [],
      });
    }

    toast.success(`${product.name} — ${(product.price * meters).toFixed(2)} €`);
  };

  // ===== Fixed handleOrderSample =====
  const handleOrderSample = () => {
    if (!product) return;

    addItem({
      ...product,
      images: product.images.length ? [product.images[0]] : [],
      price:5
    });

    toast.success(`${t("detail.sampleAdded")} — ${details.samplePrice?.toFixed(2) || "0"} €`);
  };

  const careTranslations: Record<string, string> = {
    "Chemische Reinigung": lang === "de" ? "Chemische Reinigung" : "Dry clean",
    "Nicht bleichen": lang === "de" ? "Nicht bleichen" : "Do not bleach",
    "Bügeln Stufe 2": lang === "de" ? "Bügeln Stufe 2" : "Iron level 2",
    "Bügeln Stufe 1-2": lang === "de" ? "Bügeln Stufe 1-2" : "Iron level 1-2",
    "Nicht im Trockner trocknen": lang === "de" ? "Nicht im Trockner trocknen" : "Do not tumble dry",
    "Handwäsche bei 30°C": lang === "de" ? "Handwäsche bei 30°C" : "Hand wash at 30°C",
    "Handwäsche möglich bei 30°C": lang === "de" ? "Handwäsche möglich bei 30°C" : "Hand wash possible at 30°C",
    "Nicht bügeln": lang === "de" ? "Nicht bügeln" : "Do not iron",
    "Chemische Reinigung empfohlen": lang === "de" ? "Chemische Reinigung empfohlen" : "Dry clean recommended",
    "Nur chemische Reinigung": lang === "de" ? "Nur chemische Reinigung" : "Dry clean only",
    "Bügeln Stufe 2 mit Tuch": lang === "de" ? "Bügeln Stufe 2 mit Tuch" : "Iron level 2 with cloth",
    "Liegend trocknen": lang === "de" ? "Liegend trocknen" : "Dry flat",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={product.name}
        description={details.description.slice(0, 155)}
        path={`/product/${product._id}`}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: details.description,
          image: product.images[0],
          offers: {
            "@type": "Offer",
            price: product.price.toFixed(2),
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            url: `https://www.stoffverkauf-weber.de/product/${product._id}`,
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating.toString(),
            reviewCount: product.reviews.toString(),
          },
        }}
      />
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("detail.back")}
          </Link>

          {/* Product hero */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div
                ref={imageContainerRef}
                className="relative aspect-square rounded-2xl overflow-hidden bg-secondary cursor-crosshair"
                onMouseMove={(e) => {
                  if (zoom <= 1) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  setPanPos({ x, y });
                }}
                onMouseLeave={() => setPanPos({ x: 50, y: 50 })}
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-200"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: `${panPos.x}% ${panPos.y}%`,
                  }}
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full z-10">
                    {t(`badge.${product.badge}` as TranslationKey)}
                  </span>
                )}
              </div>
              {/* Zoom slider */}
              <div className="flex items-center gap-3 mt-4 px-2">
                <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
                <Slider
                  value={[zoom]}
                  onValueChange={(v) => setZoom(v[0])}
                  min={1}
                  max={3}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground font-mono w-10 text-right">{zoom.toFixed(1)}×</span>
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col"
            >
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-2">
                {t(`cat.${product.category}` as TranslationKey)}
              </p>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-muted"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviews} {lang === "de" ? "Bewertungen" : "reviews"})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-display text-3xl font-bold text-foreground">
                  {product.salePrice.toFixed(2)} €
                </span>
                <span className="text-sm text-muted-foreground">{t("detail.perMeter")}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                {lang === "de" ? "inkl. 19% MwSt., zzgl." : "incl. 19% VAT, plus"}{" "}
                <Link to="/faq" className="underline">{lang === "de" ? "Versandkosten" : "shipping costs"}</Link>
                {lang === "de" ? ". Lieferzeit: 2-5 Werktage." : ". Delivery time: 2-5 business days."}
              </p>

              {/* Description */}
              <p className="text-muted-foreground font-body leading-relaxed mb-8">
                {details.description}
              </p>

              {/* Meter selector + Add to cart */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setMeters(Math.max(1, meters - 1))}
                    className="px-4 py-3 text-foreground hover:bg-secondary transition-colors font-bold"
                  >
                    −
                  </button>
                  <span className="px-4 py-3 font-body font-semibold text-foreground min-w-[4rem] text-center">
                    {meters} {t("detail.meters")}
                  </span>
                  <button
                    onClick={() => setMeters(meters + 1)}
                    className="px-4 py-3 text-foreground hover:bg-secondary transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {t("detail.addToCart")} — {(product.salePrice * meters).toFixed(2)} €
                </motion.button>
              </div>

              {/* Sample order */}
              {details.sampleAvailable && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOrderSample}
                  className="w-full border-2 border-dashed border-accent text-primary-foreground bg-accent py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors mb-8"
                >
                  <Scissors className="w-5 h-5" />
                  {t("detail.orderSample")} — {details.samplePrice?.toFixed(2) || 0} €
                </motion.button>
              )}
              <p className="text-xs text-foreground/60 text-center -mt-6 mb-8">
                {t("detail.sampleNote")}
              </p>
            </motion.div>
          </div>

          {/* Related products */}
          {relatedProducts?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 border-t border-border pt-12"
            >
              <h3 className="font-display text-2xl font-bold text-foreground mb-8">
                {t("detail.related")}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts?.map((p,i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Feedback Section */}
          <div className="mt-16 border-t border-border pt-12">
            <h3 className="font-display text-2xl font-bold text-foreground mb-8">
              {de ? "Kundenbewertungen" : "Customer Reviews"}
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Feedback List */}
              <div className="lg:col-span-2 space-y-6">
                {productFeedbacks.length > 0 ? (
                  productFeedbacks.map((f) => (
                    <div key={f._id} className="bg-card rounded-xl border border-border p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                            {f.user?.firstName?.[0]}{f.user?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{f.user?.firstName} {f.user?.lastName}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(f.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= f.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">"{f.comment}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic text-center py-10">
                    {de ? "Noch keine Bewertungen für dieses Produkt." : "No reviews for this product yet."}
                  </p>
                )}
              </div>

              {/* Submit Form */}
              <div className="bg-secondary/30 rounded-2xl p-8 border border-border h-fit">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-accent" />
                  </div>
                  <h4 className="font-display text-lg font-bold text-foreground">
                    {de ? "Bewertung schreiben" : "Write a review"}
                  </h4>
                </div>
                
                <form onSubmit={submitFeedback} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">{de ? "Sterne" : "Rating"}</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setUserRating(s)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star className={`w-6 h-6 ${s <= userRating ? "text-yellow-500 fill-yellow-500" : "text-muted border-muted"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">
                      {de ? "Ihr Kommentar" : "Your comment"}
                    </label>
                    <textarea
                      required
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder={de ? "Wie gefällt Ihnen der Stoff?" : "How do you like the fabric?"}
                      className="w-full px-4 py-3 bg-card text-foreground rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent min-h-[120px] resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-accent text-accent-foreground py-3 rounded-xl text-sm font-bold hover:bg-accent/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {de ? "Bewertung absenden" : "Submit Review"}
                  </button>
                  <p className="text-[10px] text-muted-foreground text-center px-4">
                    {de ? "* Bewertungen werden vor der Veröffentlichung geprüft." : "* Reviews are moderated before publication."}
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default ProductDetailPage;