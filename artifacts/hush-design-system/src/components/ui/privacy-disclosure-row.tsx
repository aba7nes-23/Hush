import { cn } from '../../lib/utils';

export type PrivacyDisclosureTone = 'keep' | 'limit';

export interface PrivacyDisclosureRowProps {
  number: number;
  title: string;
  body: string;
  tone: PrivacyDisclosureTone;
  className?: string;
}

export function PrivacyDisclosureRow({
  number,
  title,
  body,
  tone,
  className,
}: PrivacyDisclosureRowProps) {
  const numberColor = tone === 'keep' ? 'text-primary' : 'text-chart-3';

  return (
    <article
      className={cn(
        'grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 rounded-[2px] border border-border border-l-2 bg-card/70 p-4 transition-colors hover:bg-secondary/60 sm:grid-cols-[3.75rem_minmax(0,11.875rem)_minmax(0,1fr)] sm:gap-x-5 sm:p-5',
        tone === 'keep' ? 'border-l-primary' : 'border-l-chart-3',
        className,
      )}
      data-tone={tone}
    >
      <span className={cn('row-span-2 font-mono text-2xl font-bold leading-none sm:row-span-1', numberColor)} aria-hidden="true">
        {String(number).padStart(2, '0')}
      </span>
      <h2 className="pt-0.5 font-mono text-xs font-bold uppercase leading-relaxed text-foreground">
        {title}
      </h2>
      <p className="col-start-2 text-sm leading-relaxed text-muted-foreground sm:col-start-auto">
        {body}
      </p>
    </article>
  );
}
