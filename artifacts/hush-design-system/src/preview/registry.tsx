import { lazy, type ComponentType } from 'react';
import {
  ColorsPage,
  FontsPage,
  LayoutPage,
  OverviewPage,
} from './foundations';

function lazyPage(load: () => Promise<ComponentType>) {
  return lazy(async () => ({ default: await load() }));
}

const BrandDemo = lazyPage(() =>
  import('./demos/brand').then(({ BrandDemo }) => BrandDemo),
);
const CallControlsDemo = lazyPage(() =>
  import('./demos/call-controls').then(({ CallControlsDemo }) => CallControlsDemo),
);
const ButtonDemo = lazyPage(() =>
  import('./demos/button').then(({ ButtonDemo }) => ButtonDemo),
);
const FeatureModuleDemo = lazyPage(() =>
  import('./demos/feature-module').then(({ FeatureModuleDemo }) => FeatureModuleDemo),
);
const InputDemo = lazyPage(() =>
  import('./demos/input').then(({ InputDemo }) => InputDemo),
);
const MessageDemo = lazyPage(() =>
  import('./demos/message').then(({ MessageDemo }) => MessageDemo),
);
const PanelDemo = lazyPage(() =>
  import('./demos/panel').then(({ PanelDemo }) => PanelDemo),
);
const PrivacyDisclosureRowDemo = lazyPage(() =>
  import('./demos/privacy-disclosure-row').then(({ PrivacyDisclosureRowDemo }) => PrivacyDisclosureRowDemo),
);

export type PreviewEntry = {
  id: string;
  name: string;
  description: string;
  Page: ComponentType;
};

export type NavGroup = {
  name: string;
  entries: PreviewEntry[];
};

export const DESIGN_SYSTEM = {
  title: 'Hush Design System',
  description:
    'A pixel-arcade terminal visual language for Hush’s temporary private rooms.',
} as const;

export const OVERVIEW_ENTRY: PreviewEntry = {
  id: 'overview',
  name: 'Overview',
  description: 'The Hush visual foundations and component pilot.',
  Page: OverviewPage,
};

export const NAV_GROUPS: NavGroup[] = [
  {
    name: 'Brand',
    entries: [
      {
        id: 'brand-lockup',
        name: 'Brand lockup',
        description: 'The Hush text wordmark with its AudioLines icon.',
        Page: BrandDemo,
      },
    ],
  },
  {
    name: 'Content',
    entries: [
      {
        id: 'feature-module',
        name: 'Feature module',
        description: 'The three boxed value propositions from Hush’s home screen.',
        Page: FeatureModuleDemo,
      },
    ],
  },
  {
    name: 'Colors',
    entries: [
      {
        id: 'color-roles',
        name: 'Color roles',
        description: 'Arcade core, surface, and semantic color roles.',
        Page: ColorsPage,
      },
    ],
  },
  {
    name: 'Fonts',
    entries: [
      {
        id: 'type-scale',
        name: 'Type system',
        description: 'System monospace, uppercase labels, and readable body copy.',
        Page: FontsPage,
      },
    ],
  },
  {
    name: 'Layout',
    entries: [
      {
        id: 'spacing-radius',
        name: 'Spacing and surfaces',
        description: 'Compact spacing, squared corners, and terminal panels.',
        Page: LayoutPage,
      },
    ],
  },
  {
    name: 'Actions',
    entries: [
      {
        id: 'button',
        name: 'Buttons',
        description: 'Primary, quiet, destructive, and icon-only actions.',
        Page: ButtonDemo,
      },
    ],
  },
  {
    name: 'Forms and inputs',
    entries: [
      {
        id: 'input',
        name: 'Text field',
        description: 'Native text entry with terminal focus and placeholder states.',
        Page: InputDemo,
      },
    ],
  },
  {
    name: 'Data display',
    entries: [
      {
        id: 'message-item',
        name: 'Message item',
        description: 'Incoming, outgoing, text, and file message states.',
        Page: MessageDemo,
      },
    ],
  },
  {
    name: 'Calls',
    entries: [
      {
        id: 'call-controls',
        name: 'Call controls',
        description: 'Incoming, active, outgoing, and floating video-call actions.',
        Page: CallControlsDemo,
      },
    ],
  },
  {
    name: 'Privacy',
    entries: [
      {
        id: 'privacy-disclosure-row',
        name: 'Disclosure row',
        description: 'A numbered statement with keep or limit emphasis.',
        Page: PrivacyDisclosureRowDemo,
      },
    ],
  },
  {
    name: 'Structure',
    entries: [
      {
        id: 'terminal-panel',
        name: 'Terminal panel',
        description: 'Console, conversation, side, and connecting surfaces.',
        Page: PanelDemo,
      },
    ],
  },
];

export const ALL_ENTRIES: PreviewEntry[] = [
  OVERVIEW_ENTRY,
  ...NAV_GROUPS.flatMap((group) => group.entries),
];

const duplicateIds = ALL_ENTRIES.map((entry) => entry.id).filter(
  (id, index, ids) => ids.indexOf(id) !== index,
);
if (duplicateIds.length > 0) {
  throw new Error(
    `Duplicate preview page id(s): ${[...new Set(duplicateIds)].join(
      ', ',
    )}. Every page id must be unique across all nav groups.`,
  );
}
