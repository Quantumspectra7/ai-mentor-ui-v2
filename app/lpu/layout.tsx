import Link from 'next/link';

const navItems = [
  { href: '/lpu', label: 'Overview' },
  { href: '/lpu/videos', label: 'Videos' },
  { href: '/lpu/stories', label: 'Stories' },
  { href: '/lpu/procedures', label: 'Procedures' },
  { href: '/lpu/senior-advice', label: 'Senior Advice' },
  { href: '/lpu/reality-check', label: 'Reality Check' },
  { href: '/lpu/branch-explorer', label: 'Branch Explorer' },
  { href: '/lpu/resources', label: 'Study Resources' },
];

export default function LpuLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grain-overlay">
      <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-xl shadow-lg" aria-label="LPU header">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-center">
          <nav className="flex flex-wrap items-center justify-center gap-3 md:gap-4" aria-label="LPU section navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative px-3.5 py-2 text-sm md:text-base font-semibold text-amber-100/90 transition-all duration-300 hover:text-amber-50 hover:bg-amber-500/10 rounded-lg border border-transparent hover:border-amber-500/40"
              >
                <span className="relative z-10">{item.label}</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
