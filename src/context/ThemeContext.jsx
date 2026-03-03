import { useEffect, useState, useCallback } from "react";
import { ThemeContext } from "./contexts";

// Available theme options
const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system"
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to system
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || THEMES.SYSTEM;
  });
  
  const [systemTheme, setSystemTheme] = useState(() => 
    window.matchMedia("(prefers-color-scheme: dark)").matches ? THEMES.DARK : THEMES.LIGHT
  );
  
  const [mounted, setMounted] = useState(false);

  // Get effective theme (actual applied theme)
  const getEffectiveTheme = useCallback(() => {
    if (theme === THEMES.SYSTEM) {
      return systemTheme;
    }
    return theme;
  }, [theme, systemTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e) => {
      setSystemTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } 
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Apply theme to document and mark as mounted
  useEffect(() => {
    const root = document.documentElement;
    const effectiveTheme = getEffectiveTheme();

    // Add transition class for smooth theme switching
    root.classList.add("theme-transition");

    if (effectiveTheme === THEMES.DARK) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }

    // Save to localStorage
    localStorage.setItem("theme", theme);

    // Remove transition class after a short delay to prevent flash
    const timeout = setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 300);

    return () => {
      clearTimeout(timeout);
      root.classList.remove("theme-transition");
    };
  }, [theme, getEffectiveTheme]);

  // Mark as mounted after initial theme application
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => {};
  }, []);

  // Toggle between light/dark (cycles: light -> dark -> system)
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      if (prev === THEMES.LIGHT) return THEMES.DARK;
      if (prev === THEMES.DARK) return THEMES.SYSTEM;
      return THEMES.LIGHT;
    });
  }, []);

  // Set specific theme
  const setThemeMode = useCallback((newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme);
    }
  }, []);

  // Set light theme
  const setLightTheme = useCallback(() => {
    setTheme(THEMES.LIGHT);
  }, []);

  // Set dark theme
  const setDarkTheme = useCallback(() => {
    setTheme(THEMES.DARK);
  }, []);

  // Set system theme
  const setSystemThemeMode = useCallback(() => {
    setTheme(THEMES.SYSTEM);
  }, []);

  // Check if current effective theme is dark
  const isDarkMode = getEffectiveTheme() === THEMES.DARK;

  // Check if current effective theme is light
  const isLightMode = getEffectiveTheme() === THEMES.LIGHT;

  // Check if using system preference
  const isSystemMode = theme === THEMES.SYSTEM;

  // Get theme display name
  const getThemeDisplayName = useCallback(() => {
    if (theme === THEMES.SYSTEM) return "System";
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  }, [theme]);

  // Get theme icon
  const getThemeIcon = useCallback(() => {
    const effectiveTheme = getEffectiveTheme();
    if (effectiveTheme === THEMES.DARK) return "🌙";
    return "☀️";
  }, [getEffectiveTheme]);

  const contextValue = {
    // Current selected theme
    theme,
    // Actual applied theme (considering system preference)
    effectiveTheme: getEffectiveTheme(),
    // Toggle function
    toggleTheme,
    // Set specific theme
    setThemeMode,
    // Helper functions
    setLightTheme,
    setDarkTheme,
    setSystemThemeMode,
    // Boolean checks
    isDarkMode,
    isLightMode,
    isSystemMode,
    // Utility functions
    getThemeDisplayName,
    getThemeIcon,
    // Available themes
    THEMES,
    // Mounted state
    mounted
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {/* Hide content until theme is initialized to prevent flash */}
      <div style={!mounted ? { visibility: 'hidden' } : undefined}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// CSS to add to your global styles for smooth transitions
export const themeTransitionStyles = `
  .theme-transition,
  .theme-transition *,
  .theme-transition *:before,
  .theme-transition *:after {
    transition: all 0.3s ease-in-out !important;
    transition-property: background-color, border-color, color, fill, stroke !important;
  }
`;