import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel, FitnessGoal, DietaryPreference, UnitSystem } from '../types';
import {
  calculateNutritionTargets,
  calculateBMR,
  kgToLbs,
  lbsToKg,
  cmToFtInches,
  ftInchesToCm,
  ACTIVITY_LABELS,
  ACTIVITY_MULTIPLIERS,
} from '../services/calculationEngine';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Flame,
  Beef,
  Activity,
  Scale,
  Zap,
  Target,
  Utensils,
  Info,
  ChevronRight,
  X,
} from 'lucide-react';

interface OnboardingModalProps {
  initialProfile: UserProfile;
  onComplete: (profile: UserProfile) => void;
  isOpen: boolean;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  onComplete,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<number>(1);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(initialProfile.unitSystem || 'metric');
  const [name, setName] = useState(initialProfile.name || 'Lifter');
  const [age, setAge] = useState<number>(initialProfile.age || 25);
  const [gender, setGender] = useState<Gender>(initialProfile.gender || 'male');

  // Weight & Height state
  const [weightKg, setWeightKg] = useState<number>(initialProfile.weightKg || 70);
  const [heightCm, setHeightCm] = useState<number>(initialProfile.heightCm || 175);

  // Imperial helpers
  const [weightLbs, setWeightLbs] = useState<number>(kgToLbs(initialProfile.weightKg || 70));
  const initialFtIn = cmToFtInches(initialProfile.heightCm || 175);
  const [heightFeet, setHeightFeet] = useState<number>(initialFtIn.feet);
  const [heightInches, setHeightInches] = useState<number>(initialFtIn.inches);

  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    initialProfile.activityLevel || 'moderately_active'
  );
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(
    initialProfile.fitnessGoal || 'gain_muscle'
  );
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(
    initialProfile.dietaryPreference || 'non_vegetarian'
  );
  const [includeEggs, setIncludeEggs] = useState<boolean>(
    initialProfile.includeEggsIfVegetarian ?? true
  );
  const [dailyStepGoal, setDailyStepGoal] = useState<number>(
    initialProfile.dailyStepGoal || 10000
  );

  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setUnitSystem(initialProfile.unitSystem || 'metric');
      setName(initialProfile.name || 'Lifter');
      setAge(initialProfile.age || 25);
      setGender(initialProfile.gender || 'male');
      setWeightKg(initialProfile.weightKg || 70);
      setWeightLbs(kgToLbs(initialProfile.weightKg || 70));
      setHeightCm(initialProfile.heightCm || 175);
      const ftIn = cmToFtInches(initialProfile.heightCm || 175);
      setHeightFeet(ftIn.feet);
      setHeightInches(ftIn.inches);
      setActivityLevel(initialProfile.activityLevel || 'moderately_active');
      setFitnessGoal(initialProfile.fitnessGoal || 'gain_muscle');
      setDietaryPreference(initialProfile.dietaryPreference || 'non_vegetarian');
      setIncludeEggs(initialProfile.includeEggsIfVegetarian ?? true);
      setDailyStepGoal(initialProfile.dailyStepGoal || 10000);
    }
  }, [isOpen, initialProfile]);

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

  // Construct current profile for live calculations
  const tempProfile: UserProfile = {
    ...initialProfile,
    name: name.trim() || 'Lifter',
    age,
    gender,
    weightKg: Math.max(30, weightKg),
    heightCm: Math.max(100, heightCm),
    activityLevel,
    fitnessGoal,
    dietaryPreference,
    includeEggsIfVegetarian: includeEggs,
    dailyStepGoal,
    unitSystem,
    onboardingCompleted: true,
  };

  const liveBMR = calculateBMR(tempProfile.weightKg, tempProfile.heightCm, tempProfile.age, tempProfile.gender);
  const liveTDEE = Math.round(liveBMR * (ACTIVITY_MULTIPLIERS[tempProfile.activityLevel] || 1.55));
  const targets = calculateNutritionTargets(tempProfile);

  const handleFinish = () => {
    onComplete(tempProfile);
  };

  // High protein food recommendations based on chosen diet
  const getFoodRecommendations = () => {
    if (dietaryPreference === 'non_vegetarian') {
      return [
        { name: 'Chicken Breast', portion: '150g cooked', protein: '46g protein', calories: '247 kcal', icon: '🍗' },
        { name: 'Whole Eggs & Whites', portion: '3 eggs + 2 whites', protein: '26g protein', calories: '250 kcal', icon: '🥚' },
        { name: 'Greek Yogurt (0% Fat)', portion: '200g', protein: '20g protein', calories: '120 kcal', icon: '🥛' },
        { name: 'Whey Protein Isolate', portion: '1 scoop (30g)', protein: '25g protein', calories: '120 kcal', icon: '⚡' },
      ];
    }
    if (dietaryPreference === 'eggitarian') {
      return [
        { name: 'Whole Boiled Eggs', portion: '4 large eggs', protein: '24g protein', calories: '280 kcal', icon: '🥚' },
        { name: 'Low-Fat Paneer / Cottage Cheese', portion: '150g', protein: '27g protein', calories: '260 kcal', icon: '🧀' },
        { name: 'Greek Yogurt & Berries', portion: '200g', protein: '20g protein', calories: '140 kcal', icon: '🥣' },
        { name: 'Whey / Plant Protein', portion: '1 scoop', protein: '24g protein', calories: '115 kcal', icon: '⚡' },
      ];
    }
    if (dietaryPreference === 'vegetarian') {
      return [
        { name: 'Soya Chunks / Meal Maker', portion: '50g dry', protein: '26g protein', calories: '170 kcal', icon: '🌱' },
        { name: 'Low-Fat Paneer', portion: '150g', protein: '27g protein', calories: '260 kcal', icon: '🧀' },
        { name: 'Greek Yogurt / Hung Curd', portion: '200g', protein: '20g protein', calories: '125 kcal', icon: '🥛' },
        { name: 'Whey Protein', portion: '1 scoop (30g)', protein: '25g protein', calories: '120 kcal', icon: '⚡' },
      ];
    }
    // Vegan
    return [
      { name: 'Organic Firm Tofu', portion: '200g', protein: '24g protein', calories: '180 kcal', icon: '🌱' },
      { name: 'Soya Chunks / TSP', portion: '50g dry', protein: '26g protein', calories: '170 kcal', icon: '🌾' },
      { name: 'Cooked Lentils / Dal + Edamame', portion: '1.5 cups', protein: '22g protein', calories: '290 kcal', icon: '🍲' },
      { name: 'Pea & Brown Rice Protein', portion: '1 scoop (33g)', protein: '24g protein', calories: '125 kcal', icon: '⚡' },
    ];
  };

  const foodRecommendations = getFoodRecommendations();

  return (
    <div
      id="onboarding_modal_overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="onboarding_container"
        className="bg-[#0A0A0A] border border-[#262626] rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl text-[#EDEDED] my-8 relative flex flex-col max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-lg shadow-orange-500/10">
              <Flame className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#EDEDED] tracking-tight">
                {step === 4 ? 'Your Calorie & Protein Blueprint' : 'Personalize Body & Macro Engine'}
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                Step {step} of 4 • {step === 1 ? 'Body Biometrics' : step === 2 ? 'Activity & Movement' : step === 3 ? 'Goal & Diet' : 'Your Calculated Targets'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-6 bg-orange-500'
                      : s < step
                      ? 'w-2 bg-orange-700'
                      : 'w-2 bg-[#262626]'
                  }`}
                />
              ))}
            </div>

            {initialProfile.onboardingCompleted && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-[#737373] hover:text-white p-1 rounded-lg hover:bg-[#171717] transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* STEP 1: Biometrics (Weight, Height, Age, Sex) */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-[#121212] p-3 rounded-2xl border border-[#262626]">
              <span className="text-xs font-semibold text-[#EDEDED] flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-orange-500" />
                Measurement System
              </span>
              <div className="flex bg-[#171717] p-1 rounded-xl border border-[#262626]">
                <button
                  type="button"
                  onClick={() => setUnitSystem('metric')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    unitSystem === 'metric'
                      ? 'bg-orange-500 text-black font-bold'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Metric (kg / cm)
                </button>
                <button
                  type="button"
                  onClick={() => setUnitSystem('imperial')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    unitSystem === 'imperial'
                      ? 'bg-orange-500 text-black font-bold'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Imperial (lbs / ft)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                Your Name or Alias
              </label>
              <input
                type="text"
                id="input_onboarding_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full bg-[#171717] border border-[#262626] rounded-xl px-4 py-2.5 text-[#EDEDED] placeholder-[#737373] focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Age (years)
                </label>
                <input
                  type="number"
                  id="input_onboarding_age"
                  min={14}
                  max={95}
                  value={age}
                  onChange={(e) => setAge(Math.max(1, parseInt(e.target.value) || 25))}
                  className="w-full bg-[#171717] border border-[#262626] rounded-xl px-4 py-2.5 text-[#EDEDED] text-sm focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Biological Sex
                </label>
                <select
                  id="select_onboarding_gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full bg-[#171717] border border-[#262626] rounded-xl px-4 py-2.5 text-[#EDEDED] text-sm focus:outline-none focus:border-orange-500"
                >
                  <option value="male">Male (+5 kcal BMR offset)</option>
                  <option value="female">Female (-161 kcal BMR offset)</option>
                  <option value="other">Other / Non-binary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Body Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'}
                </label>
                {unitSystem === 'metric' ? (
                  <input
                    type="number"
                    id="input_onboarding_weight_kg"
                    step="0.5"
                    min={30}
                    max={250}
                    value={weightKg}
                    onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 70, false)}
                    className="w-full bg-[#171717] border border-[#262626] rounded-xl px-4 py-2.5 text-[#EDEDED] text-sm focus:outline-none focus:border-orange-500 font-mono font-bold"
                  />
                ) : (
                  <input
                    type="number"
                    id="input_onboarding_weight_lbs"
                    step="1"
                    min={65}
                    max={550}
                    value={weightLbs}
                    onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 160, true)}
                    className="w-full bg-[#171717] border border-[#262626] rounded-xl px-4 py-2.5 text-[#EDEDED] text-sm focus:outline-none focus:border-orange-500 font-mono font-bold"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Height {unitSystem === 'metric' ? '(cm)' : '(ft & in)'}
                </label>
                {unitSystem === 'metric' ? (
                  <input
                    type="number"
                    id="input_onboarding_height_cm"
                    min={100}
                    max={240}
                    value={heightCm}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 175)}
                    className="w-full bg-[#171717] border border-[#262626] rounded-xl px-4 py-2.5 text-[#EDEDED] text-sm focus:outline-none focus:border-orange-500 font-mono font-bold"
                  />
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      id="input_onboarding_height_ft"
                      min={3}
                      max={7}
                      value={heightFeet}
                      onChange={(e) =>
                        handleHeightChange(undefined, parseInt(e.target.value) || 5, undefined)
                      }
                      placeholder="ft"
                      className="w-1/2 bg-[#171717] border border-[#262626] rounded-xl px-3 py-2.5 text-[#EDEDED] text-sm focus:outline-none focus:border-orange-500 font-mono"
                    />
                    <input
                      type="number"
                      id="input_onboarding_height_in"
                      min={0}
                      max={11}
                      value={heightInches}
                      onChange={(e) =>
                        handleHeightChange(undefined, undefined, parseInt(e.target.value) || 0)
                      }
                      placeholder="in"
                      className="w-1/2 bg-[#171717] border border-[#262626] rounded-xl px-3 py-2.5 text-[#EDEDED] text-sm focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Live BMR Calculation Peek */}
            <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="text-xs font-semibold text-[#EDEDED]">
                    Calculated Basal Metabolic Rate (BMR)
                  </div>
                  <p className="text-[11px] text-[#737373]">
                    Calories your body burns purely at rest (Mifflin-St Jeor)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black font-mono text-orange-400">
                  {liveBMR} <span className="text-xs font-normal text-[#A1A1AA]">kcal/day</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Activity & Movement (TDEE) */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-[#A1A1AA]">
              Select your typical daily activity so we can calculate your Total Daily Energy Expenditure (TDEE) maintenance calories.
            </p>
            <div className="space-y-2.5">
              {(
                [
                  'sedentary',
                  'lightly_active',
                  'moderately_active',
                  'very_active',
                  'extra_active',
                ] as ActivityLevel[]
              ).map((level) => {
                const info = ACTIVITY_LABELS[level];
                const multiplier = ACTIVITY_MULTIPLIERS[level];
                const isSelected = activityLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setActivityLevel(level)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-orange-500/10 border-orange-500 text-white shadow-sm'
                        : 'bg-[#171717] border-[#262626] text-[#A1A1AA] hover:bg-[#202020]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#EDEDED]">{info.title}</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#121212] border border-[#262626] text-orange-400">
                          {multiplier}×
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                    </div>
                    <p className="text-xs text-[#737373] mt-1">{info.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                Daily Step Target (Non-Exercise Activity)
              </label>
              <div className="flex items-center gap-3 bg-[#121212] p-3 rounded-2xl border border-[#262626]">
                <input
                  type="range"
                  min={4000}
                  max={20000}
                  step={500}
                  value={dailyStepGoal}
                  onChange={(e) => setDailyStepGoal(parseInt(e.target.value))}
                  className="flex-1 accent-orange-500"
                />
                <span className="text-sm font-bold text-orange-400 min-w-[90px] text-right font-mono">
                  {dailyStepGoal.toLocaleString()} steps
                </span>
              </div>
            </div>

            {/* Live TDEE Preview */}
            <div className="bg-[#121212] border border-orange-500/30 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="text-xs font-semibold text-[#EDEDED]">
                    Calculated Maintenance Calories (TDEE)
                  </div>
                  <p className="text-[11px] text-[#737373]">
                    {liveBMR} BMR × {ACTIVITY_MULTIPLIERS[activityLevel]} multiplier
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black font-mono text-orange-400">
                  {liveTDEE} <span className="text-xs font-normal text-[#A1A1AA]">kcal/day</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Goals & Dietary Preference */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-2">
                Primary Fitness Goal
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'gain_muscle',
                    label: 'Gain Muscle / Lean Bulk',
                    desc: '+300 kcal surplus + 2.0g protein/kg body weight for maximum hypertrophy',
                    badge: '+300 kcal',
                  },
                  {
                    id: 'lose_fat',
                    label: 'Lose Fat / Cut',
                    desc: '-450 kcal deficit + 2.2g protein/kg to preserve muscle while stripping fat',
                    badge: '-450 kcal',
                  },
                  {
                    id: 'recomposition',
                    label: 'Body Recomposition',
                    desc: '-150 kcal slight deficit + 2.2g protein/kg to build muscle & lose fat concurrently',
                    badge: '-150 kcal',
                  },
                  {
                    id: 'maintain',
                    label: 'Maintain Weight',
                    desc: 'Balanced at exact TDEE + 1.8g protein/kg for athletic performance',
                    badge: '0 kcal',
                  },
                ].map((g) => {
                  const isSelected = fitnessGoal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setFitnessGoal(g.id as FitnessGoal)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-orange-500/10 border-orange-500 text-white'
                          : 'bg-[#171717] border-[#262626] text-[#A1A1AA] hover:bg-[#202020]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-xs text-[#EDEDED]">{g.label}</div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#121212] border border-[#262626] text-orange-400">
                          {g.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#737373] leading-relaxed">{g.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-2">
                Dietary Preference
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: 'non_vegetarian', label: 'Non-Veg', desc: 'Chicken, Fish, Eggs, Meat' },
                  { id: 'eggitarian', label: 'Eggitarian', desc: 'Vegetarian + Whole Eggs' },
                  { id: 'vegetarian', label: 'Vegetarian', desc: 'Paneer, Dairy, Soy, Lentils' },
                  { id: 'vegan', label: 'Vegan', desc: 'Tofu, Soy, Seitan, Legumes' },
                ].map((diet) => {
                  const isSelected = dietaryPreference === diet.id;
                  return (
                    <button
                      key={diet.id}
                      type="button"
                      onClick={() => setDietaryPreference(diet.id as DietaryPreference)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-orange-500/10 border-orange-500 text-white'
                          : 'bg-[#171717] border-[#262626] text-[#A1A1AA] hover:bg-[#202020]'
                      }`}
                    >
                      <div className="font-semibold text-xs text-[#EDEDED]">{diet.label}</div>
                      <div className="text-[10px] text-[#737373] mt-0.5 leading-tight">{diet.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Live Preview */}
            <div className="bg-[#121212] border border-orange-500/30 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-semibold text-[#EDEDED] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  Calculated Target Output Preview
                </span>
                <span className="text-[11px] text-orange-400 font-mono">Ready for Step 4 Blueprint</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-[#171717] p-2.5 rounded-xl border border-[#262626]">
                  <span className="text-[10px] text-[#737373] block">Maintenance</span>
                  <span className="text-sm font-bold text-[#EDEDED] font-mono">
                    {targets.maintenanceCalories} kcal
                  </span>
                </div>
                <div className="bg-[#171717] p-2.5 rounded-xl border border-orange-500/40">
                  <span className="text-[10px] text-orange-400 font-medium block">Daily Target</span>
                  <span className="text-sm font-bold text-orange-400 font-mono">
                    {targets.targetCalories} kcal
                  </span>
                </div>
                <div className="bg-[#171717] p-2.5 rounded-xl border border-orange-500/40">
                  <span className="text-[10px] text-orange-400 font-medium block">Daily Protein</span>
                  <span className="text-sm font-bold text-orange-400 font-mono">
                    {targets.proteinTargetGrams} g
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: The Calorie & Protein Blueprint (Results Reveal) */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Top Banner */}
            <div className="bg-gradient-to-br from-orange-500/15 via-[#171717] to-[#121212] border border-orange-500/30 rounded-3xl p-5 md:p-6 text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold border border-orange-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Target Calibrated for {tempProfile.weightKg} kg Lifter
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-[#EDEDED] tracking-tight">
                {tempProfile.name}'s Daily Macro Target
              </h3>
              <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
                Mifflin-St Jeor BMR ({targets.bmr} kcal) × {ACTIVITY_MULTIPLIERS[tempProfile.activityLevel]} Activity Multiplier + {targets.calorieDeficitOrSurplus >= 0 ? `+${targets.calorieDeficitOrSurplus}` : targets.calorieDeficitOrSurplus} kcal Goal Offset
              </p>
            </div>

            {/* Core Target Cards: Calories & Protein */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Daily Calories Card */}
              <div className="bg-[#171717] border border-orange-500/40 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Daily Calorie Target
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-mono">
                    {targets.calorieDeficitOrSurplus >= 0 ? `+${targets.calorieDeficitOrSurplus}` : targets.calorieDeficitOrSurplus} kcal
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black font-mono text-[#EDEDED] tracking-tight">
                    {targets.targetCalories}
                  </span>
                  <span className="text-sm font-bold text-[#A1A1AA]">kcal / day</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#262626] text-xs text-[#737373] flex items-center justify-between">
                  <span>Maintenance (TDEE): <strong className="text-[#EDEDED] font-mono">{targets.maintenanceCalories} kcal</strong></span>
                  <span>BMR: <strong className="text-[#EDEDED] font-mono">{targets.bmr} kcal</strong></span>
                </div>
              </div>

              {/* Daily Protein Card */}
              <div className="bg-[#171717] border border-orange-500/40 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                    <Beef className="w-4 h-4 text-orange-500" />
                    Daily Protein Target
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-mono">
                    {(targets.proteinTargetGrams / tempProfile.weightKg).toFixed(1)} g / kg
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black font-mono text-orange-400 tracking-tight">
                    {targets.proteinTargetGrams}
                  </span>
                  <span className="text-sm font-bold text-[#A1A1AA]">grams / day</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#262626] text-xs text-[#737373] flex items-center justify-between">
                  <span>Target Range: <strong className="text-[#EDEDED] font-mono">{targets.proteinMinGrams}g - {targets.proteinMaxGrams}g</strong></span>
                  <span>Energy: <strong className="text-[#EDEDED] font-mono">{targets.proteinTargetGrams * 4} kcal</strong></span>
                </div>
              </div>
            </div>

            {/* Complete Macro Split Bar */}
            <div className="bg-[#121212] border border-[#262626] rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#EDEDED] flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-orange-500" />
                  Full Macronutrient Distribution
                </span>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  100% of {targets.targetCalories} kcal
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-[#171717] rounded-full overflow-hidden flex border border-[#262626]">
                <div
                  className="h-full bg-orange-500 transition-all duration-500"
                  style={{
                    width: `${Math.round(((targets.proteinTargetGrams * 4) / targets.targetCalories) * 100)}%`,
                  }}
                  title="Protein"
                />
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{
                    width: `${Math.round(((targets.carbsTargetGrams * 4) / targets.targetCalories) * 100)}%`,
                  }}
                  title="Carbohydrates"
                />
                <div
                  className="h-full bg-orange-700 transition-all duration-500"
                  style={{
                    width: `${Math.round(((targets.fatsTargetGrams * 9) / targets.targetCalories) * 100)}%`,
                  }}
                  title="Fats"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-[#171717] p-2.5 rounded-2xl border border-[#262626]">
                  <div className="flex items-center justify-center gap-1 text-xs text-orange-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                    Protein
                  </div>
                  <div className="text-base font-black font-mono text-[#EDEDED] mt-0.5">
                    {targets.proteinTargetGrams}g
                  </div>
                  <div className="text-[10px] text-[#737373]">
                    {Math.round(((targets.proteinTargetGrams * 4) / targets.targetCalories) * 100)}% • {targets.proteinTargetGrams * 4} kcal
                  </div>
                </div>

                <div className="bg-[#171717] p-2.5 rounded-2xl border border-[#262626]">
                  <div className="flex items-center justify-center gap-1 text-xs text-amber-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    Carbohydrates
                  </div>
                  <div className="text-base font-black font-mono text-[#EDEDED] mt-0.5">
                    {targets.carbsTargetGrams}g
                  </div>
                  <div className="text-[10px] text-[#737373]">
                    {Math.round(((targets.carbsTargetGrams * 4) / targets.targetCalories) * 100)}% • {targets.carbsTargetGrams * 4} kcal
                  </div>
                </div>

                <div className="bg-[#171717] p-2.5 rounded-2xl border border-[#262626]">
                  <div className="flex items-center justify-center gap-1 text-xs text-orange-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-orange-700 inline-block" />
                    Healthy Fats
                  </div>
                  <div className="text-base font-black font-mono text-[#EDEDED] mt-0.5">
                    {targets.fatsTargetGrams}g
                  </div>
                  <div className="text-[10px] text-[#737373]">
                    {Math.round(((targets.fatsTargetGrams * 9) / targets.targetCalories) * 100)}% • {targets.fatsTargetGrams * 9} kcal
                  </div>
                </div>
              </div>
            </div>

            {/* Personalized High-Protein Food Recommendations */}
            <div className="bg-[#121212] border border-[#262626] rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#EDEDED] flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-orange-500" />
                  Recommended High-Protein Staples ({dietaryPreference.replace('_', ' ')})
                </span>
                <span className="text-[11px] text-[#737373]">To hit {targets.proteinTargetGrams}g</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {foodRecommendations.map((food, idx) => (
                  <div
                    key={idx}
                    className="bg-[#171717] border border-[#262626] rounded-2xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{food.icon}</span>
                      <div>
                        <div className="text-xs font-semibold text-[#EDEDED]">{food.name}</div>
                        <div className="text-[10px] text-[#737373]">{food.portion} • {food.calories}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">
                      {food.protein}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#262626]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-[#A1A1AA] hover:text-white bg-[#171717] hover:bg-[#202020] border border-[#262626] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              id="btn_onboarding_next"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-bold bg-orange-500 text-black hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              {step === 3 ? 'Calculate Calories & Protein' : 'Next Step'}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              id="btn_onboarding_finish"
              onClick={handleFinish}
              className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold bg-orange-500 text-black hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Blueprint & Launch Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
