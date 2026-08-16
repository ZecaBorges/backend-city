import { describe, expect, it, vi } from 'vitest';
import { avatarSpawn, campusProps, findNearestLandmark, getDossierDismissalState, worldLandmarks } from '../src/game/world';
import { getSignPresentation } from '../src/game/signage';
import { createDeterministicPositions, createSeededRandom, deterministicIndex } from '../src/game/random';

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

describe('world presentation', () => {
  it('keeps every sign above its building and facing the fixed camera angle', () => {
    for (const landmark of worldLandmarks) {
      expect(landmark.signage.rotationY).toBe(Math.PI / 4);
      expect(landmark.signage.position[1]).toBeGreaterThan(landmark.size[1] / 2);
      expect(landmark.signage.panelWidth).toBeGreaterThan(0);
    }
  });

  it('uses all three vegetation variants without random global state', () => {
    const randomSpy = vi.spyOn(Math, 'random');
    const variants = campusProps
      .filter((prop) => prop.kind === 'tree')
      .map((prop) => prop.variant);

    expect(new Set(variants)).toEqual(new Set(['small-wide', 'medium', 'tall-narrow']));
    expect(randomSpy).not.toHaveBeenCalled();
    randomSpy.mockRestore();
  });
});

describe('sign presentation', () => {
  it('uses discreet short labels in the overview', () => {
    expect(getSignPresentation('menu', false, false)).toEqual({
      visible: true,
      shortLabel: true,
      panel: false,
      period: false,
      connector: false,
    });
  });

  it('focuses selected signs in explore, tour and mobile modes', () => {
    expect(getSignPresentation('explore', false, false)).toEqual({
      visible: true,
      shortLabel: true,
      panel: true,
      period: false,
      connector: false,
    });
    expect(getSignPresentation('tour', false, false).visible).toBe(false);
    expect(getSignPresentation('tour', true, false)).toMatchObject({ visible: true, shortLabel: false, period: true, connector: true });
    expect(getSignPresentation('explore', false, true).visible).toBe(false);
    expect(getSignPresentation('explore', true, true)).toMatchObject({ visible: true, shortLabel: false, period: true });
  });
});

describe('deterministic random helpers', () => {
  it('replays the same seeded sequence and resolves stable indexes', () => {
    const first = createSeededRandom(42);
    const second = createSeededRandom(42);

    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
    expect([createSeededRandom(42)(), deterministicIndex('tree-health', 1000, 42)]).toEqual([0.6011037519201636, 323]);
  });

  it('generates stable particle positions inside configured ranges', () => {
    const ranges = [[-30, 30], [1, 9], [-24, 26]] as const;
    const first = createDeterministicPositions(16, 0xa81e17, ranges);
    const second = createDeterministicPositions(16, 0xa81e17, ranges);

    expect(first).toEqual(second);
    expect(first).toHaveLength(48);
    expect(Array.from(first).every((value, index) => value >= ranges[index % 3][0] && value <= ranges[index % 3][1])).toBe(true);
  });
});

describe('dossier proximity', () => {
  it('arms only after approaching and can repeat after reopening', () => {
    expect(getDossierDismissalState(20, false)).toEqual({ armed: false, shouldDismiss: false });
    const nearby = getDossierDismissalState(4, false);
    expect(nearby).toEqual({ armed: true, shouldDismiss: false });
    expect(getDossierDismissalState(20, nearby.armed)).toEqual({ armed: true, shouldDismiss: true });

    const reopened = getDossierDismissalState(20, false);
    expect(reopened.shouldDismiss).toBe(false);
    expect(getDossierDismissalState(20, getDossierDismissalState(4, reopened.armed).armed).shouldDismiss).toBe(true);
  });
});
