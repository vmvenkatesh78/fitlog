const KEYS = {
  WORKOUTS: 'fitlog-workouts',
  MEALS: 'fitlog-meals',
} as const;

/**
 * Safe JSON parse with fallback. Handles corrupt or missing data.
 */
function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    console.error(`[fitlog/api] Failed to parse ${key}, returning fallback`);
    return fallback;
  }
}

/**
 * Safe JSON stringify and persist. Handles quota exceeded.
 */
function safeSet<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[fitlog/api] Failed to write ${key}`, err);
    return false;
  }
}

export { KEYS, safeGet, safeSet };
