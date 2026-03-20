import type { DailySummary } from './types';
import { getTodayWorkouts } from './workouts';
import { getTodayMeals } from './meals';

export function getDailySummary(): DailySummary {
  const workouts = getTodayWorkouts();
  const meals = getTodayMeals();

  return {
    workoutCount: workouts.length,
    totalCaloriesBurned: workouts.reduce((sum, w) => sum + w.calories, 0),
    totalCaloriesConsumed: meals.reduce((sum, m) => sum + m.calories, 0),
    totalProtein: meals.reduce((sum, m) => sum + m.protein, 0),
    totalCarbs: meals.reduce((sum, m) => sum + m.carbs, 0),
    totalFat: meals.reduce((sum, m) => sum + m.fat, 0),
  };
}
