import { create } from "zustand";
interface TextState {
  text: string;
  setText: (text: string) => void;
  removeText: () => void;
}

const useTextStore = create<TextState>()(
  (set) => ({
    text: "",
    setText: (text) => set({ text }),
    removeText: () => set({ text: "" }),
  })
);

export default useTextStore;