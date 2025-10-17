import { FunctionComponent } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './Rectangle1.module.css';

const Rectangle1: FunctionComponent = () => {
  const { theme, toggleTheme, isLoaded } = useTheme();
  const isDarkMode = theme === 'dark';

  const handleToggle = () => {
    toggleTheme();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`${styles.toggleButton} ${isDarkMode ? styles.dark : styles.light}`}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
  aria-pressed={isDarkMode ? 'true' : 'false'}
      title="Toggle theme"
      disabled={!isLoaded}
    >
      <span className={`${styles.toggleThumb} ${isDarkMode ? styles.thumbDark : styles.thumbLight}`}>
        <span className={styles.icon} aria-hidden="true">
          {isDarkMode ? '🌙' : '☀️'}
        </span>
      </span>
    </button>
  );
};

export default Rectangle1;
