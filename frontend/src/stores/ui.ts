import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  localCart: Record<string, number>;
  addLocal: (id: string, qty?: number) => void;
  removeLocal: (id: string) => void;
  setLocalQty: (id: string, qty: number) => void;
  clearLocalCart: () => void;
}

export const useUI = create<UIState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite(id) {
        const cur = get().favorites;
        set({
          favorites: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
        });
      },
      isFavorite(id) {
        return get().favorites.includes(id);
      },
      localCart: {},
      addLocal(id, qty = 1) {
        const c = { ...get().localCart };
        c[id] = (c[id] ?? 0) + qty;
        set({ localCart: c });
      },
      removeLocal(id) {
        const c = { ...get().localCart };
        delete c[id];
        set({ localCart: c });
      },
      setLocalQty(id, qty) {
        const c = { ...get().localCart };
        if (qty <= 0) delete c[id];
        else c[id] = qty;
        set({ localCart: c });
      },
      clearLocalCart: () => set({ localCart: {} }),
    }),
    { name: "essence.ui" },
  ),
);
