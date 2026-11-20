import { useState } from 'react';
import { Input } from '../../components/ui/input';
import { Stack } from '../parts';

export function InputDemo() {
  const [value, setValue] = useState('');
  return (
    <div className="max-w-xl space-y-8">
      <Stack label="Text field">
        <label htmlFor="demo-name" className="font-mono text-xs uppercase tracking-wide text-primary">
          Temporary name
        </label>
        <Input id="demo-name" placeholder="A name for this room" />
        <p className="text-xs text-muted-foreground">The source uses short labels and muted helper copy.</p>
      </Stack>
      <Stack label="Controlled value">
        <label htmlFor="demo-key" className="font-mono text-xs uppercase tracking-wide text-primary">
          Room key
        </label>
        <Input
          id="demo-key"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="hush_…"
          autoComplete="off"
        />
        <p className="font-mono text-xs text-muted-foreground">{value.length} characters entered</p>
      </Stack>
      <Stack label="States">
        <Input aria-label="Disabled field" disabled value="Unavailable" readOnly />
        <Input aria-label="Invalid field" aria-invalid="true" placeholder="Check this value" />
      </Stack>
    </div>
  );
}
