import { useTheme } from "./useThemeHook";

// Theme toggle button component
export const ThemeToggle = () => {
  const { toggleTheme, getThemeIcon, getThemeDisplayName, isSystemMode } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={`Switch theme (current: ${getThemeDisplayName()})`}
      title={`Current theme: ${getThemeDisplayName()}`}
    >
      <span className="text-lg" role="img" aria-label="theme icon">
        {getThemeIcon()}
      </span>
      {isSystemMode && (
        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
          system
        </span>
      )}
    </button>
  );
};

// Theme selector component
export const ThemeSelector = () => {
  const { theme, setThemeMode, THEMES } = useTheme();

  return (
    <select
      value={theme}
      onChange={(e) => setThemeMode(e.target.value)}
      className="px-3 py-2 rounded-lg border border-gray-300
        dark:border-gray-600 bg-white dark:bg-gray-800
        text-gray-900 dark:text-white
        focus:outline-none focus:ring-2 focus:ring-blue-500
        transition-colors duration-200"
      aria-label="Select theme"
    >
      <option value={THEMES.LIGHT}>Light</option>
      <option value={THEMES.DARK}>Dark</option>
      <option value={THEMES.SYSTEM}>System</option>
    </select>
  );
};
