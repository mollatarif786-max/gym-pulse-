import {
  UserProfile,
  WorkoutLog,
  WorkoutRoutine,
  DailyNutritionLog,
  DailyStepLog,
  BodyMeasurement,
  FoodItem,
} from '../types';
import { PREBUILT_ROUTINES } from './workoutDatabase';
import { INITIAL_FOOD_DATABASE } from './foodDatabase';

const STORAGE_KEYS = {
  PROFILE: 'gympulse_profile_v1',
  WORKOUTS: 'gympulse_workouts_v1',
  ROUTINES: 'gympulse_routines_v1',
  NUTRITION: 'gympulse_nutrition_v1',
  STEPS: 'gympulse_steps_v1',
  MEASUREMENTS: 'gympulse_measurements_v1',
  CUSTOM_FOODS: 'gympulse_custom_foods_v1',
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user_default',
  name: 'Athlete',
  age: 25,
  gender: 'male',
  heightCm: 175,
  weightKg: 70.0,
  activityLevel: 'moderately_active',
  fitnessGoal: 'gain_muscle',
  dietaryPreference: 'non_vegetarian',
  includeEggsIfVegetarian: true,
  dailyStepGoal: 10000,
  unitSystem: 'metric',
  onboardingCompleted: false,
  createdAt: '2026-07-01T08:00:00.000Z',
  updatedAt: '2026-08-13T14:00:00.000Z',
};

/**
 * Generates realistic seed history (past 30 days) for rich graphs and progressive overload demos
 */
function generateSeedData() {
  const today = new Date();
  const seedWorkouts: WorkoutLog[] = [];
  const seedNutrition: DailyNutritionLog[] = [];
  const seedSteps: DailyStepLog[] = [];
  const seedMeasurements: BodyMeasurement[] = [];

  // Generate 30 days of past logs
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Measurements every 3-4 days
    if (i % 3 === 0) {
      // Gradual lean muscle gain progression: 77.2 kg -> 78.5 kg
      const weight = Number((77.2 + ((30 - i) / 30) * 1.3 + (Math.sin(i) * 0.15)).toFixed(1));
      const waist = Number((81.0 - ((30 - i) / 30) * 0.4).toFixed(1));
      seedMeasurements.push({
        id: `meas_${dateStr}`,
        date: dateStr,
        weightKg: weight,
        waistCm: waist,
        bodyFatPercentage: Number((15.2 - ((30 - i) / 30) * 0.6).toFixed(1)),
        notes: i === 0 ? 'Morning fasted weigh-in' : undefined,
      });
    }

    // Step logs
    const baseSteps = 9500 + Math.floor(Math.sin(i * 1.2) * 2200) + (i % 2 === 0 ? 800 : -600);
    seedSteps.push({
      date: dateStr,
      steps: Math.max(4500, baseSteps),
      source: i === 0 ? 'phone_sensor' : 'apple_health',
      syncedAt: `${dateStr}T20:30:00.000Z`,
    });

    // Workouts 4-5 days a week
    const dayOfWeek = d.getDay(); // 0 is Sun, 6 is Sat
    if (dayOfWeek !== 0 && dayOfWeek !== 3) {
      const routineIndex = (30 - i) % PREBUILT_ROUTINES.length;
      const routine = PREBUILT_ROUTINES[routineIndex];
      
      // Progressive overload progression for Bench Press (e.g. 75kg -> 82.5kg)
      const benchProgressWeight = Math.min(85, 75 + Math.floor((30 - i) / 8) * 2.5);

      const loggedExs = routine.exercises.slice(0, 4).map((ex, exIdx) => {
        let weight = 40 + exIdx * 15;
        if (ex.exerciseId === 'ex_bench_press') weight = benchProgressWeight;
        if (ex.exerciseId === 'ex_barbell_squat') weight = benchProgressWeight + 20;
        if (ex.exerciseId === 'ex_deadlift') weight = benchProgressWeight + 35;

        return {
          id: `lex_${dateStr}_${exIdx}`,
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          targetMuscleGroup: ex.targetMuscleGroup,
          sets: [
            { id: `s1_${exIdx}`, setNumber: 1, reps: ex.suggestedReps, weightKg: weight, completed: true, rpe: 8 },
            { id: `s2_${exIdx}`, setNumber: 2, reps: ex.suggestedReps, weightKg: weight, completed: true, rpe: 8.5 },
            { id: `s3_${exIdx}`, setNumber: 3, reps: Math.max(6, ex.suggestedReps - 1), weightKg: weight, completed: true, rpe: 9 },
          ],
          notes: 'Great mind-muscle connection',
          restSeconds: ex.suggestedRestSeconds,
        };
      });

      const totalVol = loggedExs.reduce((sum, ex) => {
        return sum + ex.sets.reduce((sSum, s) => sSum + s.weightKg * s.reps, 0);
      }, 0);

      seedWorkouts.push({
        id: `wlog_${dateStr}`,
        date: dateStr,
        routineId: routine.id,
        routineName: routine.name,
        durationMinutes: 52 + (i % 15),
        exercises: loggedExs,
        totalVolumeKg: totalVol,
        totalSets: loggedExs.length * 3,
        notes: 'Felt energized and hit all target reps with good tempo.',
        rating: 5,
        createdAt: `${dateStr}T18:45:00.000Z`,
      });
    }

    // Nutrition logs
    const isRest = dayOfWeek === 0 || dayOfWeek === 3;
    const proteinTarget = 155;
    const actualProtein = i === 0 ? 118 : proteinTarget + Math.floor(Math.sin(i) * 22) - (i % 4 === 0 ? 30 : 0);
    const actualCalories = isRest ? 2450 + Math.floor(Math.sin(i) * 150) : 2750 + Math.floor(Math.cos(i) * 200);

    seedNutrition.push({
      date: dateStr,
      breakfast: [
        {
          id: `m_b1_${dateStr}`,
          name: 'Rolled Oats with Milk & Banana',
          portion: '1 large bowl',
          servings: 1,
          calories: 420,
          protein: 18,
          carbs: 72,
          fats: 7,
          loggedAt: `${dateStr}T08:15:00.000Z`,
        },
        {
          id: `m_b2_${dateStr}`,
          name: 'Whole Boiled Eggs (3 Large)',
          portion: '3 eggs',
          servings: 1,
          calories: 216,
          protein: 18,
          carbs: 1,
          fats: 15,
          loggedAt: `${dateStr}T08:20:00.000Z`,
        },
      ],
      lunch: [
        {
          id: `m_l1_${dateStr}`,
          name: 'Grilled Chicken Breast',
          portion: '180g (cooked)',
          servings: 1.2,
          calories: 298,
          protein: 55,
          carbs: 0,
          fats: 6,
          loggedAt: `${dateStr}T13:00:00.000Z`,
        },
        {
          id: `m_l2_${dateStr}`,
          name: 'Brown Basmati Rice & Steamed Veggies',
          portion: '200g cooked',
          servings: 1,
          calories: 260,
          protein: 6,
          carbs: 54,
          fats: 2,
          loggedAt: `${dateStr}T13:00:00.000Z`,
        },
      ],
      dinner: [
        {
          id: `m_d1_${dateStr}`,
          name: 'Atlantic Salmon Fillet with Sweet Potato',
          portion: '150g salmon + 200g potato',
          servings: 1,
          calories: 480,
          protein: 38,
          carbs: 45,
          fats: 19,
          loggedAt: `${dateStr}T20:00:00.000Z`,
        },
      ],
      snacks: i === 0 ? [] : [
        {
          id: `m_s1_${dateStr}`,
          name: 'Whey Protein Isolate Shake',
          portion: '1 scoop',
          servings: 1,
          calories: 120,
          protein: 26,
          carbs: 2,
          fats: 1,
          loggedAt: `${dateStr}T16:30:00.000Z`,
        },
        {
          id: `m_s2_${dateStr}`,
          name: 'Plain Greek Yogurt (0% Fat)',
          portion: '200g',
          servings: 1,
          calories: 130,
          protein: 22,
          carbs: 7,
          fats: 0,
          loggedAt: `${dateStr}T21:30:00.000Z`,
        },
      ],
    });
  }

  return { seedWorkouts, seedNutrition, seedSteps, seedMeasurements };
}

export class StorageService {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  // --- USER PROFILE ---
  static getProfile(): UserProfile {
    if (!this.isBrowser()) return DEFAULT_USER_PROFILE;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!data) {
        this.saveProfile(DEFAULT_USER_PROFILE);
        return DEFAULT_USER_PROFILE;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  }

  static saveProfile(profile: UserProfile): void {
    if (!this.isBrowser()) return;
    try {
      profile.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  }

  // --- WORKOUTS ---
  static getWorkouts(): WorkoutLog[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      if (!data) {
        const { seedWorkouts } = generateSeedData();
        this.saveWorkouts(seedWorkouts);
        return seedWorkouts;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveWorkouts(workouts: WorkoutLog[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    } catch (e) {
      console.error('Failed to save workouts:', e);
    }
  }

  static addWorkoutLog(workout: WorkoutLog): void {
    const workouts = this.getWorkouts();
    // Replace if exists for same ID or prepend
    const existingIndex = workouts.findIndex((w) => w.id === workout.id);
    if (existingIndex >= 0) {
      workouts[existingIndex] = workout;
    } else {
      workouts.unshift(workout);
    }
    this.saveWorkouts(workouts);
  }

  static deleteWorkoutLog(workoutId: string): void {
    const workouts = this.getWorkouts().filter((w) => w.id !== workoutId);
    this.saveWorkouts(workouts);
  }

  // --- ROUTINES ---
  static getRoutines(): WorkoutRoutine[] {
    if (!this.isBrowser()) return PREBUILT_ROUTINES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      if (!data) {
        this.saveRoutines(PREBUILT_ROUTINES);
        return PREBUILT_ROUTINES;
      }
      return JSON.parse(data);
    } catch {
      return PREBUILT_ROUTINES;
    }
  }

  static saveRoutines(routines: WorkoutRoutine[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
    } catch (e) {
      console.error('Failed to save routines:', e);
    }
  }

  static saveCustomRoutine(routine: WorkoutRoutine): void {
    const routines = this.getRoutines();
    const existingIndex = routines.findIndex((r) => r.id === routine.id);
    if (existingIndex >= 0) {
      routines[existingIndex] = routine;
    } else {
      routines.push(routine);
    }
    this.saveRoutines(routines);
  }

  static deleteRoutine(routineId: string): void {
    const routines = this.getRoutines().filter((r) => r.id !== routineId);
    this.saveRoutines(routines);
  }

  // --- NUTRITION LOGS ---
  static getNutritionLogs(): DailyNutritionLog[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NUTRITION);
      if (!data) {
        const { seedNutrition } = generateSeedData();
        this.saveNutritionLogs(seedNutrition);
        return seedNutrition;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveNutritionLogs(logs: DailyNutritionLog[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.NUTRITION, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save nutrition logs:', e);
    }
  }

  static getTodayNutritionLog(dateStr?: string): DailyNutritionLog {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const logs = this.getNutritionLogs();
    const existing = logs.find((l) => l.date === targetDate);
    if (existing) return existing;

    const newLog: DailyNutritionLog = {
      date: targetDate,
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };
    logs.push(newLog);
    this.saveNutritionLogs(logs);
    return newLog;
  }

  static updateDayNutrition(log: DailyNutritionLog): void {
    const logs = this.getNutritionLogs();
    const index = logs.findIndex((l) => l.date === log.date);
    if (index >= 0) {
      logs[index] = log;
    } else {
      logs.push(log);
    }
    this.saveNutritionLogs(logs);
  }

  // --- STEPS ---
  static getStepLogs(): DailyStepLog[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STEPS);
      if (!data) {
        const { seedSteps } = generateSeedData();
        this.saveStepLogs(seedSteps);
        return seedSteps;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveStepLogs(logs: DailyStepLog[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.STEPS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save steps:', e);
    }
  }

  static logTodaySteps(steps: number, source: DailyStepLog['source'] = 'manual'): void {
    const today = new Date().toISOString().split('T')[0];
    const logs = this.getStepLogs();
    const existing = logs.find((l) => l.date === today);
    if (existing) {
      existing.steps = steps;
      existing.source = source;
      existing.syncedAt = new Date().toISOString();
    } else {
      logs.push({
        date: today,
        steps,
        source,
        syncedAt: new Date().toISOString(),
      });
    }
    this.saveStepLogs(logs);
  }

  // --- MEASUREMENTS ---
  static getMeasurements(): BodyMeasurement[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEASUREMENTS);
      if (!data) {
        const { seedMeasurements } = generateSeedData();
        this.saveMeasurements(seedMeasurements);
        return seedMeasurements;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveMeasurements(measurements: BodyMeasurement[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements));
    } catch (e) {
      console.error('Failed to save measurements:', e);
    }
  }

  static addMeasurement(measurement: BodyMeasurement): void {
    const measurements = this.getMeasurements();
    const existingIdx = measurements.findIndex((m) => m.date === measurement.date);
    if (existingIdx >= 0) {
      measurements[existingIdx] = measurement;
    } else {
      measurements.push(measurement);
    }
    measurements.sort((a, b) => b.date.localeCompare(a.date));
    this.saveMeasurements(measurements);

    // Also update current weight on UserProfile
    const profile = this.getProfile();
    profile.weightKg = measurement.weightKg;
    this.saveProfile(profile);
  }

  // --- CUSTOM FOOD ITEMS ---
  static getCustomFoods(): FoodItem[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOODS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static addCustomFood(food: FoodItem): void {
    if (!this.isBrowser()) return;
    const foods = this.getCustomFoods();
    foods.unshift(food);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FOODS, JSON.stringify(foods));
  }

  static getAllFoods(): FoodItem[] {
    const custom = this.getCustomFoods();
    return [...custom, ...INITIAL_FOOD_DATABASE];
  }

  // --- RESET / EXPORT DATA ---
  static resetAllData(): void {
    if (!this.isBrowser()) return;
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  }

  static exportAllDataAsJSON(): string {
    return JSON.stringify({
      profile: this.getProfile(),
      workouts: this.getWorkouts(),
      routines: this.getRoutines(),
      nutrition: this.getNutritionLogs(),
      steps: this.getStepLogs(),
      measurements: this.getMeasurements(),
      customFoods: this.getCustomFoods(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }
}
