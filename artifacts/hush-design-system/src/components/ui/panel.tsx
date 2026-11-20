import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type TerminalPanelVariant =
  | 'console'
  | 'conversation'
  | 'side'
  | 'connecting';

export interface TerminalPanelProps extends HTMLAttributes<HTMLElement> {
  variant?: TerminalPanelVariant;
  title?: string;
  children: ReactNode;
}

const variantClasses: Record<TerminalPanelVariant, string> = {
  console:
    'overflow-hidden bg-[repeating-linear-gradient(to_bottom,color-mix(in_srgb,var(--color-muted-foreground)_4%,transparent)_0,color-mix(in_srgb,var(--color-muted-foreground)_4%,transparent)_1px,transparent_1px,transparent_4px)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-primary)_35%,transparent),0_0_44px_color-mix(in_srgb,var(--color-accent)_9%,transparent)]',
  conversation: 'flex min-h-72 flex-col overflow-hidden bg-card',
  side: 'bg-card p-4',
  connecting: 'mx-auto w-full max-w-md bg-card p-8 text-center shadow-lg',
};

export function TerminalPanel({
  variant = 'side',
  title,
  className,
  children,
  ...props
}: TerminalPanelProps) {
  return (
    <section
      className={cn(
        'rounded-[2px] border border-border text-card-foreground',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {title ? (
        <header className="flex min-h-12 items-center justify-between border-b border-border bg-secondary/70 px-4">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            {title}
          </span>
          <span className="flex gap-1.5" aria-hidden="true">
            <i className="size-2 rounded-[1px] bg-destructive" />
            <i className="size-2 rounded-[1px] bg-accent" />
            <i className="size-2 rounded-[1px] bg-primary" />
          </span>
        </header>
      ) : null}
      {children}
    </section>
  );
}
