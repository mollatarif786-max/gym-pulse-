import React from 'react';
import {
  UserProfile,
  MetricEstimate,
  DailyNutritionLog,
  WorkoutLog,
  DailyStepLog,
  BodyMeasurement,
  SmartInsight,
  FoodItem,
} from '../types';
import { calculateDailyNutritionTotals, kgToLbs } from '../services/calculationEngine';
import { calculateStepStats } from '../services/healthStepService';
import { ProteinRecommendations } from './ProteinRecommendations';
import {
  Flame,
  Beef,
  Footprints,
  Dumbbell,
  Scale,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Plus,
  Play,
  ArrowUpRight,
  Info,
} from 'lucide-react';

interface DashboardViewProps {
  profile: UserProfile;
  targets: MetricEstimate;
  todayNutrition: DailyNutritionLog;
  todayWorkout?: WorkoutLog | null;
  workoutHistory: WorkoutLog[];
  stepLogs: DailyStepLog[];
  measurements: BodyMeasurement[];
  insights: SmartInsight[];
  onStartWorkout: () => void;
  onOpenStepSync: () => void;
  onOpenLogWeight: () => void;
  onQuickLogFood: (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks', item: FoodItem) => void;
  onNavigateTab: (tab: 'workout' | 'nutrition' | 'progress' | 'profile') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  targets,
  todayNutrition,
  todayWorkout,
  workoutHistory,
  stepLogs,
  measurements,
  insights,
  onStartWorkout,
  onOpenStepSync,
  onOpenLogWeight,
  onQuickLogFood,
  onNavigateTab,
}) => {
  const nutritionTotals = calculateDailyNutritionTotals(todayNutrition);
  const stepStats = calculateStepStats(stepLogs, profile.dailyStepGoal);

  const remainingCalories = targets.targetCalories - nutritionTotals.calories;
  const remainingProtein = targets.proteinTargetGrams - nutritionTotals.protein;

  // Calorie status state
  let calorieStatusText = 'On Track';
  let calorieStatusBadgeColor = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
  if (remainingCalories < -100) {
    calorieStatusText = `${Math.abs(remainingCalories)} kcal Above Target`;
    calorieStatusBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else if (remainingCalories > 350) {
    calorieStatusText = `${remainingCalories} kcal Remaining`;
    calorieStatusBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  // Protein status
  const isProteinShort = remainingProtein > 20;
  const isProteinHit = nutritionTotals.protein >= targets.proteinTargetGrams;

  // Weekly workout frequency (last 7 days)
  const now = new Date();
  const past7DaysWorkouts = workoutHistory.filter((w) => {
    const wDate = new Date(w.date);
    const diffDays = (now.getTime() - wDate.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7;
  });

  const latestWeight = measurements.length > 0 ? measurements[0].weightKg : profile.weightKg;
  const displayWeight = profile.unitSystem === 'metric' ? `${latestWeight} kg` : `${kgToLbs(latestWeight)} lbs`;

  // Energy expenditure breakdown (transparent, no double counting)
  const bmrKcal = targets.bmr;
  const neatKcal = stepStats.caloriesBurnedEst;
  const gymKcal = todayWorkout ? Math.round(todayWorkout.durationMinutes * 5.8) : 0;
  const estimatedActualBurn = bmrKcal + neatKcal + gymKcal;

  return (
    <div id="dashboard_main_view" className="space-y-6 pb-24">
      {/* Top Greeting & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121212] border border-[#262626] rounded-3xl p-5 md:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-[#EDEDED] tracking-tight">
              Welcome back, {profile.name}!
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">
              {profile.fitnessGoal.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#A1A1AA] mt-1">
            Mifflin-St Jeor Maintenance: <span className="text-[#EDEDED] font-semibold">{targets.maintenanceCalories} kcal/day</span> • Target Intake:{' '}
            <span className="text-orange-400 font-semibold">{targets.targetCalories} kcal</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenLogWeight}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#171717] hover:bg-[#262626] text-[#EDEDED] border border-[#262626] transition-all"
          >
            <Scale className="w-4 h-4 text-orange-400" />
            <span>{displayWeight}</span>
            <Plus className="w-3.5 h-3.5 text-[#737373] ml-0.5" />
          </button>

          <button
            type="button"
            onClick={onStartWorkout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 text-black hover:bg-orange-400 transition-all shadow-md shadow-orange-500/20"
          >
            <Dumbbell className="w-4 h-4" />
            {todayWorkout ? 'Resume / Log Workout' : 'Start Gym Session'}
          </button>
        </div>
      </div>

      {/* PRIMARY 4 CORE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. CALORIES */}
        <div
          onClick={() => onNavigateTab('nutrition')}
          className="bg-[#121212] border border-[#262626] hover:border-orange-500/40 rounded-2xl p-4 shadow-sm space-y-3 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#EDEDED]">Calories</span>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${calorieStatusBadgeColor}`}>
              {calorieStatusText}
            </span>
          </div>

          <div>
            <div className="text-2xl font-black font-mono text-[#EDEDED] tracking-tight">
              {nutritionTotals.calories}{' '}
              <span className="text-xs font-normal text-[#737373] font-sans">/ {targets.targetCalories} kcal</span>
            </div>
            <div className="text-xs text-[#A1A1AA] mt-0.5">
              {remainingCalories >= 0 ? `${remainingCalories} kcal left to target` : `${Math.abs(remainingCalories)} kcal above budget`}
            </div>
          </div>

          <div className="w-full bg-[#1A1A1A] h-2 rounded-full overflow-hidden border border-[#262626]/60">
            <div
              className={`h-full transition-all duration-500 ${
                remainingCalories < 0 ? 'bg-rose-500' : 'bg-orange-500'
              }`}
              style={{ width: `${Math.min(100, (nutritionTotals.calories / targets.targetCalories) * 100)}%` }}
            />
          </div>
        </div>

        {/* 2. PROTEIN TARGET */}
        <div
          onClick={() => onNavigateTab('nutrition')}
          className={`bg-[#121212] border rounded-2xl p-4 shadow-sm space-y-3 cursor-pointer transition-all group ${
            isProteinShort ? 'border-orange-500/30' : 'border-[#262626] hover:border-orange-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Beef className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#EDEDED]">Daily Protein</span>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                isProteinHit
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
              }`}
            >
              {isProteinHit ? 'Goal Achieved 🎯' : `${remainingProtein}g to go`}
            </span>
          </div>

          <div>
            <div className="text-2xl font-black font-mono text-orange-400 tracking-tight">
              {nutritionTotals.protein}g{' '}
              <span className="text-xs font-normal text-[#737373] font-sans">/ {targets.proteinTargetGrams}g target</span>
            </div>
            <div className="text-xs text-[#A1A1AA] mt-0.5">
              Optimal range: {targets.proteinMinGrams}g - {targets.proteinMaxGrams}g
            </div>
          </div>

          <div className="w-full bg-[#1A1A1A] h-2 rounded-full overflow-hidden border border-[#262626]/60">
            <div
              className="h-full bg-orange-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (nutritionTotals.protein / targets.proteinTargetGrams) * 100)}%` }}
            />
          </div>
        </div>

        {/* 3. PHONE STEPS */}
        <div
          onClick={onOpenStepSync}
          className="bg-[#121212] border border-[#262626] hover:border-orange-500/40 rounded-2xl p-4 shadow-sm space-y-3 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Footprints className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#EDEDED]">Daily Steps</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#171717] text-[#A1A1AA] border border-[#262626]">
              {stepStats.completionRatePercent}% Goal
            </span>
          </div>

          <div>
            <div className="text-2xl font-black font-mono text-[#EDEDED] tracking-tight">
              {stepStats.todaySteps.toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#737373] font-sans">/ {profile.dailyStepGoal.toLocaleString()}</span>
            </div>
            <div className="text-xs text-[#A1A1AA] mt-0.5">
              ~{stepStats.totalDistanceKm} km • ~{stepStats.caloriesBurnedEst} kcal NEAT
            </div>
          </div>

          <div className="w-full bg-[#1A1A1A] h-2 rounded-full overflow-hidden border border-[#262626]/60">
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${stepStats.completionRatePercent}%` }}
            />
          </div>
        </div>

        {/* 4. WORKOUT STATUS */}
        <div
          onClick={() => onNavigateTab('workout')}
          className="bg-[#121212] border border-[#262626] hover:border-orange-500/40 rounded-2xl p-4 shadow-sm space-y-3 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Dumbbell className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#EDEDED]">Gym Session</span>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                todayWorkout
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-[#171717] text-[#737373] border-[#262626]'
              }`}
            >
              {todayWorkout ? 'Completed' : 'Pending'}
            </span>
          </div>

          <div>
            <div className="text-base font-bold text-[#EDEDED] truncate">
              {todayWorkout ? todayWorkout.routineName : 'Ready to Train'}
            </div>
            <div className="text-xs text-[#A1A1AA] mt-0.5">
              {todayWorkout
                ? `${todayWorkout.durationMinutes}m • ${todayWorkout.totalVolumeKg.toLocaleString()} kg volume`
                : 'Tap to start today’s workout split'}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#A1A1AA] pt-0.5">
            <span>Weekly Progress:</span>
            <span className="font-bold text-orange-400 font-mono">{past7DaysWorkouts.length} sessions / 7d</span>
          </div>
        </div>
      </div>

      {/* SMART INSIGHTS ALERT BANNER CARDS */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <h2 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
              Smart Coach Insights
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.slice(0, 2).map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-2xl border flex items-start gap-3 shadow-sm ${
                  insight.priority === 'high'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    : 'bg-[#121212] border-[#262626] text-[#EDEDED]'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-[#1A1A1A] border border-[#262626] flex items-center justify-center shrink-0 mt-0.5">
                  {insight.type === 'protein_warning' ? (
                    <Beef className="w-4 h-4 text-orange-400" />
                  ) : insight.type === 'workout_streak' ? (
                    <Dumbbell className="w-4 h-4 text-amber-400" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-xs md:text-sm text-[#EDEDED]">{insight.title}</h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">{insight.message}</p>
                  {insight.actionableRecommendation && (
                    <p className="text-[11px] text-orange-300 font-medium pt-0.5">
                      💡 {insight.actionableRecommendation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TODAY'S INTEGRATED ACTIVITY & TOTAL EXPENDITURE CARD */}
      <div className="bg-[#121212] border border-[#262626] rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-[#EDEDED] text-sm md:text-base">Today's Unified Activity & Energy Flow</h2>
              <p className="text-xs text-[#A1A1AA]">
                Transparent daily expenditure breakdown (no double-counting)
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-xl border border-orange-500/20">
            ~{estimatedActualBurn} kcal Est. Burn
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] text-[#A1A1AA] font-medium">1. Basal Metabolic Rate (BMR)</span>
            <div className="text-base font-black text-[#EDEDED] font-mono">{bmrKcal} kcal</div>
            <span className="text-[10px] text-[#737373]">Mifflin-St Jeor baseline at rest</span>
          </div>

          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] text-[#A1A1AA] font-medium">2. Phone Step NEAT</span>
            <div className="text-base font-black text-amber-400 font-mono">+{neatKcal} kcal</div>
            <span className="text-[10px] text-[#737373]">{stepStats.todaySteps.toLocaleString()} steps walked</span>
          </div>

          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] text-[#A1A1AA] font-medium">3. Resistance Exercise (EAT)</span>
            <div className="text-base font-black text-orange-400 font-mono">
              +{gymKcal} kcal
            </div>
            <span className="text-[10px] text-[#737373]">
              {todayWorkout ? `${todayWorkout.durationMinutes}m resistance workout` : 'No workout logged yet'}
            </span>
          </div>
        </div>
      </div>

      {/* QUICK PROTEIN RECOVERY FOODS */}
      <ProteinRecommendations
        remainingProteinGrams={remainingProtein}
        dietaryPreference={profile.dietaryPreference}
        includeEggs={profile.includeEggsIfVegetarian}
        onQuickLogFood={onQuickLogFood}
      />
    </div>
  );
};
