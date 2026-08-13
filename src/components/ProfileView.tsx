import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel, FitnessGoal, DietaryPreference, UnitSystem, MetricEstimate } from '../types';
import { calculateNutritionTargets, kgToLbs, lbsToKg, cmToFtInches, ftInchesToCm, ACTIVITY_LABELS } from '../services/calculationEngine';
import { StorageService } from '../services/storageService';
import {
  User,
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
} from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfile;
  targets: MetricEstimate;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  targets,
  onUpdateProfile,
  onResetData,
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
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#EDEDED]">{profile.name}</h1>
            <p className="text-xs text-[#A1A1AA]">
              {profile.age} yrs • {profile.gender.toUpperCase()} • {profile.unitSystem === 'metric' ? `${profile.weightKg} kg` : `${kgToLbs(profile.weightKg)} lbs`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#EDEDED] bg-[#171717] hover:bg-[#262626] border border-[#262626] transition-all"
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-rose-400 bg-[#171717] hover:bg-[#262626] border border-[#262626] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Demo
          </button>
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
