import React from 'react';
import { FoodItem, DietaryPreference, MealItem } from '../types';
import { getRecommendedProteinFoods } from '../services/foodDatabase';
import { Sparkles, Clock, Flame, Beef, Plus, Check } from 'lucide-react';

interface ProteinRecommendationsProps {
  remainingProteinGrams: number;
  dietaryPreference: DietaryPreference;
  includeEggs: boolean;
  onQuickLogFood: (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks', item: FoodItem) => void;
}

export const ProteinRecommendations: React.FC<ProteinRecommendationsProps> = ({
  remainingProteinGrams,
  dietaryPreference,
  includeEggs,
  onQuickLogFood,
}) => {
  const { recommendations, topComboSuggestion } = getRecommendedProteinFoods(
    Math.max(15, remainingProteinGrams),
    dietaryPreference,
    includeEggs
  );

  const [loggedIds, setLoggedIds] = React.useState<Record<string, boolean>>({});

  const handleLog = (item: FoodItem) => {
    onQuickLogFood('snacks', item);
    setLoggedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setLoggedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <div id="protein_recommendations_container" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Beef className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#EDEDED] text-sm md:text-base">
              Protein Recovery Suggestions ({dietaryPreference === 'vegetarian' ? 'Vegetarian' : 'All Sources'})
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              Quick high-protein options tailored to fill your remaining {remainingProteinGrams > 0 ? `${remainingProteinGrams}g` : 'daily'} target.
            </p>
          </div>
        </div>
      </div>

      {/* Top Combo Banner if available */}
      {topComboSuggestion && remainingProteinGrams >= 20 && (
        <div className="bg-[#171717] border border-orange-500/30 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-orange-300">Recommended Fast Match Combo</div>
              <p className="text-xs text-[#EDEDED] mt-0.5 leading-relaxed">{topComboSuggestion.summary}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-orange-400 font-bold bg-[#121212] px-2.5 py-1 rounded-lg border border-orange-500/40">
              +{topComboSuggestion.totalProtein}g protein
            </span>
          </div>
        </div>
      )}

      {/* Grid of Recommended Practical Foods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {recommendations.map((food) => {
          const isJustLogged = loggedIds[food.id];

          return (
            <div
              key={food.id}
              className="bg-[#121212] border border-[#262626] hover:border-orange-500/40 rounded-2xl p-3.5 shadow-sm flex flex-col justify-between space-y-3 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-[#EDEDED] text-xs md:text-sm group-hover:text-orange-400 transition-colors">
                    {food.name}
                  </h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#171717] text-[#A1A1AA] border border-[#262626] whitespace-nowrap">
                    {food.portion}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="font-mono font-bold text-orange-400 flex items-center gap-1">
                    <Beef className="w-3.5 h-3.5" />
                    {food.protein}g protein
                  </span>
                  <span className="text-[#A1A1AA] flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    {food.calories} kcal
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#737373] mt-1.5">
                  <Clock className="w-3 h-3 text-[#737373]" />
                  <span>{food.prepTimeMinutes === 0 ? 'No prep required' : `~${food.prepTimeMinutes} mins prep`}</span>
                  <span>•</span>
                  <span className="text-orange-400/80">{food.reason}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                <span className="text-[10px] text-[#737373]">{food.category}</span>
                <button
                  type="button"
                  onClick={() => handleLog(food)}
                  disabled={isJustLogged}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isJustLogged
                      ? 'bg-orange-500 text-black'
                      : 'bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-black border border-orange-500/30'
                  }`}
                >
                  {isJustLogged ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Logged!
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Add to Snack
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

