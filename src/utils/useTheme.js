export function useTheme() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains('theme-dark');

    root.classList.remove('theme-dark', 'theme-light');
    const newTheme = isDark ? 'theme-light' : 'theme-dark';
    root.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const applyStoredTheme = () => {
    const saved = localStorage.getItem('theme');
    
    if (saved === 'theme-dark' || saved === 'theme-light') {
      document.documentElement.classList.add(saved);
    }
  };

  return { toggleTheme, applyStoredTheme };
}