import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Plus, Pencil, Trash2, FolderOpen, GripVertical, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import api from "../../../api";
import axios from "axios";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  enabled: boolean;
}



const AdminCategories = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const [categories, setCategories] = useState<Category[]>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [togglingIds, setTogglingIds] = useState<string[]>([]);

  // ------------------- FETCH CATEGORIES -------------------
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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const resp = await api.get("/api/category/get-categories", {
        params: { page, limit },
      });

      const mapped = resp.data.categories.map((cat: any) => ({
        id: cat._id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        enabled: cat.enabled,
      }));

      setCategories(mapped);

      // Optional: if backend sends total count
      if (resp.data.pagination) {
        setTotalPages(resp.data.pagination.pages);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, limit]);


  const openNew = () => {
    setEditingCategory(null);
    setForm({ name: "", slug: "", description: "" });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    // setForm({ name: cat.name, slug: cat.slug, description: cat.description });
    setForm(cat)
    setDialogOpen(true);
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe").replace(/[üÜ]/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleNameChange = (name: string) => {
    setForm({ ...form, name, slug: editingCategory ? form.slug : generateSlug(name) });
  };

  const handleSave = async () => {
    if (saving) return;
    try {
      if (!form.name.trim()) {
        toast.error(de ? "Name ist erforderlich" : "Name is required");
        return;
      }

      setSaving(true);
      const { data } = await api.post("/api/category/save-category", form);

      toast.success(data.message);

      setDialogOpen(false);
      setForm({
        name: "",
        slug: "",
        description: "",
      });
      fetchCategories();

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.errors?.[0] ||
          err.response?.data?.message ||
          "Server error"
        );
      } else {
        toast.error("An unexpected error occurred");
        console.error(err);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (deletingIds.includes(id)) return;
    try {
      setDeletingIds(prev => [...prev, id]);
      await api.delete(`/api/category/delete-category/${id}`);
      toast.success(
        de ? `Kategorie "${name}" gelöscht` : `Category "${name}" deleted`
      );
      setCategories(prev => prev?.filter(cat => cat.id !== id));
    } catch (error) {
      console.error(error);
      toast.error(de ? "Löschen fehlgeschlagen" : "Delete failed");
    } finally {
      setDeletingIds(prev => prev.filter(x => x !== id));
      setDeleteConfirm(null);
    }
  };

  const toggleEnabled = async (id: string) => {
    if (togglingIds.includes(id)) return;
    try {
      setTogglingIds(prev => [...prev, id]);
      const resp = await api.patch(`/api/category/toggle-category/${id}`);
      if (resp.status === 200) {
        setCategories(prev =>
          prev?.map(cat => (cat.id === id ? { ...cat, enabled: resp.data.enabled } : cat))
        );
        toast.success(resp.data.enabled ? (de ? "Aktiviert" : "Enabled") : (de ? "Deaktiviert" : "Disabled"));
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to update");
      } else {
        toast.error("An unexpected error occurred");
        console.error(err);
      }
    } finally {
      setTogglingIds(prev => prev.filter(x => x !== id));
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {de ? "Kategorien" : "Categories"} <span className="text-muted-foreground font-body text-base"></span>
        </h2>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> {de ? "Neue Kategorie" : "New Category"}
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-4 animate-pulse">
                <div className="w-4 h-4 bg-muted rounded" />
                <div className="w-9 h-9 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="w-9 h-5 bg-muted rounded-full" />
                <div className="w-20 h-8 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {de ? "Keine Kategorien gefunden" : "No categories found"}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab flex-shrink-0" />
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{cat.description || "—"}</p>
                </div>
                {/* <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                  {cat.productCount} {de ? "Produkte" : "products"}
                </span> */}
                <label className={`relative inline-flex items-center flex-shrink-0 ${togglingIds.includes(cat.id) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                  <input
                    type="checkbox"
                    checked={cat.enabled}
                    onChange={() => toggleEnabled(cat.id)}
                    disabled={togglingIds.includes(cat.id)}
                    className="sr-only peer"
                  />
                  {togglingIds.includes(cat.id) ? (
                    <div className="w-9 h-5 flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-accent transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  )}
                </label>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(cat)}
                    disabled={deletingIds.includes(cat.id) || togglingIds.includes(cat.id)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={de ? "Bearbeiten" : "Edit"}
                  >
                    <Pencil className="w-4 h-4 text-accent" />
                  </button>
                  {deleteConfirm === cat.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        disabled={deletingIds.includes(cat.id)}
                        className="px-2 py-1 bg-destructive text-destructive-foreground rounded text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {deletingIds.includes(cat.id) ? (
                          <svg className="animate-spin h-3.5 w-3.5 text-destructive-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (de ? "Ja" : "Yes")}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        disabled={deletingIds.includes(cat.id)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(cat.id)}
                      disabled={deletingIds.includes(cat.id) || togglingIds.includes(cat.id)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={de ? "Löschen" : "Delete"}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center gap-2 mt-4 p-4">
            {/* Prev */}
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            {/* Page Numbers */}
            {getVisiblePages().map((p, idx) =>
              p === "..." ? (
                <span key={idx} className="px-2 py-1 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  disabled={loading}
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
              disabled={page === totalPages || loading}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !saving && setDialogOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? (de ? "Kategorie bearbeiten" : "Edit Category") : (de ? "Neue Kategorie" : "New Category")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Name" : "Name"}</label>
              <input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={saving}
                className={inputClass}
                placeholder={de ? "z.B. Seidenstoffe" : "e.g. Silk Fabrics"}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                disabled={saving}
                className={inputClass}
                placeholder="seidenstoffe"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">{de ? "Beschreibung" : "Description"}</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                disabled={saving}
                className={inputClass + " resize-none"}
                placeholder={de ? "Kurze Beschreibung der Kategorie" : "Short category description"}
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setDialogOpen(false)}
              disabled={saving}
              className="bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {de ? "Abbrechen" : "Cancel"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {de ? "Wird verarbeitet..." : "Processing..."}
                </>
              ) : (
                editingCategory ? (de ? "Speichern" : "Save") : (de ? "Erstellen" : "Create")
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
