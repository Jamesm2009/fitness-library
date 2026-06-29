'use client';

import { useState, useEffect, useCallback } from 'react';
import ExerciseCard from '@/components/ExerciseCard';
import ExerciseModal from '@/components/ExerciseModal';
import WorkoutBuilder from '@/components/WorkoutBuilder';

export default function ExercisesPage() {
  // Data state
  const [exercises, setExercises] = useState([]);
  const [filters, setFilters] = useState({ categories: [], equipment: [], targets: [] });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeEquipment, setActiveEquipment] = useState('');
  const [activeTarget, setActiveTarget] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Workout builder state
  const [workoutItems, setWorkoutItems] = useState([]);
  const [saveMessage, setSaveMessage] = useState('');

  // Fetch filter options on mount
  useEffect(() => {
    fetch('/api/exercises/filters')
      .then(r => r.json())
      .then(data => {
        setFilters({
          categories: typeof data.categories === 'string' ? JSON.parse(data.categories) : data.categories || [],
          equipment: typeof data.equipment === 'string' ? JSON.parse(data.equipment) : data.equipment || [],
          targets: typeof data.targets === 'string' ? JSON.parse(data.targets) : data.targets || [],
        });
      })
      .catch(console.error);
  }, []);

  // Fetch exercises when filters/search/page change
  const fetchExercises = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: '24' });
    if (search) params.set('search', search);
    if (activeCategory) params.set('category', activeCategory);
    if (activeEquipment) params.set('equipment', activeEquipment);
    if (activeTarget) params.set('target', activeTarget);

    try {
      const res = await fetch(`/api/exercises?${params}`);
      const data = await res.json();
      setExercises(data.exercises || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch exercises:', err);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory, activeEquipment, activeTarget, page]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, activeCategory, activeEquipment, activeTarget]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Workout builder functions
  function addToWorkout(exercise) {
    const exists = workoutItems.find(item => item.exercise_id === exercise.id);
    if (exists) {
      setWorkoutItems(workoutItems.filter(item => item.exercise_id !== exercise.id));
    } else {
      setWorkoutItems([...workoutItems, {
        exercise_id: exercise.id,
        name: exercise.name,
        cdn_gif: exercise.cdn_gif,
        target: exercise.target,
        equipment: exercise.equipment,
        sets: 3,
        reps: 10,
        rest: 60,
      }]);
    }
  }

  function updateWorkoutItem(index, field, value) {
    const updated = [...workoutItems];
    updated[index] = { ...updated[index], [field]: value };
    setWorkoutItems(updated);
  }

  function removeWorkoutItem(index) {
    setWorkoutItems(workoutItems.filter((_, i) => i !== index));
  }

  async function saveWorkout(name) {
    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, exercises: workoutItems }),
      });
      if (res.ok) {
        setWorkoutItems([]);
        setSaveMessage('Workout saved!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save workout:', err);
    }
  }

  function isInWorkout(exerciseId) {
    return workoutItems.some(item => item.exercise_id === exerciseId);
  }

  function clearFilter(type) {
    if (type === 'category') setActiveCategory('');
    if (type === 'equipment') setActiveEquipment('');
    if (type === 'target') setActiveTarget('');
  }

  const hasActiveFilters = activeCategory || activeEquipment || activeTarget;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full bg-surface-card text-white text-sm rounded-xl px-4 py-3 pl-10
              border border-white/5 focus:border-accent/50 outline-none placeholder:text-slate-500"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${
            showFilters || hasActiveFilters
              ? 'bg-accent/15 text-accent border-accent/20'
              : 'bg-surface-card text-slate-400 border-white/5 hover:text-white'
          }`}
        >
          Filters{hasActiveFilters ? ` •` : ''}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-surface-card rounded-xl p-4 mb-4 border border-white/5 space-y-4">
          {/* Body part */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">Body Part</label>
            <div className="flex flex-wrap gap-1.5">
              {filters.categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
                  className={`filter-chip px-3 py-1.5 rounded-lg text-xs capitalize ${
                    activeCategory === cat ? 'active' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">Equipment</label>
            <div className="flex flex-wrap gap-1.5">
              {filters.equipment.map(eq => (
                <button
                  key={eq}
                  onClick={() => setActiveEquipment(activeEquipment === eq ? '' : eq)}
                  className={`filter-chip px-3 py-1.5 rounded-lg text-xs capitalize ${
                    activeEquipment === eq ? 'active' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>

          {/* Target muscle */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">Target Muscle</label>
            <div className="flex flex-wrap gap-1.5">
              {filters.targets.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTarget(activeTarget === t ? '' : t)}
                  className={`filter-chip px-3 py-1.5 rounded-lg text-xs capitalize ${
                    activeTarget === t ? 'active' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => { setActiveCategory(''); setActiveEquipment(''); setActiveTarget(''); }}
              className="text-xs text-accent hover:text-accent-hover"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Active filter tags */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeCategory && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs capitalize">
              {activeCategory}
              <button onClick={() => clearFilter('category')} className="ml-1">✕</button>
            </span>
          )}
          {activeEquipment && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-teal/15 text-teal text-xs capitalize">
              {activeEquipment}
              <button onClick={() => clearFilter('equipment')} className="ml-1">✕</button>
            </span>
          )}
          {activeTarget && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-xs capitalize">
              {activeTarget}
              <button onClick={() => clearFilter('target')} className="ml-1">✕</button>
            </span>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-slate-500 mb-4">
        {loading ? 'Loading...' : `${total} exercise${total !== 1 ? 's' : ''} found`}
      </p>

      {/* Save success toast */}
      {saveMessage && (
        <div className="fixed top-20 right-4 z-50 bg-teal text-surface px-4 py-2 rounded-xl text-sm font-medium shadow-lg slide-up">
          {saveMessage}
        </div>
      )}

      {/* Exercise grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-surface-card rounded-xl overflow-hidden border border-white/5 animate-pulse">
              <div className="aspect-square bg-surface-elevated" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-surface-elevated rounded w-3/4" />
                <div className="h-3 bg-surface-elevated rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-500 text-sm mb-2">No exercises found</p>
          <p className="text-slate-600 text-xs">
            {total === 0 && !search && !hasActiveFilters
              ? 'Database may be empty — visit the ⚙️ page to seed it.'
              : 'Try adjusting your search or filters.'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {exercises.map(ex => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                onSelect={setSelectedExercise}
                onAddToWorkout={addToWorkout}
                isInWorkout={isInWorkout(ex.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 mb-24">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-surface-card text-sm text-slate-400
                  hover:text-white border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <span className="text-sm text-slate-500 px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-surface-card text-sm text-slate-400
                  hover:text-white border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Exercise detail modal */}
      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onAddToWorkout={addToWorkout}
          isInWorkout={isInWorkout(selectedExercise.id)}
        />
      )}

      {/* Workout builder */}
      <WorkoutBuilder
        items={workoutItems}
        onUpdateItem={updateWorkoutItem}
        onRemoveItem={removeWorkoutItem}
        onSave={saveWorkout}
        onClear={() => setWorkoutItems([])}
      />
    </div>
  );
}
