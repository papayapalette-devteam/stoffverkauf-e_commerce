import { useState } from "react";
import { useAllPages, PageSection } from "@/lib/page-content";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Plus, Trash2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

const AdminPageEditor = () => {
  const { lang } = useI18n();
  const de = lang === "de";
  const { pages, updateSection, addSection, removeSection, resetPage } = useAllPages();
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, PageSection>>({});

  const startEditing = (pageId: string) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;
    const data: Record<string, PageSection> = {};
    page.sections.forEach((s) => { data[s.id] = { ...s }; });
    setEditData(data);
    setEditingPage(pageId);
  };

  const handleSave = () => {
    if (!editingPage) return;
    Object.values(editData).forEach((s) => {
      updateSection(editingPage, s.id, s);
    });
    toast.success(de ? "Seite gespeichert" : "Page saved");
    setEditingPage(null);
  };

  const handleAddSection = () => {
    if (!editingPage) return;
    const id = `section-${Date.now()}`;
    const newSection: PageSection = { id, titleDe: "Neuer Abschnitt", titleEn: "New Section", contentDe: "", contentEn: "" };
    addSection(editingPage, newSection);
    setEditData((prev) => ({ ...prev, [id]: newSection }));
  };

  const handleRemoveSection = (sectionId: string) => {
    if (!editingPage) return;
    removeSection(editingPage, sectionId);
    setEditData((prev) => {
      const copy = { ...prev };
      delete copy[sectionId];
      return copy;
    });
    toast.success(de ? "Abschnitt entfernt" : "Section removed");
  };

  const handleReset = () => {
    if (!editingPage) return;
    resetPage(editingPage);
    toast.success(de ? "Seite zurückgesetzt" : "Page reset to defaults");
    // Re-load edit data
    setTimeout(() => startEditing(editingPage), 50);
  };

  if (editingPage) {
    const page = pages.find((p) => p.id === editingPage);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setEditingPage(null)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h3 className="font-display text-xl font-bold text-foreground">
            {de ? page?.nameDe : page?.nameEn} — {de ? "Bearbeiten" : "Edit"}
          </h3>
          <div className="ml-auto flex gap-2">
            <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground bg-secondary rounded-lg transition-colors">
              <RotateCcw className="w-4 h-4" /> {de ? "Zurücksetzen" : "Reset"}
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Save className="w-4 h-4" /> {de ? "Speichern" : "Save"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {Object.values(editData).map((section) => (
            <div key={section.id} className="bg-card rounded-xl border border-border p-5 shadow-card space-y-3">
              <div className="flex items-start justify-end">
                {/* <p className="text-xs text-muted-foreground font-mono">{section.id}</p> */}
                <button onClick={() => handleRemoveSection(section.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">{de ? "Titel (DE)" : "Title (DE)"}</label>
                  <input
                    value={section.titleDe}
                    onChange={(e) => setEditData((prev) => ({ ...prev, [section.id]: { ...prev[section.id], titleDe: e.target.value } }))}
                    className="w-full px-3 py-2 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">{de ? "Titel (EN)" : "Title (EN)"}</label>
                  <input
                    value={section.titleEn}
                    onChange={(e) => setEditData((prev) => ({ ...prev, [section.id]: { ...prev[section.id], titleEn: e.target.value } }))}
                    className="w-full px-3 py-2 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">{de ? "Inhalt (DE)" : "Content (DE)"}</label>
                  <textarea
                    value={section.contentDe}
                    onChange={(e) => setEditData((prev) => ({ ...prev, [section.id]: { ...prev[section.id], contentDe: e.target.value } }))}
                    rows={4}
                    className="w-full px-3 py-2 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">{de ? "Inhalt (EN)" : "Content (EN)"}</label>
                  <textarea
                    value={section.contentEn}
                    onChange={(e) => setEditData((prev) => ({ ...prev, [section.id]: { ...prev[section.id], contentEn: e.target.value } }))}
                    rows={4}
                    className="w-full px-3 py-2 bg-secondary text-foreground rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleAddSection} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-accent border-2 border-dashed border-accent/30 rounded-xl w-full justify-center hover:bg-accent/5 transition-colors">
          <Plus className="w-4 h-4" /> {de ? "Abschnitt hinzufügen" : "Add Section"}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="font-display text-lg font-bold text-foreground">{de ? "Seiten bearbeiten" : "Edit Pages"}</h3>
        <p className="text-sm text-muted-foreground mt-1">{de ? "Klicken Sie auf eine Seite, um deren Inhalte zu bearbeiten" : "Click on a page to edit its content"}</p>
      </div>
      <div className="divide-y divide-border">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => startEditing(page.id)}
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors text-left"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{de ? page.nameDe : page.nameEn}</p>
              <p className="text-xs text-muted-foreground font-mono">{page.path}</p>
            </div>
            <span className="text-xs text-muted-foreground">{page.sections.length} {de ? "Abschnitte" : "sections"}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminPageEditor;
