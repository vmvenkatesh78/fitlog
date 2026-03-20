import { describe, it, expect, vi } from 'vitest';
import { emit, on, once, Events } from '../src/eventBus';

describe('eventBus', () => {
  describe('emit + on', () => {
    it('listener receives emitted data', () => {
      const handler = vi.fn();
      const cleanup = on(Events.WORKOUT_LOGGED, handler);

      emit(Events.WORKOUT_LOGGED, { exercise: 'Squat', sets: 3 });

      expect(handler).toHaveBeenCalledOnce();
      expect(handler).toHaveBeenCalledWith({ exercise: 'Squat', sets: 3 });
      cleanup();
    });

    it('listener does not fire after cleanup', () => {
      const handler = vi.fn();
      const cleanup = on(Events.WORKOUT_LOGGED, handler);

      cleanup();
      emit(Events.WORKOUT_LOGGED, { exercise: 'Squat' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('multiple listeners receive the same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const cleanup1 = on(Events.MEAL_LOGGED, handler1);
      const cleanup2 = on(Events.MEAL_LOGGED, handler2);

      emit(Events.MEAL_LOGGED, { name: 'Chicken' });

      expect(handler1).toHaveBeenCalledOnce();
      expect(handler2).toHaveBeenCalledOnce();
      cleanup1();
      cleanup2();
    });

    it('emits without data', () => {
      const handler = vi.fn();
      const cleanup = on(Events.THEME_CHANGED, handler);

      emit(Events.THEME_CHANGED);

      expect(handler).toHaveBeenCalledWith(null);
      cleanup();
    });
  });

  describe('once', () => {
    it('fires only once then auto-removes', () => {
      const handler = vi.fn();
      once(Events.WORKOUT_LOGGED, handler);

      emit(Events.WORKOUT_LOGGED, { exercise: 'Deadlift' });
      emit(Events.WORKOUT_LOGGED, { exercise: 'Bench' });

      expect(handler).toHaveBeenCalledOnce();
      expect(handler).toHaveBeenCalledWith({ exercise: 'Deadlift' });
    });

    it('cleanup prevents the once listener from firing', () => {
      const handler = vi.fn();
      const cleanup = once(Events.MEAL_LOGGED, handler);

      cleanup();
      emit(Events.MEAL_LOGGED, { name: 'Rice' });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Events constants', () => {
    it('has expected event names', () => {
      expect(Events.WORKOUT_LOGGED).toBe('workout:logged');
      expect(Events.MEAL_LOGGED).toBe('meal:logged');
      expect(Events.THEME_CHANGED).toBe('theme:changed');
    });
  });
});
