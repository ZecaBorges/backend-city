import { describe, expect, it } from 'vitest';
import { getCameraTarget, getCameraZoom } from '../src/game/camera';

describe('getCameraTarget', () => {
  it('uses the avatar in explore mode', () => {
    expect(getCameraTarget('explore', 'cassems', { x: 3, z: 7 })).toEqual({ x: 3, y: 1, z: 7 });
    expect(getCameraTarget('explore', 'pluxxe', { x: 3, z: 7 })).toEqual({ x: 3, y: 1, z: 7 });
  });

  it('uses landmarks during tour and overview in menu', () => {
    expect(getCameraTarget('tour', 'pluxxe', { x: 3, z: 7 })).toEqual({ x: 14, y: 1.2, z: -11 });
    expect(getCameraTarget('menu', 'pluxxe', { x: 3, z: 7 })).toEqual({ x: 0, y: 0.6, z: 1 });
  });
});

describe('getCameraZoom', () => {
  it('fits the expanded campus in overview and keeps exploration closer', () => {
    expect(getCameraZoom('menu', 1366, 768)).toBeLessThan(getCameraZoom('explore', 1366, 768));
    expect(getCameraZoom('menu', 390, 844)).toBeLessThan(getCameraZoom('explore', 390, 844));
  });

  it('accounts for short and narrow viewports', () => {
    expect(getCameraZoom('menu', 1366, 600)).toBeLessThan(getCameraZoom('menu', 1366, 1000));
    expect(getCameraZoom('menu', 390, 844)).toBeGreaterThanOrEqual(3.5);
  });
});
