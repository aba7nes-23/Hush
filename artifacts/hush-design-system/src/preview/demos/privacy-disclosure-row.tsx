import { PrivacyDisclosureRow } from '../../components/ui/privacy-disclosure-row';

const DISCLOSURES = [
  {
    number: 1,
    title: 'Messages live in memory',
    body: 'Messages and received files stay in working memory, not a saved inbox. When you choose a file, Hush reads it into memory to send it. Explicitly saving or sharing a received file creates a copy outside this promise.',
    tone: 'keep',
  },
  {
    number: 4,
    title: 'Other people can keep things',
    body: 'Anyone in the room can copy text, save a file you sent, photograph their screen, or take a screenshot. Hush cannot prevent screenshots on any device.',
    tone: 'limit',
  },
  {
    number: 7,
    title: 'Peers can see your IP',
    body: 'Calls and messages travel directly between devices, which reveals your IP address to the other people in the room. Turn on "Hide my IP from peers" before joining to route through a relay instead.',
    tone: 'limit',
  },
] as const;

export function PrivacyDisclosureRowDemo() {
  return (
    <div className="space-y-3">
      {DISCLOSURES.map((disclosure) => (
        <PrivacyDisclosureRow key={disclosure.number} {...disclosure} />
      ))}
    </div>
  );
}
