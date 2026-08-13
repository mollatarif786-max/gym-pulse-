import { UserProfile, MetricEstimate, BodyMeasurement, DailyNutritionLog, WorkoutLog } from '../types';

/**
 * Mifflin-St Jeor BMR Equation and TDEE calculation engine.
 * Pure calculation functions separated from UI.
 */

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

export const ACTIVITY_LABELS: Record<string, { title: string; description: string }> = {
  sedentary: {
    title: 'Sedentary',
    description: 'Desk job, minimal daily movement, <5k steps/day',
  },
  lightly_active: {
    title: 'Lightly Active',
    description: 'Light exercise or gym 1-3 days/week, 5k-8k steps/day',
  },
  moderately_active: {
    title: 'Moderately Active',
    description: 'Moderate gym workouts 3-5 days/week, 8k-12k steps/day',
  },
  very_active: {
    title: 'Very Active',
    description: 'Heavy gym training 6-7 days/week, active lifestyle',
  },
  extra_active: {
    title: 'Extra Active',
    description: 'Intense training 2x/day or physically demanding labor job',
  },
};

/**
 * Calculates Basal Metabolic Rate (BMR) using the validated Mifflin-St Jeor formula
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: string): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 1800;

  let genderOffset = 5;
  if (gender === 'female') {
    genderOffset = -161;
  } else if (gender === 'other') {
    genderOffset = -78; // Midpoint
  }

  // Mifflin-St Jeor formula: 10 * weight(kg) + 6.25 * height(cm) - 5 * age + s
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + genderOffset;
  return Math.round(bmr);
}

/**
 * Calculates total maintenance calories and target macros based on fitness goal
 */
export function calculateNutritionTargets(profile: UserProfile): MetricEstimate {
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
  const activityMultiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel] || 1.45;
  
  // Total Daily Energy Expenditure (TDEE) / Maintenance
  const maintenanceCalories = Math.round(bmr * activityMultiplier);

  let calorieAdjustment = 0;
  let proteinMultiplier = 1.8;
  let proteinMinMultiplier = 1.6;
  let proteinMaxMultiplier = 2.0;

  switch (profile.fitnessGoal) {
    case 'maintain':
      calorieAdjustment = 0;
      proteinMultiplier = 1.8;
      proteinMinMultiplier = 1.6;
      proteinMaxMultiplier = 2.0;
      break;
    case 'lose_fat':
      // Moderate sustainable deficit of ~450 kcal
      calorieAdjustment = -450;
      // Higher protein in deficit to preserve lean mass
      proteinMultiplier = 2.2;
      proteinMinMultiplier = 2.0;
      proteinMaxMultiplier = 2.4;
      break;
    case 'gain_muscle':
      // Lean surplus of ~300 kcal to maximize hypertrophy without excess fat
      calorieAdjustment = 300;
      proteinMultiplier = 2.0;
      proteinMinMultiplier = 1.8;
      proteinMaxMultiplier = 2.2;
      break;
    case 'recomposition':
      // Slight deficit or near maintenance with high protein
      calorieAdjustment = -150;
      proteinMultiplier = 2.2;
      proteinMinMultiplier = 2.0;
      proteinMaxMultiplier = 2.4;
      break;
  }

  const targetCalories = Math.max(1200, maintenanceCalories + calorieAdjustment);

  // Protein targets in grams
  const proteinTargetGrams = Math.round(profile.weightKg * proteinMultiplier);
  const proteinMinGrams = Math.round(profile.weightKg * proteinMinMultiplier);
  const proteinMaxGrams = Math.round(profile.weightKg * proteinMaxMultiplier);

  // Fats: ~0.8g to 0.9g per kg bodyweight
  const fatGramsPerKg = profile.fitnessGoal === 'lose_fat' ? 0.75 : 0.9;
  const fatsTargetGrams = Math.round(profile.weightKg * fatGramsPerKg);

  // Remaining calories go to Carbohydrates (4 kcal/g)
  const caloriesFromProtein = proteinTargetGrams * 4;
  const caloriesFromFat = fatsTargetGrams * 9;
  const remainingCaloriesForCarbs = Math.max(0, targetCalories - caloriesFromProtein - caloriesFromFat);
  const carbsTargetGrams = Math.round(remainingCaloriesForCarbs / 4);

  const goalDescriptions = {
    maintain: 'Balanced maintenance at calculated TDEE',
    lose_fat: '450 kcal deficit with elevated protein to preserve lean muscle tissue',
    gain_muscle: '300 kcal lean surplus to fuel muscular hypertrophy',
    recomposition: 'Slight deficit (-150 kcal) + high protein for concurrent fat loss & muscle building',
  };

  const formulaNotes = `Calculated using the Mifflin-St Jeor formula (BMR: ${bmr} kcal) with a ${profile.activityLevel.replace('_', ' ')} multiplier (${activityMultiplier}×). Goal strategy: ${goalDescriptions[profile.fitnessGoal]}.`;

  return {
    bmr,
    maintenanceCalories,
    targetCalories,
    calorieDeficitOrSurplus: calorieAdjustment,
    proteinTargetGrams,
    proteinMinGrams,
    proteinMaxGrams,
    carbsTargetGrams,
    fatsTargetGrams,
    formulaNotes,
  };
}

/**
 * Calculates total calories, protein, carbs, and fats logged for a day
 */
export function calculateDailyNutritionTotals(dayLog: DailyNutritionLog | null | undefined): {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  itemCount: number;
} {
  if (!dayLog) {
    return { calories: 0, protein: 0, carbs: 0, fats: 0, itemCount: 0 };
  }

  const allMeals = [
    ...(dayLog.breakfast || []),
    ...(dayLog.lunch || []),
    ...(dayLog.dinner || []),
    ...(dayLog.snacks || []),
  ];

  const totals = allMeals.reduce(
    (acc, item) => {
      const servings = item.servings || 1;
      acc.calories += Math.round((item.calories || 0) * servings);
      acc.protein += Math.round((item.protein || 0) * servings);
      acc.carbs += Math.round((item.carbs || 0) * servings);
      acc.fats += Math.round((item.fats || 0) * servings);
      acc.itemCount += 1;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0, itemCount: 0 }
  );

  return totals;
}

/**
 * Calculates total volume lifted (kg) and completed sets from a workout
 */
export function calculateWorkoutVolume(workout: WorkoutLog): { totalVolumeKg: number; completedSets: number } {
  let totalVolume = 0;
  let completedSets = 0;

  for (const exercise of workout.exercises || []) {
    for (const set of exercise.sets || []) {
      if (set.completed) {
        totalVolume += (set.weightKg || 0) * (set.reps || 0);
        completedSets += 1;
      }
    }
  }

  return {
    totalVolumeKg: Math.round(totalVolume),
    completedSets,
  };
}

/**
 * Estimates adaptive maintenance calories if at least 14 days of weight & calorie logs exist
 */
export function calculateAdaptiveMaintenance(
  weights: BodyMeasurement[],
  nutritionLogs: DailyNutritionLog[],
  calculatedMaintenance: number
): {
  adaptiveMaintenance: number;
  confidence: 'insufficient_data' | 'preliminary' | 'high';
  weightDeltaKg: number;
  avgDailyIntake: number;
  daysAnalyzed: number;
} {
  if (weights.length < 3 || nutritionLogs.length < 7) {
    return {
      adaptiveMaintenance: calculatedMaintenance,
      confidence: 'insufficient_data',
      weightDeltaKg: 0,
      avgDailyIntake: 0,
      daysAnalyzed: nutritionLogs.length,
    };
  }

  // Sort weights by date
  const sortedWeights = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const firstWeight = sortedWeights[0];
  const lastWeight = sortedWeights[sortedWeights.length - 1];

  const weightDeltaKg = Number((lastWeight.weightKg - firstWeight.weightKg).toFixed(2));
  
  // Calculate average intake
  let totalCalories = 0;
  let loggedDays = 0;
  for (const log of nutritionLogs) {
    const dayTotals = calculateDailyNutritionTotals(log);
    if (dayTotals.calories > 500) {
      totalCalories += dayTotals.calories;
      loggedDays += 1;
    }
  }

  if (loggedDays < 7) {
    return {
      adaptiveMaintenance: calculatedMaintenance,
      confidence: 'insufficient_data',
      weightDeltaKg,
      avgDailyIntake: 0,
      daysAnalyzed: loggedDays,
    };
  }

  const avgDailyIntake = Math.round(totalCalories / loggedDays);

  // 1 kg body tissue ~= 7700 kcal
  // Daily energy delta = (weightDelta * 7700) / loggedDays
  const dailyCaloricSurplusOrDeficit = (weightDeltaKg * 7700) / loggedDays;
  const estimatedRealMaintenance = Math.round(avgDailyIntake - dailyCaloricSurplusOrDeficit);

  // Clamp within reasonable physiological variance of calculated BMR (±25%)
  const clamped = Math.max(
    Math.round(calculatedMaintenance * 0.75),
    Math.min(Math.round(calculatedMaintenance * 1.25), estimatedRealMaintenance)
  );

  return {
    adaptiveMaintenance: clamped,
    confidence: loggedDays >= 14 ? 'high' : 'preliminary',
    weightDeltaKg,
    avgDailyIntake,
    daysAnalyzed: loggedDays,
  };
}

/**
 * Unit conversion utilities
 */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function cmToFtInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function ftInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}
