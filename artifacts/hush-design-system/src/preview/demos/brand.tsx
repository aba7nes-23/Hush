import { BrandLockup } from '../../components/ui/brand';
import { TerminalPanel } from '../../components/ui/panel';

export function BrandDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TerminalPanel title="FULL WORDMARK" className="p-6">
        <div className="flex min-h-24 items-center">
          <BrandLockup href="#overview" />
        </div>
      </TerminalPanel>
      <TerminalPanel title="COMPACT MARK" className="p-6">
        <div className="flex min-h-24 items-center">
          <BrandLockup href="#overview" compact />
        </div>
      </TerminalPanel>
      <p className="text-sm leading-relaxed text-muted-foreground md:col-span-2">
        This lockup follows the current Hush website: its text wordmark and AudioLines icon. No standalone logo file was supplied.
      </p>
    </div>
  );
}
