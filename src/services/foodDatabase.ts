import { FoodItem, DietaryPreference } from '../types';

export const INITIAL_FOOD_DATABASE: FoodItem[] = [
  // --- NON-VEGETARIAN & POULTRY / SEAFOOD ---
  {
    id: 'food_chicken_breast',
    name: 'Grilled Chicken Breast',
    portion: '150g (cooked)',
    servingGrams: 150,
    calories: 248,
    protein: 46,
    carbs: 0,
    fats: 5,
    dietaryType: 'non_vegetarian',
    prepTimeMinutes: 12,
    category: 'Lean Meat & Poultry',
    isQuickOption: true,
    notes: 'The gold standard lean protein source with virtually zero carbs.',
  },
  {
    id: 'food_chicken_thigh',
    name: 'Skinless Chicken Thigh',
    portion: '150g (cooked)',
    servingGrams: 150,
    calories: 310,
    protein: 38,
    carbs: 0,
    fats: 14,
    dietaryType: 'non_vegetarian',
    prepTimeMinutes: 15,
    category: 'Lean Meat & Poultry',
    isQuickOption: false,
    notes: 'Juicy and flavorful protein rich in iron and zinc.',
  },
  {
    id: 'food_canned_tuna',
    name: 'Chunk Light Tuna (in Water)',
    portion: '1 can (130g drained)',
    servingGrams: 130,
    calories: 140,
    protein: 30,
    carbs: 0,
    fats: 1,
    dietaryType: 'non_vegetarian',
    prepTimeMinutes: 1,
    category: 'Seafood',
    isQuickOption: true,
    notes: 'Ultra-convenient, zero prep pantry staple with 30g pure protein.',
  },
  {
    id: 'food_salmon_fillet',
    name: 'Atlantic Salmon Fillet',
    portion: '150g (cooked)',
    servingGrams: 150,
    calories: 310,
    protein: 34,
    carbs: 0,
    fats: 18,
    dietaryType: 'non_vegetarian',
    prepTimeMinutes: 12,
    category: 'Seafood',
    isQuickOption: true,
    notes: 'Rich in Omega-3 EPA/DHA fatty acids for muscle recovery and joint health.',
  },
  {
    id: 'food_lean_ground_beef',
    name: 'Extra Lean Ground Beef (93/7)',
    portion: '150g (cooked)',
    servingGrams: 150,
    calories: 260,
    protein: 36,
    carbs: 0,
    fats: 11,
    dietaryType: 'non_vegetarian',
    prepTimeMinutes: 10,
    category: 'Lean Meat & Poultry',
    isQuickOption: true,
    notes: 'High in bioavailable heme iron, creatine, and vitamin B12.',
  },
  {
    id: 'food_turkey_breast',
    name: 'Sliced Turkey Breast',
    portion: '120g (deli slice)',
    servingGrams: 120,
    calories: 130,
    protein: 28,
    carbs: 2,
    fats: 1,
    dietaryType: 'non_vegetarian',
    prepTimeMinutes: 1,
    category: 'Lean Meat & Poultry',
    isQuickOption: true,
    notes: 'Ready to eat out of the package with virtually no fat.',
  },

  // --- EGGS & EGG PRODUCTS ---
  {
    id: 'food_boiled_eggs',
    name: 'Whole Boiled Eggs (3 Large)',
    portion: '3 whole eggs',
    servingGrams: 150,
    calories: 216,
    protein: 18,
    carbs: 1,
    fats: 15,
    dietaryType: 'contains_egg',
    prepTimeMinutes: 8,
    category: 'Quick Snack',
    isQuickOption: true,
    notes: 'Complete amino acid profile + choline for brain function.',
  },
  {
    id: 'food_egg_whites',
    name: 'Liquid Egg Whites / Scramble',
    portion: '200ml (approx 6 whites)',
    servingGrams: 200,
    calories: 100,
    protein: 22,
    carbs: 1,
    fats: 0,
    dietaryType: 'contains_egg',
    prepTimeMinutes: 4,
    category: 'Dairy & Whey',
    isQuickOption: true,
    notes: '100% pure protein with almost zero calories from fat or carbs.',
  },

  // --- VEGETARIAN & DAIRY & WHEY ---
  {
    id: 'food_greek_yogurt',
    name: 'Plain Greek Yogurt (0% Fat)',
    portion: '200g (1 generous bowl)',
    servingGrams: 200,
    calories: 130,
    protein: 22,
    carbs: 7,
    fats: 0,
    dietaryType: 'vegetarian',
    prepTimeMinutes: 0,
    category: 'Dairy & Whey',
    isQuickOption: true,
    notes: 'No cooking needed. Packed with slow-digesting casein and live probiotics.',
  },
  {
    id: 'food_paneer_raw',
    name: 'Fresh Low-Fat Paneer / Cottage Cheese',
    portion: '150g',
    servingGrams: 150,
    calories: 300,
    protein: 27,
    carbs: 6,
    fats: 18,
    dietaryType: 'vegetarian',
    prepTimeMinutes: 3,
    category: 'Dairy & Whey',
    isQuickOption: true,
    notes: 'High in calcium and steady-release casein protein.',
  },
  {
    id: 'food_cottage_cheese',
    name: 'Low-Fat Cottage Cheese (2%)',
    portion: '200g (1 cup)',
    servingGrams: 200,
    calories: 164,
    protein: 24,
    carbs: 8,
    fats: 4,
    dietaryType: 'vegetarian',
    prepTimeMinutes: 1,
    category: 'Dairy & Whey',
    isQuickOption: true,
    notes: 'Delicious savory or sweet snack with high density of leucine.',
  },
  {
    id: 'food_whey_shake',
    name: 'Whey Protein Isolate Shake',
    portion: '1 scoop (32g) in water/milk',
    servingGrams: 32,
    calories: 120,
    protein: 26,
    carbs: 2,
    fats: 1,
    dietaryType: 'vegetarian',
    prepTimeMinutes: 1,
    category: 'Dairy & Whey',
    isQuickOption: true,
    notes: 'Fast-absorbing post-workout protein for rapid muscle protein synthesis.',
  },
  {
    id: 'food_milk_toned',
    name: 'High-Protein Skimmed Milk',
    portion: '300ml (1 large glass)',
    servingGrams: 300,
    calories: 140,
    protein: 14,
    carbs: 16,
    fats: 1,
    dietaryType: 'vegetarian',
    prepTimeMinutes: 0,
    category: 'Dairy & Whey',
    isQuickOption: true,
    notes: 'Hydrating post-workout beverage with naturally balanced whey and casein.',
  },

  // --- VEGETARIAN & PLANT-BASED / VEGAN ---
  {
    id: 'food_soy_chunks',
    name: 'Defatted Soy Chunks (Nutrela / TVP)',
    portion: '50g (dry / ~150g boiled)',
    servingGrams: 50,
    calories: 172,
    protein: 26,
    carbs: 16,
    fats: 0.5,
    dietaryType: 'vegan',
    prepTimeMinutes: 7,
    category: 'Plant-Based',
    isQuickOption: true,
    notes: 'Over 52% protein by dry weight. One of the highest density vegetarian sources.',
  },
  {
    id: 'food_firm_tofu',
    name: 'Organic Firm Tofu (Pan-seared / raw)',
    portion: '150g',
    servingGrams: 150,
    calories: 180,
    protein: 20,
    carbs: 4,
    fats: 10,
    dietaryType: 'vegan',
    prepTimeMinutes: 6,
    category: 'Plant-Based',
    isQuickOption: true,
    notes: 'Complete plant protein rich in magnesium, iron, and isoflavones.',
  },
  {
    id: 'food_edamame',
    name: 'Steamed Edamame (in pods)',
    portion: '150g (shelled)',
    servingGrams: 150,
    calories: 180,
    protein: 17,
    carbs: 13,
    fats: 8,
    dietaryType: 'vegan',
    prepTimeMinutes: 4,
    category: 'Quick Snack',
    isQuickOption: true,
    notes: 'Crunchy snack packed with dietary fiber and essential amino acids.',
  },
  {
    id: 'food_cooked_lentils',
    name: 'Boiled Yellow / Green Lentils (Dal)',
    portion: '1.5 cups (cooked, 300g)',
    servingGrams: 300,
    calories: 340,
    protein: 24,
    carbs: 58,
    fats: 1.5,
    dietaryType: 'vegan',
    prepTimeMinutes: 15,
    category: 'Grains & Legumes',
    isQuickOption: false,
    notes: 'Complex carbohydrates combined with fiber and plant protein.',
  },
  {
    id: 'food_cooked_chickpeas',
    name: 'Boiled Chickpeas (Garbanzo Beans)',
    portion: '1.5 cups (250g)',
    servingGrams: 250,
    calories: 360,
    protein: 19,
    carbs: 60,
    fats: 5,
    dietaryType: 'vegan',
    prepTimeMinutes: 10,
    category: 'Grains & Legumes',
    isQuickOption: false,
    notes: 'Great in salads, chaats, or mashed into high-protein hummus.',
  },
  {
    id: 'food_plant_protein_shake',
    name: 'Pea & Brown Rice Protein Shake',
    portion: '1 scoop (35g)',
    servingGrams: 35,
    calories: 135,
    protein: 25,
    carbs: 3,
    fats: 2,
    dietaryType: 'vegan',
    prepTimeMinutes: 1,
    category: 'Plant-Based',
    isQuickOption: true,
    notes: '100% plant-derived complete amino acid profile for dairy-free lifters.',
  },
  {
    id: 'food_peanut_butter_toast',
    name: 'Whole Grain Toast + Peanut Butter',
    portion: '2 slices + 2 tbsp PB',
    servingGrams: 100,
    calories: 340,
    protein: 14,
    carbs: 32,
    fats: 17,
    dietaryType: 'vegan',
    prepTimeMinutes: 2,
    category: 'Quick Snack',
    isQuickOption: true,
    notes: 'Calorie-dense sustained energy source great before heavy gym sessions.',
  },
  {
    id: 'food_oatmeal_banana',
    name: 'Rolled Oats with Milk & Banana',
    portion: '1 large bowl (80g dry oats + 250ml milk)',
    servingGrams: 350,
    calories: 420,
    protein: 18,
    carbs: 72,
    fats: 7,
    dietaryType: 'vegetarian',
    prepTimeMinutes: 5,
    category: 'Meal',
    isQuickOption: true,
    notes: 'Classic bodybuilding breakfast offering sustained beta-glucan carbs.',
  },
];

/**
 * Returns prioritized food recommendations based on remaining protein gap & dietary rules
 */
export function getRecommendedProteinFoods(
  remainingProteinGrams: number,
  preference: DietaryPreference,
  includeEggs: boolean
): {
  recommendations: (FoodItem & { matchingScore: number; reason: string })[];
  topComboSuggestion?: {
    items: FoodItem[];
    totalProtein: number;
    totalCalories: number;
    summary: string;
  };
} {
  // Filter foods by dietary restriction
  const availableFoods = INITIAL_FOOD_DATABASE.filter((food) => {
    if (preference === 'vegetarian') {
      if (food.dietaryType === 'non_vegetarian') return false;
      if (food.dietaryType === 'contains_egg' && !includeEggs) return false;
      return true;
    }
    return true;
  });

  // Calculate matching score: favors quick options, appropriate protein volume close to gap, and lean calorie efficiency
  const scored = availableFoods.map((item) => {
    const proteinDensityRatio = item.protein / Math.max(50, item.calories); // higher is leaner protein
    const sizeFit = 1 - Math.min(1, Math.abs(item.protein - remainingProteinGrams) / Math.max(20, remainingProteinGrams));
    const quickBonus = item.isQuickOption ? 0.3 : 0;
    const prepPenalty = (item.prepTimeMinutes || 0) * 0.02;

    const score = proteinDensityRatio * 15 + sizeFit * 10 + quickBonus * 5 - prepPenalty;

    let reason = 'Balanced protein source';
    if (item.prepTimeMinutes <= 2) reason = 'Instant / No-prep option';
    else if (item.protein >= 30) reason = 'High single-dose protein hit';
    else if (item.calories < 150) reason = 'Ultra lean & low calorie';
    else if (item.category === 'Plant-Based') reason = '100% plant-powered';

    return {
      ...item,
      matchingScore: score,
      reason,
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.matchingScore - a.matchingScore);

  const topRecommendations = scored.slice(0, 6);

  // Generate combo suggestion if gap is over 25g
  let topComboSuggestion;
  if (remainingProteinGrams >= 25 && scored.length >= 2) {
    const primary = scored[0];
    const secondary = scored.find((item) => item.id !== primary.id && item.category !== primary.category) || scored[1];
    if (secondary) {
      const comboProtein = primary.protein + secondary.protein;
      const comboCalories = primary.calories + secondary.calories;
      topComboSuggestion = {
        items: [primary, secondary],
        totalProtein: comboProtein,
        totalCalories: comboCalories,
        summary: `Quick Power Combo: ${primary.name} (${primary.portion}) + ${secondary.name} (${secondary.portion}) gives you ${comboProtein}g protein in ~${Math.max(primary.prepTimeMinutes, secondary.prepTimeMinutes)} minutes.`,
      };
    }
  }

  return {
    recommendations: topRecommendations,
    topComboSuggestion,
  };
}
