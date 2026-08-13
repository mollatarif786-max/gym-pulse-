import React, { useState } from 'react';
import { WorkoutLog, WorkoutRoutine, ExerciseDefinition } from '../types';
import { PREBUILT_ROUTINES, EXERCISE_CATALOG } from '../services/workoutDatabase';
import { Dumbbell, Play, Plus, Clock, History, BookOpen, Layers, Trash2, ChevronRight, CheckCircle2 } from 'lucide-react';

interface WorkoutViewProps {
  workoutHistory: WorkoutLog[];
  routines: WorkoutRoutine[];
  onStartWorkout: (routine?: WorkoutRoutine | null) => void;
  onSaveRoutine: (routine: WorkoutRoutine) => void;
  onDeleteRoutine: (routineId: string) => void;
  onDeleteWorkout: (workoutId: string) => void;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({
  workoutHistory,
  routines,
  onStartWorkout,
  onSaveRoutine,
  onDeleteRoutine,
  onDeleteWorkout,
}) => {
  const [activeTab, setActiveTab] = useState<'routines' | 'history' | 'catalog'>('routines');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [searchCatalog, setSearchCatalog] = useState<string>('');

  // Create routine modal
  const [isCreatingRoutine, setIsCreatingRoutine] = useState<boolean>(false);
  const [newRoutineName, setNewRoutineName] = useState<string>('');
  const [newRoutineCategory, setNewRoutineCategory] = useState<WorkoutRoutine['category']>('Split');
  const [newRoutineDescription, setNewRoutineDescription] = useState<string>('');
  const [selectedRoutineExs, setSelectedRoutineExs] = useState<string[]>([]);

  const handleCreateRoutineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineName.trim() || selectedRoutineExs.length === 0) return;

    const routineExercises = selectedRoutineExs.map((exId) => {
      const def = EXERCISE_CATALOG.find((e) => e.id === exId);
      return {
        exerciseId: exId,
        exerciseName: def?.name || 'Custom Exercise',
        targetMuscleGroup: def?.primaryMuscle || 'Full Body',
        suggestedSets: 3,
        suggestedReps: 10,
        suggestedRestSeconds: def?.defaultRestSeconds || 90,
      };
    });

    const newRoutine: WorkoutRoutine = {
      id: `custom_routine_${Date.now()}`,
      name: newRoutineName,
      description: newRoutineDescription || 'Custom personalized routine.',
      category: newRoutineCategory,
      exercises: routineExercises,
      isCustom: true,
    };

    onSaveRoutine(newRoutine);
    setIsCreatingRoutine(false);
    setNewRoutineName('');
    setNewRoutineDescription('');
    setSelectedRoutineExs([]);
  };

  const toggleSelectExForRoutine = (exId: string) => {
    setSelectedRoutineExs((prev) =>
      prev.includes(exId) ? prev.filter((id) => id !== exId) : [...prev, exId]
    );
  };

  const muscleGroups = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Abs'];

  const filteredCatalog = EXERCISE_CATALOG.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchCatalog.toLowerCase()) || ex.primaryMuscle.toLowerCase().includes(searchCatalog.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.primaryMuscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div id="workout_main_view" className="space-y-6 pb-24">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121212] border border-[#262626] rounded-3xl p-5 md:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-[#EDEDED] tracking-tight">Gym & Resistance Training</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              Overload Engine
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#A1A1AA] mt-1">
            Log active sessions, track set volume, and beat previous records across your workout splits.
          </p>
        </div>

        <button
          type="button"
          id="btn_start_quick_workout"
          onClick={() => onStartWorkout(null)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-orange-500 text-black hover:bg-orange-400 shadow-lg shadow-orange-500/20 transition-all cursor-pointer whitespace-nowrap"
        >
          <Play className="w-4 h-4 fill-black" />
          Start Empty Workout
        </button>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262626] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('routines')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeTab === 'routines'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'text-[#A1A1AA] hover:text-white hover:bg-[#171717]'
          }`}
        >
          <Layers className="w-4 h-4" />
          Routines & Splits ({routines.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'text-[#A1A1AA] hover:text-white hover:bg-[#171717]'
          }`}
        >
          <History className="w-4 h-4" />
          Workout History ({workoutHistory.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeTab === 'catalog'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'text-[#A1A1AA] hover:text-white hover:bg-[#171717]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Exercise Library ({EXERCISE_CATALOG.length})
        </button>
      </div>

      {/* TAB 1: ROUTINES & SPLITS */}
      {activeTab === 'routines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
              Saved Splits & Templates
            </span>
            <button
              type="button"
              id="btn_create_custom_routine"
              onClick={() => setIsCreatingRoutine(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Build Custom Split
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="bg-[#121212] border border-[#262626] hover:border-[#404040] rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 group transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#EDEDED] text-base group-hover:text-orange-400 transition-colors">
                          {routine.name}
                        </h3>
                        {routine.isCustom && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">{routine.description}</p>
                    </div>

                    {routine.isCustom && (
                      <button
                        type="button"
                        onClick={() => onDeleteRoutine(routine.id)}
                        className="text-[#737373] hover:text-rose-400 p-1 rounded-lg"
                        title="Delete custom routine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Exercises inside routine preview */}
                  <div className="mt-3.5 space-y-1.5">
                    {routine.exercises.slice(0, 4).map((ex, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-[#171717] px-2.5 py-1.5 rounded-lg border border-[#262626]">
                        <span className="text-[#EDEDED] font-medium truncate max-w-[200px]">{ex.exerciseName}</span>
                        <span className="text-[#737373] font-mono text-[11px]">
                          {ex.suggestedSets} × {ex.suggestedReps} reps
                        </span>
                      </div>
                    ))}
                    {routine.exercises.length > 4 && (
                      <span className="text-[11px] text-[#737373] block text-right">
                        +{routine.exercises.length - 4} more exercises
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
                  <span className="text-xs text-[#737373] font-mono">{routine.exercises.length} exercises</span>
                  <button
                    type="button"
                    onClick={() => onStartWorkout(routine)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-black border border-orange-500/30 transition-all shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start Routine
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: WORKOUT HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {workoutHistory.length === 0 ? (
            <div className="bg-[#121212] border border-[#262626] rounded-2xl p-8 text-center space-y-3">
              <Dumbbell className="w-8 h-8 text-[#737373] mx-auto" />
              <p className="text-sm font-semibold text-[#EDEDED]">No workout logs recorded yet</p>
              <p className="text-xs text-[#737373] max-w-sm mx-auto">
                Hit "Start Empty Workout" or choose a routine above to log your first gym session!
              </p>
            </div>
          ) : (
            workoutHistory.map((workout) => (
              <div
                key={workout.id}
                className="bg-[#121212] border border-[#262626] rounded-2xl p-4 md:p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#EDEDED] text-base">{workout.routineName}</h3>
                      <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                        {workout.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#A1A1AA] mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#737373]" />
                        {workout.durationMinutes} mins
                      </span>
                      <span>•</span>
                      <span className="text-orange-400 font-semibold font-mono">
                        {workout.totalVolumeKg.toLocaleString()} kg total volume
                      </span>
                      <span>•</span>
                      <span>{workout.totalSets} completed sets</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteWorkout(workout.id)}
                    className="text-[#737373] hover:text-rose-400 p-1 rounded-lg"
                    title="Delete log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Exercises logged in this workout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                  {workout.exercises.map((ex, exIdx) => {
                    const completedSets = ex.sets.filter((s) => s.completed);
                    const topSet = [...completedSets].sort((a, b) => b.weightKg - a.weightKg)[0];

                    return (
                      <div
                        key={exIdx}
                        className="bg-[#171717] border border-[#262626] rounded-xl p-2.5 text-xs space-y-1"
                      >
                        <div className="font-semibold text-[#EDEDED] truncate">{ex.exerciseName}</div>
                        <div className="text-[11px] text-[#A1A1AA] flex items-center justify-between">
                          <span>{completedSets.length} sets</span>
                          {topSet && (
                            <span className="font-mono text-orange-400 font-bold">
                              Top: {topSet.weightKg}kg × {topSet.reps}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {workout.notes && (
                  <p className="text-xs text-[#A1A1AA] italic bg-[#171717] p-2 rounded-lg border border-[#262626]">
                    "{workout.notes}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: EXERCISE CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchCatalog}
              onChange={(e) => setSearchCatalog(e.target.value)}
              placeholder="Search exercise by name or category..."
              className="flex-1 bg-[#121212] border border-[#262626] rounded-xl px-4 py-2.5 text-xs text-[#EDEDED] placeholder-[#737373] focus:outline-none focus:border-orange-500"
            />
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {muscleGroups.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMuscle(m)}
                  className={`px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all ${
                    selectedMuscle === m
                      ? 'bg-orange-500 text-black font-bold'
                      : 'bg-[#121212] border border-[#262626] text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCatalog.map((ex) => (
              <div
                key={ex.id}
                className="bg-[#121212] border border-[#262626] rounded-2xl p-4 shadow-sm space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-[#EDEDED] text-sm">{ex.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        {ex.primaryMuscle}
                      </span>
                      <span className="text-[11px] text-[#A1A1AA]">{ex.equipment}</span>
                      <span className="text-[11px] text-[#737373]">• {ex.category}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-orange-400 bg-[#171717] border border-[#262626] px-2 py-1 rounded-lg">
                    {ex.defaultRestSeconds}s rest
                  </span>
                </div>
                {ex.instructions && (
                  <p className="text-xs text-[#A1A1AA] leading-relaxed bg-[#171717] p-2.5 rounded-xl border border-[#262626]">
                    {ex.instructions}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Custom Routine Modal */}
      {isCreatingRoutine && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#262626] rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl p-6 overflow-hidden">
            <h3 className="font-bold text-[#EDEDED] text-lg mb-4">Create Custom Workout Routine</h3>
            <form onSubmit={handleCreateRoutineSubmit} className="space-y-4 flex-1 flex flex-col overflow-hidden">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Routine Name</label>
                <input
                  type="text"
                  required
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  placeholder="e.g. Quad Hypertrophy & Arms"
                  className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3.5 py-2 text-xs text-[#EDEDED] placeholder-[#737373] focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Description / Focus</label>
                <input
                  type="text"
                  value={newRoutineDescription}
                  onChange={(e) => setNewRoutineDescription(e.target.value)}
                  placeholder="e.g. Heavy squats followed by arm drop-sets"
                  className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3.5 py-2 text-xs text-[#EDEDED] placeholder-[#737373] focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Select Exercises ({selectedRoutineExs.length} chosen)
                </label>
                <div className="flex-1 overflow-y-auto space-y-1.5 border border-[#262626] rounded-xl p-2 bg-[#171717]">
                  {EXERCISE_CATALOG.map((ex) => {
                    const isSelected = selectedRoutineExs.includes(ex.id);
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => toggleSelectExForRoutine(ex.id)}
                        className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-orange-500/20 border border-orange-500/40 text-white font-semibold'
                            : 'bg-[#121212] hover:bg-[#262626] text-[#A1A1AA]'
                        }`}
                      >
                        <div>
                          <span>{ex.name}</span>
                          <span className="text-[10px] text-[#737373] ml-2">({ex.primaryMuscle})</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setIsCreatingRoutine(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-white bg-[#171717] border border-[#262626]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newRoutineName.trim() || selectedRoutineExs.length === 0}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-500 text-black hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
