import { create } from "zustand";
import { Themes } from "../constants";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "light", // current theme

  setTheme: (newTheme) => {
    localStorage.setItem("chat-theme", newTheme); // store in localStorage
    set({ theme: newTheme }); // update Zustand state
  },
}));
