import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[2px] border px-4 text-xs font-semibold uppercase tracking-[0.06em] transition-[color,background-color,border-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow-[0_0_16px_color-mix(in_srgb,var(--color-primary)_20%,transparent)] hover:brightness-110',
        quiet: 'border-border bg-secondary text-secondary-foreground hover:border-primary hover:text-primary',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:brightness-110',
        outline: 'border-border bg-transparent text-foreground hover:border-primary hover:text-primary',
        ghost: 'border-transparent bg-transparent text-foreground hover:bg-muted',
        link: 'h-auto min-h-0 border-transparent bg-transparent px-0 text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'px-4',
        sm: 'min-h-9 px-3 text-[11px]',
        lg: 'min-h-12 px-6 text-sm',
        icon: 'h-11 min-h-11 w-11 px-0',
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
