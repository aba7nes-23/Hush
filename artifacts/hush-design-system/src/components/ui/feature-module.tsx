import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export type FeatureAccent = 'cyan' | 'magenta' | 'yellow';

const accentStyles: Record<FeatureAccent, { rule: string; icon: string; hover: string }> = {
  cyan: {
    rule: 'bg-primary shadow-[0_0_14px_color-mix(in_srgb,var(--color-primary)_75%,transparent)]',
    icon: 'border-primary/45 text-primary',
    hover: 'hover:border-primary/60',
  },
  magenta: {
    rule: 'bg-accent shadow-[0_0_14px_color-mix(in_srgb,var(--color-accent)_75%,transparent)]',
    icon: 'border-accent/45 text-accent',
    hover: 'hover:border-accent/60',
  },
  yellow: {
    rule: 'bg-chart-3 shadow-[0_0_14px_color-mix(in_srgb,var(--color-chart-3)_75%,transparent)]',
    icon: 'border-chart-3/45 text-chart-3',
    hover: 'hover:border-chart-3/60',
  },
};

export interface FeatureModuleProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: FeatureAccent;
  className?: string;
}

export function FeatureModule({
  icon: Icon,
  title,
  description,
  accent = 'cyan',
  className,
}: FeatureModuleProps) {
  const colors = accentStyles[accent];
  return (
    <article
      className={cn(
        'group relative flex min-w-0 gap-3 overflow-hidden rounded-[2px] border border-border bg-card p-4 transition-colors hover:bg-secondary/60 sm:gap-4',
        colors.hover,
        className,
      )}
    >
      <span className={cn('absolute inset-x-0 top-0 h-0.5', colors.rule)} aria-hidden="true" />
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-[2px] border bg-background/50', colors.icon)}>
        <Icon size={17} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="mb-1 font-mono text-sm font-bold leading-snug text-foreground">{title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </article>
  );
}
