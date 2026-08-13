import { ExerciseDefinition, WorkoutRoutine, WorkoutLog } from '../types';

export const EXERCISE_CATALOG: ExerciseDefinition[] = [
  // --- CHEST ---
  {
    id: 'ex_bench_press',
    name: 'Barbell Flat Bench Press',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders'],
    equipment: 'Barbell',
    category: 'Strength',
    defaultRestSeconds: 120,
    instructions: 'Keep shoulder blades retracted, touch mid-sternum with controlled eccentric, press firmly upward.',
  },
  {
    id: 'ex_incline_db_press',
    name: 'Incline Dumbbell Press',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Shoulders', 'Triceps'],
    equipment: 'Dumbbell',
    category: 'Hypertrophy',
    defaultRestSeconds: 90,
    instructions: 'Set bench to 30-45 degrees. Lower dumbbells under control to chest level, press up without clashing dumbbells.',
  },
  {
    id: 'ex_cable_crossover',
    name: 'Cable Chest Flyes',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Shoulders'],
    equipment: 'Cable',
    category: 'Hypertrophy',
    defaultRestSeconds: 60,
    instructions: 'Slight bend in elbows. Bring hands together in a wide hugging motion, squeezing pecs at peak contraction.',
  },
  {
    id: 'ex_chest_dips',
    name: 'Chest Dips (Parallel Bars)',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders'],
    equipment: 'Bodyweight',
    category: 'Strength',
    defaultRestSeconds: 90,
    instructions: 'Lean torso forward slightly to prioritize lower pecs. Lower until upper arms are parallel to floor.',
  },

  // --- BACK ---
  {
    id: 'ex_deadlift',
    name: 'Conventional Barbell Deadlift',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Hamstrings', 'Glutes'],
    equipment: 'Barbell',
    category: 'Strength',
    defaultRestSeconds: 180,
    instructions: 'Barbell over mid-foot, hip hinge setup, brace lats and core, drive floor away with legs.',
  },
  {
    id: 'ex_barbell_row',
    name: 'Bent-Over Barbell Row',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Shoulders'],
    equipment: 'Barbell',
    category: 'Strength',
    defaultRestSeconds: 90,
    instructions: 'Hinge at hips to ~45 degrees with flat spine. Pull barbell towards lower abdomen leading with elbows.',
  },
  {
    id: 'ex_lat_pulldown',
    name: 'Lat Pulldown (Wide Grip)',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps'],
    equipment: 'Cable',
    category: 'Hypertrophy',
    defaultRestSeconds: 75,
    instructions: 'Drive elbows down and back towards pockets. Avoid excessive swinging.',
  },
  {
    id: 'ex_seated_cable_row',
    name: 'Seated Cable Row (Close Grip)',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Shoulders'],
    equipment: 'Cable',
    category: 'Hypertrophy',
    defaultRestSeconds: 75,
    instructions: 'Keep chest high, pull handle to belly button, squeeze shoulder blades together for 1s.',
  },
  {
    id: 'ex_pull_ups',
    name: 'Pull-Ups / Chin-Ups',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps'],
    equipment: 'Bodyweight',
    category: 'Strength',
    defaultRestSeconds: 90,
    instructions: 'Full dead hang at bottom, pull chin clearly over bar with controlled descent.',
  },

  // --- SHOULDERS ---
  {
    id: 'ex_overhead_press',
    name: 'Standing Barbell Overhead Press (OHP)',
    primaryMuscle: 'Shoulders',
    secondaryMuscles: ['Triceps'],
    equipment: 'Barbell',
    category: 'Strength',
    defaultRestSeconds: 120,
    instructions: 'Squeeze glutes and core tight, press barbell straight overhead, push head through at lockout.',
  },
  {
    id: 'ex_db_lateral_raise',
    name: 'Dumbbell Lateral Raises',
    primaryMuscle: 'Shoulders',
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    category: 'Hypertrophy',
    defaultRestSeconds: 60,
    instructions: 'Slight forward lean, raise arms out to sides in scapular plane until parallel with floor.',
  },
  {
    id: 'ex_face_pulls',
    name: 'Cable Face Pulls',
    primaryMuscle: 'Shoulders',
    secondaryMuscles: ['Back'],
    equipment: 'Cable',
    category: 'Hypertrophy',
    defaultRestSeconds: 60,
    instructions: 'Set rope at eye level. Pull towards forehead while externally rotating shoulders.',
  },

  // --- BICEPS ---
  {
    id: 'ex_barbell_curl',
    name: 'Standing Barbell Bicep Curl',
    primaryMuscle: 'Biceps',
    secondaryMuscles: [],
    equipment: 'Barbell',
    category: 'Hypertrophy',
    defaultRestSeconds: 75,
    instructions: 'Keep elbows pinned to ribs. Curl bar up with full contraction, 2-second negative.',
  },
  {
    id: 'ex_incline_db_curl',
    name: 'Incline Dumbbell Curl',
    primaryMuscle: 'Biceps',
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    category: 'Hypertrophy',
    defaultRestSeconds: 60,
    instructions: 'Sit on incline bench to place long head of bicep into deep stretch. Curl with supination.',
  },
  {
    id: 'ex_hammer_curl',
    name: 'Dumbbell Hammer Curls',
    primaryMuscle: 'Biceps',
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    category: 'Hypertrophy',
    defaultRestSeconds: 60,
    instructions: 'Palms facing each other throughout the movement. Targets brachialis and forearms.',
  },

  // --- TRICEPS ---
  {
    id: 'ex_tricep_pushdown',
    name: 'Cable Tricep Rope Pushdown',
    primaryMuscle: 'Triceps',
    secondaryMuscles: [],
    equipment: 'Cable',
    category: 'Hypertrophy',
    defaultRestSeconds: 60,
    instructions: 'Pin elbows to sides. Extend arms fully and spread rope ends apart at bottom.',
  },
  {
    id: 'ex_skull_crushers',
    name: 'EZ-Bar Skull Crushers (Lying Extension)',
    primaryMuscle: 'Triceps',
    secondaryMuscles: [],
    equipment: 'Barbell',
    category: 'Hypertrophy',
    defaultRestSeconds: 75,
    instructions: 'Lower bar towards forehead or crown of head, keep elbows tucked in, extend through triceps.',
  },
  {
    id: 'ex_overhead_tricep_ext',
    name: 'Cable Overhead Tricep Extension',
    primaryMuscle: 'Triceps',
    secondaryMuscles: [],
    equipment: 'Cable',
    category: 'Hypertrophy',
    defaultRestSeconds: 60,
    instructions: 'Provides maximum stretch to long head of triceps.',
  },

  // --- LEGS (QUADS, HAMSTRINGS, GLUTES, CALVES) ---
  {
    id: 'ex_barbell_squat',
    name: 'Barbell Back Squat',
    primaryMuscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    equipment: 'Barbell',
    category: 'Strength',
    defaultRestSeconds: 150,
    instructions: 'Bar on upper traps, feet shoulder-width, break at knees and hips simultaneously, hit parallel or below.',
  },
  {
    id: 'ex_leg_press',
    name: '45-Degree Leg Press',
    primaryMuscle: 'Quads',
    secondaryMuscles: ['Glutes'],
    equipment: 'Machine',
    category: 'Hypertrophy',
    defaultRestSeconds: 90,
    instructions: 'Place feet mid-platform, lower weight until 90 degrees at knee without letting lower back round.',
  },
  {
    id: 'ex_romanian_deadlift',
    name: 'Romanian Deadlift (RDL)',
    primaryMuscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Back'],
    equipment: 'Barbell',
    category: 'Strength',
    defaultRestSeconds: 90,
    instructions: 'Slight soft bend in knees, push hips back towards wall behind you until deep hamstring stretch.',
  },
  {
    id: 'ex_leg_curl',
    name: 'Lying / Seated Leg Curl',
    primaryMuscle: 'Hamstrings',
    secondaryMuscles: [],
    equipment: 'Machine',
    category: 'Hypertrophy',
    defaultRestSeconds: 60,
    instructions: 'Dorsiflex toes, curl heels towards glutes with controlled 2s eccentric.',
  },
  {
    id: 'ex_leg_extension',
    name: 'Leg Extension',
    primaryMuscle: 'Quads',
    secondaryMuscles: [],
    equipment: 'Machine',
    category: 'Hypertrophy',
    defaultRestSeconds: 60,
    instructions: 'Extend knees fully, pause at top for 1s squeeze.',
  },
  {
    id: 'ex_standing_calf_raise',
    name: 'Standing Calf Raise',
    primaryMuscle: 'Calves',
    secondaryMuscles: [],
    equipment: 'Machine',
    category: 'Hypertrophy',
    defaultRestSeconds: 45,
    instructions: 'Full stretch at bottom for 2s pause to eliminate Achilles tendon bounce, rise high on big toes.',
  },

  // --- ABS / CORE ---
  {
    id: 'ex_hanging_leg_raise',
    name: 'Hanging Leg / Knee Raises',
    primaryMuscle: 'Abs',
    secondaryMuscles: [],
    equipment: 'Bodyweight',
    category: 'Hypertrophy',
    defaultRestSeconds: 60,
    instructions: 'Hang from pull-up bar, tilt pelvis up and curl knees/toes toward chest without swinging.',
  },
  {
    id: 'ex_cable_woodchopper',
    name: 'Cable Abdominal Crunch / Woodchopper',
    primaryMuscle: 'Abs',
    secondaryMuscles: [],
    equipment: 'Cable',
    category: 'Hypertrophy',
    defaultRestSeconds: 60,
    instructions: 'Kneel in front of cable pulley, crunch torso down curling sternum toward pelvis.',
  },
];

export const PREBUILT_ROUTINES: WorkoutRoutine[] = [
  {
    id: 'routine_chest_triceps',
    name: 'Chest & Triceps (Push Focus)',
    description: 'High-yield pressing power and tricep isolation routine for upper body mass.',
    category: 'Split',
    exercises: [
      { exerciseId: 'ex_bench_press', exerciseName: 'Barbell Flat Bench Press', targetMuscleGroup: 'Chest', suggestedSets: 4, suggestedReps: 8, suggestedRestSeconds: 120 },
      { exerciseId: 'ex_incline_db_press', exerciseName: 'Incline Dumbbell Press', targetMuscleGroup: 'Chest', suggestedSets: 3, suggestedReps: 10, suggestedRestSeconds: 90 },
      { exerciseId: 'ex_cable_crossover', exerciseName: 'Cable Chest Flyes', targetMuscleGroup: 'Chest', suggestedSets: 3, suggestedReps: 12, suggestedRestSeconds: 60 },
      { exerciseId: 'ex_skull_crushers', exerciseName: 'EZ-Bar Skull Crushers (Lying Extension)', targetMuscleGroup: 'Triceps', suggestedSets: 3, suggestedReps: 10, suggestedRestSeconds: 75 },
      { exerciseId: 'ex_tricep_pushdown', exerciseName: 'Cable Tricep Rope Pushdown', targetMuscleGroup: 'Triceps', suggestedSets: 3, suggestedReps: 12, suggestedRestSeconds: 60 },
    ],
  },
  {
    id: 'routine_back_biceps',
    name: 'Back & Biceps (Pull Focus)',
    description: 'Thick lat development, heavy rowing, and peaked bicep growth.',
    category: 'Split',
    exercises: [
      { exerciseId: 'ex_deadlift', exerciseName: 'Conventional Barbell Deadlift', targetMuscleGroup: 'Back', suggestedSets: 3, suggestedReps: 5, suggestedRestSeconds: 180 },
      { exerciseId: 'ex_lat_pulldown', exerciseName: 'Lat Pulldown (Wide Grip)', targetMuscleGroup: 'Back', suggestedSets: 4, suggestedReps: 10, suggestedRestSeconds: 75 },
      { exerciseId: 'ex_seated_cable_row', exerciseName: 'Seated Cable Row (Close Grip)', targetMuscleGroup: 'Back', suggestedSets: 3, suggestedReps: 12, suggestedRestSeconds: 75 },
      { exerciseId: 'ex_barbell_curl', exerciseName: 'Standing Barbell Bicep Curl', targetMuscleGroup: 'Biceps', suggestedSets: 3, suggestedReps: 10, suggestedRestSeconds: 75 },
      { exerciseId: 'ex_hammer_curl', exerciseName: 'Dumbbell Hammer Curls', targetMuscleGroup: 'Biceps', suggestedSets: 3, suggestedReps: 12, suggestedRestSeconds: 60 },
    ],
  },
  {
    id: 'routine_shoulders_abs',
    name: 'Shoulders & Core Sculpt',
    description: 'Deltoid width (boulder shoulders) and high-density core stability.',
    category: 'Split',
    exercises: [
      { exerciseId: 'ex_overhead_press', exerciseName: 'Standing Barbell Overhead Press (OHP)', targetMuscleGroup: 'Shoulders', suggestedSets: 4, suggestedReps: 8, suggestedRestSeconds: 120 },
      { exerciseId: 'ex_db_lateral_raise', exerciseName: 'Dumbbell Lateral Raises', targetMuscleGroup: 'Shoulders', suggestedSets: 4, suggestedReps: 15, suggestedRestSeconds: 60 },
      { exerciseId: 'ex_face_pulls', exerciseName: 'Cable Face Pulls', targetMuscleGroup: 'Shoulders', suggestedSets: 3, suggestedReps: 15, suggestedRestSeconds: 60 },
      { exerciseId: 'ex_hanging_leg_raise', exerciseName: 'Hanging Leg / Knee Raises', targetMuscleGroup: 'Abs', suggestedSets: 3, suggestedReps: 12, suggestedRestSeconds: 60 },
      { exerciseId: 'ex_cable_woodchopper', exerciseName: 'Cable Abdominal Crunch / Woodchopper', targetMuscleGroup: 'Abs', suggestedSets: 3, suggestedReps: 15, suggestedRestSeconds: 60 },
    ],
  },
  {
    id: 'routine_legs_quad_ham',
    name: 'Legs (Quad & Hamstring Power)',
    description: 'Heavy compound leg training for maximum lower body strength and metabolism boost.',
    category: 'Split',
    exercises: [
      { exerciseId: 'ex_barbell_squat', exerciseName: 'Barbell Back Squat', targetMuscleGroup: 'Quads', suggestedSets: 4, suggestedReps: 8, suggestedRestSeconds: 150 },
      { exerciseId: 'ex_romanian_deadlift', exerciseName: 'Romanian Deadlift (RDL)', targetMuscleGroup: 'Hamstrings', suggestedSets: 3, suggestedReps: 10, suggestedRestSeconds: 90 },
      { exerciseId: 'ex_leg_press', exerciseName: '45-Degree Leg Press', targetMuscleGroup: 'Quads', suggestedSets: 3, suggestedReps: 12, suggestedRestSeconds: 90 },
      { exerciseId: 'ex_leg_curl', exerciseName: 'Lying / Seated Leg Curl', targetMuscleGroup: 'Hamstrings', suggestedSets: 3, suggestedReps: 12, suggestedRestSeconds: 60 },
      { exerciseId: 'ex_standing_calf_raise', exerciseName: 'Standing Calf Raise', targetMuscleGroup: 'Calves', suggestedSets: 4, suggestedReps: 15, suggestedRestSeconds: 45 },
    ],
  },
  {
    id: 'routine_upper_power',
    name: 'Upper Body Power & Hypertrophy',
    description: 'Complete upper body compound session for 2-day or Upper/Lower splits.',
    category: 'Upper/Lower',
    exercises: [
      { exerciseId: 'ex_bench_press', exerciseName: 'Barbell Flat Bench Press', targetMuscleGroup: 'Chest', suggestedSets: 4, suggestedReps: 6, suggestedRestSeconds: 120 },
      { exerciseId: 'ex_barbell_row', exerciseName: 'Bent-Over Barbell Row', targetMuscleGroup: 'Back', suggestedSets: 4, suggestedReps: 8, suggestedRestSeconds: 90 },
      { exerciseId: 'ex_overhead_press', exerciseName: 'Standing Barbell Overhead Press (OHP)', targetMuscleGroup: 'Shoulders', suggestedSets: 3, suggestedReps: 8, suggestedRestSeconds: 90 },
      { exerciseId: 'ex_lat_pulldown', exerciseName: 'Lat Pulldown (Wide Grip)', targetMuscleGroup: 'Back', suggestedSets: 3, suggestedReps: 10, suggestedRestSeconds: 75 },
      { exerciseId: 'ex_tricep_pushdown', exerciseName: 'Cable Tricep Rope Pushdown', targetMuscleGroup: 'Triceps', suggestedSets: 3, suggestedReps: 12, suggestedRestSeconds: 60 },
      { exerciseId: 'ex_barbell_curl', exerciseName: 'Standing Barbell Bicep Curl', targetMuscleGroup: 'Biceps', suggestedSets: 3, suggestedReps: 10, suggestedRestSeconds: 60 },
    ],
  },
  {
    id: 'routine_lower_power',
    name: 'Lower Body Strength & Hypertrophy',
    description: 'Full lower chain driver featuring squats, RDLs, and calves.',
    category: 'Upper/Lower',
    exercises: [
      { exerciseId: 'ex_barbell_squat', exerciseName: 'Barbell Back Squat', targetMuscleGroup: 'Quads', suggestedSets: 4, suggestedReps: 6, suggestedRestSeconds: 150 },
      { exerciseId: 'ex_romanian_deadlift', exerciseName: 'Romanian Deadlift (RDL)', targetMuscleGroup: 'Hamstrings', suggestedSets: 4, suggestedReps: 8, suggestedRestSeconds: 90 },
      { exerciseId: 'ex_leg_extension', exerciseName: 'Leg Extension', targetMuscleGroup: 'Quads', suggestedSets: 3, suggestedReps: 12, suggestedRestSeconds: 60 },
      { exerciseId: 'ex_leg_curl', exerciseName: 'Lying / Seated Leg Curl', targetMuscleGroup: 'Hamstrings', suggestedSets: 3, suggestedReps: 12, suggestedRestSeconds: 60 },
      { exerciseId: 'ex_standing_calf_raise', exerciseName: 'Standing Calf Raise', targetMuscleGroup: 'Calves', suggestedSets: 4, suggestedReps: 15, suggestedRestSeconds: 45 },
    ],
  },
];

/**
 * Looks up historical performance for an exercise to enable progressive overload tracking
 */
export function getPreviousExercisePerformance(
  exerciseName: string,
  workoutHistory: WorkoutLog[]
): {
  lastSessionDate?: string;
  bestSetFormatted?: string; // e.g. "82.5 kg × 8 reps"
  lastSetsFormatted?: string[]; // e.g. ["80kg × 8", "80kg × 7", "75kg × 8"]
  maxWeightKg: number;
} {
  const matchingLogs = workoutHistory
    .filter((log) => log.exercises.some((e) => e.exerciseName.toLowerCase() === exerciseName.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (matchingLogs.length === 0) {
    return { maxWeightKg: 0 };
  }

  const latestLog = matchingLogs[0];
  const targetEx = latestLog.exercises.find((e) => e.exerciseName.toLowerCase() === exerciseName.toLowerCase());

  if (!targetEx || !targetEx.sets || targetEx.sets.length === 0) {
    return { maxWeightKg: 0 };
  }

  const completedSets = targetEx.sets.filter((s) => s.completed && s.reps > 0);
  if (completedSets.length === 0) {
    return { maxWeightKg: 0 };
  }

  let maxWeightKg = 0;
  let bestSet = completedSets[0];

  const lastSetsFormatted = completedSets.map((s) => {
    if (s.weightKg > maxWeightKg) {
      maxWeightKg = s.weightKg;
      bestSet = s;
    }
    return `${s.weightKg}kg × ${s.reps}`;
  });

  return {
    lastSessionDate: latestLog.date,
    bestSetFormatted: `${bestSet.weightKg} kg × ${bestSet.reps} reps`,
    lastSetsFormatted,
    maxWeightKg,
  };
}
