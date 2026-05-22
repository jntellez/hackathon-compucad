import { useEffect, useState } from 'react';

type HealthState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function App() {
  const [health, setHealth] = useState<HealthState>({
    status: 'idle',
    message: 'Waiting to check API status.'
  });

  useEffect(() => {
    async function checkHealth() {
      setHealth({ status: 'loading', message: 'Checking API health...' });

      try {
        const response = await fetch(`${API_URL}/api/health`);

        if (!response.ok) {
          throw new Error('API health check failed');
        }

        const data = (await response.json()) as { status: string; timestamp: string };

        setHealth({
          status: 'success',
          message: `API is ${data.status} · ${new Date(data.timestamp).toLocaleString()}`
        });
      } catch (_error) {
        setHealth({
          status: 'error',
          message: 'Could not reach the API. Start the backend and try again.'
        });
      }
    }

    void checkHealth();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="space-y-4">
          <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-300">
            Hackathon scaffold
          </span>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Compucad Training Agent</h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Initial foundation for an employee AI training platform. This scaffold keeps the frontend,
              backend, and shared code organized without introducing the business logic yet.
            </p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
            <h2 className="text-lg font-medium text-white">Frontend</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              React, Vite, TypeScript, and TailwindCSS for a fast and maintainable UI baseline.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
            <h2 className="text-lg font-medium text-white">Backend</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Express, TypeScript, Prisma, and PostgreSQL ready for future deterministic business rules.
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-white">API health check</h2>
              <p className="mt-2 text-sm text-slate-300">Minimal connectivity test to confirm the scaffold is wired correctly.</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                health.status === 'success'
                  ? 'bg-emerald-400/10 text-emerald-300'
                  : health.status === 'error'
                    ? 'bg-rose-400/10 text-rose-300'
                    : 'bg-slate-800 text-slate-300'
              }`}
            >
              {health.status}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-200">{health.message}</p>
        </section>
      </div>
    </main>
  );
}
