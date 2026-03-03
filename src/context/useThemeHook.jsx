import { useContext } from "react";
import { ThemeContext } from "./contexts";

// Custom hook with error handling
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
