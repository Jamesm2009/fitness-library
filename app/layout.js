import './globals.css';

export const metadata = {
  title: 'Fitness Library',
  description: 'Exercise library and workout builder',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-surface font-[Inter,sans-serif]">
        <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl">💪</span>
              <span className="font-semibold text-lg text-white tracking-tight">Fitness Library</span>
            </a>
            <div className="flex items-center gap-1">
              <a
                href="/"
                className="px-3 py-1.5 text-sm rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Exercises
              </a>
              <a
                href="/workouts"
                className="px-3 py-1.5 text-sm rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                My Workouts
              </a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
