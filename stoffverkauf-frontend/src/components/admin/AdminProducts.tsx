import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Plus, Search, Pencil, Trash2, Eye, Upload, FileText, Tag, Palette, ChevronDown, ChevronUp, Link2, Loader2, Globe, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "../../../api";
import axios from "axios";
import { uploadFiles } from "@/lib/upload_images";
import * as XLSX from "xlsx";


interface ProductVariant {
  color: string;
  pattern: string;
  size: string;
  stock: number;
}

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

interface Csvrow {
  name: string;
  price: number;
  salePrice?: number; // optional number
  category: string;
  badge: string;
  width: string;
  stockQty: number;
  composition: string;
  description: string;
}

const emptyForm: ProductForm = {
  _id:"",name: "", price: 0, salePrice: 0, category: "Flanell", badge: "", width: "140 cm",
  inStock: true, stockQty: "50", composition: "", description: "",images:[],
  seoTitle: "", seoDescription: "", seoKeywords: "",
  variants: [],rating:0,reviews:0
};

// interface ScrapedProduct {
//   name: string;
//   price: string;
//   category: string;
//   description: string;
//   composition: string;
//   width: string;
//   imageUrl: string;
//   source: string;
// }

const AdminProducts = () => {
  const { lang } = useI18n();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [activeFormTab, setActiveFormTab] = useState<"basic" | "seo" | "variants">("basic");
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showUrlImport, setShowUrlImport] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  // const [scrapedProducts, setScrapedProducts] = useState<ScrapedProduct[]>([]);
  const [scrapeError, setScrapeError] = useState("");
  const de = lang === "de";

  
  // get all categories

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  enabled: boolean;
}

  
 const [categories, setcategories] = useState<Category[]>();
  useEffect(() => {
    const fetchCategoires = async () => {
      try {
         const resp = await api.get("/api/category/get-categories");

          setcategories(resp.data.categories);

        // Optional: if backend sends total count
        if (resp.data) {
          setTotalPages(resp.data.totalPages);
        }

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

    fetchCategoires();
  }, []);

   
  // const filtered = products.filter((p) => {
  //   const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
  //   const matchCat = categoryFilter === "all" || p.category === categoryFilter;
  //   return matchSearch && matchCat;
  // });

  const handleEdit = (p: typeof products[0]) => {
    setForm(p);
    // setEditingId(p._id);
    setShowForm(true);
    setActiveFormTab("basic");
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

const [products, setproducts] = useState<ProductForm[]>([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const resp = await api.get("/api/products/get-product", {
          params: { page, limit,search },
        });

        setproducts(resp.data.products);


        // Optional: if backend sends total count
        if (resp.data) {
          setTotalPages(resp.data.totalPages);
        }

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

    fetchProducts();
  }, [page, limit,search]);

// upload images

  const [uploading, setUploading] = useState(false);
  const handleUploadFiles = async (files: File[]) => {
  try {
    setUploading(true);

    const urls = await uploadFiles(files); // reusable function

    setForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...urls],
    }));

    toast.success(de ? "Bilder hochgeladen" : "Images uploaded");

  }catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          toast.error(
            err.response?.data?.message || "Failed to fetch categories"
          );
        } else {
          toast.error("An unexpected error occurred while fetching categories");
          console.error(err);
        }
      } finally {
    setUploading(false);
  }
};

const removeImage = (index: number) => {
  setForm((prev) => ({
    ...prev,
    images: prev.images.filter((_, i) => i !== index),
  }));
};

  const handleSave = async() => {

    try {
        const response = await api.post("/api/products/add-product",form);

        toast.success(form._id ? (de ? "Produkt aktualisiert" : "Product updated") : (de ? "Produkt erstellt" : "Product created"));
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
      
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // Axios error
        toast.error(
          err.response?.data?.errors?.[0] ||
          err.response?.data?.message ||
          "Server error"
        );
      } else {
        // Non-Axios / unknown error
        toast.error("An unexpected error occurred");
        console.error(err);
      }
    };

  };

const handleDelete = async (id: string, name: string) => {
  const confirmDelete = window.confirm(
    de
      ? `Möchten Sie "${name}" wirklich löschen?`
      : `Are you sure you want to delete "${name}"?`
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/api/products/delete-product/${id}`);

    toast.success(
      de ? `"${name}" gelöscht` : `"${name}" deleted`
    );

    // remove from UI (important)
    setproducts((prev) => prev.filter((p) => p._id !== id));

  }catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // Axios error
        toast.error(
          err.response?.data?.errors?.[0] ||
          err.response?.data?.message ||
          "Server error"
        );
      } else {
        // Non-Axios / unknown error
        toast.error("An unexpected error occurred");
        console.error(err);
      }
    };
};
  const addVariant = () => {
    setForm({ ...form, variants: [...form.variants, { color: "", pattern: "", size: "", stock: 0 }] });
  };

  const updateVariant = (idx: number, field: keyof ProductVariant, value: string | number) => {
    const updated = form.variants.map((v, i) => i === idx ? { ...v, [field]: value } : v);
    setForm({ ...form, variants: updated });
  };

  const removeVariant = (idx: number) => {
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== idx) });
  };

  // const handleUrlScrape = async () => {
  //   if (!importUrl.trim()) {
  //     setScrapeError(de ? "Bitte geben Sie eine URL ein" : "Please enter a URL");
  //     return;
  //   }
    
  //   setScrapeError("");
  //   setIsScrapingUrl(true);
  //   setScrapedProducts([]);

  //   // Simulate scraping delay
  //   await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));

  //   try {
  //     // Extract domain for display
  //     const url = new URL(importUrl.trim().startsWith("http") ? importUrl.trim() : `https://${importUrl.trim()}`);
  //     const domain = url.hostname.replace("www.", "");

  //     // Detect if it's a category page (multiple products) or single product
  //     const isCategory = url.pathname.includes("category") || url.pathname.includes("collection") || url.pathname.includes("shop") || url.pathname.includes("stoffe") || url.pathname.split("/").filter(Boolean).length <= 2;

  //     const fabricNames = [
  //       "Premium Wollstoff Melange", "Italienischer Seidenstoff", "Bio-Baumwolle Jacquard",
  //       "Feiner Kaschmirstoff", "Leinen-Viskose Mix", "Designer Bouclé Tweed",
  //       "Stretch Jersey Milano", "Flanell Fischgrät Premium", "Organza Seidenmix",
  //     ];
  //     const cats = ["Flanell", "Schurwolle", "Leinen", "Jersey", "Bouclé", "Baumwollstoffe", "Designer"];
  //     const compositions = ["100% Schurwolle", "80% Wolle, 20% Polyamid", "100% Leinen", "95% Baumwolle, 5% Elasthan", "70% Viskose, 30% Seide"];
  //     const widths = ["140 cm", "150 cm", "145 cm", "155 cm", "160 cm"];

  //     const count = isCategory ? 3 + Math.floor(Math.random() * 5) : 1;
  //     const results: ScrapedProduct[] = Array.from({ length: count }, (_, i) => ({
  //       name: fabricNames[Math.floor(Math.random() * fabricNames.length)] + (count > 1 ? ` ${i + 1}` : ""),
  //       price: (19.9 + Math.random() * 80).toFixed(2),
  //       category: cats[Math.floor(Math.random() * cats.length)],
  //       description: de
  //         ? `Hochwertiger Stoff importiert von ${domain}. Weicher Griff, ideal für verschiedene Nähprojekte.`
  //         : `High-quality fabric imported from ${domain}. Soft hand feel, ideal for various sewing projects.`,
  //       composition: compositions[Math.floor(Math.random() * compositions.length)],
  //       width: widths[Math.floor(Math.random() * widths.length)],
  //       imageUrl: "/placeholder.svg",
  //       source: domain,
  //     }));

  //     setScrapedProducts(results);
  //     toast.success(
  //       de
  //         ? `${results.length} Produkt${results.length > 1 ? "e" : ""} von ${domain} gefunden`
  //         : `${results.length} product${results.length > 1 ? "s" : ""} found from ${domain}`
  //     );
  //   } catch {
  //     setScrapeError(de ? "Ungültige URL. Bitte überprüfen Sie die Eingabe." : "Invalid URL. Please check your input.");
  //   } finally {
  //     setIsScrapingUrl(false);
  //   }
  // };

  // const handleImportScrapedProduct = (sp: ScrapedProduct) => {
  //   setForm({
  //     ...emptyForm,
  //     name: sp.name,
  //     price: Number(sp.price),
  //     category: sp.category,
  //     description: sp.description,
  //     composition: sp.composition,
  //     width: sp.width,
  //     seoTitle: sp.name,
  //     seoDescription: sp.description.slice(0, 160),
  //   });
  //   setEditingId(null);
  //   setShowForm(true);
  //   setShowUrlImport(false);
  //   setActiveFormTab("basic");
  //   toast.info(de ? "Produktdaten übernommen – bitte prüfen und speichern" : "Product data imported – please review and save");
  // };

  // const handleImportAllScraped = () => {
  //   toast.success(
  //     de
  //       ? `${scrapedProducts.length} Produkte zur Liste hinzugefügt (Demo)`
  //       : `${scrapedProducts.length} products added to list (Demo)`
  //   );
  //   setScrapedProducts([]);
  //   setShowUrlImport(false);
  //   setImportUrl("");
  // };

  const formTabClass = (tab: typeof activeFormTab) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeFormTab === tab ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`;

  const inputClass = "w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent";


  // bulk import products

  const [parsedProducts, setParsedProducts] = useState<Csvrow[]>([]);

   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json<Csvrow>(sheet);

const products: Csvrow[] = jsonData.map((row) => ({
  name: row.name,
  price: Number(row.price),
  salePrice: row.salePrice ? Number(row.salePrice) : undefined,
  category: row.category,
  badge: row.badge || "",
  width: row.width || "",
  composition: row.composition || "",
  description: row.description || "",
  stockQty: row.stockQty ? Number(row.stockQty) : 0,
}));

      setParsedProducts(products);

      toast.success(
        de
          ? `${products.length} Produkte geladen`
          : `${products.length} products loaded`
      );
    };

    reader.readAsBinaryString(file);
  };


const [isLoading, setIsLoading] = useState(false);
  // ✅ Call API
 const handleImport = async () => {
  if (parsedProducts.length === 0) {
    toast.error(de ? "Keine Daten geladen" : "No data loaded");
    return;
  }

  try {
    setIsLoading(true)
    // ✅ Send as { products: [...] } to match backend
    const res = await api.post("api/products/bulk-upload", {
      products: parsedProducts,
    });

    // ✅ Extract data from response
    const data = res.data;

    toast.success(
      de
        ? `${data.count} Produkte importiert`
        : `${data.count} products imported`
    );

    setParsedProducts([]);
    setShowBulkImport(false);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Something went wrong";

    toast.error(de ? "Import fehlgeschlagen" : message);
  }finally
  {
    setIsLoading(false)
  }
};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {de ? "Produkte" : "Products"} <span className="text-muted-foreground font-body text-base"></span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={de ? "Produkte suchen..." : "Search products..."}
              className="pl-10 pr-4 py-2 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent w-48"
            />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent">
            <option value="all">{de ? "Alle Kategorien" : "All Categories"}</option>
            {/* {categories?.map(c => <option key={c} value={c}>{c}</option>)} */}
          </select>
          <button
            onClick={() => setShowBulkImport(!showBulkImport)}
            className="flex items-center gap-2 bg-secondary text-foreground px-3 py-2 rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
          >
            <FileText className="w-4 h-4" /> {de ? "CSV Import" : "CSV Import"}
          </button>
          <button
            // onClick={() => { setShowUrlImport(!showUrlImport); setScrapedProducts([]); setScrapeError(""); setImportUrl(""); }}
            className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-2 rounded-lg text-sm font-semibold hover:bg-accent/20 transition-colors border border-accent/30"
          >
            <Link2 className="w-4 h-4" /> {de ? "URL Import" : "URL Import"}
          </button>
          <button
            onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); setActiveFormTab("basic"); }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> {de ? "Neues Produkt" : "New Product"}
          </button>
        </div>
      </div>

      {/* Bulk CSV Import */}
 {showBulkImport && (
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-card">
    <h3 className="font-display text-base font-bold text-foreground mb-3">
      {de ? "Massenimport via CSV/Excel" : "Bulk Import via CSV/Excel"}
    </h3>

    <p className="text-sm text-muted-foreground mb-4">
      {de
        ? "Laden Sie eine CSV-Datei mit Spalten: Name, Preis, Kategorie, Badge, Breite, AufLager (1/0)"
        : "Upload a CSV file with columns: Name, Price, Category, Badge, Width, InStock (1/0)"}
    </p>

    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center mb-4">
      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />

      <p className="text-sm text-muted-foreground mb-2">
        {de ? "CSV oder Excel-Datei hier ablegen" : "Drop CSV or Excel file here"}
      </p>

      {/* ✅ Hidden File Input */}
      <input
        type="file"
        accept=".csv, .xlsx, .xls"
        onChange={handleFileUpload}
        className="hidden"
        id="bulkFileInput"
      />

      {/* ✅ Button linked to input */}
      <label
        htmlFor="bulkFileInput"
        className="cursor-pointer text-xs bg-secondary text-foreground px-4 py-2 rounded-lg font-semibold hover:bg-muted"
      >
        {de ? "Datei auswählen" : "Choose File"}
      </label>
    </div>

    <div className="flex gap-3">
<button
  onClick={handleImport}
  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"

>

  {de ? "Importieren" : "Import"}
</button>

     <button
  onClick={() => {
   const csvContent =
  "name,price,salePrice,category,badge,width,composition,description,stockQty\n" +
  "Beispiel Stoff,49.90,39.90,Flanell,Bestseller,140 cm,Baumwolle,Weicher Stoff,10\n" +
  "Leinen Stoff,39.90,39.39,Leinen,Premium,150 cm,Leinen,Leichter Stoff,5\n";
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "product-template.csv";
    link.click();

    URL.revokeObjectURL(url);

    toast.success(
      de ? "Vorlage heruntergeladen" : "Template downloaded"
    );
  }}
  className="bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
>
  {de ? "Vorlage herunterladen" : "Download Template"}
</button>
    </div>
  </motion.div>
)}

      {/* URL Import */}
      {/* {showUrlImport && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                {de ? "Produkte per URL importieren" : "Import Products via URL"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {de 
                  ? "Fügen Sie eine Produkt- oder Kategorie-URL ein, um Produktdaten automatisch zu übernehmen" 
                  : "Paste a product or category URL to automatically extract product data"}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={importUrl}
                onChange={(e) => { setImportUrl(e.target.value); setScrapeError(""); }}
                placeholder={de ? "https://beispiel.de/stoffe/flanell..." : "https://example.com/fabrics/flannel..."}
                className="w-full pl-10 pr-4 py-3 bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                onKeyDown={(e) => e.key === "Enter" && handleUrlScrape()}
              />
            </div>
            <button
              onClick={handleUrlScrape}
              disabled={isScrapingUrl}
              className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-3 rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {isScrapingUrl ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {de ? "Scanne..." : "Scanning..."}
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  {de ? "Scannen" : "Scan"}
                </>
              )}
            </button>
          </div>

          {scrapeError && (
            <div className="flex items-center gap-2 text-destructive text-sm mb-4 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {scrapeError}
            </div>
          )}

          {isScrapingUrl && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{de ? "Seite wird analysiert..." : "Analyzing page..."}</p>
              <p className="text-xs text-muted-foreground mt-1">{de ? "Produktdaten werden extrahiert" : "Extracting product data"}</p>
            </div>
          )}

          {scrapedProducts.length > 0 && !isScrapingUrl && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  {de 
                    ? `${scrapedProducts.length} Produkt${scrapedProducts.length > 1 ? "e" : ""} gefunden` 
                    : `${scrapedProducts.length} product${scrapedProducts.length > 1 ? "s" : ""} found`}
                </p>
                {scrapedProducts.length > 1 && (
                  <button
                    onClick={handleImportAllScraped}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    {de ? "Alle importieren" : "Import All"}
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {scrapedProducts.map((sp, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg border border-border hover:bg-secondary transition-colors">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{sp.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="font-semibold text-foreground">{sp.price} €/m</span>
                        <span>{sp.category}</span>
                        <span>{sp.composition}</span>
                        <span className="text-accent">{sp.source}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleImportScrapedProduct(sp)}
                      className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-accent/20 transition-colors flex-shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      {de ? "Übernehmen" : "Import"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  💡 {de 
                    ? "Klicken Sie 'Übernehmen', um die Daten in das Produktformular zu laden und vor dem Speichern zu prüfen." 
                    : "Click 'Import' to load the data into the product form for review before saving."}
                </p>
              </div>
            </div>
          )}

          {!isScrapingUrl && scrapedProducts.length === 0 && !scrapeError && (
            <div className="bg-secondary/30 rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-2">
                {de ? "Unterstützte URL-Typen:" : "Supported URL types:"}
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• {de ? "Einzelne Produktseiten → importiert 1 Produkt" : "Single product pages → imports 1 product"}</li>
                <li>• {de ? "Kategorie-/Shop-Seiten → importiert mehrere Produkte" : "Category/shop pages → imports multiple products"}</li>
                <li>• {de ? "Funktioniert mit allen gängigen Stoff- und Mode-Shops" : "Works with all common fabric and fashion shops"}</li>
              </ul>
              <p className="text-xs text-accent mt-3 font-medium">
                ⚡ {de 
                  ? "Demo-Modus: Für echtes Scraping kann Lovable Cloud aktiviert werden" 
                  : "Demo mode: For real scraping, enable Lovable Cloud"}
              </p>
            </div>
          )}
        </motion.div>
      )} */}


      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-foreground">
              {editingId ? (de ? "Produkt bearbeiten" : "Edit Product") : (de ? "Neues Produkt" : "New Product")}
            </h3>
            <div className="flex gap-1">
              <button onClick={() => setActiveFormTab("basic")} className={formTabClass("basic")}>{de ? "Allgemein" : "General"}</button>
              <button onClick={() => setActiveFormTab("seo")} className={formTabClass("seo")}>SEO</button>
              <button onClick={() => setActiveFormTab("variants")} className={formTabClass("variants")}>{de ? "Varianten" : "Variants"}</button>
            </div>
          </div>

          {activeFormTab === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Produktname" : "Product Name"}</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Regulärer Preis (€/m)" : "Regular Price (€/m)"}</label>
                  <input value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} type="number" step="0.01" className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Angebotspreis (€/m)" : "Sale Price (€/m)"}</label>
                  <input value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })} type="number" step="0.01" placeholder={de ? "Leer = kein Angebot" : "Empty = no sale"} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Kategorie" : "Category"}</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                    {categories?.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Badge</label>
                  <select value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className={inputClass}>
                    <option value="">{de ? "Kein Badge" : "No Badge"}</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="Premium">Premium</option>
                    <option value="Neu">{de ? "Neu" : "New"}</option>
                    <option value="Angebot">{de ? "Angebot" : "Sale"}</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Stoffbreite" : "Fabric Width"}</label>
                  <input value={form.width} onChange={(e) => setForm({ ...form, width: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Zusammensetzung" : "Composition"}</label>
                  <input value={form.composition} onChange={(e) => setForm({ ...form, composition: e.target.value })} placeholder="100% Wolle" className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Lagerbestand (m)" : "Stock (m)"}</label>
                  <input value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: e.target.value })} type="number" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{de ? "Beschreibung" : "Description"}</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={inputClass + " resize-none"} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} className="w-4 h-4 rounded accent-accent" />
                <label className="text-sm font-medium text-foreground">{de ? "Auf Lager" : "In Stock"}</label>
              </div>
<div
  className={`mt-4 p-4 border-2 border-dashed border-border rounded-xl text-center cursor-pointer transition relative ${
    uploading ? "opacity-60 pointer-events-none" : "hover:bg-secondary/30"
  }`}
  onClick={() => !uploading && document.getElementById("fileInput")?.click()}
  onDragOver={(e) => e.preventDefault()}
  onDrop={async (e) => {
    e.preventDefault();
    if (uploading) return;
    const files = Array.from(e.dataTransfer.files);
    await handleUploadFiles(files);
  }}
>
  {/* Loader overlay */}
  {uploading && (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 rounded-xl z-10">
      <Loader2 className="w-6 h-6 animate-spin text-accent mb-2" />
      <p className="text-xs text-muted-foreground">
        {de ? "Wird hochgeladen..." : "Uploading..."}
      </p>
    </div>
  )}

  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />

  <p className="text-sm text-muted-foreground">
    {de
      ? "Bilder per Drag & Drop hinzufügen oder klicken"
      : "Drag & drop images or click to upload"}
  </p>

  <p className="text-xs text-muted-foreground mt-1">
    {de
      ? "Mehrere Bilder möglich (JPG, PNG, WebP)"
      : "Multiple images supported (JPG, PNG, WebP)"}
  </p>

  {/* Hidden input */}
  <input
    id="fileInput"
    type="file"
    multiple
    accept="image/*"
    className="hidden"
    onChange={async (e) => {
      if (!e.target.files) return;
      const files = Array.from(e.target.files);
      await handleUploadFiles(files);
    }}
  />
</div>

{form.images?.length > 0 && (
  <div className="flex gap-3 mt-4 flex-wrap">
    {form.images.map((img, i) => (
      <div key={i} className="relative">
        <img
          src={img}
          className="w-20 h-20 object-cover rounded-lg border"
        />

        <button
          onClick={() => removeImage(i)}
          className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full px-1"
        >
          ✕
        </button>
      </div>
    ))}
  </div>
)}
            </div>
          )}

          {activeFormTab === "seo" && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-3 border border-border mb-2">
                <p className="text-xs text-muted-foreground">{de ? "SEO-Felder helfen, das Produkt in Suchmaschinen besser sichtbar zu machen." : "SEO fields help improve product visibility in search engines."}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{de ? "SEO-Titel (max. 60 Zeichen)" : "SEO Title (max. 60 chars)"}</label>
                <input value={form.seoTitle} onChange={e => setForm({ ...form, seoTitle: e.target.value })} maxLength={60} className={inputClass} />
                {/* <p className="text-xs text-muted-foreground mt-1">{form?.seoTitle?.length}/60</p> */}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{de ? "Meta-Beschreibung (max. 160 Zeichen)" : "Meta Description (max. 160 chars)"}</label>
                <textarea value={form.seoDescription} onChange={e => setForm({ ...form, seoDescription: e.target.value })} rows={3} maxLength={160} className={inputClass + " resize-none"} />
                {/* <p className="text-xs text-muted-foreground mt-1">{form?.seoDescription?.length}/160</p> */}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{de ? "Keywords (kommagetrennt)" : "Keywords (comma-separated)"}</label>
                <input value={form.seoKeywords} onChange={e => setForm({ ...form, seoKeywords: e.target.value })} placeholder="Flanell, Schurwolle, Meterware" className={inputClass} />
              </div>
              {/* Preview */}
              <div className="bg-secondary/50 border border-border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">{de ? "Google-Vorschau:" : "Google Preview:"}</p>
                <p className="text-sm font-semibold text-blue-600">{form.seoTitle || form.name || (de ? "Produkttitel" : "Product Title")}</p>
                <p className="text-xs text-green-700">stoffverkauf-weber.de/product/...</p>
                <p className="text-xs text-muted-foreground mt-1">{form.seoDescription || (de ? "Meta-Beschreibung..." : "Meta description...")}</p>
              </div>
            </div>
          )}

          {activeFormTab === "variants" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{de ? "Fügen Sie Varianten wie Farben, Muster und Breiten hinzu." : "Add variants like colors, patterns, and widths."}</p>
              {form.variants.map((v, idx) => (
                <div key={idx} className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-secondary/50 rounded-lg border border-border">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1"><Palette className="inline w-3 h-3 mr-1" />{de ? "Farbe" : "Color"}</label>
                    <input value={v.color} onChange={e => updateVariant(idx, "color", e.target.value)} placeholder={de ? "z.B. Dunkelblau" : "e.g. Navy Blue"} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1"><Tag className="inline w-3 h-3 mr-1" />{de ? "Muster" : "Pattern"}</label>
                    <input value={v.pattern} onChange={e => updateVariant(idx, "pattern", e.target.value)} placeholder={de ? "z.B. Gestreift" : "e.g. Striped"} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">{de ? "Breite" : "Width"}</label>
                    <input value={v.size} onChange={e => updateVariant(idx, "size", e.target.value)} placeholder="140 cm" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">{de ? "Bestand (m)" : "Stock (m)"}</label>
                    <div className="flex gap-1">
                      <input type="number" value={v.stock} onChange={e => updateVariant(idx, "stock", Number(e.target.value))} className={inputClass} />
                      <button onClick={() => removeVariant(idx)} className="px-2 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 flex-shrink-0">✕</button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addVariant} className="flex items-center gap-2 text-sm text-accent border border-accent/30 px-4 py-2 rounded-lg hover:bg-accent/10 transition-colors">
                <Plus className="w-4 h-4" /> {de ? "Variante hinzufügen" : "Add Variant"}
              </button>
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-4 border-t border-border">
            <button onClick={handleSave} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
              {de ? "Speichern" : "Save"}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="bg-secondary text-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
              {de ? "Abbrechen" : "Cancel"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Products Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Produkt" : "Product"}</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">{de ? "Kategorie" : "Category"}</th>
                <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Preis" : "Price"}</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden lg:table-cell">{de ? "Bewertung" : "Rating"}</th>
                <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">Status</th>
                <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Aktionen" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p?.images?.length ? p.images[0] : "/placeholder.svg"} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-secondary flex-shrink-0" />
                      <div>
                        <span className="font-medium text-foreground block">{p.name}</span>
                        {p.badge && <span className="text-[10px] text-accent font-bold uppercase">{p.badge}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">{p.category}</td>
                  <td className="p-4 text-foreground font-semibold">{p.price.toFixed(2)} €</td>
                  <td className="p-4 text-muted-foreground hidden lg:table-cell">⭐ {p.rating} ({p.reviews})</td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.inStock !== false ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}>
                      {p.inStock !== false ? (de ? "Auf Lager" : "In Stock") : (de ? "Vergriffen" : "Out of Stock")}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => window.open(`/product/${p._id}`, "_blank")} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Ansehen" : "View"}>
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleEdit(p)} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Bearbeiten" : "Edit"}>
                        <Pencil className="w-4 h-4 text-accent" />
                      </button>
                      <button onClick={() => handleDelete(p._id,p.name)} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Löschen" : "Delete"}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 mt-4 p-4">

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
      </div>

         {isLoading && (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 rounded-xl z-10">
      <Loader2 className="w-6 h-6 animate-spin text-accent mb-2" />
      <p className="text-xs text-muted-foreground">
        {de ? "Wird hochgeladen..." : "Uploading..."}
      </p>
    </div>
  )} 
    </div>
  );
};

export default AdminProducts;
