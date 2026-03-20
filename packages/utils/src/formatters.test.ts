import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatCalories,
  formatWeight,
  formatDuration,
  formatRelativeTime,
} from '../src/formatters';

describe('formatters', () => {
  describe('formatNumber', () => {
    it('adds commas to large numbers', () => {
      expect(formatNumber(1500)).toBe('1,500');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('handles zero', () => {
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatCalories', () => {
    it('formats with cal suffix', () => {
      expect(formatCalories(1500)).toBe('1,500 cal');
      expect(formatCalories(0)).toBe('0 cal');
    });
  });

  describe('formatWeight', () => {
    it('formats metric (kg)', () => {
      expect(formatWeight(80, 'metric')).toBe('80.0 kg');
    });

    it('formats imperial (lbs)', () => {
      expect(formatWeight(80, 'imperial')).toBe('176.4 lbs');
    });

    it('defaults to metric', () => {
      expect(formatWeight(60)).toBe('60.0 kg');
    });
  });

  describe('formatDuration', () => {
    it('formats minutes under 60', () => {
      expect(formatDuration(45)).toBe('45 min');
    });

    it('formats hours', () => {
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(120)).toBe('2h');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns "Just now" for recent dates', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('Just now');
    });

    it('returns minutes for recent past', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60000);
      expect(formatRelativeTime(fiveMinAgo)).toBe('5m ago');
    });

    it('returns hours for same day', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 3600000);
      expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
    });

    it('accepts ISO string input', () => {
      const now = new Date();
      expect(formatRelativeTime(now.toISOString())).toBe('Just now');
    });
  });
});
