import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel, FitnessGoal, DietaryPreference, UnitSystem } from '../types';
import { calculateNutritionTargets, kgToLbs, lbsToKg, cmToFtInches, ftInchesToCm, ACTIVITY_LABELS } from '../services/calculationEngine';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Flame, Beef, Activity } from 'lucide-react';

interface OnboardingModalProps {
  initialProfile: UserProfile;
  onComplete: (profile: UserProfile) => void;
  isOpen: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ initialProfile, onComplete, isOpen }) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<number>(1);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(initialProfile.unitSystem || 'metric');
  const [name, setName] = useState(initialProfile.name || 'Lifter');
  const [age, setAge] = useState<number>(initialProfile.age || 25);
  const [gender, setGender] = useState<Gender>(initialProfile.gender || 'male');
  
  // Weight & Height state
  const [weightKg, setWeightKg] = useState<number>(initialProfile.weightKg || 75);
  const [heightCm, setHeightCm] = useState<number>(initialProfile.heightCm || 175);
  
  // Imperial helpers
  const [weightLbs, setWeightLbs] = useState<number>(kgToLbs(initialProfile.weightKg || 75));
  const initialFtIn = cmToFtInches(initialProfile.heightCm || 175);
  const [heightFeet, setHeightFeet] = useState<number>(initialFtIn.feet);
  const [heightInches, setHeightInches] = useState<number>(initialFtIn.inches);

  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(initialProfile.activityLevel || 'moderately_active');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(initialProfile.fitnessGoal || 'gain_muscle');
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(initialProfile.dietaryPreference || 'non_vegetarian');
  const [includeEggs, setIncludeEggs] = useState<boolean>(initialProfile.includeEggsIfVegetarian ?? true);
  const [dailyStepGoal, setDailyStepGoal] = useState<number>(initialProfile.dailyStepGoal || 10000);

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

  // Preview live targets
  const tempProfile: UserProfile = {
    ...initialProfile,
    name,
    age,
    gender,
    weightKg,
    heightCm,
    activityLevel,
    fitnessGoal,
    dietaryPreference,
    includeEggsIfVegetarian: includeEggs,
    dailyStepGoal,
    unitSystem,
    onboardingCompleted: true,
  };

  const targets = calculateNutritionTargets(tempProfile);

  const handleFinish = () => {
    onComplete(tempProfile);
  };

  return (
    <div id="onboarding_modal_overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div id="onboarding_container" className="bg-[#0A0A0A] border border-[#262626] rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl text-[#EDEDED] my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sparkles className="w-5 h-5 text-black font-bold" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#EDEDED] tracking-tight">Personalize Your Fitness Engine</h2>
              <p className="text-xs text-[#A1A1AA]">Step {step} of 3 • Science-backed Mifflin-St Jeor calibration</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-orange-500' : s < step ? 'w-2 bg-orange-700' : 'w-2 bg-[#262626]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Biometrics */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#EDEDED]">Unit Preference</span>
              <div className="flex bg-[#171717] p-1 rounded-xl border border-[#262626]">
                <button
                  type="button"
                  onClick={() => setUnitSystem('metric')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    unitSystem === 'metric' ? 'bg-orange-500 text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Metric (kg / cm)
                </button>
                <button
                  type="button"
                  onClick={() => setUnitSystem('imperial')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    unitSystem === 'imperial' ? 'bg-orange-500 text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Imperial (lbs / ft)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Your Name or Alias</label>
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
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Age</label>
                <input
                  type="number"
                  id="input_onboarding_age"
                  min={14}
                  max={95}
                  value={age}
                  onChange={(e) => setAge(Math.max(1, parseInt(e.target.value) || 25))}
                  className="w-full bg-[#171717] border border-[#262626] rounded-xl px-4 py-2.5 text-[#EDEDED] text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Biological Sex</label>
                <select
                  id="select_onboarding_gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full bg-[#171717] border border-[#262626] rounded-xl px-4 py-2.5 text-[#EDEDED] text-sm focus:outline-none focus:border-orange-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
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
                    className="w-full bg-[#171717] border border-[#262626] rounded-xl px-4 py-2.5 text-[#EDEDED] text-sm focus:outline-none focus:border-orange-500 font-mono"
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
                    className="w-full bg-[#171717] border border-[#262626] rounded-xl px-4 py-2.5 text-[#EDEDED] text-sm focus:outline-none focus:border-orange-500 font-mono"
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
                    className="w-full bg-[#171717] border border-[#262626] rounded-xl px-4 py-2.5 text-[#EDEDED] text-sm focus:outline-none focus:border-orange-500 font-mono"
                  />
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      id="input_onboarding_height_ft"
                      min={3}
                      max={7}
                      value={heightFeet}
                      onChange={(e) => handleHeightChange(undefined, parseInt(e.target.value) || 5, undefined)}
                      placeholder="ft"
                      className="w-1/2 bg-[#171717] border border-[#262626] rounded-xl px-3 py-2.5 text-[#EDEDED] text-sm focus:outline-none focus:border-orange-500 font-mono"
                    />
                    <input
                      type="number"
                      id="input_onboarding_height_in"
                      min={0}
                      max={11}
                      value={heightInches}
                      onChange={(e) => handleHeightChange(undefined, undefined, parseInt(e.target.value) || 0)}
                      placeholder="in"
                      className="w-1/2 bg-[#171717] border border-[#262626] rounded-xl px-3 py-2.5 text-[#EDEDED] text-sm focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Activity & Training Level */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-[#A1A1AA]">
              Select your current baseline activity level so we can calculate an accurate non-exercise + training energy expenditure multiplier.
            </p>
            <div className="space-y-2.5">
              {(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'] as ActivityLevel[]).map((level) => {
                const info = ACTIVITY_LABELS[level];
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
                      <span className="font-semibold text-sm text-[#EDEDED]">{info.title}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                    </div>
                    <p className="text-xs text-[#737373] mt-0.5">{info.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
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
                <span className="text-sm font-bold text-orange-400 min-w-[70px] text-right font-mono">
                  {dailyStepGoal.toLocaleString()} steps
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Goals & Dietary Preference */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-2">Primary Fitness Goal</label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'gain_muscle', label: 'Gain Muscle', desc: '+300 kcal lean surplus + high protein' },
                  { id: 'lose_fat', label: 'Lose Fat', desc: '-450 kcal deficit with lean mass protection' },
                  { id: 'recomposition', label: 'Recomposition', desc: 'Build muscle & lose fat simultaneously' },
                  { id: 'maintain', label: 'Maintain Weight', desc: 'Sustain current weight & performance' },
                ].map((g) => {
                  const isSelected = fitnessGoal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setFitnessGoal(g.id as FitnessGoal)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-orange-500/10 border-orange-500 text-white'
                          : 'bg-[#171717] border-[#262626] text-[#A1A1AA] hover:bg-[#202020]'
                      }`}
                    >
                      <div className="font-semibold text-xs text-[#EDEDED]">{g.label}</div>
                      <div className="text-[11px] text-[#737373] mt-1 leading-tight">{g.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-2">Dietary Preference</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDietaryPreference('non_vegetarian')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    dietaryPreference === 'non_vegetarian'
                      ? 'bg-orange-500/10 border-orange-500 text-white'
                      : 'bg-[#171717] border-[#262626] text-[#A1A1AA] hover:bg-[#202020]'
                  }`}
                >
                  <div className="font-semibold text-xs text-[#EDEDED]">Non-Vegetarian</div>
                  <div className="text-[11px] text-[#737373] mt-0.5">Chicken, Fish, Eggs, Whey, Dairy</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDietaryPreference('vegetarian')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    dietaryPreference === 'vegetarian'
                      ? 'bg-orange-500/10 border-orange-500 text-white'
                      : 'bg-[#171717] border-[#262626] text-[#A1A1AA] hover:bg-[#202020]'
                  }`}
                >
                  <div className="font-semibold text-xs text-[#EDEDED]">Vegetarian</div>
                  <div className="text-[11px] text-[#737373] mt-0.5">Paneer, Greek Yogurt, Soy, Tofu, Legumes</div>
                </button>
              </div>

              {dietaryPreference === 'vegetarian' && (
                <label className="flex items-center gap-2.5 mt-2.5 text-xs text-[#EDEDED] cursor-pointer bg-[#171717] p-2.5 rounded-xl border border-[#262626]">
                  <input
                    type="checkbox"
                    checked={includeEggs}
                    onChange={(e) => setIncludeEggs(e.target.checked)}
                    className="rounded accent-orange-500 w-4 h-4"
                  />
                  <span>Include Eggs (Ovo-Vegetarian / Eggitarian recommendations)</span>
                </label>
              )}
            </div>

            {/* Live Calculation Preview Banner */}
            <div className="bg-[#121212] border border-orange-500/30 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-semibold text-[#EDEDED] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Calculated Metabolic Targets
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-[#171717] p-2 rounded-xl border border-[#262626]">
                  <span className="text-[10px] text-[#737373] block">Est. Maintenance</span>
                  <span className="text-sm font-bold text-[#EDEDED]">{targets.maintenanceCalories} kcal</span>
                </div>
                <div className="bg-[#171717] p-2 rounded-xl border border-orange-500/30">
                  <span className="text-[10px] text-orange-400 font-medium block">Daily Target</span>
                  <span className="text-sm font-bold text-orange-400">{targets.targetCalories} kcal</span>
                </div>
                <div className="bg-[#171717] p-2 rounded-xl border border-orange-500/30">
                  <span className="text-[10px] text-orange-400 font-medium block">Daily Protein</span>
                  <span className="text-sm font-bold text-orange-400">{targets.proteinTargetGrams} g</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#262626]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-[#A1A1AA] hover:text-white bg-[#171717] hover:bg-[#202020] border border-[#262626] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              id="btn_onboarding_next"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-orange-500 text-black hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              id="btn_onboarding_finish"
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-orange-500 text-black hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              Launch Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
