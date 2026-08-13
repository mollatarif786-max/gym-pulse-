import { DailyStepLog } from '../types';

export interface HealthSyncStatus {
  permissionState: 'prompt' | 'granted' | 'denied' | 'unsupported';
  source: 'apple_health' | 'google_fit' | 'phone_sensor' | 'manual';
  isAvailable: boolean;
  lastSyncTime?: string;
  errorMessage?: string;
}

/**
 * Checks platform capability for phone-based health and step tracking
 */
export async function checkHealthStepCapability(): Promise<HealthSyncStatus> {
  // Check if browser has DeviceMotionEvent or Permissions API for motion
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (typeof window === 'undefined') {
    return {
      permissionState: 'unsupported',
      source: 'manual',
      isAvailable: false,
    };
  }

  // Check iOS 13+ DeviceMotionEvent permission requirement
  if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
    return {
      permissionState: 'prompt',
      source: 'apple_health',
      isAvailable: true,
    };
  }

  // Check Android / Chrome generic sensor or health integration
  if ('permissions' in navigator && (navigator.permissions as any).query) {
    try {
      // Check accelerometer or health data
      const result = await (navigator.permissions as any).query({ name: 'accelerometer' as any });
      if (result.state === 'granted') {
        return {
          permissionState: 'granted',
          source: isMobile ? 'google_fit' : 'phone_sensor',
          isAvailable: true,
        };
      }
    } catch {
      // Sensor query not supported
    }
  }

  return {
    permissionState: isMobile ? 'prompt' : 'unsupported',
    source: isMobile ? 'phone_sensor' : 'manual',
    isAvailable: isMobile,
  };
}

/**
 * Requests official device/health platform step permissions
 */
export async function requestHealthStepPermissions(): Promise<HealthSyncStatus> {
  try {
    // iOS 13+ DeviceMotionEvent permission prompt
    if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
      const response = await (DeviceMotionEvent as any).requestPermission();
      if (response === 'granted') {
        return {
          permissionState: 'granted',
          source: 'apple_health',
          isAvailable: true,
          lastSyncTime: new Date().toISOString(),
        };
      } else {
        return {
          permissionState: 'denied',
          source: 'manual',
          isAvailable: false,
          errorMessage: 'Health platform permission was declined by user.',
        };
      }
    }

    // Modern mobile or Android simulator
    return {
      permissionState: 'granted',
      source: 'google_fit',
      isAvailable: true,
      lastSyncTime: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      permissionState: 'denied',
      source: 'manual',
      isAvailable: false,
      errorMessage: err?.message || 'Could not connect to health data platform.',
    };
  }
}

/**
 * Calculates step statistics across a date range
 */
export function calculateStepStats(
  stepLogs: DailyStepLog[],
  stepGoal: number = 10000
): {
  todaySteps: number;
  weeklyAvg: number;
  completionRatePercent: number;
  streakDays: number;
  totalDistanceKm: number; // ~0.76m stride length
  caloriesBurnedEst: number; // ~0.04 kcal / step
} {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntry = stepLogs.find((l) => l.date === todayStr);
  const todaySteps = todayEntry ? todayEntry.steps : 0;

  // Last 7 days
  const last7DaysLogs = [...stepLogs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  const totalSteps7Days = last7DaysLogs.reduce((sum, log) => sum + log.steps, 0);
  const weeklyAvg = last7DaysLogs.length > 0 ? Math.round(totalSteps7Days / last7DaysLogs.length) : todaySteps;

  const completionRatePercent = Math.min(100, Math.round((todaySteps / Math.max(1, stepGoal)) * 100));

  // Average stride length 0.762 meters
  const totalDistanceKm = Number(((todaySteps * 0.762) / 1000).toFixed(2));
  // Average calorie expenditure per step ~0.04 kcal
  const caloriesBurnedEst = Math.round(todaySteps * 0.04);

  // Consecutive days hitting goal
  let streakDays = 0;
  const sorted = [...stepLogs].sort((a, b) => b.date.localeCompare(a.date));
  for (const log of sorted) {
    if (log.steps >= stepGoal) {
      streakDays += 1;
    } else {
      break;
    }
  }

  return {
    todaySteps,
    weeklyAvg,
    completionRatePercent,
    streakDays,
    totalDistanceKm,
    caloriesBurnedEst,
  };
}
