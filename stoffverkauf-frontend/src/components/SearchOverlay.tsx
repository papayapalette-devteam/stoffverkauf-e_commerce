import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal, ArrowUpDown, Star, ShoppingBag, Heart, Check } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api";
import { useCart, type Product } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { Checkbox } from "@/components/ui/checkbox";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

type SortOption = "relevance" | "price-asc" | "price-desc" | "rating" | "reviews";

const priceMin = 0;
const priceMax = 500;

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const { t, lang } = useI18n();
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([priceMin, priceMax]);
  
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [dbBadges, setDbBadges] = useState<string[]>([]);
  
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeBadges, setActiveBadges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showFilters, setShowFilters] = useState(true);
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "inStock">("all");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, activeCategories, activeBadges, availabilityFilter, priceRange, sortBy]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
      
      // Fetch metadata (categories, badges)
      const fetchMetaData = async () => {
        try {
          const [catRes, badgeRes] = await Promise.all([
            api.get("/api/category/get-categories"),
            api.get("/api/products/get-badges")
          ]);
          
          if (catRes.data && catRes.data.categories) {
            const names = catRes.data.categories
              .filter((c: any) => c.enabled)
              .map((c: any) => c.name);
            setDbCategories(names);
          }
          if (badgeRes.data && badgeRes.data.badges) {
             setDbBadges(badgeRes.data.badges);
          }
        } catch (error) {
          console.error("Error fetching meta data:", error);
        }
      };
      
      fetchMetaData();
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          search: debouncedQuery,
          sortBy
        });

        if (activeCategories.length > 0) params.append("categories", activeCategories.join(","));
        if (activeBadges.length > 0) params.append("badges", activeBadges.join(","));
        if (availabilityFilter === "inStock") params.append("inStock", "true");
        if (priceRange[0] > priceMin) params.append("minPrice", priceRange[0].toString());
        if (priceRange[1] < priceMax) params.append("maxPrice", priceRange[1].toString());

        const res = await api.get(`/api/products/get-product?${params.toString()}`);
        if (res.data.success) {
          setDbProducts(res.data.products);
          setTotalPages(res.data.totalPages);
          setTotalResults(res.data.totalProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [isOpen, debouncedQuery, activeCategories, activeBadges, availabilityFilter, priceRange, sortBy, page]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const toggleCategory = (cat: string) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleBadge = (badge: string) => {
    setActiveBadges((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
    );
  };

  // Count products per badge
  const badgeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of dbBadges) {
      counts[b] = dbProducts.filter((p) => p.badge === b).length;
    }
    return counts;
  }, [dbBadges, dbProducts]);

  const filtered = dbProducts;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "relevance", label: lang === "de" ? "Relevanz" : "Relevance" },
    { value: "price-asc", label: lang === "de" ? "Preis: aufsteigend" : "Price: low to high" },
    { value: "price-desc", label: lang === "de" ? "Preis: absteigend" : "Price: high to low" },
    { value: "rating", label: lang === "de" ? "Beste Bewertung" : "Top rated" },
    { value: "reviews", label: lang === "de" ? "Meiste Bewertungen" : "Most reviewed" },
  ];

  const activeFilterCount = activeCategories.length + activeBadges.length +
    (priceRange[0] > priceMin || priceRange[1] < priceMax ? 1 : 0) +
    (availabilityFilter !== "all" ? 1 : 0);

  const resetAll = () => {
    setQuery("");
    setActiveCategories([]);
    setActiveBadges([]);
    setPriceRange([priceMin, priceMax]);
    setSortBy("relevance");
    setAvailabilityFilter("all");
    setPage(1);
  };

  const getLabel = (prefix: string, value: string) => {
    const key = `${prefix}.${value}` as TranslationKey;
    const translated = t(key);
    return translated === key ? value : translated;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex flex-col"
        >
          {/* Header */}
          <div className="border-b border-border bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 lg:px-8 py-4">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={lang === "de" ? "Stoffe, Kategorien, Muster suchen..." : "Search fabrics, categories, patterns..."}
                  className="flex-1 bg-transparent text-foreground text-lg placeholder:text-muted-foreground focus:outline-none font-body"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-lg transition-colors relative ${showFilters ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                    aria-label="Toggle filters"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content: sidebar + results */}
          <div className="flex-1 overflow-hidden flex">
            {/* Sidebar filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.aside
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="hidden md:flex flex-col border-r border-border bg-background/60 overflow-hidden shrink-0"
                >
                  <div className="overflow-y-auto flex-1 p-5 space-y-6">
                    {/* Filter header */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">
                        {lang === "de" ? "Filter" : "Filter"}
                      </h3>
                      {activeFilterCount > 0 && (
                        <button onClick={resetAll} className="text-xs text-accent font-semibold hover:underline">
                          {lang === "de" ? "Zurücksetzen" : "Reset"}
                        </button>
                      )}
                    </div>

                    {/* Badge checkboxes (Dynamic) */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        {lang === "de" ? "Besonderheiten" : "Special Features"}
                      </p>
                      <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                        {dbBadges.map((badge) => {
                          const isActive = activeBadges.includes(badge);
                          const count = badgeCounts[badge] || 0;
                          return (
                            <label
                              key={badge}
                              className={`flex items-center gap-2.5 py-1.5 px-2 rounded-md cursor-pointer transition-colors text-sm ${
                                isActive ? "bg-accent/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                              }`}
                            >
                              <Checkbox
                                checked={isActive}
                                onCheckedChange={() => toggleBadge(badge)}
                                className="h-4 w-4"
                              />
                              <span className="flex-1 leading-tight">
                                {getLabel("badge", badge)}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-medium">
                                ({count})
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Category chips (Dynamic) */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {lang === "de" ? "Kategorie" : "Category"}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {dbCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                              activeCategories.includes(cat)
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-muted"
                            }`}
                          >
                            {getLabel("cat", cat)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price range */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {lang === "de" ? "Preis" : "Price"}
                        </p>
                        <span className="text-xs font-medium text-foreground">
                          {priceRange[0].toFixed(0)} € – {priceRange[1].toFixed(0)} €
                        </span>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min={priceMin}
                          max={priceMax}
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 1), priceRange[1]])}
                          className="w-full accent-accent h-1.5"
                        />
                        <input
                          type="range"
                          min={priceMin}
                          max={priceMax}
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 1)])}
                          className="w-full accent-accent h-1.5"
                        />
                      </div>
                    </div>

                    {/* Availability */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {lang === "de" ? "Verfügbarkeit" : "Availability"}
                      </p>
                      <div className="space-y-1.5">
                        <label className={`flex items-center gap-2.5 py-1.5 px-2 rounded-md cursor-pointer transition-colors text-sm ${
                          availabilityFilter === "all" ? "bg-accent/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}>
                          <Checkbox
                            checked={availabilityFilter === "all"}
                            onCheckedChange={() => setAvailabilityFilter("all")}
                            className="h-4 w-4"
                          />
                          <span>{lang === "de" ? "Alle anzeigen" : "Show all"}</span>
                        </label>
                        <label className={`flex items-center gap-2.5 py-1.5 px-2 rounded-md cursor-pointer transition-colors text-sm ${
                          availabilityFilter === "inStock" ? "bg-accent/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}>
                          <Checkbox
                            checked={availabilityFilter === "inStock"}
                            onCheckedChange={() => setAvailabilityFilter("inStock")}
                            className="h-4 w-4"
                          />
                          <span>{lang === "de" ? "Nicht ausverkauft" : "In stock"}</span>
                        </label>
                      </div>
                    </div>

                    {/* Sort */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        <ArrowUpDown className="w-3.5 h-3.5 inline mr-1" />
                        {lang === "de" ? "Sortieren" : "Sort by"}
                      </p>
                      <div className="space-y-1">
                        {sortOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setSortBy(opt.value)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              sortBy === opt.value
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Mobile filter bar */}
            <div className="md:hidden absolute top-[68px] left-0 right-0 z-10 border-b border-border bg-background/90 backdrop-blur-md">
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
                      {/* Badges (Dynamic) */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          {lang === "de" ? "Besonderheiten" : "Special Features"}
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          {dbBadges.map((badge) => {
                            const isActive = activeBadges.includes(badge);
                            const count = badgeCounts[badge] || 0;
                            return (
                              <label
                                key={badge}
                                className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer text-xs ${
                                  isActive ? "bg-accent/10 text-foreground" : "text-muted-foreground"
                                }`}
                              >
                                <Checkbox
                                  checked={isActive}
                                  onCheckedChange={() => toggleBadge(badge)}
                                  className="h-3.5 w-3.5"
                                />
                                <span className="truncate">{getLabel("badge", badge)} ({count})</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Categories (Dynamic) */}
                      <div className="flex flex-wrap gap-1.5">
                        {dbCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                              activeCategories.includes(cat)
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            {getLabel("cat", cat)}
                          </button>
                        ))}
                      </div>

                      {/* Price + Sort row */}
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">
                            {priceRange[0]}€ – {priceRange[1]}€
                          </p>
                          <input
                            type="range" min={priceMin} max={priceMax} value={priceRange[0]}
                            onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 1), priceRange[1]])}
                            className="w-full accent-accent h-1.5"
                          />
                          <input
                            type="range" min={priceMin} max={priceMax} value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 1)])}
                            className="w-full accent-accent h-1.5"
                          />
                        </div>
                      </div>

                      {activeFilterCount > 0 && (
                        <button onClick={resetAll} className="text-xs text-accent font-semibold">
                          {lang === "de" ? "Alle Filter zurücksetzen" : "Reset all filters"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              <div className="container mx-auto px-4 lg:px-8 py-6">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">
                    {totalResults} {lang === "de" ? "Ergebnisse" : "results"}
                    {query && (
                      <span>
                        {" "}{lang === "de" ? "für" : "for"} <strong className="text-foreground">"{query}"</strong>
                      </span>
                    )}
                  </p>
                  {activeFilterCount > 0 && (
                    <button onClick={resetAll} className="text-xs text-accent font-semibold hover:underline hidden md:block">
                      {lang === "de" ? "Alle Filter zurücksetzen" : "Reset all filters"}
                    </button>
                  )}
                </div>

                {/* Active filter tags */}
                {(activeBadges.length > 0 || activeCategories.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {activeBadges.map((badge) => (
                      <button
                        key={badge}
                        onClick={() => toggleBadge(badge)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-xs font-medium hover:bg-accent/25 transition-colors"
                      >
                        {getLabel("badge", badge)}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                    {activeCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 transition-colors"
                      >
                        {getLabel("cat", cat)}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

                {filtered.length === 0 ? (
                  <div className="text-center py-20">
                    <Search className="w-12 h-12 text-muted mx-auto mb-4" />
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      {lang === "de" ? "Keine Ergebnisse gefunden" : "No results found"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {lang === "de" ? "Versuchen Sie andere Suchbegriffe oder Filter" : "Try different search terms or filters"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filtered.map((product, i) => {
                        const wishlisted = isInWishlist(product._id);
                        return (
                          <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="group"
                          >
                            <Link
                              to={`/product/${product._id}`}
                              onClick={onClose}
                              className="block relative aspect-square rounded-xl overflow-hidden bg-secondary mb-2"
                            >
                              <img
                                src={product.images && product.images.length > 0 ? product.images[0] : ""}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {product.badge && (
                                <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                  {getLabel("badge", product.badge)}
                                </span>
                              )}
                              <button
                                 onClick={(e) => { e.preventDefault(); toggleItem(product); }}
                                 className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${
                                   wishlisted ? "bg-destructive text-destructive-foreground opacity-100" : "bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100"
                                 }`}
                              >
                                <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-current" : ""}`} />
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); addItem(product); }}
                                className="absolute bottom-2 right-2 bg-primary text-primary-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-elevated"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                              </button>
                            </Link>
                            <div className="space-y-0.5">
                              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                {getLabel("cat", product.category)}
                              </p>
                              <h3 className="font-body font-semibold text-foreground text-xs lg:text-sm leading-tight">
                                {product.name}
                              </h3>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-body font-bold text-foreground text-sm">{(product.salePrice || product.price).toFixed(2)} €</p>
                                  {product.width && (
                                    <p className="text-[10px] text-muted-foreground">{product.width}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-accent text-accent" />
                                  <span className="text-[10px] text-muted-foreground">{product.rating || 0}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-8 pb-4">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="px-4 py-2 text-sm font-semibold rounded-lg bg-secondary text-secondary-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {lang === "de" ? "Zurück" : "Previous"}
                        </button>
                        <span className="text-sm text-muted-foreground font-medium">
                          {lang === "de" ? "Seite" : "Page"} {page} {lang === "de" ? "von" : "of"} {totalPages}
                        </span>
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="px-4 py-2 text-sm font-semibold rounded-lg bg-secondary text-secondary-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {lang === "de" ? "Weiter" : "Next"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;