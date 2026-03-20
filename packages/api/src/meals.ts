import type { Meal } from './types';
import { KEYS, safeGet, safeSet } from './storage';

export function getMeals(): Meal[] {
  return safeGet<Meal[]>(KEYS.MEALS, []);
}

export function saveMeal(meal: Omit<Meal, 'id' | 'timestamp'>): Meal {
  const newMeal: Meal = {
    ...meal,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  const meals = [newMeal, ...getMeals()];
  safeSet(KEYS.MEALS, meals);
  return newMeal;
}

export function deleteMeal(id: string): void {
  const meals = getMeals().filter((m) => m.id !== id);
  safeSet(KEYS.MEALS, meals);
}

export function getTodayMeals(): Meal[] {
  const today = new Date().toISOString().split('T')[0];
  return getMeals().filter((m) => m.timestamp.startsWith(today));
}
