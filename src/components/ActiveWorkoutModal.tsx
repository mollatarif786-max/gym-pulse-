import React, { useState, useEffect } from 'react';
import { LoggedExercise, WorkoutLog, WorkoutRoutine, WorkoutSet, ExerciseDefinition } from '../types';
import { EXERCISE_CATALOG, getPreviousExercisePerformance } from '../services/workoutDatabase';
import { calculateWorkoutVolume } from '../services/calculationEngine';
import { Dumbbell, Plus, Trash2, CheckCircle2, Clock, Sparkles, X, Search, ChevronRight, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActiveWorkoutModalProps {
  routine?: WorkoutRoutine | null;
  workoutHistory: WorkoutLog[];
  onSaveWorkout: (workout: WorkoutLog) => void;
  onCancel: () => void;
  onStartRestTimer: (seconds: number) => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  routine,
  workoutHistory,
  onSaveWorkout,
  onCancel,
  onStartRestTimer,
}) => {
  const [routineName, setRoutineName] = useState<string>(routine?.name || 'Custom Gym Session');
  const [exercises, setExercises] = useState<LoggedExercise[]>([]);
  const [startTime] = useState<Date>(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [rating, setRating] = useState<number>(5);

  // Exercise picker modal
  const [showExercisePicker, setShowExercisePicker] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('All');

  // Initialize exercises from routine if present
  useEffect(() => {
    if (routine && routine.exercises.length > 0) {
      const initialExercises: LoggedExercise[] = routine.exercises.map((rex, idx) => {
        const prevPerf = getPreviousExercisePerformance(rex.exerciseName, workoutHistory);
        const sets: WorkoutSet[] = [];
        for (let s = 1; s <= (rex.suggestedSets || 3); s++) {
          sets.push({
            id: `set_${idx}_${s}_${Date.now()}`,
            setNumber: s,
            weightKg: prevPerf.maxWeightKg || 40,
            reps: rex.suggestedReps || 10,
            completed: false,
            previousBest: prevPerf.bestSetFormatted,
          });
        }

        return {
          id: `ex_${idx}_${Date.now()}`,
          exerciseId: rex.exerciseId,
          exerciseName: rex.exerciseName,
          targetMuscleGroup: rex.targetMuscleGroup,
          sets,
          restSeconds: rex.suggestedRestSeconds || 90,
          notes: '',
        };
      });
      setExercises(initialExercises);
    } else {
      // Start with 1 default exercise (Bench press)
      const prevPerf = getPreviousExercisePerformance('Barbell Flat Bench Press', workoutHistory);
      setExercises([
        {
          id: `ex_0_${Date.now()}`,
          exerciseId: 'ex_bench_press',
          exerciseName: 'Barbell Flat Bench Press',
          targetMuscleGroup: 'Chest',
          sets: [
            { id: `s1_${Date.now()}`, setNumber: 1, reps: 8, weightKg: prevPerf.maxWeightKg || 60, completed: false, previousBest: prevPerf.bestSetFormatted },
            { id: `s2_${Date.now()}`, setNumber: 2, reps: 8, weightKg: prevPerf.maxWeightKg || 60, completed: false, previousBest: prevPerf.bestSetFormatted },
            { id: `s3_${Date.now()}`, setNumber: 3, reps: 8, weightKg: prevPerf.maxWeightKg || 60, completed: false, previousBest: prevPerf.bestSetFormatted },
          ],
          restSeconds: 120,
        },
      ]);
    }
  }, [routine]);

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      return `${hours}h ${mins % 60}m ${secs}s`;
    }
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const handleToggleSet = (exIndex: number, setIndex: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exIndex] };
      const targetSet = { ...targetEx.sets[setIndex] };
      
      targetSet.completed = !targetSet.completed;
      targetEx.sets[setIndex] = targetSet;
      updated[exIndex] = targetEx;

      // If set just marked completed, trigger rest timer!
      if (targetSet.completed && targetEx.restSeconds) {
        onStartRestTimer(targetEx.restSeconds);
      }

      return updated;
    });
  };

  const handleSetChange = (
    exIndex: number,
    setIndex: number,
    field: 'weightKg' | 'reps' | 'rpe',
    value: number
  ) => {
    setExercises((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exIndex] };
      const targetSet = { ...targetEx.sets[setIndex] };
      (targetSet as any)[field] = value;
      targetEx.sets[setIndex] = targetSet;
      updated[exIndex] = targetEx;
      return updated;
    });
  };

  const handleAddSet = (exIndex: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exIndex] };
      const lastSet = targetEx.sets[targetEx.sets.length - 1];
      const newSetNumber = targetEx.sets.length + 1;
      
      targetEx.sets.push({
        id: `set_${exIndex}_${newSetNumber}_${Date.now()}`,
        setNumber: newSetNumber,
        weightKg: lastSet ? lastSet.weightKg : 50,
        reps: lastSet ? lastSet.reps : 10,
        completed: false,
        previousBest: lastSet?.previousBest,
      });
      updated[exIndex] = targetEx;
      return updated;
    });
  };

  const handleRemoveSet = (exIndex: number, setIndex: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exIndex] };
      if (targetEx.sets.length <= 1) return prev; // keep at least 1 set
      targetEx.sets.splice(setIndex, 1);
      // re-index
      targetEx.sets.forEach((s, idx) => (s.setNumber = idx + 1));
      updated[exIndex] = targetEx;
      return updated;
    });
  };

  const handleRemoveExercise = (exIndex: number) => {
    setExercises((prev) => prev.filter((_, idx) => idx !== exIndex));
  };

  const handleAddExerciseFromPicker = (def: ExerciseDefinition) => {
    const prevPerf = getPreviousExercisePerformance(def.name, workoutHistory);
    const newEx: LoggedExercise = {
      id: `ex_${Date.now()}`,
      exerciseId: def.id,
      exerciseName: def.name,
      targetMuscleGroup: def.primaryMuscle,
      sets: [
        { id: `s1_${Date.now()}`, setNumber: 1, reps: 10, weightKg: prevPerf.maxWeightKg || 40, completed: false, previousBest: prevPerf.bestSetFormatted },
        { id: `s2_${Date.now()}`, setNumber: 2, reps: 10, weightKg: prevPerf.maxWeightKg || 40, completed: false, previousBest: prevPerf.bestSetFormatted },
        { id: `s3_${Date.now()}`, setNumber: 3, reps: 10, weightKg: prevPerf.maxWeightKg || 40, completed: false, previousBest: prevPerf.bestSetFormatted },
      ],
      restSeconds: def.defaultRestSeconds || 90,
    };
    setExercises((prev) => [...prev, newEx]);
    setShowExercisePicker(false);
  };

  // Summary stats
  const tempLog: WorkoutLog = {
    id: 'temp',
    date: new Date().toISOString().split('T')[0],
    routineName,
    durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
    exercises,
    totalVolumeKg: 0,
    totalSets: 0,
    createdAt: new Date().toISOString(),
  };
  const { totalVolumeKg, completedSets } = calculateWorkoutVolume(tempLog);

  const handleFinishWorkout = () => {
    const finalLog: WorkoutLog = {
      id: `wlog_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      routineId: routine?.id,
      routineName,
      durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      exercises,
      totalVolumeKg,
      totalSets: completedSets,
      notes: generalNotes,
      rating,
      createdAt: new Date().toISOString(),
    };

    // Confetti celebration
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onSaveWorkout(finalLog);
  };

  const muscleGroups = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Abs'];
  const filteredCatalog = EXERCISE_CATALOG.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || ex.primaryMuscle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscleFilter === 'All' || ex.primaryMuscle === selectedMuscleFilter;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div id="active_workout_modal" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between overflow-hidden">
      {/* Sticky Header */}
      <header className="bg-[#121212] border-b border-[#262626] px-4 py-3 max-w-4xl w-full mx-auto flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <input
              type="text"
              id="input_workout_routine_name"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="bg-transparent font-bold text-[#EDEDED] text-base md:text-lg focus:outline-none border-b border-transparent focus:border-orange-500 w-full"
            />
            <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
              <span className="flex items-center gap-1 font-mono text-orange-400 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                {formatElapsed(elapsedSeconds)}
              </span>
              <span>•</span>
              <span>{completedSets} sets done</span>
              <span>•</span>
              <span className="font-semibold text-[#EDEDED]">{totalVolumeKg.toLocaleString()} kg lifted</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-white bg-[#171717] hover:bg-[#202020] border border-[#262626] transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn_finish_active_workout"
            onClick={handleFinishWorkout}
            className="px-4 py-1.5 rounded-xl text-xs md:text-sm font-bold bg-orange-500 text-black hover:bg-orange-400 transition-all shadow-md shadow-orange-500/20 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Finish Workout
          </button>
        </div>
      </header>

      {/* Main Exercises Scroll Area */}
      <main className="flex-1 overflow-y-auto p-4 max-w-4xl w-full mx-auto space-y-5 pb-28">
        {exercises.map((ex, exIdx) => {
          const prevPerf = getPreviousExercisePerformance(ex.exerciseName, workoutHistory);

          return (
            <div
              key={ex.id}
              className="bg-[#171717] border border-[#262626] rounded-2xl p-4 shadow-sm relative space-y-3"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#EDEDED] text-base">{ex.exerciseName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {ex.targetMuscleGroup}
                    </span>
                  </div>
                  {prevPerf.bestSetFormatted && (
                    <p className="text-xs text-orange-400/90 font-mono mt-0.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-orange-400" />
                      Previous Best: <span className="font-bold text-[#EDEDED]">{prevPerf.bestSetFormatted}</span>
                      {prevPerf.lastSessionDate && <span className="text-[#737373] text-[11px]">({prevPerf.lastSessionDate})</span>}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveExercise(exIdx)}
                  className="text-[#737373] hover:text-rose-400 p-1 rounded-lg hover:bg-[#202020] transition-colors"
                  title="Remove Exercise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Sets Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-[#EDEDED]">
                  <thead>
                    <tr className="text-[#737373] text-[11px] border-b border-[#262626] uppercase font-mono">
                      <th className="py-2 text-center w-10">Set</th>
                      <th className="py-2 text-left w-28">Previous</th>
                      <th className="py-2 text-center w-24">kg</th>
                      <th className="py-2 text-center w-20">Reps</th>
                      <th className="py-2 text-center w-14">Done</th>
                      <th className="py-2 text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]/50">
                    {ex.sets.map((set, setIdx) => {
                      const prevBest = prevPerf.lastSetsFormatted?.[setIdx] || prevPerf.bestSetFormatted || '-';

                      return (
                        <tr
                          key={set.id}
                          className={`transition-colors ${
                            set.completed ? 'bg-orange-500/5' : 'hover:bg-[#202020]/40'
                          }`}
                        >
                          <td className="py-2 text-center font-bold text-[#A1A1AA] font-mono">
                            {set.setNumber}
                          </td>
                          <td className="py-2 text-left font-mono text-[11px] text-[#737373]">
                            {prevBest}
                          </td>
                          <td className="py-2 text-center">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={set.weightKg}
                              onChange={(e) =>
                                handleSetChange(exIdx, setIdx, 'weightKg', parseFloat(e.target.value) || 0)
                              }
                              className="w-18 bg-[#121212] border border-[#262626] rounded-lg px-2 py-1 text-center text-[#EDEDED] font-mono font-bold focus:outline-none focus:border-orange-500"
                            />
                          </td>
                          <td className="py-2 text-center">
                            <input
                              type="number"
                              min="1"
                              value={set.reps}
                              onChange={(e) =>
                                handleSetChange(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)
                              }
                              className="w-14 bg-[#121212] border border-[#262626] rounded-lg px-2 py-1 text-center text-[#EDEDED] font-mono font-bold focus:outline-none focus:border-orange-500"
                            />
                          </td>
                          <td className="py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSet(exIdx, setIdx)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all ${
                                set.completed
                                  ? 'bg-orange-500 text-black font-bold shadow-md shadow-orange-500/20'
                                  : 'bg-[#121212] text-[#737373] hover:bg-[#202020] hover:text-white border border-[#262626]'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="py-2 text-center">
                            {ex.sets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSet(exIdx, setIdx)}
                                className="text-[#737373] hover:text-rose-400"
                                title="Delete set"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Set Actions & Rest trigger */}
              <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => handleAddSet(exIdx)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Set
                </button>

                <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                  <span>Rest:</span>
                  <button
                    type="button"
                    onClick={() => onStartRestTimer(ex.restSeconds || 90)}
                    className="flex items-center gap-1 font-mono text-orange-400 bg-[#121212] hover:bg-[#202020] px-2 py-1 rounded-md border border-[#262626] transition-colors"
                  >
                    <Clock className="w-3 h-3" />
                    {ex.restSeconds || 90}s
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Exercise button */}
        <button
          type="button"
          id="btn_add_exercise_to_workout"
          onClick={() => setShowExercisePicker(true)}
          className="w-full py-3.5 rounded-2xl border-2 border-dashed border-[#262626] hover:border-orange-500/50 bg-[#121212] hover:bg-[#171717] text-[#A1A1AA] hover:text-orange-400 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Another Exercise
        </button>

        {/* Workout Notes */}
        <div className="bg-[#171717] border border-[#262626] rounded-2xl p-4 space-y-2">
          <label className="block text-xs font-semibold text-[#A1A1AA]">Workout Notes & Energy Rating</label>
          <textarea
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            placeholder="How did the lifts feel? Any joint soreness or energy peaks?"
            rows={2}
            className="w-full bg-[#121212] border border-[#262626] rounded-xl p-3 text-xs text-[#EDEDED] placeholder-[#737373] focus:outline-none focus:border-orange-500"
          />
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-[#737373]">Session Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-lg transition-transform ${rating >= star ? 'scale-110' : 'opacity-40'}`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#171717] border border-[#262626] rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#262626] flex items-center justify-between">
              <h3 className="font-bold text-[#EDEDED] text-base">Select Exercise from Catalog</h3>
              <button
                onClick={() => setShowExercisePicker(false)}
                className="text-[#737373] hover:text-white p-1 rounded-lg hover:bg-[#202020]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-[#262626] space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#737373] absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exercises or equipment..."
                  className="w-full bg-[#121212] border border-[#262626] rounded-xl pl-9 pr-4 py-2 text-xs text-[#EDEDED] placeholder-[#737373] focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Muscle filter chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {muscleGroups.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMuscleFilter(m)}
                    className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all ${
                      selectedMuscleFilter === m
                        ? 'bg-orange-500 text-black font-bold'
                        : 'bg-[#121212] text-[#A1A1AA] hover:text-white border border-[#262626]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredCatalog.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => handleAddExerciseFromPicker(ex)}
                  className="w-full text-left p-3 rounded-xl bg-[#121212] hover:bg-[#202020] border border-[#262626] hover:border-orange-500/40 flex items-center justify-between group transition-all"
                >
                  <div>
                    <div className="font-semibold text-xs text-[#EDEDED] group-hover:text-orange-400 transition-colors">
                      {ex.name}
                    </div>
                    <div className="text-[11px] text-[#737373] flex items-center gap-2 mt-0.5">
                      <span className="text-orange-400/90">{ex.primaryMuscle}</span>
                      <span>•</span>
                      <span>{ex.equipment}</span>
                      <span>•</span>
                      <span>{ex.category}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-orange-400 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
