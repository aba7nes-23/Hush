import { useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, AudioLines } from 'lucide-react';

const SECTIONS: { title: string; body: string; tone: 'keep' | 'limit' }[] = [
  { tone: 'keep', title: 'Messages live in memory', body: 'Messages and received files stay in working memory, not a saved inbox. When you choose a file, Hush reads it into memory to send it. Explicitly saving or sharing a received file creates a copy outside this promise.' },
  { tone: 'keep', title: 'Leaving clears local history', body: 'Leaving or restarting clears the conversation from Hush. This is not a guarantee of forensic erasure from device memory, system snapshots, clipboard, or any copies you or recipients saved.' },
  { tone: 'keep', title: 'No account, no profile', body: 'The name you type is used only inside the room. It is not saved, and it is not tied to you anywhere else.' },
  { tone: 'limit', title: 'Other people can keep things', body: 'Anyone in the room can copy text, save a file you sent, photograph their screen, or take a screenshot. Hush cannot prevent screenshots on any device.' },
  { tone: 'limit', title: 'The key is trust', body: 'Anyone with the room key can join. Share it directly with people you mean to talk to, and leave the room if it reaches someone you did not expect.' },
  { tone: 'limit', title: 'What the server sees', body: 'Our server helps peers find each other. While a room is open it briefly sees that the room exists, how many devices are in it, and their network addresses. It does not see message content.' },
  { tone: 'limit', title: 'Peers can see your IP', body: 'Calls and messages travel directly between devices, which reveals your IP address to the other people in the room. Turn on "Hide my IP from peers" before joining to route through a relay instead.' },
  { tone: 'limit', title: 'Saving leaves Hush', body: 'If you choose to save a file, that copy lands on your device or in whatever app you send it to. It is no longer covered by Hush leaving nothing behind.' },
  { tone: 'limit', title: 'Calls are a compatibility boundary', body: 'Voice and video run inside an embedded browser frame. Some devices or browsers may block camera or microphone access there; if so, Hush will tell you rather than pretend the call is working.' },
];

export default function Privacy() {
  useEffect(() => {
    document.title = 'Privacy, plainly — Hush';
    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      'The honest version of what Hush keeps, what it clears, and what it cannot promise.',
    );
  }, []);

  return (
    <main className="hush-page">
      <div className="privacy-page">
        <Link href="/" className="privacy-back" data-testid="link-privacy-back">
          <span className="brand-mark"><AudioLines size={16} /></span>
          <ArrowLeft size={14} /> Back to Hush
        </Link>
        <p className="eyebrow">The honest version</p>
        <h1 className="privacy-title">What Hush keeps,<br /><em>and what it can't promise.</em></h1>
        <div aria-label="Hush privacy disclosures">
          {SECTIONS.map((section, index) => (
            <article className={`privacy-row ${section.tone}`} key={section.title} data-testid={`privacy-section-${index + 1}`}>
              <span className="privacy-num">{String(index + 1).padStart(2, '0')}</span>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
