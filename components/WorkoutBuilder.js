'use client';

import { useState } from 'react';

export default function WorkoutBuilder({ items, onUpdateItem, onRemoveItem, onSave, onClear }) {
  const [expanded, setExpanded] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [saving, setSaving] = useState(false);

  if (items.length === 0) return null;

  async function handleSave() {
    if (!workoutName.trim()) return;
    setSaving(true);
    await onSave(workoutName.trim());
    setWorkoutName('');
    setSaving(false);
    setExpanded(false);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 slide-up">
      {/* Collapsed bar */}
      <div
        className="bg-surface-elevated border-t border-white/10 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
              {items.length}
            </span>
            <span className="text-sm font-medium text-slate-200">
              {items.length} exercise{items.length !== 1 ? 's' : ''} in workout
            </span>
          </div>
          <span className="text-slate-400 text-lg">{expanded ? '▾' : '▴'}</span>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="bg-surface-card border-t border-white/5 max-h-[60vh] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Exercise list */}
            <div className="space-y-3 mb-4">
              {items.map((item, index) => (
                <div
                  key={item.exercise_id}
                  className="flex items-center gap-3 bg-surface rounded-xl p-3 border border-white/5"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.cdn_gif}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />

                  {/* Name + controls */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-normal text-slate-200 truncate">{item.name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {/* Sets */}
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] text-slate-500 uppercase">Sets</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={item.sets}
                          onChange={e => onUpdateItem(index, 'sets', parseInt(e.target.value) || 1)}
                          className="w-12 bg-surface-elevated text-white text-xs text-center rounded-md
                            py-1 border border-white/10 focus:border-accent outline-none"
                        />
                      </div>
                      {/* Reps */}
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] text-slate-500 uppercase">Reps</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={item.reps}
                          onChange={e => onUpdateItem(index, 'reps', parseInt(e.target.value) || 1)}
                          className="w-12 bg-surface-elevated text-white text-xs text-center rounded-md
                            py-1 border border-white/10 focus:border-accent outline-none"
                        />
                      </div>
                      {/* Rest */}
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] text-slate-500 uppercase">Rest</label>
                        <input
                          type="number"
                          min="0"
                          max="300"
                          step="15"
                          value={item.rest}
                          onChange={e => onUpdateItem(index, 'rest', parseInt(e.target.value) || 0)}
                          className="w-14 bg-surface-elevated text-white text-xs text-center rounded-md
                            py-1 border border-white/10 focus:border-accent outline-none"
                        />
                        <span className="text-[10px] text-slate-500">s</span>
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => onRemoveItem(index)}
                    className="text-slate-500 hover:text-red-400 transition-colors text-sm shrink-0 p-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Save controls */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Workout name (e.g. Push Day)"
                value={workoutName}
                onChange={e => setWorkoutName(e.target.value)}
                className="flex-1 bg-surface text-white text-sm rounded-xl px-4 py-3
                  border border-white/10 focus:border-accent outline-none placeholder:text-slate-500"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <button
                onClick={handleSave}
                disabled={!workoutName.trim() || saving}
                className="px-5 py-3 bg-accent hover:bg-accent-hover text-white text-sm font-medium
                  rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? '...' : 'Save'}
              </button>
              <button
                onClick={onClear}
                className="px-3 py-3 bg-white/5 text-slate-400 hover:text-red-400 text-sm
                  rounded-xl transition-colors"
                title="Clear all"
              >
                🗑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
