import type { Position2D } from './movement';

export const JOYSTICK_DEAD_ZONE = 0.12;

export function computeJoystickVector(
  originX: number,
  originY: number,
  pointerX: number,
  pointerY: number,
  radius: number,
  deadZone: number = JOYSTICK_DEAD_ZONE,
): Position2D {
  let dx = (pointerX - originX) / radius;
  let dy = (pointerY - originY) / radius;
  const length = Math.hypot(dx, dy);
  if (length === 0) return { x: 0, z: 0 };
  if (length > 1) {
    dx /= length;
    dy /= length;
  }
  if (Math.hypot(dx, dy) < deadZone) return { x: 0, z: 0 };
  return { x: dx, z: dy };
}
