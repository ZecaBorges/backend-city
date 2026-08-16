import { describe, expect, it } from 'vitest';
import { getCameraFrameOffset, getCameraTarget, getCameraZoom } from '../src/game/camera';

describe('getCameraTarget', () => {
  it('uses the avatar in explore mode', () => {
    expect(getCameraTarget('explore', 'cassems', { x: 3, z: 7 })).toEqual({ x: 3, y: 1, z: 7 });
    expect(getCameraTarget('explore', 'pluxxe', { x: 3, z: 7 })).toEqual({ x: 3, y: 1, z: 7 });
  });

  it('uses landmarks during tour and overview in menu', () => {
    expect(getCameraTarget('tour', 'pluxxe', { x: 3, z: 7 })).toEqual({ x: 14, y: 7.4, z: -11 });
    expect(getCameraTarget('menu', 'pluxxe', { x: 3, z: 7 })).toEqual({ x: 0, y: 0.6, z: 1 });
  });

  it('shifts desktop framing away from an open dossier', () => {
    expect(getCameraFrameOffset('explore', true, 1366)).toEqual({ x: 3.2, z: -3.2 });
    expect(getCameraFrameOffset('explore', false, 1366)).toEqual({ x: 0, z: 0 });
    expect(getCameraFrameOffset('explore', true, 950)).toEqual({ x: 0, z: 0 });
    expect(getCameraFrameOffset('explore', true, 768)).toEqual({ x: 0, z: 0 });
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
    expect(getCameraZoom('explore', 390, 844)).toBeGreaterThan(390 / 30);
  });
});
