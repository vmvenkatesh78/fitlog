/**
 * Simple event bus using DOM CustomEvents
 * No libraries, no magic - just plain browser APIs
 */

type EventCallback<T = unknown> = (data: T) => void;

/**
 * Emit an event that any MFE can listen to
 */
export function emit<T = unknown>(event: string, data?: T): void {
  window.dispatchEvent(new CustomEvent(event, { detail: data }));
}

/**
 * Listen to an event from any MFE
 * Returns cleanup function
 */
export function on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<T>;
    callback(customEvent.detail);
  };
  
  window.addEventListener(event, handler);
  
  // Return cleanup function
  return () => window.removeEventListener(event, handler);
}

/**
 * Listen to an event once, then auto-remove
 */
export function once<T = unknown>(event: string, callback: EventCallback<T>): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<T>;
    callback(customEvent.detail);
    window.removeEventListener(event, handler);
  };
  
  window.addEventListener(event, handler);
  
  return () => window.removeEventListener(event, handler);
}

/**
 * Predefined event names for type safety
 */
export const Events = {
  // Workout events
  WORKOUT_LOGGED: 'workout:logged',
  WORKOUT_DELETED: 'workout:deleted',
  
  // Food events
  MEAL_LOGGED: 'meal:logged',
  MEAL_DELETED: 'meal:deleted',
  
  // User events
  USER_UPDATED: 'user:updated',
  THEME_CHANGED: 'theme:changed',
} as const;