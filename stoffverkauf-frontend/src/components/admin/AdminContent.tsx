import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { GripVertical, ImageIcon, Plus, Pencil, Trash2, X, Eye } from "lucide-react";
import { toast } from "sonner";
import AdminPageEditor from "./AdminPageEditor";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { uploadFiles } from "@/lib/upload_images";
import api from "../../../api";
import axios from "axios";

const mockSections = [
  { id: "hero", type: "hero", title: "Hero Banner", enabled: true },
  { id: "features", type: "features", title: "Features Bar", enabled: true },
  { id: "categories", type: "categories", title: "Category Showcase", enabled: true },
  { id: "bestseller", type: "carousel", title: "Bestseller Carousel", enabled: true },
  { id: "products", type: "grid", title: "Product Grid", enabled: true },
  { id: "offer", type: "banner", title: "Offer Banner", enabled: true },
  { id: "why", type: "info", title: "Why Choose Us", enabled: true },
  { id: "testimonials", type: "testimonials", title: "Testimonials", enabled: true },
  { id: "newsletter", type: "newsletter", title: "Newsletter", enabled: true },
];

interface BlogPost {
  _id: string;
  title: string;
  status: "published" | "draft";
  date: string;
  excerpt: string;
  content: string;
  image?: string;
}

const emptyPost: Omit<BlogPost, "_id"> = { 
  title: "", 
  status: "draft", 
  date: new Date().toISOString().split("T")[0], 
  excerpt: "", 
  content: "",
  image: "" 
};


const AdminContent = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const [activeTab, setActiveTab] = useState<"sections" | "hero" | "blog" | "pages">("pages");
  const [sections, setSections] = useState<any[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [heroForm, setHeroForm] = useState<any>({
    badge: "",
    title1: "",
    title2: "",
    subtitle: "",
    cta1: "",
    cta2: "",
    images: [] // array of image URLs
  });

  // Blog state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postForm, setPostForm] = useState<Omit<BlogPost, "_id">>(emptyPost);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [uploading, setUploading] = useState(false);


  const fetchSections = async () => {
    try {
      setLoadingSections(true);
      const res = await api.get("/api/home-sections");
      setSections(res.data);
    } catch (err) {
      console.error("Failed to fetch sections", err);
    } finally {
      setLoadingSections(false);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      const res = await api.get("/api/home-sections");
      const hero = res.data.find((s: any) => s.id === "hero");
      if (hero && hero.data) {
        setHeroForm(hero.data);
      }
    } catch (err) {
      console.error("Failed to fetch hero data", err);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setUploading(true);
      const urls = await uploadFiles(Array.from(files));
      if (urls && urls.length > 0) {
        setHeroForm((prev: any) => ({
          ...prev,
          images: [...(prev.images || []), ...urls]
        }));
        toast.success(de ? "Bilder hochgeladen" : "Images uploaded");
      }
    } catch (err) {
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeHeroImage = (index: number) => {
    setHeroForm((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index)
    }));
  };

  const saveHeroData = async () => {
    try {
      await api.put("/api/home-sections/hero", {
        data: heroForm,
        title: "Hero Banner",
        type: "hero"
      });
      toast.success(de ? "Hero aktualisiert" : "Hero updated");
    } catch (err) {
      toast.error("Failed to save hero data");
    }
  };

  const toggleSection = async (id: string, currentStatus: boolean) => {
    try {
        const res = await api.put(`/api/home-sections/${id}`, { enabled: !currentStatus });
        setSections((prev) => prev.map((s) => s.id === id ? res.data : s));
        toast.success(de ? "Sektion aktualisiert" : "Section updated");
    } catch (err) {
        toast.error("Failed to update section");
    }
  };



  // Blog handlers
  const openNewPost = () => {
    setEditingPost(null);
    setPostForm({ ...emptyPost, date: new Date().toISOString().split("T")[0] });
    setBlogDialogOpen(true);
  };

  const openEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setPostForm(post);
    setBlogDialogOpen(true);
  };





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


const handleGetPosts = async () => {
  try {
    const res = await api.get("api/blog/get-blogs",{params:{page,limit}});

    const data = res.data.posts
;

    setBlogPosts(data); // make sure you have this state
    setTotalPages(res.data.totalPages)
  } catch (err: any) {
    console.error(err);
    toast.error(
      err.response?.data?.message ||
        (de ? "Fehler beim Laden" : "Failed to load posts")
    );
  }
};

useEffect(()=>
{
  handleGetPosts()

},[page])



  const handleUploadFiles = async (files: File[]) => {
  try {
    setUploading(true);

    const urls = await uploadFiles(files); // returns array of uploaded image URLs

    if (urls?.length > 0) {
      setPostForm((prev) => ({
        ...prev,
        image: urls[0], // only take the first image
      }));

      toast.success(de ? "Bild hochgeladen" : "Image uploaded");
    }

  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      toast.error(err.response?.data?.message || "Failed to upload image");
    } else {
      toast.error("An unexpected error occurred while uploading image");
      console.error(err);
    }
  } finally {
    setUploading(false);
  }
};


const handleSavePost = async () => {
  if (!postForm.title.trim()) {
    toast.error(de ? "Titel ist erforderlich" : "Title is required");
    return;
  }

  try {
    // Prepare payload: image must be a string URL

    let data;

    if (editingPost) {
      // Update existing post
      const res = await api.put(`api/blog/update-blog/${editingPost._id}`, postForm);
      data = res.data;
      setBlogPosts((prev) =>
        prev.map((p) => (p._id === editingPost._id ? data : p))
      );
      toast.success(de ? "Beitrag aktualisiert" : "Post updated");
    } else {
      // Create new post
      const res = await api.post("api/blog/add-blog", postForm);
      data = res.data;
      // setBlogPosts(data);
      toast.success(de ? "Beitrag erstellt" : "Post created");
    }

    setBlogDialogOpen(false);
  } catch (err: any) {
    console.error(err);
    toast.error(err.response?.data?.message || (de ? "Fehler beim Speichern" : "Failed to save post"));
  }
};



const handleDeletePost = async (id: string) => {
  try {
    const post = blogPosts.find(p => p._id === id);

    // Call backend delete API
    await api.delete(`api/blog/delete-blog/${id}`);

    // Update UI after successful deletion
    setBlogPosts(prev => prev.filter(p => p._id !== id));

    toast.success(
      de
        ? `"${post?.title}" gelöscht`
        : `"${post?.title}" deleted`
    );

    setDeleteConfirm(null);
  } catch (err: any) {
    console.error(err);
    toast.error(
      err.response?.data?.message ||
        (de ? "Fehler beim Löschen" : "Failed to delete post")
    );
  }
};

  const togglePostStatus = (id: string) => {
    setBlogPosts(prev => prev.map(p => p._id === id ? { ...p, status: p.status === "published" ? "draft" : "published" } : p));
    toast.success(de ? "Status aktualisiert" : "Status updated");
  };

  const inputClass = "w-full px-4 py-2.5 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent";

  const tabs = [
    { id: "pages" as const, label: de ? "Seiten" : "Pages" },
    { id: "sections" as const, label: de ? "Sektionen" : "Sections" },
    { id: "hero" as const, label: "Hero Banner" },
    { id: "blog" as const, label: "Blog" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">
        {de ? "Inhalte verwalten" : "Content Management"}
      </h2>

      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "pages" && <AdminPageEditor />}

      {activeTab === "sections" && (
        <div className="bg-card rounded-xl border border-border shadow-card">
          <div className="p-5 border-b border-border">
            <p className="text-sm text-muted-foreground">{de ? "Sektionen ein-/ausblenden und neu anordnen" : "Toggle and reorder homepage sections"}</p>
          </div>
          <div className="divide-y divide-border">
            {loadingSections ? (
              <div className="p-8 text-center text-muted-foreground">{de ? "Wird geladen..." : "Loading..."}</div>
            ) : (
              sections.map((section) => (
                <div key={section.id} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{section.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{section.type}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={section.enabled} onChange={() => toggleSection(section.id, section.enabled)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-accent transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))
            )}

          </div>
        </div>
      )}

      {activeTab === "hero" && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-card max-w-2xl">
          <div className="mb-6 space-y-4">
             <div className="p-4 border-2 border-dashed border-border rounded-xl text-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                   {de ? "Hero-Bilder verwalten" : "Manage hero images"}
                </p>
                <input 
                  type="file" 
                  multiple 
                  onChange={handleHeroImageUpload} 
                  className="hidden" 
                  id="hero-file-upload" 
                  accept="image/*"
                />
                <label 
                  htmlFor="hero-file-upload" 
                  className="inline-block text-xs bg-secondary text-foreground px-4 py-2 rounded-lg font-semibold cursor-pointer hover:bg-muted"
                >
                  {uploading ? (de ? "Lade hoch..." : "Uploading...") : (de ? "Bilder hochladen" : "Upload Images")}
                </label>
             </div>

             {/* Image Preview Grid */}
             <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
               {heroForm.images?.map((url: string, index: number) => (
                 <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                    <img src={url} alt={`Hero ${index}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeHeroImage(index)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                 </div>
               ))}
             </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Badge</label>
                <input value={heroForm.badge} onChange={e => setHeroForm({...heroForm, badge: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Title 1</label>
                <input value={heroForm.title1} onChange={e => setHeroForm({...heroForm, title1: e.target.value})} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Title 2</label>
                <input value={heroForm.title2} onChange={e => setHeroForm({...heroForm, title2: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Sub Title</label>
                <input value={heroForm.subtitle} onChange={e => setHeroForm({...heroForm, subtitle: e.target.value})} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">CTA 1 Text</label>
                <input value={heroForm.cta1} onChange={e => setHeroForm({...heroForm, cta1: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">CTA 2 Text</label>
                <input value={heroForm.cta2} onChange={e => setHeroForm({...heroForm, cta2: e.target.value})} className={inputClass} />
              </div>
            </div>
            
            <button onClick={saveHeroData} className="bg-primary text-primary-foreground w-full py-3 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              {de ? "Aktualisieren" : "Update Hero Banner"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "blog" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={openNewPost} className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> {de ? "Neuer Beitrag" : "New Post"}
            </button>
          </div>
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Titel" : "Title"}</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">{de ? "Datum" : "Date"}</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">{de ? "Aktionen" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {blogPosts?.map((post) => (
                  <tr key={post._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{post.title}</td>
                    <td className="p-4">
                      <button onClick={() => togglePostStatus(post._id)} className="cursor-pointer">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${post.status === "published" ? "bg-green-500/10 text-green-600" : "bg-accent/10 text-accent"}`}>
                          {post.status === "published" ? (de ? "Veröffentlicht" : "Published") : (de ? "Entwurf" : "Draft")}
                        </span>
                      </button>
                    </td>
                    <td className="p-4 text-muted-foreground">{new Date(post.date).toDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => window.open(`/blog/${post._id}`, "_blank")} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Ansehen" : "View"}>
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => openEditPost(post)} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Bearbeiten" : "Edit"}>
                          <Pencil className="w-4 h-4 text-accent" />
                        </button>
                        {deleteConfirm === post._id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDeletePost(post._id)} className="px-2 py-1 bg-destructive text-destructive-foreground rounded text-xs font-semibold">
                              {de ? "Ja" : "Yes"}
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="p-2 hover:bg-secondary rounded-lg">
                              <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(post._id)} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Löschen" : "Delete"}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {blogPosts?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      {de ? "Keine Beiträge vorhanden" : "No posts yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

  <div className="flex items-center gap-2 mt-4 p-4" style={{display:totalPages<=1?"none":"flex"}}>

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

     {/* Blog Post Dialog */}
<Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}>
  <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
    {/* Header stays fixed */}
    <DialogHeader>
      <DialogTitle>
        {editingPost
          ? de
            ? "Beitrag bearbeiten"
            : "Edit Post"
          : de
          ? "Neuer Beitrag"
          : "New Post"}
      </DialogTitle>
    </DialogHeader>

    {/* Scrollable content */}
    <div className="overflow-y-auto flex-1 space-y-4 py-2">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">
          {de ? "Titel" : "Title"}
        </label>
        <input
          value={postForm.title}
          onChange={(e) =>
            setPostForm({ ...postForm, title: e.target.value })
          }
          className={inputClass}
          placeholder={de ? "Beitragstitel" : "Post title"}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">
            Status
          </label>
          <select
            value={postForm.status}
            onChange={(e) =>
              setPostForm({
                ...postForm,
                status: e.target.value as "published" | "draft",
              })
            }
            className={inputClass}
          >
            <option value="draft">{de ? "Entwurf" : "Draft"}</option>
            <option value="published">{de ? "Veröffentlicht" : "Published"}</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1">
            {de ? "Datum" : "Date"}
          </label>
          <input
            type="date"
            value={postForm.date}
            onChange={(e) =>
              setPostForm({ ...postForm, date: e.target.value })
            }
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-1">
          {de ? "Auszug" : "Excerpt"}
        </label>
        <textarea
          value={postForm.excerpt}
          onChange={(e) =>
            setPostForm({ ...postForm, excerpt: e.target.value })
          }
          rows={2}
          className={`${inputClass} resize-none`}
          placeholder={de ? "Kurze Zusammenfassung..." : "Short summary..."}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-1">
          {de ? "Inhalt" : "Content"}
        </label>
        <textarea
          value={postForm.content}
          onChange={(e) =>
            setPostForm({ ...postForm, content: e.target.value })
          }
          rows={6}
          className={`${inputClass} resize-none`}
          placeholder={de ? "Beitragsinhalt..." : "Post content..."}
        />
      </div>

<div>
  <label className="text-sm font-medium text-foreground block mb-1">
    {de ? "Beitragsbild" : "Post Image"}
  </label>

  <input
    type="file"
    accept="image/*"
    disabled={uploading} // disable input while uploading
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      await handleUploadFiles([file]); // call upload
    }}
    className={inputClass}
  />

  <div className="mt-2 relative w-full max-h-40">
    {uploading ? (
      <div className="flex items-center justify-center h-40 bg-muted rounded-md">
        <span className="animate-spin border-4 border-t-accent border-gray-200 rounded-full w-8 h-8"></span>
        <span className="ml-2 text-sm text-muted-foreground">
          {de ? "Hochladen..." : "Uploading..."}
        </span>
      </div>
    ) : (
      postForm.image && (
        <img
          src={
            typeof postForm.image === "string"
              ? postForm.image
              : URL.createObjectURL(postForm.image)
          }
          alt="Preview"
          className="w-full max-h-40 object-contain rounded-md"
        />
      )
    )}
  </div>
</div>

    </div>

    {/* Footer stays fixed */}
    <DialogFooter>
      <button
        onClick={() => setBlogDialogOpen(false)}
        className="bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
      >
        {de ? "Abbrechen" : "Cancel"}
      </button>
      <button
        onClick={handleSavePost}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        {de ? "Speichern" : "Save"}
      </button>
    </DialogFooter>
  </DialogContent>
</Dialog>
        </div>
      )}
    </div>
  );
};

export default AdminContent;
