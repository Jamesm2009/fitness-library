'use client';

import { useState, useEffect } from 'react';

export default function WorkoutLogger({ workout, onComplete, onCancel }) {
  const [exercises, setExercises] = useState([]);
  const [startedAt] = useState(new Date().toISOString());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Initialize exercise log state from workout template
  useEffect(() => {
    const initial = workout.exercises.map(ex => ({
      exercise_id: ex.exercise_id,
      name: ex.name,
      cdn_gif: ex.cdn_gif,
      target: ex.target || '',
      equipment: ex.equipment || '',
      target_sets: ex.sets,
      target_reps: ex.reps,
      sets: Array.from({ length: ex.sets }, () => ({
        weight: 0,
        reps: ex.reps,
        completed: false,
      })),
    }));
    setExercises(initial);
  }, [workout]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function updateSet(exIndex, setIndex, field, value) {
    const updated = [...exercises];
    updated[exIndex].sets[setIndex] = {
      ...updated[exIndex].sets[setIndex],
      [field]: value,
    };
    setExercises(updated);
  }

  function toggleSetComplete(exIndex, setIndex) {
    const updated = [...exercises];
    updated[exIndex].sets[setIndex].completed = !updated[exIndex].sets[setIndex].completed;
    setExercises(updated);
  }

  function addSet(exIndex) {
    const updated = [...exercises];
    const lastSet = updated[exIndex].sets[updated[exIndex].sets.length - 1];
    updated[exIndex].sets.push({
      weight: lastSet?.weight || 0,
      reps: updated[exIndex].target_reps,
      completed: false,
    });
    setExercises(updated);
  }

  function removeSet(exIndex, setIndex) {
    const updated = [...exercises];
    if (updated[exIndex].sets.length > 1) {
      updated[exIndex].sets.splice(setIndex, 1);
      setExercises(updated);
    }
  }

  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0
  );
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalVolume = exercises.reduce(
    (sum, ex) => sum + ex.sets
      .filter(s => s.completed)
      .reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0),
    0
  );

  const [saveError, setSaveError] = useState('');

  async function handleFinish() {
    setSaving(true);
    setSaveError('');
    try {
      // Slim payload — strip fields the API doesn't need
      const trimmedExercises = exercises.map(ex => ({
        exercise_id: ex.exercise_id,
        name: ex.name,
        target: ex.target,
        equipment: ex.equipment,
        cdn_gif: ex.cdn_gif,
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        sets: ex.sets.map(s => ({
          weight: s.weight || 0,
          reps: s.reps || 0,
          completed: !!s.completed,
        })),
      }));

      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workout_id: workout.id,
          exercises: trimmedExercises,
          started_at: startedAt,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.error || `Save failed (${res.status})`);
        return;
      }

      onComplete(data.log);
    } catch (err) {
      console.error('Failed to save log:', err);
      setSaveError('Network error — check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-surface overflow-y-auto">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white text-sm">{workout.name}</h2>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-teal font-mono">{formatTime(elapsed)}</span>
                <span className="text-xs text-slate-500">
                  {completedSets}/{totalSets} sets
                </span>
                {totalVolume > 0 && (
                  <span className="text-xs text-slate-500">
                    {totalVolume.toLocaleString()} vol
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (completedSets > 0) {
                    if (confirm('Cancel workout? Your progress will be lost.')) onCancel();
                  } else {
                    onCancel();
                  }
                }}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg
                  bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFinish}
                disabled={completedSets === 0 || saving}
                className="px-4 py-1.5 text-xs font-medium text-white rounded-lg
                  bg-teal hover:bg-teal-hover transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Finish'}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal rounded-full transition-all duration-300"
              style={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Save error display */}
      {saveError && (
        <div className="max-w-2xl mx-auto px-4 pt-3">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{saveError}</p>
          </div>
        </div>
      )}

      {/* Exercise list */}
      <div className="max-w-2xl mx-auto px-4 py-4 pb-32 space-y-4">
        {exercises.map((ex, exIndex) => {
          const exCompleted = ex.sets.filter(s => s.completed).length;
          return (
            <div key={exIndex} className="bg-surface-card rounded-xl border border-white/5 overflow-hidden">
              {/* Exercise header */}
              <div className="flex items-center gap-3 p-4">
                {ex.cdn_gif && (
                  <img
                    src={ex.cdn_gif}
                    alt={ex.name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">{ex.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{ex.target} • {ex.equipment}</p>
                </div>
                <span className={`text-xs font-mono ${
                  exCompleted === ex.sets.length ? 'text-teal' : 'text-slate-500'
                }`}>
                  {exCompleted}/{ex.sets.length}
                </span>
              </div>

              {/* Set headers */}
              <div className="px-4 pb-1">
                <div className="flex items-center gap-2 text-[10px] text-slate-600 uppercase tracking-wider">
                  <span className="w-10 text-center">Set</span>
                  <span className="w-20 text-center">Weight</span>
                  <span className="w-16 text-center">Reps</span>
                  <span className="flex-1" />
                </div>
              </div>

              {/* Sets */}
              <div className="px-4 pb-3 space-y-1.5">
                {ex.sets.map((set, setIndex) => (
                  <div
                    key={setIndex}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      set.completed ? 'bg-teal/5' : 'bg-surface'
                    }`}
                  >
                    {/* Set number */}
                    <span className={`w-10 text-center text-xs font-mono ${
                      set.completed ? 'text-teal' : 'text-slate-500'
                    }`}>
                      {setIndex + 1}
                    </span>

                    {/* Weight input */}
                    <div className="w-20 relative">
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={set.weight || ''}
                        placeholder="0"
                        onChange={e => updateSet(exIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                        className={`w-full text-center text-sm py-1.5 rounded-md border outline-none transition-colors ${
                          set.completed
                            ? 'bg-teal/10 border-teal/20 text-teal'
                            : 'bg-surface-elevated border-white/10 text-white focus:border-accent/50'
                        }`}
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-600">lb</span>
                    </div>

                    {/* Reps input */}
                    <div className="w-16">
                      <input
                        type="number"
                        min="0"
                        value={set.reps || ''}
                        placeholder="0"
                        onChange={e => updateSet(exIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                        className={`w-full text-center text-sm py-1.5 rounded-md border outline-none transition-colors ${
                          set.completed
                            ? 'bg-teal/10 border-teal/20 text-teal'
                            : 'bg-surface-elevated border-white/10 text-white focus:border-accent/50'
                        }`}
                      />
                    </div>

                    {/* Complete toggle */}
                    <div className="flex-1 flex justify-end gap-1">
                      <button
                        onClick={() => toggleSetComplete(exIndex, setIndex)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                          set.completed
                            ? 'bg-teal text-surface'
                            : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => removeSet(exIndex, setIndex)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs
                          text-slate-600 hover:text-red-400 hover:bg-white/5 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add set button */}
                <button
                  onClick={() => addSet(exIndex)}
                  className="w-full py-1.5 text-xs text-slate-500 hover:text-teal
                    hover:bg-teal/5 rounded-lg transition-colors"
                >
                  + Add Set
                </button>
              </div>
            </div>
          );
        })}

        {/* Notes */}
        <div className="bg-surface-card rounded-xl border border-white/5 p-4">
          <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">
            Workout Notes
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="How did it feel? Anything to remember next time?"
            rows={3}
            className="w-full bg-surface text-sm text-slate-300 rounded-lg p-3 border border-white/10
              focus:border-accent/50 outline-none resize-none placeholder:text-slate-600"
          />
        </div>
      </div>
    </div>
  );
}
