import { AudioLines } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface BrandLockupProps {
  href?: string;
  compact?: boolean;
  className?: string;
}

export function BrandLockup({
  href = '/',
  compact = false,
  className,
}: BrandLockupProps) {
  return (
    <a
      href={href}
      className={cn(
        'inline-flex items-center gap-2.5 font-mono font-bold tracking-[-0.06em] text-foreground no-underline',
        className,
      )}
      aria-label="Hush home"
    >
      <span className="grid size-[34px] place-items-center rounded-[3px] border border-primary bg-card text-primary shadow-[inset_0_0_14px_color-mix(in_srgb,var(--color-primary)_12%,transparent),0_0_14px_color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
        <AudioLines size={19} aria-hidden="true" strokeWidth={2.2} />
      </span>
      {!compact ? (
        <span className="text-[22px] leading-none drop-shadow-[0_0_12px_color-mix(in_srgb,var(--color-accent)_35%,transparent)]">
          hush
        </span>
      ) : null}
    </a>
  );
}
