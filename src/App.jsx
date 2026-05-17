function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-12 sm:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-10 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-12">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
              Looks Like It
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              React + Vite + Tailwind
            </h1>
            <p className="mt-4 text-slate-400 sm:text-lg">
              A ready-to-deploy Vercel-friendly frontend starter project.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950/80 p-6 ring-1 ring-white/5">
              <h2 className="text-xl font-semibold text-white">
                Fast Development
              </h2>
              <p className="mt-3 text-slate-400">
                Hot module replacement and small build sizes make it easy to
                iterate.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-950/80 p-6 ring-1 ring-white/5">
              <h2 className="text-xl font-semibold text-white">
                Tailwind Ready
              </h2>
              <p className="mt-3 text-slate-400">
                Configure styles with utility classes and responsive design out
                of the box.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href="https://vercel.com/new"
              target="_blank"
              className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Deploy to Vercel
            </a>
            <a
              href="https://github.com/hojzhn/looks-like-it"
              target="_blank"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
