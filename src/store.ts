import { create } from "zustand";

type SectionName = "Home" | "About";

interface StoreState {
  introAnimDone: boolean;
  currSection: SectionName;
  setIntroAnimDone: (bool: boolean) => void;
  setCurrSection: (section: SectionName) => void;
}

const useStore = create<StoreState>((set) => ({
  introAnimDone: false,
  currSection: "Home",
  setIntroAnimDone: (bool) => set({ introAnimDone: bool }),
  setCurrSection: (section) => set({ currSection: section }),
}));

export type { SectionName };
export default useStore;
