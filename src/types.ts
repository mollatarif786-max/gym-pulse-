export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
export type FitnessGoal = 'maintain' | 'lose_fat' | 'gain_muscle' | 'recomposition';
export type DietaryPreference = 'vegetarian' | 'non_vegetarian' | 'eggitarian' | 'vegan';
export type UnitSystem = 'metric' | 'imperial';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  heightCm: number; // Stored in cm
  weightKg: number; // Stored in kg
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  dietaryPreference: DietaryPreference;
  includeEggsIfVegetarian: boolean;
  dailyStepGoal: number;
  unitSystem: UnitSystem;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MetricEstimate {
  bmr: number;
  maintenanceCalories: number;
  targetCalories: number;
  calorieDeficitOrSurplus: number;
  proteinTargetGrams: number;
  proteinMinGrams: number;
  proteinMaxGrams: number;
  carbsTargetGrams: number;
  fatsTargetGrams: number;
  formulaNotes: string;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
  rpe?: number; // Rate of perceived exertion (1-10)
  previousBest?: string; // e.g. "80kg × 8"
}

export interface LoggedExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetMuscleGroup: MuscleGroup;
  sets: WorkoutSet[];
  notes?: string;
  restSeconds?: number;
}

export type MuscleGroup = 
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Quads'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Abs'
  | 'Full Body'
  | 'Cardio';

export interface ExerciseDefinition {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: 'Barbell' | 'Dumbbell' | 'Machine' | 'Cable' | 'Bodyweight' | 'Kettlebell' | 'Other';
  category: 'Strength' | 'Hypertrophy' | 'Cardio' | 'Mobility';
  instructions?: string;
  defaultRestSeconds: number;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  description: string;
  category: 'Push/Pull/Legs' | 'Upper/Lower' | 'Split' | 'Full Body' | 'Custom';
  exercises: {
    exerciseId: string;
    exerciseName: string;
    targetMuscleGroup: MuscleGroup;
    suggestedSets: number;
    suggestedReps: number;
    suggestedRestSeconds: number;
  }[];
  isCustom?: boolean;
}

export interface WorkoutLog {
  id: string;
  date: string; // YYYY-MM-DD
  routineId?: string;
  routineName: string;
  durationMinutes: number;
  exercises: LoggedExercise[];
  totalVolumeKg: number;
  totalSets: number;
  notes?: string;
  rating?: number; // 1-5
  createdAt: string;
}

export interface FoodItem {
  id: string;
  name: string;
  portion: string;
  servingGrams?: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  dietaryType: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'contains_egg';
  prepTimeMinutes: number;
  category: 'Quick Snack' | 'Lean Meat & Poultry' | 'Dairy & Whey' | 'Plant-Based' | 'Seafood' | 'Grains & Legumes' | 'Meal';
  isQuickOption?: boolean;
  notes?: string;
}

export interface MealItem {
  id: string;
  foodId?: string;
  name: string;
  portion: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  loggedAt: string; // ISO string
}

export interface DailyNutritionLog {
  date: string; // YYYY-MM-DD
  breakfast: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
  snacks: MealItem[];
  waterMl?: number;
  notes?: string;
}

export interface BodyMeasurement {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  waistCm?: number;
  bodyFatPercentage?: number;
  notes?: string;
}

export interface DailyStepLog {
  date: string; // YYYY-MM-DD
  steps: number;
  source: 'apple_health' | 'google_fit' | 'phone_sensor' | 'manual';
  syncedAt?: string;
}

export interface SmartInsight {
  id: string;
  type: 'protein_warning' | 'calorie_alert' | 'workout_streak' | 'step_milestone' | 'pr_achievement' | 'nutrition_tip';
  title: string;
  message: string;
  actionableRecommendation?: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
}
