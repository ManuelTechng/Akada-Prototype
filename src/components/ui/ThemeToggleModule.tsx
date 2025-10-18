import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './ThemeToggle.module.css';

interface ThemeToggleModuleProps {
  className?: string;
}

const ThemeToggleModule: React.FC<ThemeToggleModuleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`${styles.toggleTrack} ${isDark ? styles.darkMode : styles.lightMode} ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Thumb */}
      <span className={`${styles.toggleThumb} ${isDark ? styles.thumbDark : styles.thumbLight}`}>
        {/* Icon */}
        <div className={styles.iconContainer}>
          {isDark ? (
            <Moon className={styles.moonIcon} />
          ) : (
            <Sun className={styles.sunIcon} />
          )}
        </div>
      </span>
    </button>
  );
};

export default ThemeToggleModule;

