import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { toast } from "sonner";
import api from "../../api";
import axios from "axios";
import { log } from "console";

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
      const newProducts = resp.data.products || resp.data;
      const newTotalPages = resp.data.totalPages ? Number(resp.data.totalPages) : 1;
      
      console.log("FETCH RESPONSE:", {
        activeCategory,
        isDataArray: Array.isArray(resp.data),
        totalPagesInResponse: resp.data.totalPages,
        newTotalPages
      });

      setproducts(newProducts);
      setTotalPages(newTotalPages);

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

// console.log("RENDER ProductGrid: page=", page, "totalPages=", totalPages);



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
                onClick={() => {
                  setActiveCategory("all");
                  setPage(1);
                }}
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
                onClick={() => {
                  setActiveCategory(cat.name);
                  setPage(1);
                }}
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
      {totalPages > 1 && (
        <div translate="no" className="flex flex-wrap items-center justify-left gap-4 mt-8 mb-4">
  <button
    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
    disabled={page === 1}
    className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
  >
    Prev
  </button>

  <span key={totalPages + "-" + page} className="text-sm font-medium text-gray-700">
    Shop Page: {page} / {totalPages}
  </span>

  <button
    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
    disabled={page === totalPages || totalPages === 0}
    className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
  >
    Next
  </button>
  
  <div className="flex items-center gap-2 ml-4">
    <span className="text-sm text-gray-600">Go to:</span>
    <input
      key={page}
      type="number"
      min={1}
      max={totalPages}
      defaultValue={page}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          const val = parseInt(e.currentTarget.value);
          if (!isNaN(val) && val >= 1 && val <= totalPages) {
            setPage(val);
          }
        }
      }}
      onBlur={(e) => {
        const val = parseInt(e.currentTarget.value);
        if (!isNaN(val) && val >= 1 && val <= totalPages) {
          setPage(val);
        }
      }}
      className="w-16 px-2 py-1 border rounded text-center outline-none"
    />
  </div>
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
