import { describe, expect, it } from 'vitest';
import { findNearestLandmark, avatarSpawn } from '../src/game/world';

describe('findNearestLandmark', () => {
  it('returns the closest landmark within range', () => {
    expect(findNearestLandmark({ x: 0, z: 2.3 }, 7.5)).toBe('engineering-core');
    expect(findNearestLandmark({ x: -14, z: -6 }, 7.5)).toBe('cassems');
  });

  it('returns null when nothing is within range', () => {
    expect(findNearestLandmark(avatarSpawn, 7.5)).toBeNull();
  });

  it('honors a custom range', () => {
    expect(findNearestLandmark({ x: -14, z: -6 }, 3)).toBeNull();
    expect(findNearestLandmark({ x: -14, z: -6 }, 5)).toBe('cassems');
  });
});