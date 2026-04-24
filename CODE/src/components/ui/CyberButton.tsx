import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { COLORS } from "./constants";

export interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "destructive" | "outline" | "ghost" | "link" | "success" | "tertiary";
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  asChild?: boolean;
  children?: React.ReactNode;
  className?: string;
  glowing?: boolean;
}

const cyberButtonVariants = cva(
  "relative inline-flex items-center justify-center font-display font-semibold text-sm uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cyber-clip focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:bg-secondary/70",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 focus:bg-accent/80",
        tertiary: "bg-tertiary text-tertiary-foreground hover:bg-tertiary/90 focus:bg-tertiary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:bg-destructive/80",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent focus:bg-accent/50",
        ghost: "hover:bg-accent hover:text-accent focus:bg-accent/30",
        link: "text-primary underline-offset-4 hover:text-primary focus:text-primary/80",
        success: "bg-green-600 text-white hover:bg-green-700 focus:bg-green-800",
      },
      size: {
        default: "h-10 px-4 py-2 min-w-[80px]",
        sm: "h-9 px-3 py-1.5 min-w-[70px]",
        lg: "h-11 px-6 py-2.5 min-w-[100px]",
        xl: "h-13 px-8 py-3 text-lg min-w-[200px]",
        icon: "h-10 w-10 px-2 min-w-[40px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface CyberButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof cyberButtonVariants> {
  glowing?: boolean;
}

const CyberButton = React.forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, variant, size, glowing = false, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          cyberButtonVariants({ variant, size }),
          glowing && "animate-pulse-glow",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
CyberButton.displayName = "CyberButton";

export { CyberButton, cyberButtonVariants };
