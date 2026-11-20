import { useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, AudioLines } from 'lucide-react';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page not found — Hush';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'This page is not part of Hush.');
  }, []);

  return (
    <main className="hush-page not-found">
      <section>
        <span className="brand-mark"><AudioLines size={20} /></span>
        <p className="eyebrow">404 / no room here</p>
        <h1>Wrong turn.</h1>
        <p>This page is not part of Hush. Rooms are temporary; start again from the beginning.</p>
        <Link href="/" className="btn btn-primary" data-testid="link-not-found-home"><ArrowLeft size={15} /> Return to Hush</Link>
      </section>
    </main>
  );
}
