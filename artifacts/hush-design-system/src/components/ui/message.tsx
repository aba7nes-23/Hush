import type { ReactNode } from 'react';
import { Download, File } from 'lucide-react';
import { cn } from '../../lib/utils';

export type MessageContent =
  | { kind: 'text'; text: string }
  | { kind: 'file'; name: string; size: number };

export interface MessageItemProps {
  author: string;
  timestamp: number;
  own?: boolean;
  content: MessageContent;
  onSave?: () => void;
  className?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MessageBubble({
  children,
  own,
}: {
  children: ReactNode;
  own: boolean;
}) {
  return (
    <div
      className={cn(
        'max-w-full whitespace-pre-wrap break-words rounded-[2px] border px-3.5 py-2.5 font-mono text-[13px] leading-relaxed',
        own
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border border-l-2 border-l-accent bg-secondary text-secondary-foreground',
      )}
    >
      {children}
    </div>
  );
}

export function MessageItem({
  author,
  timestamp,
  own = false,
  content,
  onSave,
  className,
}: MessageItemProps) {
  const date = new Date(timestamp);
  const timeLabel = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
  const authorLabel = own ? 'You' : author;

  return (
    <article
      className={cn(
        'flex max-w-[78%] flex-col items-start gap-1.5',
        own && 'ml-auto items-end',
        className,
      )}
    >
      <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
        <b className={cn('font-semibold', own ? 'text-accent' : 'text-primary')}>
          {authorLabel}
        </b>
        <time dateTime={date.toISOString()}>{timeLabel}</time>
      </div>
      {content.kind === 'text' ? (
        <MessageBubble own={own}>{content.text}</MessageBubble>
      ) : (
        <MessageBubble own={own}>
          <span className="flex min-w-[14rem] items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-[2px] border border-current/30 bg-current/10">
              <File size={17} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block max-w-48 overflow-hidden text-ellipsis whitespace-nowrap text-xs">
                {content.name}
              </strong>
              <small className="mt-1 block font-mono text-[10px] opacity-75">
                {formatBytes(content.size)}
              </small>
            </span>
            {!own && onSave ? (
              <button
                className="grid size-8 shrink-0 place-items-center rounded-[2px] border border-current/40 bg-transparent hover:bg-current/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                type="button"
                onClick={onSave}
                aria-label={`Save ${content.name}`}
                title="Save file"
              >
                <Download size={15} aria-hidden="true" />
              </button>
            ) : null}
          </span>
        </MessageBubble>
      )}
    </article>
  );
}
