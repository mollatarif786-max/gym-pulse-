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
import { FirestoreSyncService } from './services/firestoreSyncService';
import { auth, testConnection } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { WorkoutView } from './components/WorkoutView';
import { NutritionView } from './components/NutritionView';
import { ProgressView } from './components/ProgressView';
import { ProfileView } from './components/ProfileView';
import { LoginPage } from './components/LoginPage';
import { OnboardingModal } from './components/OnboardingModal';
import { ActiveWorkoutModal } from './components/ActiveWorkoutModal';
import { StepSyncModal } from './components/StepSyncModal';
import { LogMeasurementModal } from './components/LogMeasurementModal';
import { RestTimerFloating } from './components/RestTimerFloating';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

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
    testConnection();

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

  // Firebase Auth State Listener & Cloud Sync Engine
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Load user cloud data
          const cloudData = await FirestoreSyncService.loadAllUserData(user.uid);
          if (cloudData && cloudData.profile) {
            setProfile(cloudData.profile);
            StorageService.saveProfile(cloudData.profile);

            if (cloudData.workouts.length > 0) {
              setWorkouts(cloudData.workouts);
              StorageService.saveWorkouts(cloudData.workouts);
            }
            if (Object.keys(cloudData.nutritionLogs).length > 0) {
              const nutList = Object.values(cloudData.nutritionLogs);
              setNutritionLogs(nutList);
              StorageService.saveNutritionLogs(nutList);
            }
            if (cloudData.measurements.length > 0) {
              setMeasurements(cloudData.measurements);
              StorageService.saveMeasurements(cloudData.measurements);
            }
            if (cloudData.steps.length > 0) {
              setStepLogs(cloudData.steps);
              StorageService.saveStepLogs(cloudData.steps);
            }
          } else {
            // First time signing in with Google: push local profile & data to cloud
            const localProfile = StorageService.getProfile();
            const updatedProfile: UserProfile = {
              ...localProfile,
              id: user.uid,
              name: user.displayName || localProfile.name || 'Google Lifter',
            };
            setProfile(updatedProfile);
            StorageService.saveProfile(updatedProfile);

            const localWorkouts = StorageService.getWorkouts();
            const localNutLogs = StorageService.getNutritionLogs();
            const nutMap: Record<string, DailyNutritionLog> = {};
            localNutLogs.forEach((n) => {
              if (n.date) nutMap[n.date] = n;
            });
            const localMeasurements = StorageService.getMeasurements();
            const localSteps = StorageService.getStepLogs();

            await FirestoreSyncService.syncLocalDataToCloud(
              user.uid,
              updatedProfile,
              localWorkouts,
              nutMap,
              localMeasurements,
              localSteps
            );
          }
        } catch (err) {
          console.warn('Error syncing cloud state on auth change:', err);
        }
      }
    });

    return () => unsubscribe();
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

  // State mutation handlers with local persistence & Firestore sync
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    StorageService.saveProfile(newProfile);
    setIsOnboardingOpen(false);

    if (currentUser) {
      FirestoreSyncService.saveUserProfile(currentUser.uid, newProfile).catch((e) =>
        console.error('Failed to sync profile update to cloud:', e)
      );
    }
  };

  const handleSaveWorkout = (newWorkout: WorkoutLog) => {
    StorageService.addWorkoutLog(newWorkout);
    const updatedWorkouts = StorageService.getWorkouts();
    setWorkouts(updatedWorkouts);
    setActiveRoutineForWorkout(undefined);

    if (currentUser) {
      FirestoreSyncService.saveWorkout(currentUser.uid, newWorkout).catch((e) =>
        console.error('Failed to sync workout to cloud:', e)
      );
    }
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

    if (currentUser) {
      FirestoreSyncService.saveNutrition(currentUser.uid, updatedLog).catch((e) =>
        console.error('Failed to sync nutrition to cloud:', e)
      );
    }
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

    if (currentUser) {
      FirestoreSyncService.saveNutrition(currentUser.uid, updated).catch((e) =>
        console.error('Failed to sync nutrition to cloud:', e)
      );
    }
  };

  const handleSaveSteps = (steps: number, source: DailyStepLog['source']) => {
    StorageService.logTodaySteps(steps, source);
    const updatedSteps = StorageService.getStepLogs();
    setStepLogs(updatedSteps);

    if (currentUser) {
      const todayStep = updatedSteps.find((s) => s.date === todayStr);
      if (todayStep) {
        FirestoreSyncService.saveSteps(currentUser.uid, todayStep).catch((e) =>
          console.error('Failed to sync steps to cloud:', e)
        );
      }
    }
  };

  const handleSaveMeasurement = (measurement: BodyMeasurement) => {
    StorageService.addMeasurement(measurement);
    setMeasurements(StorageService.getMeasurements());
    const updatedProfile = StorageService.getProfile();
    setProfile(updatedProfile);

    if (currentUser) {
      FirestoreSyncService.saveMeasurement(currentUser.uid, measurement).catch((e) =>
        console.error('Failed to sync measurement to cloud:', e)
      );
      FirestoreSyncService.saveUserProfile(currentUser.uid, updatedProfile).catch((e) =>
        console.error('Failed to sync updated weight to cloud profile:', e)
      );
    }
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
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
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
            onOpenCalculator={() => setIsOnboardingOpen(true)}
            onQuickLogFood={handleQuickLogFood}
            onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginModalOpen(true)}
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
            onOpenCalculator={() => setIsOnboardingOpen(true)}
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
            onOpenCalculator={() => setIsOnboardingOpen(true)}
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}
      </main>

      {/* DEDICATED GOOGLE LOGIN / ACCOUNT MODAL */}
      <LoginPage
        isOpen={isLoginModalOpen}
        currentUser={currentUser}
        onClose={() => setIsLoginModalOpen(false)}
        onContinueAsGuest={() => setIsLoginModalOpen(false)}
        onSuccess={() => setIsLoginModalOpen(false)}
      />

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

      {/* ONBOARDING & CALORIE / PROTEIN CALCULATOR MODAL */}
      <OnboardingModal
        initialProfile={profile}
        isOpen={isOnboardingOpen}
        onComplete={(updated) => {
          handleUpdateProfile(updated);
          setIsOnboardingOpen(false);
        }}
        onClose={() => setIsOnboardingOpen(false)}
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
