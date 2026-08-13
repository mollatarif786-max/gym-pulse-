import React, { useState } from 'react';
import {
  UserProfile,
  DailyNutritionLog,
  MealItem,
  FoodItem,
  MetricEstimate,
} from '../types';
import { calculateDailyNutritionTotals } from '../services/calculationEngine';
import { INITIAL_FOOD_DATABASE } from '../services/foodDatabase';
import { ProteinRecommendations } from './ProteinRecommendations';
import {
  Utensils,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Search,
  X,
  Sparkles,
} from 'lucide-react';

interface NutritionViewProps {
  profile: UserProfile;
  targets: MetricEstimate;
  todayNutrition: DailyNutritionLog;
  onUpdateNutrition: (updatedLog: DailyNutritionLog) => void;
  onAddCustomFood?: (food: FoodItem) => void;
}

export const NutritionView: React.FC<NutritionViewProps> = ({
  profile,
  targets,
  todayNutrition,
  onUpdateNutrition,
  onAddCustomFood,
}) => {
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('breakfast');
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customFoodMode, setCustomFoodMode] = useState<boolean>(false);

  // Custom food fields
  const [customName, setCustomName] = useState<string>('');
  const [customPortion, setCustomPortion] = useState<string>('1 serving');
  const [customCalories, setCustomCalories] = useState<number>(200);
  const [customProtein, setCustomProtein] = useState<number>(20);
  const [customCarbs, setCustomCarbs] = useState<number>(15);
  const [customFats, setCustomFats] = useState<number>(5);

  const totals = calculateDailyNutritionTotals(todayNutrition);

  const remainingCalories = targets.targetCalories - totals.calories;
  const remainingProtein = targets.proteinTargetGrams - totals.protein;
  const remainingCarbs = targets.carbsTargetGrams - totals.carbs;
  const remainingFats = targets.fatsTargetGrams - totals.fats;

  const handleRemoveMealItem = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks', itemId: string) => {
    const updated = {
      ...todayNutrition,
      [mealType]: todayNutrition[mealType].filter((i) => i.id !== itemId),
    };
    onUpdateNutrition(updated);
  };

  const handleAddMealItem = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks', food: FoodItem, servings: number = 1) => {
    const newItem: MealItem = {
      id: `meal_item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      foodId: food.id,
      name: food.name,
      portion: food.portion,
      servings,
      calories: Math.round(food.calories * servings),
      protein: Math.round(food.protein * servings),
      carbs: Math.round(food.carbs * servings),
      fats: Math.round(food.fats * servings),
      loggedAt: new Date().toISOString(),
    };

    const updated = {
      ...todayNutrition,
      [mealType]: [...(todayNutrition[mealType] || []), newItem],
    };
    onUpdateNutrition(updated);
    setIsAddFoodModalOpen(false);
    setSearchQuery('');
  };

  const handleCustomFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newFood: FoodItem = {
      id: `custom_food_${Date.now()}`,
      name: customName,
      portion: customPortion,
      calories: customCalories,
      protein: customProtein,
      carbs: customCarbs,
      fats: customFats,
      dietaryType: profile.dietaryPreference === 'vegetarian' ? 'vegetarian' : 'non_vegetarian',
      prepTimeMinutes: 5,
      category: 'Meal',
      isQuickOption: true,
    };

    if (onAddCustomFood) {
      onAddCustomFood(newFood);
    }

    handleAddMealItem(selectedMealType, newFood, 1);
    setCustomFoodMode(false);
    setCustomName('');
  };

  const meals = [
    { key: 'breakfast' as const, label: 'Breakfast', icon: '🌅', items: todayNutrition.breakfast || [] },
    { key: 'lunch' as const, label: 'Lunch', icon: '☀️', items: todayNutrition.lunch || [] },
    { key: 'dinner' as const, label: 'Dinner', icon: '🌙', items: todayNutrition.dinner || [] },
    { key: 'snacks' as const, label: 'Snacks & Supplements', icon: '⚡', items: todayNutrition.snacks || [] },
  ];

  const filteredFoods = INITIAL_FOOD_DATABASE.filter((f) => {
    const matches = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (profile.dietaryPreference === 'vegetarian') {
      if (f.dietaryType === 'non_vegetarian') return false;
      if (f.dietaryType === 'contains_egg' && !profile.includeEggsIfVegetarian) return false;
    }
    return matches;
  });

  return (
    <div id="nutrition_main_view" className="space-y-6 pb-24">
      {/* Header Macro Overview Card */}
      <div className="bg-[#121212] border border-[#262626] rounded-3xl p-5 md:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#262626]">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#EDEDED] tracking-tight">Today's Nutrition Breakdown</h1>
            <p className="text-xs text-[#A1A1AA]">
              Mifflin-St Jeor Target: <span className="font-semibold text-orange-400">{targets.targetCalories} kcal</span> (Maintenance: {targets.maintenanceCalories} kcal)
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#171717] text-[#EDEDED] border border-[#262626] w-fit">
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Macro Progress Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Calories */}
          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A1A1AA] flex items-center gap-1 font-medium">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Calories
              </span>
              <span className="font-mono text-[#737373] text-[11px]">
                {totals.calories} / {targets.targetCalories}
              </span>
            </div>
            <div className="text-lg font-black text-[#EDEDED] font-mono">
              {remainingCalories >= 0 ? `${remainingCalories} left` : `${Math.abs(remainingCalories)} over`}
            </div>
            <div className="w-full bg-[#262626] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  remainingCalories < 0 ? 'bg-rose-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(100, (totals.calories / targets.targetCalories) * 100)}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          <div className="bg-[#171717] border border-orange-500/30 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-400 flex items-center gap-1 font-semibold">
                <Beef className="w-3.5 h-3.5" />
                Protein
              </span>
              <span className="font-mono text-[#737373] text-[11px]">
                {totals.protein}g / {targets.proteinTargetGrams}g
              </span>
            </div>
            <div className="text-lg font-black text-orange-400 font-mono">
              {remainingProtein > 0 ? `${remainingProtein}g left` : 'Target Hit! 🎯'}
            </div>
            <div className="w-full bg-[#262626] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 transition-all duration-500"
                style={{ width: `${Math.min(100, (totals.protein / targets.proteinTargetGrams) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A1A1AA] flex items-center gap-1 font-medium">
                <Wheat className="w-3.5 h-3.5 text-amber-400" />
                Carbs
              </span>
              <span className="font-mono text-[#737373] text-[11px]">
                {totals.carbs}g / {targets.carbsTargetGrams}g
              </span>
            </div>
            <div className="text-lg font-black text-[#EDEDED] font-mono">
              {remainingCarbs >= 0 ? `${remainingCarbs}g left` : `${Math.abs(remainingCarbs)}g over`}
            </div>
            <div className="w-full bg-[#262626] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${Math.min(100, (totals.carbs / Math.max(1, targets.carbsTargetGrams)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fats */}
          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A1A1AA] flex items-center gap-1 font-medium">
                <Droplet className="w-3.5 h-3.5 text-rose-400" />
                Fats
              </span>
              <span className="font-mono text-[#737373] text-[11px]">
                {totals.fats}g / {targets.fatsTargetGrams}g
              </span>
            </div>
            <div className="text-lg font-black text-[#EDEDED] font-mono">
              {remainingFats >= 0 ? `${remainingFats}g left` : `${Math.abs(remainingFats)}g over`}
            </div>
            <div className="w-full bg-[#262626] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-400 transition-all duration-500"
                style={{ width: `${Math.min(100, (totals.fats / Math.max(1, targets.fatsTargetGrams)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Protein Alert Banner if Short */}
        {remainingProtein > 20 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-orange-200">
            <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-orange-300">You're {remainingProtein}g short of your protein target today.</span>{' '}
              Sufficient protein is vital for muscle tissue recovery and preserving lean mass. Check out the recommended options below to hit your number!
            </div>
          </div>
        )}
      </div>

      {/* Meal Logging Sections */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
          Logged Meals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meals.map((meal) => {
            const mealCalories = meal.items.reduce((s, i) => s + (i.calories || 0), 0);
            const mealProtein = meal.items.reduce((s, i) => s + (i.protein || 0), 0);

            return (
              <div
                key={meal.key}
                className="bg-[#121212] border border-[#262626] rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{meal.icon}</span>
                      <h3 className="font-bold text-[#EDEDED] text-sm">{meal.label}</h3>
                    </div>
                    <div className="text-xs font-mono text-[#A1A1AA] flex items-center gap-2">
                      <span>{mealCalories} kcal</span>
                      <span>•</span>
                      <span className="text-orange-400 font-semibold">{mealProtein}g P</span>
                    </div>
                  </div>

                  {/* Items in this meal */}
                  <div className="mt-3 space-y-2">
                    {meal.items.length === 0 ? (
                      <p className="text-xs text-[#737373] italic py-2">No food logged yet.</p>
                    ) : (
                      meal.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between bg-[#171717] p-2 rounded-xl border border-[#262626] text-xs"
                        >
                          <div>
                            <span className="font-medium text-[#EDEDED]">{item.name}</span>
                            <div className="text-[10px] text-[#737373]">
                              {item.portion} • {item.calories} kcal • {item.protein}g protein
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveMealItem(meal.key, item.id)}
                            className="text-[#737373] hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMealType(meal.key);
                    setIsAddFoodModalOpen(true);
                  }}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Food to {meal.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Protein Food Recommendations */}
      <ProteinRecommendations
        remainingProteinGrams={remainingProtein}
        dietaryPreference={profile.dietaryPreference}
        includeEggs={profile.includeEggsIfVegetarian}
        onQuickLogFood={handleAddMealItem}
      />

      {/* Add Food Modal */}
      {isAddFoodModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#262626] rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#262626] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#EDEDED] text-base">Add Food to {selectedMealType.toUpperCase()}</h3>
                <p className="text-xs text-[#A1A1AA]">Search database or enter custom nutrition item</p>
              </div>
              <button
                onClick={() => setIsAddFoodModalOpen(false)}
                className="text-[#737373] hover:text-white p-1 rounded-lg hover:bg-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-[#262626] space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCustomFoodMode(false)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    !customFoodMode ? 'bg-orange-500 text-black font-bold' : 'bg-[#171717] text-[#A1A1AA]'
                  }`}
                >
                  Search Database
                </button>
                <button
                  type="button"
                  onClick={() => setCustomFoodMode(true)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    customFoodMode ? 'bg-orange-500 text-black font-bold' : 'bg-[#171717] text-[#A1A1AA]'
                  }`}
                >
                  Custom Food Entry
                </button>
              </div>

              {!customFoodMode && (
                <div className="relative">
                  <Search className="w-4 h-4 text-[#737373] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chicken, paneer, greek yogurt, eggs..."
                    className="w-full bg-[#171717] border border-[#262626] rounded-xl pl-9 pr-4 py-2 text-xs text-[#EDEDED] placeholder-[#737373] focus:outline-none focus:border-orange-500"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {!customFoodMode ? (
                filteredFoods.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl bg-[#171717] border border-[#262626] flex items-center justify-between hover:border-orange-500/40 transition-all"
                  >
                    <div>
                      <div className="font-semibold text-xs text-[#EDEDED]">{f.name}</div>
                      <div className="text-[11px] text-[#A1A1AA] flex items-center gap-2 mt-0.5">
                        <span>{f.portion}</span>
                        <span>•</span>
                        <span className="text-orange-400 font-mono">{f.calories} kcal</span>
                        <span>•</span>
                        <span className="text-orange-400 font-mono font-bold">{f.protein}g P</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddMealItem(selectedMealType, f, 1)}
                      className="px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-black font-bold text-xs transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                ))
              ) : (
                <form onSubmit={handleCustomFoodSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Food Name</label>
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Homemade Protein Bowl"
                      className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Portion Description</label>
                      <input
                        type="text"
                        value={customPortion}
                        onChange={(e) => setCustomPortion(e.target.value)}
                        placeholder="e.g. 200g or 1 bowl"
                        className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Calories (kcal)</label>
                      <input
                        type="number"
                        min="0"
                        value={customCalories}
                        onChange={(e) => setCustomCalories(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-orange-400 mb-1">Protein (g)</label>
                      <input
                        type="number"
                        min="0"
                        value={customProtein}
                        onChange={(e) => setCustomProtein(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-amber-300 mb-1">Carbs (g)</label>
                      <input
                        type="number"
                        min="0"
                        value={customCarbs}
                        onChange={(e) => setCustomCarbs(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-rose-400 mb-1">Fats (g)</label>
                      <input
                        type="number"
                        min="0"
                        value={customFats}
                        onChange={(e) => setCustomFats(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#171717] border border-[#262626] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-orange-500 text-black hover:bg-orange-400 transition-all shadow-md"
                    >
                      Save & Add Food
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
