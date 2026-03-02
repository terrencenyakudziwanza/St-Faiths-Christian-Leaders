import { create } from "zustand";

interface StoreState {
  introAnimDone: boolean;
  currSection: string;
  setIntroAnimDone: (bool: boolean) => void;
  setCurrSection: (section: string) => void;
}

const useStore = create<StoreState>((set) => ({
  introAnimDone: false,
  currSection: "Home",
  setIntroAnimDone: (bool) => set({ introAnimDone: bool }),
  setCurrSection: (section) => set({ currSection: section }),
}));

export default useStore;
