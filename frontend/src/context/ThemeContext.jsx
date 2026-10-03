import { createContext, useEffect, useMemo, useState } from "react";

export const ThemeContext = createContext(null);

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("collabcanvas_theme") || "dark");
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("collabcanvas_theme", theme); }, [theme]);
  const value = useMemo(() => ({ theme, setTheme, toggleTheme: () => setTheme(t => t === "dark" ? "light" : "dark") }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
