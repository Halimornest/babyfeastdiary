"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface Baby {
  id: number;
  name: string;
  birthDate: string;
}

interface BabyContextType {
  babies: Baby[];
  activeBabyId: number | null;
  activeBaby: Baby | null;
  selectBaby: (id: number) => void;
  refreshBabies: () => Promise<void>;
  loading: boolean;
}

const BabyContext = createContext<BabyContextType>({
  babies: [],
  activeBabyId: null,
  activeBaby: null,
  selectBaby: () => {},
  refreshBabies: async () => {},
  loading: true,
});

export function BabyProvider({ children }: { children: ReactNode }) {
  const [babies, setBabies] = useState<Baby[]>([]);
  const [activeBabyId, setActiveBabyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBabies = useCallback(async () => {
    try {
      const res = await fetch("/api/babies");
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (Array.isArray(data)) {
        setBabies(data);
        if (data.length > 0) {
          const stored = localStorage.getItem("selectedBabyId");
          const storedId = stored ? Number(stored) : null;
          if (storedId && data.find((b: Baby) => b.id === storedId)) {
            setActiveBabyId(storedId);
          } else {
            setActiveBabyId(data[0].id);
            localStorage.setItem("selectedBabyId", String(data[0].id));
          }
        } else {
          setActiveBabyId(null);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBabies();
  }, [fetchBabies]);

  const selectBaby = useCallback((id: number) => {
    setActiveBabyId(id);
    localStorage.setItem("selectedBabyId", String(id));
  }, []);

  const activeBaby = babies.find((b) => b.id === activeBabyId) || null;

  return (
    <BabyContext.Provider
      value={{
        babies,
        activeBabyId,
        activeBaby,
        selectBaby,
        refreshBabies: fetchBabies,
        loading,
      }}
    >
      {children}
    </BabyContext.Provider>
  );
}

export function useBaby() {
  return useContext(BabyContext);
}
