'use client';

import { useState, useEffect } from 'react';

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  async function fetchWorkouts() {
    try {
      const res = await fetch('/api/workouts');
      const data = await res.json();
      setWorkouts(data.workouts || []);
    } catch (err) {
      console.error('Failed to fetch workouts:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (deleting) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/workouts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWorkouts(workouts.filter(w => w.id !== id));
        if (expandedId === id) setExpandedId(null);
      }
    } catch (err) {
      console.error('Failed to delete workout:', err);
    } finally {
      setDeleting(null);
    }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  function totalVolume(workout) {
    return workout.exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps), 0);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface-card rounded-xl p-4 border border-white/5 animate-pulse">
              <div className="h-5 bg-surface-elevated rounded w-1/3 mb-2" />
              <div className="h-3 bg-surface-elevated rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">My Workouts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {workouts.length} saved workout{workouts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <a
          href="/"
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold
            rounded-xl transition-colors"
        >
          + New Workout
        </a>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🏋️</p>
          <p className="text-slate-400 text-sm mb-1">No saved workouts yet</p>
          <p className="text-slate-600 text-xs">
            Head to the exercise library and build your first workout.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map(workout => (
            <div
              key={workout.id}
              className="bg-surface-card rounded-xl border border-white/5 overflow-hidden"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpandedId(expandedId === workout.id ? null : workout.id)}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm">{workout.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500">
                      {workout.exercise_count || workout.exercises?.length} exercises
                    </span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs text-slate-500">
                      {totalVolume(workout)} total reps
                    </span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs text-slate-500">
                      {formatDate(workout.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this workout?')) handleDelete(workout.id);
                    }}
                    disabled={deleting === workout.id}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors text-xs"
                  >
                    {deleting === workout.id ? '...' : '🗑'}
                  </button>
                  <span className="text-slate-500 text-xs">
                    {expandedId === workout.id ? '▾' : '▸'}
                  </span>
                </div>
              </div>

              {/* Expanded exercise list */}
              {expandedId === workout.id && (
                <div className="border-t border-white/5 p-4 space-y-2">
                  {workout.exercises.map((ex, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-surface rounded-lg p-3"
                    >
                      {ex.cdn_gif && (
                        <img
                          src={ex.cdn_gif}
                          alt={ex.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{ex.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{ex.target} • {ex.equipment}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm text-white font-mono">{ex.sets}×{ex.reps}</p>
                        {ex.rest > 0 && (
                          <p className="text-[10px] text-slate-500">{ex.rest}s rest</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
