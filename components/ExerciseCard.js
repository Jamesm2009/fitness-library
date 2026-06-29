'use client';

export default function ExerciseCard({ exercise, onSelect, onAddToWorkout, isInWorkout }) {
  return (
    <div
      className="exercise-card bg-surface-card rounded-xl overflow-hidden border border-white/5 cursor-pointer group"
      onClick={() => onSelect(exercise)}
    >
      {/* GIF thumbnail */}
      <div className="aspect-square bg-surface-elevated relative overflow-hidden">
        <img
          src={exercise.cdn_gif}
          alt={exercise.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        {/* Add to workout button overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToWorkout(exercise);
          }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center
            text-sm transition-all shadow-lg
            ${isInWorkout
              ? 'bg-teal text-surface scale-100'
              : 'bg-surface/80 text-white opacity-0 group-hover:opacity-100 hover:bg-accent'
            }`}
          title={isInWorkout ? 'In workout' : 'Add to workout'}
        >
          {isInWorkout ? '✓' : '+'}
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 mb-2">
          {exercise.name}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 text-[11px] rounded-full bg-accent/15 text-accent font-medium capitalize">
            {exercise.target}
          </span>
          <span className="px-2 py-0.5 text-[11px] rounded-full bg-white/5 text-slate-400 capitalize">
            {exercise.equipment}
          </span>
        </div>
      </div>
    </div>
  );
}
