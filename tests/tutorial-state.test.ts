import { describe, expect, it } from 'vitest';
import { completeTutorial, hasCompletedTutorial } from '../src/game/tutorial-state';

describe('tutorial persistence', () => {
  it('is pending until explicitly completed', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    expect(hasCompletedTutorial(storage)).toBe(false);
    completeTutorial(storage);
    expect(hasCompletedTutorial(storage)).toBe(true);
  });

  it('fails safely when storage is unavailable', () => {
    const storage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };

    expect(hasCompletedTutorial(storage)).toBe(false);
    expect(() => completeTutorial(storage)).not.toThrow();
  });
});
