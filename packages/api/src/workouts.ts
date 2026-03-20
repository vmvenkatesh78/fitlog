import type { Workout } from './types';
import { KEYS, safeGet, safeSet } from './storage';

export function getWorkouts(): Workout[] {
  return safeGet<Workout[]>(KEYS.WORKOUTS, []);
}

export function saveWorkout(workout: Omit<Workout, 'id' | 'timestamp'>): Workout {
  const newWorkout: Workout = {
    ...workout,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  const workouts = [newWorkout, ...getWorkouts()];
  safeSet(KEYS.WORKOUTS, workouts);
  return newWorkout;
}

export function deleteWorkout(id: string): void {
  const workouts = getWorkouts().filter((w) => w.id !== id);
  safeSet(KEYS.WORKOUTS, workouts);
}

export function getTodayWorkouts(): Workout[] {
  const today = new Date().toISOString().split('T')[0];
  return getWorkouts().filter((w) => w.timestamp.startsWith(today));
}
