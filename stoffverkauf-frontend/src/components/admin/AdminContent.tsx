import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { GripVertical, ImageIcon, Plus, Pencil, Trash2, X, Eye } from "lucide-react";
import { toast } from "sonner";
import AdminPageEditor from "./AdminPageEditor";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
  id: string;
  title: string;
  status: "published" | "draft";
  date: string;
  excerpt: string;
  content: string;
}

const initialBlogPosts: BlogPost[] = [
  { id: "1", title: "Die richtige Schurwolle finden", status: "published", date: "2026-01-15", excerpt: "Tipps zur Auswahl der perfekten Schurwolle für Ihr Nähprojekt.", content: "Schurwolle ist einer der edelsten Stoffe..." },
  { id: "2", title: "Pflegetipps für feine Stoffe", status: "published", date: "2026-01-20", excerpt: "So pflegen Sie Ihre hochwertigen Stoffe richtig.", content: "Feine Stoffe benötigen besondere Pflege..." },
  { id: "3", title: "Trends Frühjahr/Sommer 2026", status: "draft", date: "2026-02-10", excerpt: "Die wichtigsten Stofftrends der kommenden Saison.", content: "Leichte Stoffe dominieren die kommende Saison..." },
];

const emptyPost: Omit<BlogPost, "id"> = { title: "", status: "draft", date: new Date().toISOString().split("T")[0], excerpt: "", content: "" };

const AdminContent = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const [activeTab, setActiveTab] = useState<"sections" | "hero" | "blog" | "pages">("pages");
  const [sections, setSections] = useState(mockSections);
  const [heroForm, setHeroForm] = useState({
    badge: "Neue Kollektion 2026",
    title1: "Italienische",
    title2: "Designerstoffe",
    subtitle: "Hochwertige Stoffe direkt aus Italien.",
    cta1: "Jetzt einkaufen",
    cta2: "Stoffe entdecken",
  });

  // Blog state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postForm, setPostForm] = useState<Omit<BlogPost, "id">>(emptyPost);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
    toast.success(de ? "Sektion aktualisiert" : "Section updated");
  };

  // Blog handlers
  const openNewPost = () => {
    setEditingPost(null);
    setPostForm({ ...emptyPost, date: new Date().toISOString().split("T")[0] });
    setBlogDialogOpen(true);
  };

  const openEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setPostForm({ title: post.title, status: post.status, date: post.date, excerpt: post.excerpt, content: post.content });
    setBlogDialogOpen(true);
  };

  const handleSavePost = () => {
    if (!postForm.title.trim()) {
      toast.error(de ? "Titel ist erforderlich" : "Title is required");
      return;
    }
    if (editingPost) {
      setBlogPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...postForm } : p));
      toast.success(de ? "Beitrag aktualisiert" : "Post updated");
    } else {
      setBlogPosts(prev => [...prev, { id: Date.now().toString(), ...postForm }]);
      toast.success(de ? "Beitrag erstellt" : "Post created");
    }
    setBlogDialogOpen(false);
  };

  const handleDeletePost = (id: string) => {
    const post = blogPosts.find(p => p.id === id);
    setBlogPosts(prev => prev.filter(p => p.id !== id));
    toast.success(de ? `"${post?.title}" gelöscht` : `"${post?.title}" deleted`);
    setDeleteConfirm(null);
  };

  const togglePostStatus = (id: string) => {
    setBlogPosts(prev => prev.map(p => p.id === id ? { ...p, status: p.status === "published" ? "draft" : "published" } : p));
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
            {sections.map((section) => (
              <div key={section.id} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{section.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{section.type}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={section.enabled} onChange={() => toggleSection(section.id)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-accent transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "hero" && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-card max-w-2xl">
          <div className="mb-6 p-4 border-2 border-dashed border-border rounded-xl text-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">{de ? "Hero-Bild ändern" : "Change hero image"}</p>
            <button className="text-xs bg-secondary text-foreground px-4 py-2 rounded-lg font-semibold">{de ? "Bild hochladen" : "Upload Image"}</button>
          </div>
          <div className="space-y-4">
            {Object.entries(heroForm).map(([key, value]) => (
              <div key={key}>
                <label className="text-sm font-medium text-foreground block mb-1 capitalize">{key}</label>
                <input
                  value={value}
                  onChange={(e) => setHeroForm({ ...heroForm, [key]: e.target.value })}
                  className={inputClass}
                />
              </div>
            ))}
            <button onClick={() => toast.success(de ? "Hero aktualisiert" : "Hero updated")} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
              {de ? "Speichern" : "Save"}
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
                {blogPosts.map((post) => (
                  <tr key={post.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{post.title}</td>
                    <td className="p-4">
                      <button onClick={() => togglePostStatus(post.id)} className="cursor-pointer">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${post.status === "published" ? "bg-green-500/10 text-green-600" : "bg-accent/10 text-accent"}`}>
                          {post.status === "published" ? (de ? "Veröffentlicht" : "Published") : (de ? "Entwurf" : "Draft")}
                        </span>
                      </button>
                    </td>
                    <td className="p-4 text-muted-foreground">{post.date}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => window.open(`/blog/${post.id}`, "_blank")} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Ansehen" : "View"}>
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => openEditPost(post)} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Bearbeiten" : "Edit"}>
                          <Pencil className="w-4 h-4 text-accent" />
                        </button>
                        {deleteConfirm === post.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDeletePost(post.id)} className="px-2 py-1 bg-destructive text-destructive-foreground rounded text-xs font-semibold">
                              {de ? "Ja" : "Yes"}
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="p-2 hover:bg-secondary rounded-lg">
                              <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(post.id)} className="p-2 hover:bg-secondary rounded-lg transition-colors" title={de ? "Löschen" : "Delete"}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {blogPosts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      {de ? "Keine Beiträge vorhanden" : "No posts yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Blog Post Dialog */}
          <Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingPost ? (de ? "Beitrag bearbeiten" : "Edit Post") : (de ? "Neuer Beitrag" : "New Post")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Titel" : "Title"}</label>
                  <input value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} className={inputClass} placeholder={de ? "Beitragstitel" : "Post title"} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Status</label>
                    <select value={postForm.status} onChange={(e) => setPostForm({ ...postForm, status: e.target.value as "published" | "draft" })} className={inputClass}>
                      <option value="draft">{de ? "Entwurf" : "Draft"}</option>
                      <option value="published">{de ? "Veröffentlicht" : "Published"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">{de ? "Datum" : "Date"}</label>
                    <input type="date" value={postForm.date} onChange={(e) => setPostForm({ ...postForm, date: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Auszug" : "Excerpt"}</label>
                  <textarea value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} rows={2} className={inputClass + " resize-none"} placeholder={de ? "Kurze Zusammenfassung..." : "Short summary..."} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{de ? "Inhalt" : "Content"}</label>
                  <textarea value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} rows={6} className={inputClass + " resize-none"} placeholder={de ? "Beitragsinhalt..." : "Post content..."} />
                </div>
              </div>
              <DialogFooter>
                <button onClick={() => setBlogDialogOpen(false)} className="bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
                  {de ? "Abbrechen" : "Cancel"}
                </button>
                <button onClick={handleSavePost} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
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
