import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../../api";
import { toast } from "sonner";

export type PageSection = {
  id: string;
  titleDe: string;
  titleEn: string;
  contentDe: string;
  contentEn: string;
};

export type PageDef = {
  _id?: string;
  id: string;
  nameDe: string;
  nameEn: string;
  path: string;
  sections: PageSection[];
};

type Ctx = {
  pages: PageDef[];
  getPage: (id: string) => PageDef | undefined;
  updateSection: (pageId: string, sectionId: string, data: Partial<PageSection>) => void;
  addSection: (pageId: string, section: PageSection) => void;
  removeSection: (pageId: string, sectionId: string) => void;
  resetPage: (pageId: string) => void;
  isLoading: boolean;
};

const PageContentContext = createContext<Ctx | null>(null);

export const PageContentProvider = ({ children }: { children: ReactNode }) => {
  const [pages, setPages] = useState<PageDef[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/api/pages");
      setPages(res.data);
    } catch (err) {
      console.error("Failed to fetch pages", err);
      toast.error("Failed to load page content from server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const getPage = (id: string) => pages.find((p) => p.id === id);

  const updateSection = async (pageId: string, sectionId: string, data: Partial<PageSection>) => {
    const page = getPage(pageId);
    if (!page) return;

    const newSections = page.sections.map((s) => s.id === sectionId ? { ...s, ...data } : s);
    
    try {
        const res = await api.put(`/api/pages/${pageId}`, { ...page, sections: newSections });
        setPages((prev) => prev.map((p) => p.id === pageId ? res.data : p));
    } catch (err) {
        toast.error("Failed to save changes");
    }
  };

  const addSection = async (pageId: string, section: PageSection) => {
    const page = getPage(pageId);
    if (!page) return;

    const newSections = [...page.sections, section];
    
    try {
        const res = await api.put(`/api/pages/${pageId}`, { ...page, sections: newSections });
        setPages((prev) => prev.map((p) => p.id === pageId ? res.data : p));
    } catch (err) {
        toast.error("Failed to add section");
    }
  };

  const removeSection = async (pageId: string, sectionId: string) => {
    const page = getPage(pageId);
    if (!page) return;

    const newSections = page.sections.filter((s) => s.id !== sectionId);
    
    try {
        const res = await api.put(`/api/pages/${pageId}`, { ...page, sections: newSections });
        setPages((prev) => prev.map((p) => p.id === pageId ? res.data : p));
    } catch (err) {
        toast.error("Failed to remove section");
    }
  };

  const resetPage = async (pageId: string) => {
      // For backend implementation, reset can just set sections to empty or default.
      try {
          const res = await api.put(`/api/pages/${pageId}`, { sections: [] });
          setPages((prev) => prev.map((p) => p.id === pageId ? res.data : p));
      } catch (err) {
          toast.error("Failed to reset page");
      }
  };

  return (
    <PageContentContext.Provider value={{ pages, getPage, updateSection, addSection, removeSection, resetPage, isLoading }}>
      {children}
    </PageContentContext.Provider>
  );
};

export const usePageContent = (pageId: string) => {
  const ctx = useContext(PageContentContext);
  if (!ctx) throw new Error("usePageContent must be used within PageContentProvider");
  const page = ctx.getPage(pageId);
  return { page, sections: page?.sections || [], ...ctx };
};

export const useAllPages = () => {
  const ctx = useContext(PageContentContext);
  if (!ctx) throw new Error("useAllPages must be used within PageContentProvider");
  return ctx;
};
