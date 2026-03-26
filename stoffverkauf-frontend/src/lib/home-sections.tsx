import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import api from "../../api";

export type HomeSection = {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
};

type Ctx = {
  sections: HomeSection[];
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const HomeSectionsContext = createContext<Ctx | null>(null);

export const HomeSectionsProvider = ({ children }: { children: ReactNode }) => {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSections = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/api/home-sections");
      setSections(res.data);
    } catch (err) {
      console.error("Failed to fetch home sections", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  return (
    <HomeSectionsContext.Provider value={{ sections, isLoading, refresh: fetchSections }}>
      {children}
    </HomeSectionsContext.Provider>
  );
};

export const useHomeSections = () => {
  const ctx = useContext(HomeSectionsContext);
  if (!ctx) throw new Error("useHomeSections must be used within HomeSectionsProvider");
  return ctx;
};
