import type { Position2D } from './movement';
import { getLandmark, type LandmarkId } from './world';

export type CameraMode = 'menu' | 'tour' | 'explore';

export interface CameraTarget {
  x: number;
  y: number;
  z: number;
}

function clamp(minimum: number, maximum: number, value: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function getCameraZoom(mode: CameraMode, viewportWidth: number, viewportHeight: number): number {
  if (mode === 'menu') {
    return clamp(3.5, 16, Math.min(viewportWidth / 98, viewportHeight / 68));
  }
  return clamp(10, 25, Math.min(viewportWidth / 30, viewportHeight / 34));
}

export function getCameraTarget(
  mode: CameraMode,
  selectedId: LandmarkId,
  avatarPosition: Position2D,
): CameraTarget {
  if (mode === 'menu') return { x: 0, y: 0.6, z: 1 };
  if (mode === 'explore') return { x: avatarPosition.x, y: 1, z: avatarPosition.z };
  const [x, y, z] = getLandmark(selectedId).cameraTarget;
  return { x, y, z };
}
