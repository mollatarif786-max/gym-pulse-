import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  UserProfile,
  WorkoutLog,
  DailyNutritionLog,
  BodyMeasurement,
  DailyStepLog,
} from '../types';

export interface UserCloudData {
  profile: UserProfile | null;
  workouts: WorkoutLog[];
  nutritionLogs: Record<string, DailyNutritionLog>;
  measurements: BodyMeasurement[];
  steps: DailyStepLog[];
}

export const FirestoreSyncService = {
  /**
   * Save user profile to Firestore
   */
  async saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
    const path = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...profile,
        userId,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Load user profile from Firestore
   */
  async loadUserProfile(userId: string): Promise<UserProfile | null> {
    const path = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  /**
   * Save a single workout log to Firestore
   */
  async saveWorkout(userId: string, workout: WorkoutLog): Promise<void> {
    const path = `users/${userId}/workouts/${workout.id}`;
    try {
      const workoutRef = doc(db, 'users', userId, 'workouts', workout.id);
      await setDoc(workoutRef, {
        ...workout,
        userId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Save nutrition log for a date
   */
  async saveNutrition(userId: string, nutrition: DailyNutritionLog): Promise<void> {
    const path = `users/${userId}/nutrition/${nutrition.date}`;
    try {
      const nutritionRef = doc(db, 'users', userId, 'nutrition', nutrition.date);
      await setDoc(nutritionRef, {
        ...nutrition,
        userId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Save a measurement
   */
  async saveMeasurement(userId: string, measurement: BodyMeasurement): Promise<void> {
    const path = `users/${userId}/measurements/${measurement.id}`;
    try {
      const ref = doc(db, 'users', userId, 'measurements', measurement.id);
      await setDoc(ref, {
        ...measurement,
        userId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Save daily step log
   */
  async saveSteps(userId: string, stepLog: DailyStepLog): Promise<void> {
    const path = `users/${userId}/steps/${stepLog.date}`;
    try {
      const ref = doc(db, 'users', userId, 'steps', stepLog.date);
      await setDoc(ref, {
        ...stepLog,
        userId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Load entire cloud state for a user
   */
  async loadAllUserData(userId: string): Promise<UserCloudData> {
    try {
      const profile = await this.loadUserProfile(userId);

      // Fetch workouts
      const workoutsPath = `users/${userId}/workouts`;
      const workoutsSnap = await getDocs(collection(db, 'users', userId, 'workouts'));
      const workouts: WorkoutLog[] = [];
      workoutsSnap.forEach((docSnap) => {
        workouts.push(docSnap.data() as WorkoutLog);
      });

      // Fetch nutrition
      const nutritionSnap = await getDocs(collection(db, 'users', userId, 'nutrition'));
      const nutritionLogs: Record<string, DailyNutritionLog> = {};
      nutritionSnap.forEach((docSnap) => {
        const log = docSnap.data() as DailyNutritionLog;
        if (log.date) {
          nutritionLogs[log.date] = log;
        }
      });

      // Fetch measurements
      const measurementsSnap = await getDocs(collection(db, 'users', userId, 'measurements'));
      const measurements: BodyMeasurement[] = [];
      measurementsSnap.forEach((docSnap) => {
        measurements.push(docSnap.data() as BodyMeasurement);
      });

      // Fetch steps
      const stepsSnap = await getDocs(collection(db, 'users', userId, 'steps'));
      const steps: DailyStepLog[] = [];
      stepsSnap.forEach((docSnap) => {
        steps.push(docSnap.data() as DailyStepLog);
      });

      return {
        profile,
        workouts,
        nutritionLogs,
        measurements,
        steps,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    }
  },

  /**
   * Push all current local data to Firestore in batch upon first Google Sign-in
   */
  async syncLocalDataToCloud(
    userId: string,
    profile: UserProfile,
    workouts: WorkoutLog[],
    nutritionLogs: Record<string, DailyNutritionLog>,
    measurements: BodyMeasurement[],
    steps: DailyStepLog[]
  ): Promise<void> {
    try {
      await this.saveUserProfile(userId, profile);

      const batch = writeBatch(db);
      // Workouts
      workouts.slice(0, 50).forEach((w) => {
        const wRef = doc(db, 'users', userId, 'workouts', w.id);
        batch.set(wRef, { ...w, userId });
      });

      // Nutrition
      Object.values(nutritionLogs).slice(0, 30).forEach((n) => {
        const nRef = doc(db, 'users', userId, 'nutrition', n.date);
        batch.set(nRef, { ...n, userId });
      });

      // Measurements
      measurements.slice(0, 50).forEach((m) => {
        const mRef = doc(db, 'users', userId, 'measurements', m.id);
        batch.set(mRef, { ...m, userId });
      });

      // Steps
      steps.slice(0, 30).forEach((s) => {
        const sRef = doc(db, 'users', userId, 'steps', s.date);
        batch.set(sRef, { ...s, userId });
      });

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  },
};
