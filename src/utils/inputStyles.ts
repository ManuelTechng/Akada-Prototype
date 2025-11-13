// Standardized input styles for consistent dark mode support using HSL semantic tokens
export const inputStyles = {
  base: "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors",
  colors: "border-input bg-input text-foreground",
  disabled: "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
  placeholder: "placeholder-muted-foreground",

  // Combined class for standard inputs
  standard: "w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed bg-input text-foreground placeholder-muted-foreground",

  // For inputs with icons (left padding)
  withIcon: "pl-10 w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed bg-input text-foreground placeholder-muted-foreground"
};

// Helper function to combine classes
export const combineClasses = (...classes: (string | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};
