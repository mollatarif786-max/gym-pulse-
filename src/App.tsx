import React, { useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  WorkoutLog,
  WorkoutRoutine,
  DailyNutritionLog,
  DailyStepLog,
  BodyMeasurement,
  FoodItem,
} from './types';
import { StorageService, DEFAULT_USER_PROFILE } from './services/storageService';
import { calculateNutritionTargets } from './services/calculationEngine';
import { generateSmartInsights } from './services/insightsEngine';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { WorkoutView } from './components/WorkoutView';
import { NutritionView } from './components/NutritionView';
import { ProgressView } from './components/ProgressView';
import { ProfileView } from './components/ProfileView';
import { OnboardingModal } from './components/OnboardingModal';
import { ActiveWorkoutModal } from './components/ActiveWorkoutModal';
import { StepSyncModal } from './components/StepSyncModal';
import { LogMeasurementModal } from './components/LogMeasurementModal';
import { RestTimerFloating } from './components/RestTimerFloating';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Core app state
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [nutritionLogs, setNutritionLogs] = useState<DailyNutritionLog[]>([]);
  const [stepLogs, setStepLogs] = useState<DailyStepLog[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);

  // Modals & Active Session state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [activeRoutineForWorkout, setActiveRoutineForWorkout] = useState<WorkoutRoutine | null | undefined>(undefined);
  const [isStepModalOpen, setIsStepModalOpen] = useState<boolean>(false);
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState<boolean>(false);

  // Floating Rest Timer state
  const [restTimerVisible, setRestTimerVisible] = useState<boolean>(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(90);
  const [restTotalSeconds, setRestTotalSeconds] = useState<number>(90);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState<boolean>(false);

  // Load state on mount
  useEffect(() => {
    const loadedProfile = StorageService.getProfile();
    setProfile(loadedProfile);
    if (!loadedProfile.onboardingCompleted) {
      setIsOnboardingOpen(true);
    }

    setWorkouts(StorageService.getWorkouts());
    setRoutines(StorageService.getRoutines());
    setNutritionLogs(StorageService.getNutritionLogs());
    setStepLogs(StorageService.getStepLogs());
    setMeasurements(StorageService.getMeasurements());
  }, []);

  // Live calculated targets & insights
  const targets = useMemo(() => calculateNutritionTargets(profile), [profile]);

  const todayStr = new Date().toISOString().split('T')[0];

  const todayNutrition = useMemo(() => {
    const existing = nutritionLogs.find((l) => l.date === todayStr);
    if (existing) return existing;
    return {
      date: todayStr,
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };
  }, [nutritionLogs, todayStr]);

  const todayWorkout = useMemo(() => {
    return workouts.find((w) => w.date === todayStr) || null;
  }, [workouts, todayStr]);

  const insights = useMemo(() => {
    return generateSmartInsights(
      profile,
      targets,
      todayNutrition,
      nutritionLogs,
      workouts,
      stepLogs
    );
  }, [profile, targets, todayNutrition, nutritionLogs, workouts, stepLogs]);

  // Floating timer interval
  useEffect(() => {
    let interval: any = null;
    if (isRestTimerRunning && restSecondsLeft > 0) {
      interval = setInterval(() => {
        setRestSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (restSecondsLeft === 0) {
      setIsRestTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRestTimerRunning, restSecondsLeft]);

  const handleStartRestTimer = (seconds: number) => {
    setRestTotalSeconds(seconds);
    setRestSecondsLeft(seconds);
    setIsRestTimerRunning(true);
    setRestTimerVisible(true);
  };

  const handleAdjustRestTimer = (delta: number) => {
    setRestSecondsLeft((prev) => Math.max(0, prev + delta));
  };

  const handleResetRestTimer = (seconds: number) => {
    setRestTotalSeconds(seconds);
    setRestSecondsLeft(seconds);
    setIsRestTimerRunning(true);
  };

  // State mutation handlers with persistence
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    StorageService.saveProfile(newProfile);
    setIsOnboardingOpen(false);
  };

  const handleSaveWorkout = (newWorkout: WorkoutLog) => {
    StorageService.addWorkoutLog(newWorkout);
    setWorkouts(StorageService.getWorkouts());
    setActiveRoutineForWorkout(undefined);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    StorageService.deleteWorkoutLog(workoutId);
    setWorkouts(StorageService.getWorkouts());
  };

  const handleSaveRoutine = (routine: WorkoutRoutine) => {
    StorageService.saveCustomRoutine(routine);
    setRoutines(StorageService.getRoutines());
  };

  const handleDeleteRoutine = (routineId: string) => {
    StorageService.deleteRoutine(routineId);
    setRoutines(StorageService.getRoutines());
  };

  const handleUpdateNutrition = (updatedLog: DailyNutritionLog) => {
    StorageService.updateDayNutrition(updatedLog);
    setNutritionLogs(StorageService.getNutritionLogs());
  };

  const handleQuickLogFood = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks', item: FoodItem) => {
    const current = StorageService.getTodayNutritionLog();
    const newItem = {
      id: `meal_item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      foodId: item.id,
      name: item.name,
      portion: item.portion,
      servings: 1,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fats,
      loggedAt: new Date().toISOString(),
    };
    const updated = {
      ...current,
      [mealType]: [...(current[mealType] || []), newItem],
    };
    StorageService.updateDayNutrition(updated);
    setNutritionLogs(StorageService.getNutritionLogs());
  };

  const handleSaveSteps = (steps: number, source: DailyStepLog['source']) => {
    StorageService.logTodaySteps(steps, source);
    setStepLogs(StorageService.getStepLogs());
  };

  const handleSaveMeasurement = (measurement: BodyMeasurement) => {
    StorageService.addMeasurement(measurement);
    setMeasurements(StorageService.getMeasurements());
    setProfile(StorageService.getProfile());
  };

  const handleResetAll = () => {
    StorageService.resetAllData();
    setProfile(DEFAULT_USER_PROFILE);
    setWorkouts(StorageService.getWorkouts());
    setRoutines(StorageService.getRoutines());
    setNutritionLogs(StorageService.getNutritionLogs());
    setStepLogs(StorageService.getStepLogs());
    setMeasurements(StorageService.getMeasurements());
  };

  return (
    <div id="gympulse_app_root" className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] font-sans antialiased selection:bg-orange-500 selection:text-black">
      {/* Top / Bottom Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        hasActiveWorkout={activeRoutineForWorkout !== undefined}
      />

      {/* Main View Container */}
      <main className="max-w-4xl mx-auto px-4 pt-4 md:pt-6 pb-20 md:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            targets={targets}
            todayNutrition={todayNutrition}
            todayWorkout={todayWorkout}
            workoutHistory={workouts}
            stepLogs={stepLogs}
            measurements={measurements}
            insights={insights}
            onStartWorkout={() => setActiveRoutineForWorkout(null)}
            onOpenStepSync={() => setIsStepModalOpen(true)}
            onOpenLogWeight={() => setIsMeasurementModalOpen(true)}
            onQuickLogFood={handleQuickLogFood}
            onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
          />
        )}

        {activeTab === 'workout' && (
          <WorkoutView
            workoutHistory={workouts}
            routines={routines}
            onStartWorkout={(routine) => setActiveRoutineForWorkout(routine || null)}
            onSaveRoutine={handleSaveRoutine}
            onDeleteRoutine={handleDeleteRoutine}
            onDeleteWorkout={handleDeleteWorkout}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionView
            profile={profile}
            targets={targets}
            todayNutrition={todayNutrition}
            onUpdateNutrition={handleUpdateNutrition}
            onAddCustomFood={(food) => StorageService.addCustomFood(food)}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressView
            profile={profile}
            targets={targets}
            measurements={measurements}
            workouts={workouts}
            nutritionLogs={nutritionLogs}
            stepLogs={stepLogs}
            onOpenLogMeasurement={() => setIsMeasurementModalOpen(true)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            targets={targets}
            onUpdateProfile={handleUpdateProfile}
            onResetData={handleResetAll}
          />
        )}
      </main>

      {/* FLOATING REST TIMER */}
      {restTimerVisible && (
        <RestTimerFloating
          secondsLeft={restSecondsLeft}
          totalSeconds={restTotalSeconds}
          isRunning={isRestTimerRunning}
          onAdjustSeconds={handleAdjustRestTimer}
          onToggleTimer={() => setIsRestTimerRunning(!isRestTimerRunning)}
          onClose={() => setRestTimerVisible(false)}
          onReset={handleResetRestTimer}
        />
      )}

      {/* ACTIVE WORKOUT LOGGING SESSION MODAL */}
      {activeRoutineForWorkout !== undefined && (
        <ActiveWorkoutModal
          routine={activeRoutineForWorkout}
          workoutHistory={workouts}
          onSaveWorkout={handleSaveWorkout}
          onCancel={() => setActiveRoutineForWorkout(undefined)}
          onStartRestTimer={handleStartRestTimer}
        />
      )}

      {/* ONBOARDING MODAL */}
      <OnboardingModal
        initialProfile={profile}
        isOpen={isOnboardingOpen}
        onComplete={handleUpdateProfile}
      />

      {/* STEP SYNC MODAL */}
      <StepSyncModal
        isOpen={isStepModalOpen}
        currentSteps={stepLogs.find((s) => s.date === todayStr)?.steps || 0}
        stepGoal={profile.dailyStepGoal}
        onSaveSteps={handleSaveSteps}
        onClose={() => setIsStepModalOpen(false)}
      />

      {/* LOG MEASUREMENT MODAL */}
      <LogMeasurementModal
        isOpen={isMeasurementModalOpen}
        currentWeightKg={profile.weightKg}
        unitSystem={profile.unitSystem}
        onSaveMeasurement={handleSaveMeasurement}
        onClose={() => setIsMeasurementModalOpen(false)}
      />
    </div>
  );
}
