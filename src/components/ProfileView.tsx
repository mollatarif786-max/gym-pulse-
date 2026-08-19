import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel, FitnessGoal, DietaryPreference, UnitSystem, MetricEstimate } from '../types';
import { calculateNutritionTargets, kgToLbs, lbsToKg, cmToFtInches, ftInchesToCm, ACTIVITY_LABELS } from '../services/calculationEngine';
import { StorageService } from '../services/storageService';
import { User } from 'firebase/auth';
import {
  User as UserIcon,
  Settings,
  Scale,
  Activity,
  Flame,
  Beef,
  Save,
  RotateCcw,
  Download,
  Info,
  CheckCircle2,
  AlertTriangle,
  Cloud,
  ShieldCheck,
  LogIn,
  LogOut,
} from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfile;
  targets: MetricEstimate;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetData: () => void;
  onOpenCalculator?: () => void;
  currentUser?: User | null;
  onOpenLogin?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  targets,
  onUpdateProfile,
  onResetData,
  onOpenCalculator,
  currentUser,
  onOpenLogin,
}) => {

  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState<number>(profile.age);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(profile.unitSystem);

  const [weightKg, setWeightKg] = useState<number>(profile.weightKg);
  const [weightLbs, setWeightLbs] = useState<number>(kgToLbs(profile.weightKg));

  const initialFtIn = cmToFtInches(profile.heightCm);
  const [heightCm, setHeightCm] = useState<number>(profile.heightCm);
  const [heightFeet, setHeightFeet] = useState<number>(initialFtIn.feet);
  const [heightInches, setHeightInches] = useState<number>(initialFtIn.inches);

  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(profile.fitnessGoal);
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(profile.dietaryPreference);
  const [includeEggs, setIncludeEggs] = useState<boolean>(profile.includeEggsIfVegetarian);
  const [dailyStepGoal, setDailyStepGoal] = useState<number>(profile.dailyStepGoal);

  const [isSavedBanner, setIsSavedBanner] = useState<boolean>(false);

  const handleWeightChange = (val: number, isLbs: boolean) => {
    if (isLbs) {
      setWeightLbs(val);
      setWeightKg(lbsToKg(val));
    } else {
      setWeightKg(val);
      setWeightLbs(kgToLbs(val));
    }
  };

  const handleHeightChange = (cmVal?: number, ftVal?: number, inVal?: number) => {
    if (cmVal !== undefined) {
      setHeightCm(cmVal);
      const ftIn = cmToFtInches(cmVal);
      setHeightFeet(ftIn.feet);
      setHeightInches(ftIn.inches);
    } else if (ftVal !== undefined || inVal !== undefined) {
      const f = ftVal !== undefined ? ftVal : heightFeet;
      const i = inVal !== undefined ? inVal : heightInches;
      setHeightFeet(f);
      setHeightInches(i);
      setHeightCm(ftInchesToCm(f, i));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name,
      age,
      gender,
      weightKg: Number(weightKg.toFixed(1)),
      heightCm,
      activityLevel,
      fitnessGoal,
      dietaryPreference,
      includeEggsIfVegetarian: includeEggs,
      dailyStepGoal,
      unitSystem,
      updatedAt: new Date().toISOString(),
    };
    onUpdateProfile(updated);
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 3000);
  };

  const handleExport = () => {
    const json = StorageService.exportAllDataAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gympulse_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="profile_main_view" className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121212] border border-[#262626] rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-black font-bold shadow-lg shadow-orange-500/20">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#EDEDED]">{profile.name}</h1>
            <p className="text-xs text-[#A1A1AA]">
              {profile.age} yrs • {profile.gender.toUpperCase()} • {profile.unitSystem === 'metric' ? `${profile.weightKg} kg` : `${kgToLbs(profile.weightKg)} lbs`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenCalculator && (
            <button
              type="button"
              onClick={onOpenCalculator}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-orange-400 bg-orange-500/10 hover:bg-orange-500 hover:text-black border border-orange-500/30 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4" />
              Recalculate Blueprint
            </button>
          )}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#EDEDED] bg-[#171717] hover:bg-[#262626] border border-[#262626] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-orange-400" />
            Export Data
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all demo data and restore defaults?')) {
                onResetData();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-rose-400 bg-[#171717] hover:bg-[#262626] border border-[#262626] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Demo
          </button>
        </div>
      </div>

      {/* Google Cloud Sync Card */}
      <div className="bg-[#121212] border border-[#262626] rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#EDEDED]">Google Account & Cloud Sync</h2>
                {currentUser ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Connected
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-[#A1A1AA] border border-[#262626]">
                    Offline Local Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A1A1AA]">
                {currentUser
                  ? `Signed in as ${currentUser.email} • Your workouts and nutrition sync to Google Cloud.`
                  : 'Sign in with your Google Account to back up and sync your workout data across all devices.'}
              </p>
            </div>
          </div>

          {onOpenLogin && (
            <button
              type="button"
              onClick={onOpenLogin}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer w-fit ${
                currentUser
                  ? 'bg-[#171717] hover:bg-[#262626] text-[#EDEDED] border border-[#262626]'
                  : 'bg-white hover:bg-neutral-100 text-neutral-900 shadow-md'
              }`}
            >
              {!currentUser && (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{currentUser ? 'Manage Google Account' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#171717] rounded-2xl border border-[#262626]">
            <span className="text-[#737373] text-[11px] block">Cloud Database</span>
            <span className="font-semibold text-[#EDEDED] flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" /> Firebase Firestore
            </span>
          </div>
          <div className="p-3 bg-[#171717] rounded-2xl border border-[#262626]">
            <span className="text-[#737373] text-[11px] block">Authentication</span>
            <span className="font-semibold text-[#EDEDED] flex items-center gap-1 mt-0.5">
              Google OAuth Popup
            </span>
          </div>
          <div className="p-3 bg-[#171717] rounded-2xl border border-[#262626]">
            <span className="text-[#737373] text-[11px] block">Sync Mode</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
              {currentUser ? 'Continuous Auto-Sync' : 'Local Storage Only'}
            </span>
          </div>
        </div>
      </div>

      {isSavedBanner && (
        <div className="flex items-center gap-2 text-xs font-semibold text-orange-300 bg-orange-500/10 p-3 rounded-2xl border border-orange-500/30">
          <CheckCircle2 className="w-4 h-4" />
          Settings successfully updated and recalculated!
        </div>
      )}

      {/* FORM: BIOMETRICS & TARGETS */}
      <form onSubmit={handleSave} className="bg-[#121212] border border-[#262626] rounded-3xl p-5 md:p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3">
          <h2 className="font-bold text-[#EDEDED] text-base">Biometrics & Calculation Engine Inputs</h2>
          <div className="flex bg-[#171717] p-1 rounded-xl border border-[#262626]">
            <button
              type="button"
              onClick={() => setUnitSystem('metric')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                unitSystem === 'metric' ? 'bg-orange-500 text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Metric
            </button>
            <button
              type="button"
              onClick={() => setUnitSystem('imperial')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                unitSystem === 'imperial' ? 'bg-orange-500 text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Imperial
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Age</label>
              <input
                type="number"
                min="14"
                max="99"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Biological Sex</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
              Body Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'}
            </label>
            {unitSystem === 'metric' ? (
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                value={weightKg}
                onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 70, false)}
                className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500 font-mono"
              />
            ) : (
              <input
                type="number"
                step="0.5"
                min="65"
                max="550"
                value={weightLbs}
                onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 160, true)}
                className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500 font-mono"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
              Height {unitSystem === 'metric' ? '(cm)' : '(ft & in)'}
            </label>
            {unitSystem === 'metric' ? (
              <input
                type="number"
                min="100"
                max="240"
                value={heightCm}
                onChange={(e) => handleHeightChange(parseInt(e.target.value) || 175)}
                className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500 font-mono"
              />
            ) : (
              <div className="flex gap-2">
                <input
                  type="number"
                  min="3"
                  max="7"
                  value={heightFeet}
                  onChange={(e) => handleHeightChange(undefined, parseInt(e.target.value) || 5, undefined)}
                  placeholder="ft"
                  className="w-1/2 bg-[#171717] border border-[#262626] rounded-xl px-3 py-2.5 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500 font-mono"
                />
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={heightInches}
                  onChange={(e) => handleHeightChange(undefined, undefined, parseInt(e.target.value) || 0)}
                  placeholder="in"
                  className="w-1/2 bg-[#171717] border border-[#262626] rounded-xl px-3 py-2.5 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Activity & Goals */}
        <div className="space-y-4 pt-2 border-t border-[#262626]">
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-2">Activity Level Multiplier</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'] as ActivityLevel[]).map((lvl) => {
                const info = ACTIVITY_LABELS[lvl];
                const isSelected = activityLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setActivityLevel(lvl)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-orange-500/10 border-orange-500 text-white font-semibold'
                        : 'bg-[#171717] border-[#262626] text-[#A1A1AA] hover:bg-[#202020]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#EDEDED]">{info.title}</div>
                    <div className="text-[11px] text-[#737373] mt-0.5">{info.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Primary Fitness Goal</label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500"
              >
                <option value="gain_muscle">Gain Muscle (+300 kcal lean surplus)</option>
                <option value="lose_fat">Lose Fat (-450 kcal deficit)</option>
                <option value="recomposition">Recomposition (-150 kcal + high protein)</option>
                <option value="maintain">Maintain Weight (TDEE balance)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Dietary Preference</label>
              <select
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value as DietaryPreference)}
                className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500"
              >
                <option value="non_vegetarian">Non-Vegetarian (Chicken, Fish, Eggs, Whey)</option>
                <option value="vegetarian">Vegetarian (Paneer, Greek Yogurt, Soy, Tofu)</option>
              </select>
            </div>
          </div>

          {dietaryPreference === 'vegetarian' && (
            <label className="flex items-center gap-2.5 text-xs text-[#EDEDED] cursor-pointer bg-[#171717] p-2.5 rounded-xl border border-[#262626]">
              <input
                type="checkbox"
                checked={includeEggs}
                onChange={(e) => setIncludeEggs(e.target.checked)}
                className="rounded accent-orange-500 w-4 h-4"
              />
              <span>Include Eggs (Ovo-Vegetarian / Eggitarian recommendations)</span>
            </label>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Daily Step Target</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={4000}
                max={20000}
                step={500}
                value={dailyStepGoal}
                onChange={(e) => setDailyStepGoal(parseInt(e.target.value))}
                className="flex-1 accent-orange-500"
              />
              <span className="text-sm font-mono font-bold text-orange-400 min-w-[90px] text-right">
                {dailyStepGoal.toLocaleString()} steps
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#262626] flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-orange-500 text-black hover:bg-orange-400 transition-all shadow-md shadow-orange-500/20"
          >
            <Save className="w-4 h-4" />
            Save Profile & Recalculate
          </button>
        </div>
      </form>

      {/* CALCULATION ENGINE BREAKDOWN & MEDICAL DISCLAIMER */}
      <div className="bg-[#121212] border border-[#262626] rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-orange-400" />
          <h2 className="font-bold text-[#EDEDED] text-base">Mifflin-St Jeor Formula Transparency</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#171717] p-3.5 rounded-2xl border border-[#262626] space-y-1">
            <span className="text-[#A1A1AA] font-semibold">Basal Metabolic Rate (BMR)</span>
            <div className="font-mono text-[#EDEDED] text-sm font-bold">{targets.bmr} kcal/day</div>
            <p className="text-[11px] text-[#737373]">
              Energy required by vital organs in a completely resting state (Mifflin-St Jeor 1990).
            </p>
          </div>

          <div className="bg-[#171717] p-3.5 rounded-2xl border border-[#262626] space-y-1">
            <span className="text-[#A1A1AA] font-semibold">Maintenance Calories (TDEE)</span>
            <div className="font-mono text-orange-400 text-sm font-bold">{targets.maintenanceCalories} kcal/day</div>
            <p className="text-[11px] text-[#737373]">
              BMR × Activity factor ({profile.activityLevel.replace('_', ' ')}).
            </p>
          </div>
        </div>

        <p className="text-xs text-[#A1A1AA] leading-relaxed bg-[#171717] p-3 rounded-xl border border-[#262626]">
          {targets.formulaNotes}
        </p>

        <div className="flex items-start gap-2.5 text-[11px] text-[#737373] border-t border-[#262626] pt-3">
          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <span>
            Note: All calorie, macro, and protein calculations provided in GymPulse are scientific estimates and recommendations for fitness tracking purposes, not formal medical advice. Individual metabolic rates vary based on thyroid function, body fat percentage, and training intensity.
          </span>
        </div>
      </div>
    </div>
  );
};
