import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600",
        destructive: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
        outline: "border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200",
        secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
        ghost: "hover:bg-gray-100 text-gray-800 dark:hover:bg-gray-700 dark:text-gray-200",
        link: "text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400",
      },
      size: {
        default: "h-10 sm:h-11 px-4 sm:px-8 py-2 min-h-[40px] sm:min-h-[44px] text-sm",
        sm: "h-9 sm:h-10 px-3 sm:px-4 min-h-[36px] sm:min-h-[40px] text-xs sm:text-sm",
        lg: "h-11 sm:h-12 px-6 sm:px-12 min-h-[44px] sm:min-h-[48px] text-sm sm:text-base",
        icon: "h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] lg:min-h-[44px] lg:min-w-[44px]",
        xs: "h-7 sm:h-8 px-2 sm:px-3 min-h-[28px] sm:min-h-[32px] text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };