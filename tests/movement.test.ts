import { describe, expect, it } from 'vitest';
import {
  calculateMovement,
  circleIntersectsAabb,
  isEditableTarget,
  isPositionWalkable,
} from '../src/game/movement';

const bounds = { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };
const idle = { forward: false, backward: false, left: false, right: false };

describe('calculateMovement', () => {
  it('moves with WASD directions', () => {
    expect(calculateMovement({ x: 0, z: 0 }, { ...idle, forward: true }, 0.1, 10, bounds)).toEqual({
      x: 0,
      z: -0.5,
    });
    expect(calculateMovement({ x: 0, z: 0 }, { ...idle, right: true }, 0.1, 10, bounds)).toEqual({
      x: 0.5,
      z: 0,
    });
  });

  it('normalizes diagonal movement', () => {
    const next = calculateMovement(
      { x: 0, z: 0 },
      { ...idle, forward: true, right: true },
      0.05,
      10,
      bounds,
    );

    expect(Math.hypot(next.x, next.z)).toBeCloseTo(0.5);
  });

  it('clamps long frames and world boundaries', () => {
    expect(
      calculateMovement({ x: 9.9, z: 0 }, { ...idle, right: true }, 10, 10, bounds),
    ).toEqual({ x: 10, z: 0 });
  });

  it('does not move when idle', () => {
    expect(calculateMovement({ x: 2, z: 3 }, idle, 0.05, 10, bounds)).toEqual({ x: 2, z: 3 });
  });

  it('keeps the avatar outside solid buildings', () => {
    const obstacle = { minX: 1, maxX: 3, minZ: -1, maxZ: 1 };
    const next = calculateMovement(
      { x: 0.2, z: 0 },
      { ...idle, right: true },
      0.05,
      10,
      bounds,
      { radius: 0.5, obstacles: [obstacle] },
    );

    expect(next.x).toBe(0.2);
    expect(next.z).toBe(0);
  });

  it('slides along a building when one axis is blocked', () => {
    const obstacle = { minX: 1, maxX: 3, minZ: -1, maxZ: 1 };
    const next = calculateMovement(
      { x: 0.4, z: 0 },
      { ...idle, right: true, backward: true },
      0.05,
      10,
      bounds,
      { radius: 0.5, obstacles: [obstacle] },
    );

    expect(next.x).toBe(0.4);
    expect(next.z).toBeGreaterThan(0);
  });

  it('respects avatar radius at world boundaries', () => {
    const next = calculateMovement(
      { x: 9.4, z: 0 },
      { ...idle, right: true },
      0.05,
      10,
      bounds,
      { radius: 0.5, obstacles: [] },
    );

    expect(next.x).toBe(9.5);
  });
});

describe('circleIntersectsAabb', () => {
  const box = { minX: 1, maxX: 3, minZ: 1, maxZ: 3 };

  it('detects face and corner overlap', () => {
    expect(circleIntersectsAabb({ x: 0.7, z: 2 }, 0.5, box)).toBe(true);
    expect(circleIntersectsAabb({ x: 0.7, z: 0.7 }, 0.5, box)).toBe(true);
  });

  it('allows exact tangency and separated circles', () => {
    expect(circleIntersectsAabb({ x: 0.5, z: 2 }, 0.5, box)).toBe(false);
    expect(circleIntersectsAabb({ x: -1, z: -1 }, 0.5, box)).toBe(false);
  });
});

describe('isPositionWalkable', () => {
  const obstacle = { minX: 1, maxX: 3, minZ: 1, maxZ: 3 };

  it('accepts clear positions and rejects colliders', () => {
    expect(isPositionWalkable({ x: 0, z: 0 }, bounds, { radius: 0.5, obstacles: [obstacle] })).toBe(true);
    expect(isPositionWalkable({ x: 1.2, z: 2 }, bounds, { radius: 0.5, obstacles: [obstacle] })).toBe(false);
  });

  it('respects radius-adjusted world bounds', () => {
    expect(isPositionWalkable({ x: 9.5, z: 0 }, bounds, { radius: 0.5, obstacles: [] })).toBe(true);
    expect(isPositionWalkable({ x: 9.6, z: 0 }, bounds, { radius: 0.5, obstacles: [] })).toBe(false);
  });
});

describe('isEditableTarget', () => {
  it('protects interactive controls from game keyboard capture', () => {
    expect(isEditableTarget(document.createElement('button'))).toBe(true);
    expect(isEditableTarget(document.createElement('input'))).toBe(true);
    expect(isEditableTarget(document.createElement('div'))).toBe(false);
  });
});
