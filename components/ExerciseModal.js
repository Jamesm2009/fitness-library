'use client';

import { useState } from 'react';

const LANG_LABELS = { en: 'English', es: 'Español' de: 'German' };

export default function ExerciseModal({ exercise, onClose, onAddToWorkout, isInWorkout }) {
  const [lang, setLang] = useState('en');

  if (!exercise) return null;

  const instructions = exercise.instructions?.[lang] || exercise.instructions?.en || '';
  const steps = Array.isArray(instructions) ? instructions : instructions.split(/\d+\.\s+/).filter(Boolean);

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-card w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto border border-white/5"
        onClick={e => e.stopPropagation()}
      >
        {/* GIF */}
        <div className="relative aspect-square sm:aspect-video bg-surface-elevated">
          <img
            src={exercise.cdn_gif}
            alt={exercise.name}
            className="w-full h-full object-contain"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface/80 text-white
              flex items-center justify-center text-sm hover:bg-surface transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          {/* Title + meta */}
          <h2 className="text-xl font-semibold text-white mb-3">{exercise.name}</h2>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2.5 py-1 text-xs rounded-full bg-accent/15 text-accent font-medium capitalize">
              {exercise.category}
            </span>
            <span className="px-2.5 py-1 text-xs rounded-full bg-teal/15 text-teal font-medium capitalize">
              {exercise.target}
            </span>
            <span className="px-2.5 py-1 text-xs rounded-full bg-white/5 text-slate-300 capitalize">
              {exercise.equipment}
            </span>
          </div>

          {/* Secondary muscles */}
          {exercise.secondary_muscles?.length > 0 && (
            <div className="mb-4">
              <span className="text-xs text-slate-500 uppercase tracking-wide">Secondary muscles</span>
              <p className="text-sm text-slate-300 mt-0.5 capitalize">
                {exercise.secondary_muscles.join(', ')}
              </p>
            </div>
          )}

          {/* Language tabs */}
          <div className="flex gap-1 mb-3">
            {Object.entries(LANG_LABELS).map(([code, label]) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  lang === code
                    ? 'bg-accent text-white font-medium'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="space-y-2 mb-5">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-accent font-semibold text-sm mt-0.5 shrink-0 w-5 text-right">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">{step.trim()}</p>
              </div>
            ))}
          </div>

          {/* Add to workout */}
          <button
            onClick={() => onAddToWorkout(exercise)}
            className={`w-full py-3 rounded-xl font-medium text-sm transition-colors ${
              isInWorkout
                ? 'bg-teal/15 text-teal border border-teal/20'
                : 'bg-accent hover:bg-accent-hover text-white'
            }`}
          >
            {isInWorkout ? '✓ In Current Workout' : '+ Add to Workout'}
          </button>
        </div>
      </div>
    </div>
  );
}
