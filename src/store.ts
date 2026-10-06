import { create } from "zustand";

interface StoreState {
  introAnimDone: boolean;
  introAnimStarted: boolean;
  currSection: string;
  setIntroAnimDone: (bool: boolean) => void;
  setIntroAnimStarted: (bool: boolean) => void;
  setCurrSection: (section: string) => void;
}

const useStore = create<StoreState>((set) => ({
  introAnimDone: false,
  introAnimStarted: false,
  currSection: "Home",
  setIntroAnimDone: (bool) => set({ introAnimDone: bool }),
  setIntroAnimStarted: (bool) => set({ introAnimStarted: bool }),
  setCurrSection: (section) => set({ currSection: section }),
}));

export default useStore;
