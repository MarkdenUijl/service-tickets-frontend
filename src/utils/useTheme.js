import { useDark } from '@vueuse/core';

let isDarkRef = null;

export function useTheme() {
  if (!isDarkRef) {
    isDarkRef = useDark({
      selector: 'html',
      attribute: 'class',
      valueDark: 'theme-dark',
      valueLight: 'theme-light',
      storageKey: 'theme',
      initialValue: 'auto',
    });
  }

  const toggleTheme = () => {
    isDarkRef.value = !isDarkRef.value;
  };

  const resetToSystem = () => {
    localStorage.removeItem('theme');
    
    isDarkRef.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  return {
    isDark: isDarkRef,
    toggleTheme,
    resetToSystem,
  };
}