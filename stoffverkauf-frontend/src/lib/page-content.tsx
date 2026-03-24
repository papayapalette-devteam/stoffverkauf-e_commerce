import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type PageSection = {
  id: string;
  titleDe: string;
  titleEn: string;
  contentDe: string;
  contentEn: string;
};

export type PageDef = {
  id: string;
  nameDe: string;
  nameEn: string;
  path: string;
  sections: PageSection[];
};

const defaultPages: PageDef[] = [
  {
    id: "service",
    nameDe: "Service",
    nameEn: "Service",
    path: "/service",
    sections: [],
  },
  {
    id: "shipping",
    nameDe: "Versandbedingungen",
    nameEn: "Shipping Terms",
    path: "/shipping",
    sections: [],
  },
  {
    id: "samples",
    nameDe: "Stoffmuster",
    nameEn: "Fabric Samples",
    path: "/samples",
    sections: [],
  },
  {
    id: "returns",
    nameDe: "Rückgabe",
    nameEn: "Returns",
    path: "/returns",
    sections: [],
  },
  {
    id: "faq",
    nameDe: "FAQ",
    nameEn: "FAQ",
    path: "/faq",
    sections: [],
  },
  {
    id: "legal",
    nameDe: "Rechtliches",
    nameEn: "Legal",
    path: "/legal",
    sections: [],
  },
  {
    id: "agb",
    nameDe: "AGB",
    nameEn: "Terms & Conditions",
    path: "/agb",
    sections: [],
  },
  {
    id: "impressum",
    nameDe: "Impressum",
    nameEn: "Imprint",
    path: "/impressum",
    sections: [],
  },
  {
    id: "datenschutz",
    nameDe: "Datenschutz",
    nameEn: "Privacy Policy",
    path: "/datenschutz",
    sections: [],
  },
  {
    id: "widerruf",
    nameDe: "Widerrufsbelehrung",
    nameEn: "Cancellation Policy",
    path: "/widerruf",
    sections: [],
  },
];

const STORAGE_KEY = "weber_page_content";

function loadContent(): PageDef[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as PageDef[];
      // Merge: keep stored overrides but add any new default pages/sections
      const merged = defaultPages.map((dp) => {
        const sp = parsed.find((p) => p.id === dp.id);
        if (!sp) return dp;
        return { ...dp, sections: dp.sections.map((ds) => {
          const ss = sp.sections.find((s) => s.id === ds.id);
          return ss || ds;
        })};
      });
      return merged;
    }
  } catch {}
  return defaultPages;
}

function saveContent(pages: PageDef[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
}

type Ctx = {
  pages: PageDef[];
  getPage: (id: string) => PageDef | undefined;
  updateSection: (pageId: string, sectionId: string, data: Partial<PageSection>) => void;
  addSection: (pageId: string, section: PageSection) => void;
  removeSection: (pageId: string, sectionId: string) => void;
  resetPage: (pageId: string) => void;
};

const PageContentContext = createContext<Ctx | null>(null);

export const PageContentProvider = ({ children }: { children: ReactNode }) => {
  const [pages, setPages] = useState<PageDef[]>(loadContent);

  useEffect(() => { saveContent(pages); }, [pages]);

  const getPage = (id: string) => pages.find((p) => p.id === id);

  const updateSection = (pageId: string, sectionId: string, data: Partial<PageSection>) => {
    setPages((prev) => prev.map((p) => p.id !== pageId ? p : {
      ...p,
      sections: p.sections.map((s) => s.id !== sectionId ? s : { ...s, ...data }),
    }));
  };

  const addSection = (pageId: string, section: PageSection) => {
    setPages((prev) => prev.map((p) => p.id !== pageId ? p : { ...p, sections: [...p.sections, section] }));
  };

  const removeSection = (pageId: string, sectionId: string) => {
    setPages((prev) => prev.map((p) => p.id !== pageId ? p : { ...p, sections: p.sections.filter((s) => s.id !== sectionId) }));
  };

  const resetPage = (pageId: string) => {
    const def = defaultPages.find((p) => p.id === pageId);
    if (def) setPages((prev) => prev.map((p) => p.id !== pageId ? p : def));
  };

  return (
    <PageContentContext.Provider value={{ pages, getPage, updateSection, addSection, removeSection, resetPage }}>
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
