export interface MovementKeys {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export interface Position2D {
  x: number;
  z: number;
}

export interface Bounds2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface Aabb2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface MovementCollisionOptions {
  radius: number;
  obstacles: readonly Aabb2D[];
}

export function circleIntersectsAabb(center: Position2D, radius: number, box: Aabb2D): boolean {
  const nearestX = Math.max(box.minX, Math.min(center.x, box.maxX));
  const nearestZ = Math.max(box.minZ, Math.min(center.z, box.maxZ));
  const distanceX = center.x - nearestX;
  const distanceZ = center.z - nearestZ;
  return distanceX * distanceX + distanceZ * distanceZ < radius * radius;
}

export function isPositionWalkable(
  position: Position2D,
  bounds: Bounds2D,
  collision: MovementCollisionOptions,
): boolean {
  const { radius, obstacles } = collision;
  const insideBounds =
    position.x >= bounds.minX + radius &&
    position.x <= bounds.maxX - radius &&
    position.z >= bounds.minZ + radius &&
    position.z <= bounds.maxZ - radius;
  return insideBounds && !obstacles.some((box) => circleIntersectsAabb(position, radius, box));
}

export function calculateMovement(
  position: Position2D,
  keys: MovementKeys,
  delta: number,
  speed: number,
  bounds: Bounds2D,
  collision?: MovementCollisionOptions,
  analog?: Position2D,
): Position2D {
  let xAxis = Number(keys.right) - Number(keys.left);
  let zAxis = Number(keys.backward) - Number(keys.forward);

  if (analog && (analog.x !== 0 || analog.z !== 0)) {
    xAxis = analog.x;
    zAxis = analog.z;
  }

  const length = Math.hypot(xAxis, zAxis);
  if (length > 0) {
    xAxis /= length;
    zAxis /= length;
  }

  const magnitude = analog && (analog.x !== 0 || analog.z !== 0) ? Math.min(1, Math.hypot(analog.x, analog.z)) : 1;
  const safeDelta = Math.min(Math.max(delta, 0), 0.05);

  const radius = collision?.radius ?? 0;
  const minX = bounds.minX + radius;
  const maxX = bounds.maxX - radius;
  const minZ = bounds.minZ + radius;
  const maxZ = bounds.maxZ - radius;
  const intendedX = Math.min(maxX, Math.max(minX, position.x + xAxis * speed * safeDelta * magnitude));
  const intendedZ = Math.min(maxZ, Math.max(minZ, position.z + zAxis * speed * safeDelta * magnitude));

  if (!collision) return { x: intendedX, z: intendedZ };

  const xCandidate = { x: intendedX, z: position.z };
  const acceptedX = collision.obstacles.some((box) => circleIntersectsAabb(xCandidate, radius, box))
    ? position.x
    : intendedX;
  const zCandidate = { x: acceptedX, z: intendedZ };
  const acceptedZ = collision.obstacles.some((box) => circleIntersectsAabb(zCandidate, radius, box))
    ? position.z
    : intendedZ;

  return { x: acceptedX, z: acceptedZ };
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
}
