import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
      <div className="ambient-glow" />
      <div className="grid-overlay" />

      <div className="relative z-10 w-full max-w-2xl text-center">
        <h1 className="animate-fade-up font-[family-name:var(--font-display)] text-6xl sm:text-7xl md:text-8xl font-medium tracking-tight text-gold-gradient mb-6">
          Lobby
        </h1>

        <div className="animate-fade-up-delay-1 gold-line w-32 mx-auto mb-10" />

        <p className="animate-fade-up-delay-2 text-lg sm:text-xl text-black/55 font-light leading-relaxed max-w-md mx-auto mb-14">
          Let&apos;s get the fuck after it today, fellas
        </p>

        <div className="animate-fade-up-delay-3 flex justify-center">
          <Link
            href="/lobby"
            className="btn-gold inline-flex items-center justify-center px-10 py-4 text-sm rounded-sm w-full sm:w-auto min-w-[220px] tracking-[0.06em] uppercase"
          >
            Enter Portal
          </Link>
        </div>

        <p className="animate-fade-up-delay-3 mt-16 text-xs text-black/30 tracking-widest uppercase">
          Roman, Kai &amp; Grey
        </p>
      </div>
    </main>
  );
}
