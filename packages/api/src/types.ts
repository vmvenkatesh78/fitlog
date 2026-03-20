export interface Workout {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight?: number;
  calories: number;
  timestamp: string; // ISO string — serialize/deserialize at boundaries
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
}

export interface DailySummary {
  workoutCount: number;
  totalCaloriesBurned: number;
  totalCaloriesConsumed: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}
