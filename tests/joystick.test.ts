import { describe, expect, it } from 'vitest';
import { computeJoystickVector, JOYSTICK_DEAD_ZONE } from '../src/game/joystick';

const radius = 32;
const origin = { x: 100, y: 200 };

describe('computeJoystickVector', () => {
  it('returns zero at the origin', () => {
    expect(computeJoystickVector(origin.x, origin.y, origin.x, origin.y, radius)).toEqual({ x: 0, z: 0 });
  });

  it('maps screen deltas to world axes with inverted Y (up = forward)', () => {
    expect(computeJoystickVector(origin.x, origin.y, origin.x + 16, origin.y, radius)).toEqual({ x: 0.5, z: 0 });
    expect(computeJoystickVector(origin.x, origin.y, origin.x, origin.y - 16, radius)).toEqual({ x: 0, z: -0.5 });
  });

  it('keeps proportional magnitude on partial diagonal deflection', () => {
    const vector = computeJoystickVector(origin.x, origin.y, origin.x + 16, origin.y - 16, radius);
    expect(vector.x).toBeCloseTo(0.5);
    expect(vector.z).toBeCloseTo(-0.5);
    expect(Math.hypot(vector.x, vector.z)).toBeCloseTo(Math.hypot(0.5, -0.5));
  });

  it('clamps input beyond the radius to magnitude one', () => {
    const vector = computeJoystickVector(origin.x, origin.y, origin.x + 200, origin.y, radius);
    expect(Math.hypot(vector.x, vector.z)).toBeCloseTo(1);
    expect(vector.x).toBe(1);
  });

  it('applies the dead zone', () => {
    expect(computeJoystickVector(origin.x, origin.y, origin.x + radius * 0.1, origin.y, radius, JOYSTICK_DEAD_ZONE)).toEqual({ x: 0, z: 0 });
    const outside = computeJoystickVector(origin.x, origin.y, origin.x + radius * 0.2, origin.y, radius, JOYSTICK_DEAD_ZONE);
    expect(outside.x).toBeCloseTo(0.2);
    expect(outside.z).toBe(0);
  });
});