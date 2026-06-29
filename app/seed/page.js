'use client';

import { useState } from 'react';

export default function SeedPage() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSeed() {
    if (status === 'loading') return;
    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Seed failed');
      }

      setResult(data);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-white mb-2">Database Setup</h1>
      <p className="text-slate-400 text-sm mb-8">
        Seed your Upstash Redis database with the exercise dataset from GitHub.
        This fetches all 1,324 exercises and stores them in Redis. Run this once
        after initial setup, or again to refresh the data.
      </p>

      <div className="bg-surface-card rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          <span className="text-sm text-slate-300">
            Source: hasaneyldrm/exercises-dataset
          </span>
        </div>

        <button
          onClick={handleSeed}
          disabled={status === 'loading'}
          className="w-full py-3 rounded-lg font-semibold text-sm transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            bg-accent hover:bg-accent-hover text-white"
        >
          {status === 'loading' ? 'Seeding Redis...' : 'Seed Database'}
        </button>

        {status === 'success' && result && (
          <div className="mt-4 p-4 rounded-lg bg-teal/10 border border-teal/20">
            <p className="text-teal font-semibold text-sm mb-2">✓ Database seeded</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <span>Exercises loaded:</span>
              <span className="text-white font-mono">{result.count}</span>
              <span>Body part categories:</span>
              <span className="text-white font-mono">{result.categories}</span>
              <span>Equipment types:</span>
              <span className="text-white font-mono">{result.equipment}</span>
              <span>Target muscles:</span>
              <span className="text-white font-mono">{result.targets}</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
