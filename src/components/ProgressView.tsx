import React, { useState, useMemo } from 'react';
import {
  UserProfile,
  MetricEstimate,
  BodyMeasurement,
  WorkoutLog,
  DailyNutritionLog,
  DailyStepLog,
} from '../types';
import { calculateDailyNutritionTotals, calculateAdaptiveMaintenance, kgToLbs } from '../services/calculationEngine';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Scale,
  Footprints,
  Beef,
  Flame,
  Dumbbell,
  Plus,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';

interface ProgressViewProps {
  profile: UserProfile;
  targets: MetricEstimate;
  measurements: BodyMeasurement[];
  workouts: WorkoutLog[];
  nutritionLogs: DailyNutritionLog[];
  stepLogs: DailyStepLog[];
  onOpenLogMeasurement: () => void;
}

type Timeframe = '7d' | '30d' | '90d' | 'all';

export const ProgressView: React.FC<ProgressViewProps> = ({
  profile,
  targets,
  measurements,
  workouts,
  nutritionLogs,
  stepLogs,
  onOpenLogMeasurement,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
  const [selectedLift, setSelectedLift] = useState<string>('Barbell Flat Bench Press');

  const daysLimit = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;

  // Filter datasets by timeframe
  const cutoffDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - daysLimit);
    return d.toISOString().split('T')[0];
  }, [daysLimit]);

  // 1. Weight & Waist Chart Data
  const weightChartData = useMemo(() => {
    return [...measurements]
      .filter((m) => m.date >= cutoffDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((m) => ({
        date: m.date.slice(5), // MM-DD
        weightKg: m.weightKg,
        weightLbs: kgToLbs(m.weightKg),
        waistCm: m.waistCm,
      }));
  }, [measurements, cutoffDate]);

  // 2. Steps History Chart Data
  const stepChartData = useMemo(() => {
    return [...stepLogs]
      .filter((s) => s.date >= cutoffDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((s) => ({
        date: s.date.slice(5),
        steps: s.steps,
        goal: profile.dailyStepGoal,
      }));
  }, [stepLogs, cutoffDate, profile.dailyStepGoal]);

  // 3. Protein & Calorie Consistency Data
  const nutritionChartData = useMemo(() => {
    return [...nutritionLogs]
      .filter((n) => n.date >= cutoffDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((n) => {
        const totals = calculateDailyNutritionTotals(n);
        return {
          date: n.date.slice(5),
          protein: totals.protein,
          proteinTarget: targets.proteinTargetGrams,
          calories: totals.calories,
          maintenance: targets.maintenanceCalories,
        };
      });
  }, [nutritionLogs, cutoffDate, targets]);

  // 4. Strength Progression Data for selected lift
  const strengthData = useMemo(() => {
    const dataPoints: { date: string; maxWeight: number; volume: number }[] = [];

    const sortedWorkouts = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
    sortedWorkouts.forEach((w) => {
      if (w.date < cutoffDate) return;
      const matchingEx = w.exercises.find((e) => e.exerciseName.toLowerCase() === selectedLift.toLowerCase());
      if (matchingEx && matchingEx.sets.length > 0) {
        const completedSets = matchingEx.sets.filter((s) => s.completed);
        if (completedSets.length > 0) {
          const maxWeight = Math.max(...completedSets.map((s) => s.weightKg));
          const totalVol = completedSets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
          dataPoints.push({
            date: w.date.slice(5),
            maxWeight,
            volume: totalVol,
          });
        }
      }
    });

    return dataPoints;
  }, [workouts, cutoffDate, selectedLift]);

  // Adaptive Maintenance Caloric Calibration
  const adaptiveCalc = calculateAdaptiveMaintenance(measurements, nutritionLogs, targets.maintenanceCalories);

  // Key lift PRs summary
  const keyLiftPRs = useMemo(() => {
    const keyLifts = [
      'Barbell Flat Bench Press',
      'Barbell Back Squat',
      'Conventional Barbell Deadlift',
      'Standing Barbell Overhead Press (OHP)',
    ];

    return keyLifts.map((name) => {
      let maxWeight = 0;
      let topReps = 0;
      let date = '';

      workouts.forEach((w) => {
        const ex = w.exercises.find((e) => e.exerciseName.toLowerCase() === name.toLowerCase());
        if (ex) {
          ex.sets.forEach((s) => {
            if (s.completed && s.weightKg >= maxWeight) {
              maxWeight = s.weightKg;
              topReps = s.reps;
              date = w.date;
            }
          });
        }
      });

      return { name, maxWeight, topReps, date };
    });
  }, [workouts]);

  return (
    <div id="progress_main_view" className="space-y-6 pb-24">
      {/* Top Banner with Timeframe filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121212] border border-[#262626] rounded-3xl p-5 md:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-[#EDEDED] tracking-tight">Progress & Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              Longitudinal Stats
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#A1A1AA] mt-1">
            Track weight trends, progressive overload strength, step volume, and nutritional consistency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Chips */}
          <div className="flex bg-[#171717] p-1 rounded-xl border border-[#262626]">
            {(['7d', '30d', '90d', 'all'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs rounded-lg font-semibold uppercase transition-all ${
                  timeframe === tf ? 'bg-orange-500 text-black shadow-sm' : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenLogMeasurement}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-orange-500 text-black hover:bg-orange-400 transition-all shadow-md shadow-orange-500/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Log Metric
          </button>
        </div>
      </div>

      {/* ADAPTIVE MAINTENANCE CALORIE CALIBRATION CARD */}
      <div className="bg-[#121212] border border-orange-500/30 rounded-3xl p-5 md:p-6 shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#EDEDED] text-base">Adaptive Calorie Maintenance Calibration</h2>
              <p className="text-xs text-[#A1A1AA]">
                Calculates your real-world metabolic rate from logged weight changes and calorie intake.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-orange-400 bg-[#171717] px-2.5 py-1 rounded-xl border border-orange-500/40">
            {adaptiveCalc.confidence === 'high' ? 'High Precision' : 'Calibrating...'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-[#171717] p-3.5 rounded-2xl border border-[#262626]">
            <span className="text-[11px] text-[#A1A1AA] block">Mifflin-St Jeor Theoretical</span>
            <span className="text-lg font-black font-mono text-[#EDEDED]">{targets.maintenanceCalories} kcal/day</span>
            <span className="text-[10px] text-[#737373] block mt-0.5">Based on static biometrics</span>
          </div>

          <div className="bg-[#171717] p-3.5 rounded-2xl border border-orange-500/30">
            <span className="text-[11px] text-orange-400 font-medium block">Observed Adaptive Maintenance</span>
            <span className="text-lg font-black font-mono text-orange-400">
              {adaptiveCalc.adaptiveMaintenance} kcal/day
            </span>
            <span className="text-[10px] text-[#A1A1AA] block mt-0.5">
              {adaptiveCalc.weightDeltaKg >= 0 ? `+${adaptiveCalc.weightDeltaKg}` : adaptiveCalc.weightDeltaKg} kg delta over {adaptiveCalc.daysAnalyzed} days
            </span>
          </div>

          <div className="bg-[#171717] p-3.5 rounded-2xl border border-[#262626]">
            <span className="text-[11px] text-[#A1A1AA] block">Average Caloric Intake</span>
            <span className="text-lg font-black font-mono text-orange-400">
              {adaptiveCalc.avgDailyIntake || targets.targetCalories} kcal/day
            </span>
            <span className="text-[10px] text-[#737373] block mt-0.5">Energy balance aligned with {profile.fitnessGoal}</span>
          </div>
        </div>
      </div>

      {/* KEY LIFT PRs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-orange-400" />
          <h2 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
            All-Time Strength Records (PRs)
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {keyLiftPRs.map((pr, idx) => (
            <div key={idx} className="bg-[#121212] border border-[#262626] rounded-2xl p-3.5 space-y-1">
              <span className="text-[11px] text-[#A1A1AA] font-medium truncate block">{pr.name}</span>
              <div className="text-lg font-black font-mono text-[#EDEDED]">
                {pr.maxWeight > 0 ? `${pr.maxWeight} kg` : 'No logs yet'}
              </div>
              <span className="text-[10px] text-orange-400 font-mono block">
                {pr.topReps > 0 ? `× ${pr.topReps} reps (${pr.date})` : 'Start workout to log'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CHART 1: BODY WEIGHT OVER TIME */}
      <div className="bg-[#121212] border border-[#262626] rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-[#EDEDED] text-sm md:text-base">Body Weight Trend ({profile.unitSystem === 'metric' ? 'kg' : 'lbs'})</h3>
          </div>
          <span className="text-xs text-[#737373] font-mono">{weightChartData.length} records</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" stroke="#737373" tick={{ fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} stroke="#737373" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', fontSize: '12px', color: '#EDEDED' }}
              />
              <Line
                type="monotone"
                dataKey={profile.unitSystem === 'metric' ? 'weightKg' : 'weightLbs'}
                name={profile.unitSystem === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'}
                stroke="#F97316"
                strokeWidth={3}
                dot={{ r: 4, fill: '#F97316' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: STRENGTH PROGRESSION */}
      <div className="bg-[#121212] border border-[#262626] rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-[#EDEDED] text-sm md:text-base">Strength Progression Overload</h3>
          </div>

          <select
            value={selectedLift}
            onChange={(e) => setSelectedLift(e.target.value)}
            className="bg-[#171717] border border-[#262626] rounded-xl px-3 py-1.5 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500 font-semibold"
          >
            <option value="Barbell Flat Bench Press">Barbell Flat Bench Press</option>
            <option value="Barbell Back Squat">Barbell Back Squat</option>
            <option value="Conventional Barbell Deadlift">Conventional Barbell Deadlift</option>
            <option value="Standing Barbell Overhead Press (OHP)">Standing Barbell Overhead Press</option>
            <option value="Bent-Over Barbell Row">Bent-Over Barbell Row</option>
            <option value="Standing Barbell Bicep Curl">Standing Barbell Bicep Curl</option>
          </select>
        </div>

        <div className="h-64 w-full">
          {strengthData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#737373]">
              No lift history for {selectedLift} in this timeframe. Log a session to see progression!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strengthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#737373" tick={{ fontSize: 11 }} />
                <YAxis stroke="#737373" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', fontSize: '12px', color: '#EDEDED' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#A1A1AA' }} />
                <Line
                  type="monotone"
                  dataKey="maxWeight"
                  name="Top Set Weight (kg)"
                  stroke="#F97316"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#F97316' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* CHART 3: PROTEIN CONSISTENCY */}
      <div className="bg-[#121212] border border-[#262626] rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Beef className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-[#EDEDED] text-sm md:text-base">Daily Protein Intake Consistency (g)</h3>
          </div>
          <span className="text-xs text-[#A1A1AA]">Target: {targets.proteinTargetGrams}g</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nutritionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" stroke="#737373" tick={{ fontSize: 11 }} />
              <YAxis stroke="#737373" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', fontSize: '12px', color: '#EDEDED' }}
              />
              <ReferenceLine y={targets.proteinTargetGrams} stroke="#F97316" strokeDasharray="4 4" label={{ value: 'Target', fill: '#F97316', fontSize: 11 }} />
              <Bar dataKey="protein" name="Protein Logged (g)" fill="#FB923C" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 4: DAILY STEPS & ACTIVITY */}
      <div className="bg-[#121212] border border-[#262626] rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Footprints className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-[#EDEDED] text-sm md:text-base">Daily Step Volume</h3>
          </div>
          <span className="text-xs text-[#A1A1AA]">Goal: {profile.dailyStepGoal.toLocaleString()}</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stepChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" stroke="#737373" tick={{ fontSize: 11 }} />
              <YAxis stroke="#737373" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', fontSize: '12px', color: '#EDEDED' }}
              />
              <ReferenceLine y={profile.dailyStepGoal} stroke="#F97316" strokeDasharray="4 4" label={{ value: 'Goal', fill: '#F97316', fontSize: 11 }} />
              <Bar dataKey="steps" name="Steps Walked" fill="#F97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
