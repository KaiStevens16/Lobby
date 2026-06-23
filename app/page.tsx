import Link from "next/link";

const MEET_LINK =
  process.env.NEXT_PUBLIC_MEET_LINK ?? "https://meet.google.com/your-link-here";

export default function HomePage() {
  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
      <div className="ambient-glow" />
      <div className="grid-overlay" />

      <div className="relative z-10 w-full max-w-2xl text-center">
        <p className="animate-fade-up text-[11px] tracking-[0.35em] uppercase text-gold-dim mb-8">
          Private Session
        </p>

        <h1 className="animate-fade-up-delay-1 font-[family-name:var(--font-display)] text-6xl sm:text-7xl md:text-8xl font-medium tracking-tight text-gold-gradient mb-6">
          Lobby
        </h1>

        <div className="animate-fade-up-delay-1 gold-line w-32 mx-auto mb-10" />

        <p className="animate-fade-up-delay-2 text-lg sm:text-xl text-white/60 font-light leading-relaxed max-w-md mx-auto mb-14">
          You&apos;re in the right place. The session will begin shortly.
        </p>

        <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={MEET_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-flex items-center justify-center px-10 py-4 text-sm rounded-sm w-full sm:w-auto min-w-[220px]"
          >
            Join Meeting
          </a>
          <Link
            href="/lobby"
            className="btn-ghost inline-flex items-center justify-center px-10 py-4 text-sm rounded-sm w-full sm:w-auto min-w-[220px] tracking-[0.06em] uppercase"
          >
            Enter Portal
          </Link>
        </div>

        <p className="animate-fade-up-delay-3 mt-16 text-xs text-white/25 tracking-widest uppercase">
          Roman &amp; Kai
        </p>
      </div>
    </main>
  );
}
