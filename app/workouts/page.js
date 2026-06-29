'use client';

import { useState, useEffect } from 'react';
import WorkoutLogger from '@/components/WorkoutLogger';

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [historyId, setHistoryId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Workout logger state
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [completedLog, setCompletedLog] = useState(null);

  // Edit state
  const [editExercises, setEditExercises] = useState([]);
  const [editName, setEditName] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // History state
  const [logs, setLogs] = useState({});
  const [loadingLogs, setLoadingLogs] = useState(null);

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

  async function fetchLogs(workoutId) {
    if (logs[workoutId]) {
      setHistoryId(historyId === workoutId ? null : workoutId);
      return;
    }
    setLoadingLogs(workoutId);
    try {
      const res = await fetch(`/api/logs?workout_id=${workoutId}`);
      const data = await res.json();
      setLogs(prev => ({ ...prev, [workoutId]: data.logs || [] }));
      setHistoryId(workoutId);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoadingLogs(null);
    }
  }

  // --- Edit functions ---
  function startEditing(workout) {
    setEditingId(workout.id);
    setEditName(workout.name);
    setEditExercises(workout.exercises.map(ex => ({ ...ex })));
    setExpandedId(null);
    setHistoryId(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditExercises([]);
    setEditName('');
  }

  function updateEditExercise(index, field, value) {
    const updated = [...editExercises];
    updated[index] = { ...updated[index], [field]: value };
    setEditExercises(updated);
  }

  function removeEditExercise(index) {
    setEditExercises(editExercises.filter((_, i) => i !== index));
  }

  function moveExercise(index, direction) {
    const updated = [...editExercises];
    const target = index + direction;
    if (target < 0 || target >= updated.length) return;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setEditExercises(updated);
  }

  async function saveEdit(workoutId) {
    if (!editName.trim() || editExercises.length === 0) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/workouts/${workoutId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), exercises: editExercises }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkouts(workouts.map(w => w.id === workoutId ? data.workout : w));
        cancelEditing();
      }
    } catch (err) {
      console.error('Failed to save edit:', err);
    } finally {
      setSavingEdit(false);
    }
  }

  // --- Delete functions ---
  async function handleDelete(id, includeHistory) {
    setDeleting(id);
    try {
      const url = includeHistory
        ? `/api/workouts/${id}?include_history=true`
        : `/api/workouts/${id}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        setWorkouts(workouts.filter(w => w.id !== id));
        if (expandedId === id) setExpandedId(null);
        if (historyId === id) setHistoryId(null);
        if (editingId === id) cancelEditing();
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error('Failed to delete workout:', err);
    } finally {
      setDeleting(null);
    }
  }

  function handleWorkoutComplete(log) {
    setActiveWorkout(null);
    setCompletedLog(log);
    setLogs(prev => ({
      ...prev,
      [log.workout_id]: [log, ...(prev[log.workout_id] || [])],
    }));
    setTimeout(() => setCompletedLog(null), 5000);
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  function formatDateTime(iso) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  }

  function formatDuration(start, end) {
    const ms = new Date(end) - new Date(start);
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  function totalVolume(workout) {
    return workout.exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps), 0);
  }

  // Show the workout logger full-screen
  if (activeWorkout) {
    return (
      <WorkoutLogger
        workout={activeWorkout}
        onComplete={handleWorkoutComplete}
        onCancel={() => setActiveWorkout(null)}
      />
    );
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
          <h1 className="text-xl font-semibold text-white">My Workouts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {workouts.length} saved workout{workouts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <a
          href="/"
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium
            rounded-xl transition-colors"
        >
          + New Workout
        </a>
      </div>

      {/* Completed workout toast */}
      {completedLog && (
        <div className="mb-4 p-4 rounded-xl bg-teal/10 border border-teal/20 slide-up">
          <p className="text-teal text-sm font-medium">
            ✓ Workout complete — {completedLog.total_sets} sets,{' '}
            {completedLog.total_volume.toLocaleString()} lb total volume
          </p>
          <p className="text-slate-500 text-xs mt-0.5">
            {formatDuration(completedLog.started_at, completedLog.completed_at)} session
          </p>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div className="bg-surface-card rounded-2xl p-5 max-w-sm w-full border border-white/5"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-white font-medium text-sm mb-2">Delete Workout</h3>
            <p className="text-slate-400 text-xs mb-4">
              Choose what to remove for "{deleteConfirm.name}":
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleDelete(deleteConfirm.id, false)}
                disabled={deleting}
                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 text-left transition-colors"
              >
                <p className="text-sm text-slate-200">Delete plan only</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Removes the workout template. History logs are kept.
                </p>
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id, true)}
                disabled={deleting}
                className="w-full p-3 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-left
                  border border-red-500/20 transition-colors"
              >
                <p className="text-sm text-red-400">Delete everything</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Removes the plan and all workout history. Cannot be undone.
                </p>
              </button>
            </div>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="w-full mt-3 p-2 text-xs text-slate-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
              {/* --- EDIT MODE --- */}
              {editingId === workout.id ? (
                <div className="p-4">
                  {/* Editable name */}
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-surface text-white text-sm rounded-lg px-3 py-2 mb-3
                      border border-white/10 focus:border-accent/50 outline-none"
                  />

                  {/* Editable exercise list */}
                  <div className="space-y-2 mb-3">
                    {editExercises.map((ex, i) => (
                      <div key={i} className="flex items-center gap-2 bg-surface rounded-lg p-2.5">
                        {/* Reorder */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button
                            onClick={() => moveExercise(i, -1)}
                            disabled={i === 0}
                            className="text-[10px] text-slate-500 hover:text-white disabled:opacity-20"
                          >▲</button>
                          <button
                            onClick={() => moveExercise(i, 1)}
                            disabled={i === editExercises.length - 1}
                            className="text-[10px] text-slate-500 hover:text-white disabled:opacity-20"
                          >▼</button>
                        </div>

                        {ex.cdn_gif && (
                          <img src={ex.cdn_gif} alt={ex.name}
                            className="w-9 h-9 rounded-lg object-cover shrink-0" />
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-200 truncate">{ex.name}</p>
                        </div>

                        {/* Sets */}
                        <div className="flex items-center gap-1">
                          <input
                            type="number" min="1" max="20" value={ex.sets}
                            onChange={e => updateEditExercise(i, 'sets', parseInt(e.target.value) || 1)}
                            className="w-10 bg-surface-elevated text-white text-xs text-center rounded-md
                              py-1 border border-white/10 outline-none"
                          />
                          <span className="text-[10px] text-slate-600">×</span>
                          <input
                            type="number" min="1" max="100" value={ex.reps}
                            onChange={e => updateEditExercise(i, 'reps', parseInt(e.target.value) || 1)}
                            className="w-10 bg-surface-elevated text-white text-xs text-center rounded-md
                              py-1 border border-white/10 outline-none"
                          />
                        </div>

                        {/* Rest */}
                        <div className="flex items-center gap-0.5">
                          <input
                            type="number" min="0" max="300" step="15" value={ex.rest}
                            onChange={e => updateEditExercise(i, 'rest', parseInt(e.target.value) || 0)}
                            className="w-12 bg-surface-elevated text-white text-xs text-center rounded-md
                              py-1 border border-white/10 outline-none"
                          />
                          <span className="text-[10px] text-slate-600">s</span>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeEditExercise(i)}
                          className="text-slate-600 hover:text-red-400 text-xs p-1 transition-colors"
                        >✕</button>
                      </div>
                    ))}
                  </div>

                  {editExercises.length === 0 && (
                    <p className="text-xs text-red-400 mb-2">
                      Add at least one exercise (go to the library to pick more).
                    </p>
                  )}

                  {/* Save / Cancel */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(workout.id)}
                      disabled={savingEdit || editExercises.length === 0 || !editName.trim()}
                      className="flex-1 py-2 text-xs font-medium text-white bg-teal hover:bg-teal-hover
                        rounded-lg transition-colors disabled:opacity-40"
                    >
                      {savingEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-white/5 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* --- VIEW MODE --- */}
                  {/* Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => setExpandedId(expandedId === workout.id ? null : workout.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-100 text-sm">{workout.name}</h3>
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
                    <div className="flex items-center gap-1.5">
                      {/* Start workout */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveWorkout(workout); }}
                        className="px-3 py-1.5 text-xs font-medium text-white rounded-lg
                          bg-teal hover:bg-teal-hover transition-colors"
                      >
                        Start
                      </button>
                      {/* Edit */}
                      <button
                        onClick={(e) => { e.stopPropagation(); startEditing(workout); }}
                        className="p-1.5 text-xs text-slate-500 hover:text-white bg-white/5 rounded-lg transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      {/* History */}
                      <button
                        onClick={(e) => { e.stopPropagation(); fetchLogs(workout.id); }}
                        className={`p-1.5 text-xs rounded-lg transition-colors ${
                          historyId === workout.id
                            ? 'bg-accent/15 text-accent'
                            : 'text-slate-500 hover:text-white bg-white/5'
                        }`}
                        title="History"
                      >
                        {loadingLogs === workout.id ? '...' : '📊'}
                      </button>
                      {/* Delete */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(workout); }}
                        className="p-1.5 text-xs text-slate-500 hover:text-red-400 bg-white/5 rounded-lg transition-colors"
                        title="Delete"
                      >
                        🗑
                      </button>
                      <span className="text-slate-500 text-xs ml-1">
                        {expandedId === workout.id ? '▾' : '▸'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded exercise list */}
                  {expandedId === workout.id && (
                    <div className="border-t border-white/5 p-4 space-y-2">
                      {workout.exercises.map((ex, i) => (
                        <div key={i} className="flex items-center gap-3 bg-surface rounded-lg p-3">
                          {ex.cdn_gif && (
                            <img src={ex.cdn_gif} alt={ex.name}
                              className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-200 truncate">{ex.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{ex.target} • {ex.equipment}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm text-slate-300 font-mono">{ex.sets}×{ex.reps}</p>
                            {ex.rest > 0 && (
                              <p className="text-[10px] text-slate-500">{ex.rest}s rest</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Workout history */}
                  {historyId === workout.id && logs[workout.id] && (
                    <div className="border-t border-white/5 p-4">
                      <h4 className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                        Workout History
                      </h4>
                      {logs[workout.id].length === 0 ? (
                        <p className="text-xs text-slate-600 text-center py-4">
                          No sessions logged yet. Hit Start to record your first one.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {logs[workout.id].map(log => (
                            <div key={log.id} className="bg-surface rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-slate-200">
                                  {formatDateTime(log.completed_at)}
                                </span>
                                <span className="text-xs text-teal font-mono">
                                  {formatDuration(log.started_at, log.completed_at)}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-slate-500">
                                  {log.total_sets} sets completed
                                </span>
                                {log.total_volume > 0 && (
                                  <span className="text-xs text-slate-500">
                                    {log.total_volume.toLocaleString()} lb volume
                                  </span>
                                )}
                              </div>
                              {log.notes && (
                                <p className="text-xs text-slate-500 mt-1.5 italic">
                                  &ldquo;{log.notes}&rdquo;
                                </p>
                              )}
                              <div className="mt-2 space-y-1">
                                {log.exercises.map((ex, i) => {
                                  const completedSets = ex.sets.filter(s => s.completed);
                                  if (completedSets.length === 0) return null;
                                  return (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                      <span className="text-slate-400 truncate flex-1">{ex.name}</span>
                                      <span className="text-slate-500 font-mono shrink-0 ml-2">
                                        {completedSets.map(s => `${s.weight || 0}×${s.reps}`).join(', ')}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
