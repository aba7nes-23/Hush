import { LockKeyhole, Radio, Sparkles } from 'lucide-react';
import { FeatureModule } from '../../components/ui/feature-module';

const FEATURES = [
  {
    icon: LockKeyhole,
    title: 'Only the people invited',
    description: 'Share a one-time room key directly with the people you mean to reach.',
    accent: 'cyan',
  },
  {
    icon: Radio,
    title: 'Direct when it can be',
    description: 'Encrypted peer-to-peer messages, file sharing, and voice or video calls.',
    accent: 'magenta',
  },
  {
    icon: Sparkles,
    title: 'Temporary by design',
    description: 'Room content lives in memory. Leave or restart, and Hush clears its local history.',
    accent: 'yellow',
  },
] as const;

export function FeatureModuleDemo() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {FEATURES.map((feature) => (
        <FeatureModule key={feature.title} {...feature} />
      ))}
    </div>
  );
}
