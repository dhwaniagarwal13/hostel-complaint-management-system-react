import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('theme') || 'dark' : 'dark'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 p-3 rounded-2xl glass-panel group 
                 hover:scale-110 active:scale-95 transition-all duration-300 z-50
                 ring-1 ring-outline/10 hover:ring-primary/40"
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6 overflow-hidden">
        <div className={`absolute inset-0 transform transition-all duration-500 ease-spring ${
          theme === 'dark' ? 'translate-y-0 opacity-100 rotate-0' : 'translate-y-10 opacity-0 rotate-90'
        }`}>
          <Moon className="w-6 h-6 text-primary group-hover:text-primary/80" />
        </div>
        <div className={`absolute inset-0 transform transition-all duration-500 ease-spring ${
          theme === 'light' ? 'translate-y-0 opacity-100 rotate-0' : '-translate-y-10 opacity-0 -rotate-90'
        }`}>
          <Sun className="w-6 h-6 text-tertiary group-hover:text-tertiary/80" />
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
