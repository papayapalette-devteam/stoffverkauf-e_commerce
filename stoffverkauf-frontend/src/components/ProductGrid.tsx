import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { toast } from "sonner";
import api from "../../api";
import axios from "axios";

const ProductGrid = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { t } = useI18n();


  // all categories

  interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  enabled: boolean;
}

  const [categories, setCategories] = useState<Category[]>();
    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const resp = await api.get("/api/category/get-categories");
        
          
  
          const mapped = resp.data.categories.map((cat) => ({
            id: cat._id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            enabled: cat.enabled,
          }));
  
          setCategories(mapped);
  
         
  
        } catch (err: unknown) {
          if (axios.isAxiosError(err)) {
            toast.error(
              err.response?.data?.message || "Failed to fetch categories"
            );
          } else {
            toast.error("An unexpected error occurred while fetching categories");
            console.error(err);
          }
        }
      };
  
      fetchCategories();
    }, []);


// all products

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
      let resp;

      if (activeCategory === "all") {
        // Fetch all products
        resp = await api.get("/api/products/get-product", {
          params: { page, limit },
        });
      } else {
        // Fetch products by category
        resp = await api.get(`/api/products/get-product-by-category/${activeCategory}`, {
          params: { page, limit },
        });
      }

      // Update products state
      setproducts(resp.data.products || resp.data);
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
}, [activeCategory, page, limit]);


 



  return (
    <section id="shop" className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
              {t("grid.title")}
            </h2>
            <p className="text-muted-foreground mt-2 font-body">
              {t("grid.subtitle")}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">

              <button
    onClick={() => setActiveCategory("all") }
    className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
      activeCategory === "all"
        ? "bg-primary text-primary-foreground"
        : "bg-secondary text-secondary-foreground hover:bg-muted"
    }`}
  >
    {"all"}
  </button>

            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  activeCategory === cat.name
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {t(`${cat.name}` as TranslationKey)}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {products?.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </motion.div>
      </div>
              <div className="flex items-center gap-2 mt-4 p-4" style={{ display: totalPages <= 1 ? "none" : "flex" }}>

  {/* Prev */}
  <button
    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
    disabled={page === 1}
    className="px-3 py-1 border rounded disabled:opacity-50"
  >
    Prev
  </button>

  {/* Page Numbers */}
 {getVisiblePages().map((p, idx) =>
  p === "..." ? (
    <span key={`dots-${idx}`} className="px-2 py-1 text-gray-500">
      ...
    </span>
  ) : (
    <button
      key={`page-${p}`}   // ✅ stable unique key
      onClick={() => setPage(p as number)}
      className={`px-3 py-1 border rounded ${
        page === p ? "bg-[#5C00B3] text-white" : ""
      }`}
    >
      {p}
    </button>
  )
)}

  {/* Next */}
  <button
    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
    disabled={page === totalPages}
    className="px-3 py-1 border rounded disabled:opacity-50"
  >
    Next
  </button>
</div>
    </section>
  );
};

export default ProductGrid;
