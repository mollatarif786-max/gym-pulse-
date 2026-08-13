import {
  UserProfile,
  DailyNutritionLog,
  WorkoutLog,
  DailyStepLog,
  SmartInsight,
  MetricEstimate,
} from '../types';
import { calculateDailyNutritionTotals } from './calculationEngine';

export function generateSmartInsights(
  profile: UserProfile,
  targets: MetricEstimate,
  todayNutrition: DailyNutritionLog,
  nutritionLogs: DailyNutritionLog[],
  workouts: WorkoutLog[],
  stepLogs: DailyStepLog[]
): SmartInsight[] {
  const insights: SmartInsight[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. TODAY'S PROTEIN GAP CHECK
  const todayTotals = calculateDailyNutritionTotals(todayNutrition);
  const remainingProtein = targets.proteinTargetGrams - todayTotals.protein;

  if (remainingProtein > 20) {
    insights.push({
      id: 'insight_protein_gap_today',
      type: 'protein_warning',
      title: `${remainingProtein}g Short on Protein Target`,
      message: `You've logged ${todayTotals.protein}g of your ${targets.proteinTargetGrams}g daily goal. Getting sufficient protein ensures optimal muscle recovery and satiety.`,
      actionableRecommendation: `Tap recommendations below to add quick options like Greek yogurt, Paneer, or Chicken breast.`,
      priority: remainingProtein > 45 ? 'high' : 'medium',
      timestamp: new Date().toISOString(),
    });
  } else if (todayTotals.protein >= targets.proteinTargetGrams && todayTotals.protein > 0) {
    insights.push({
      id: 'insight_protein_hit_today',
      type: 'nutrition_tip',
      title: `Protein Goal Achieved! (${todayTotals.protein}g)`,
      message: `Outstanding job hitting your daily protein target of ${targets.proteinTargetGrams}g. Your muscles have the amino acids they need for repair.`,
      priority: 'low',
      timestamp: new Date().toISOString(),
    });
  }

  // 2. MULTI-DAY PROTEIN CONSISTENCY CHECK
  const past3Days = nutritionLogs
    .filter((l) => l.date !== todayStr)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  if (past3Days.length >= 3) {
    const lowProteinDays = past3Days.filter((l) => {
      const totals = calculateDailyNutritionTotals(l);
      return totals.protein < targets.proteinMinGrams;
    });

    if (lowProteinDays.length >= 3) {
      insights.push({
        id: 'insight_protein_3day_streak',
        type: 'protein_warning',
        title: 'Protein Intake Below Target for 3 Days',
        message: 'Your protein intake has hovered below your optimal recovery zone for 3 consecutive days. Consider prepping high-protein snacks in advance.',
        actionableRecommendation: 'Keep easy protein (protein powder, boiled eggs, or roasted edamame) ready for busy days.',
        priority: 'high',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 3. WEEKLY WORKOUT FREQUENCY
  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);
  const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

  const recentWorkouts = workouts.filter((w) => w.date >= oneWeekAgoStr);
  if (recentWorkouts.length >= 4) {
    insights.push({
      id: 'insight_workout_streak',
      type: 'workout_streak',
      title: `${recentWorkouts.length} Workouts Crushed This Week!`,
      message: `You have completed ${recentWorkouts.length} gym sessions over the last 7 days. Consistency is the #1 driver of hypertrophy and metabolic conditioning.`,
      priority: 'medium',
      timestamp: new Date().toISOString(),
    });
  } else if (recentWorkouts.length === 0 && workouts.length > 0) {
    insights.push({
      id: 'insight_workout_nudge',
      type: 'workout_streak',
      title: 'Ready for Your Next Gym Session?',
      message: "It's been a few days since your last recorded lift. Even a quick 35-minute routine maintains strength adaptations.",
      priority: 'low',
      timestamp: new Date().toISOString(),
    });
  }

  // 4. STEP COUNT TREND (THIS WEEK VS PREVIOUS WEEK)
  const last14DaysSteps = [...stepLogs].sort((a, b) => b.date.localeCompare(a.date));
  const thisWeekSteps = last14DaysSteps.slice(0, 7);
  const prevWeekSteps = last14DaysSteps.slice(7, 14);

  if (thisWeekSteps.length >= 4 && prevWeekSteps.length >= 4) {
    const avgThisWeek = Math.round(thisWeekSteps.reduce((s, l) => s + l.steps, 0) / thisWeekSteps.length);
    const avgPrevWeek = Math.round(prevWeekSteps.reduce((s, l) => s + l.steps, 0) / prevWeekSteps.length);
    const diff = avgThisWeek - avgPrevWeek;

    if (diff >= 1500) {
      insights.push({
        id: 'insight_step_up',
        type: 'step_milestone',
        title: `Steps Up +${diff.toLocaleString()} / Day!`,
        message: `Your average daily step count this week (${avgThisWeek.toLocaleString()}) is significantly higher than last week (${avgPrevWeek.toLocaleString()}). Great boost to your daily NEAT energy burn.`,
        priority: 'medium',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 5. CALORIE MAINTENANCE CONTEXT
  if (todayTotals.calories > 0) {
    const remainingCalories = targets.targetCalories - todayTotals.calories;
    if (profile.fitnessGoal === 'lose_fat' && remainingCalories < -200) {
      insights.push({
        id: 'insight_calorie_surplus_deficit',
        type: 'calorie_alert',
        title: 'Calorie Budget Exceeded',
        message: `You've consumed ${todayTotals.calories} kcal (${Math.abs(remainingCalories)} kcal above your fat loss target of ${targets.targetCalories} kcal). A brisk 25-minute evening walk can help balance your daily expenditure.`,
        priority: 'medium',
        timestamp: new Date().toISOString(),
      });
    } else if (profile.fitnessGoal === 'gain_muscle' && remainingCalories > 600) {
      insights.push({
        id: 'insight_muscle_fuel_needed',
        type: 'calorie_alert',
        title: 'Calorie Surplus Gap',
        message: `You have ${remainingCalories} kcal left to reach your muscle gain target (${targets.targetCalories} kcal). Don't leave energy on the table for recovery.`,
        priority: 'low',
        timestamp: new Date().toISOString(),
      });
    }
  }

  return insights;
}
