import { describe, expect, it } from 'vitest';
import { experiences, metrics, profile } from '../src/data/resume';
import {
  avatarCollisionRadius,
  avatarSpawn,
  campusPaths,
  campusProps,
  worldBounds,
  resolveFastTravelDestination,
  worldColliders,
  worldLandmarks,
} from '../src/game/world';
import { circleIntersectsAabb } from '../src/game/movement';
import { isPositionWalkable } from '../src/game/movement';

describe('resume data', () => {
  it('contains the essential recruiter-first information', () => {
    expect(profile.name).toBe('José Emanuel Borges');
    expect(profile.title).toBe('Senior Backend Engineer');
    expect(metrics.some((metric) => metric.value === '5h → 12min')).toBe(true);
    expect(experiences).toHaveLength(5);
  });

  it('exposes the current WhatsApp as a canonical contact channel', () => {
    expect(profile.whatsapp.display).toBe('+55 87 98827-1297');
    expect(profile.whatsapp.url).toBe('https://wa.me/5587988271297');
  });

  it('uses unique experience ids linked to every career building', () => {
    const ids = experiences.map((experience) => experience.id);
    expect(new Set(ids).size).toBe(ids.length);
    const careerIds = worldLandmarks.filter((landmark) => landmark.experienceId).map((landmark) => landmark.id);
    expect(careerIds.sort()).toEqual([...ids].sort());
  });

  it('has complete experience content', () => {
    for (const experience of experiences) {
      expect(experience.company.trim()).not.toBe('');
      expect(experience.summary.length).toBeGreaterThan(30);
      expect(experience.achievements.length).toBeGreaterThanOrEqual(2);
      expect(experience.technologies.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('shows project seniority only for CASSEMS', () => {
    expect(experiences.find((experience) => experience.id === 'cassems')?.role).toContain('Sênior');
    for (const experience of experiences.filter((item) => item.id !== 'cassems')) {
      expect(experience.role).not.toMatch(/Sênior|Senior/i);
    }
  });

  it('includes platform and future districts with valid collision data', () => {
    expect(worldLandmarks.some((landmark) => landmark.id === 'engineering-core')).toBe(true);
    expect(worldLandmarks.some((landmark) => landmark.id === 'ai-rd' && landmark.status === 'blueprint')).toBe(true);
    expect(new Set(worldLandmarks.map((landmark) => landmark.id)).size).toBe(worldLandmarks.length);
    expect(worldColliders.length).toBeGreaterThanOrEqual(worldLandmarks.length);
    expect(worldColliders.every((box) => box.minX < box.maxX && box.minZ < box.maxZ)).toBe(true);
  });

  it('spaces the campus districts apart and provides each campus prop type', () => {
    for (let index = 0; index < worldLandmarks.length; index += 1) {
      for (let otherIndex = index + 1; otherIndex < worldLandmarks.length; otherIndex += 1) {
        const current = worldLandmarks[index].position;
        const other = worldLandmarks[otherIndex].position;
        expect(Math.hypot(current[0] - other[0], current[2] - other[2])).toBeGreaterThan(10);
      }
    }
    expect(new Set(campusProps.map((prop) => prop.id)).size).toBe(campusProps.length);
    expect(new Set(campusProps.map((prop) => prop.kind))).toEqual(new Set(['tree', 'bench', 'fountain']));
    const trees = campusProps.filter((prop) => prop.kind === 'tree');
    const benches = campusProps.filter((prop) => prop.kind === 'bench');
    expect(trees.length).toBeGreaterThanOrEqual(12);
    expect(benches.length).toBeGreaterThanOrEqual(8);
    expect(Math.max(...trees.map((tree) => tree.position[0])) - Math.min(...trees.map((tree) => tree.position[0]))).toBeGreaterThan(40);
    expect(Math.max(...trees.map((tree) => tree.position[2])) - Math.min(...trees.map((tree) => tree.position[2]))).toBeGreaterThan(35);
  });

  it('keeps the avatar spawn outside every solid landmark', () => {
    expect(
      worldColliders.some((box) => circleIntersectsAabb(avatarSpawn, avatarCollisionRadius, box)),
    ).toBe(false);
  });

  it('covers the visible trust ring and engineering pylons with collision footprints', () => {
    const trust = worldLandmarks.find((landmark) => landmark.id === 'visavale')!;
    const core = worldLandmarks.find((landmark) => landmark.id === 'engineering-core')!;
    expect(trust.collisionSize?.[0]).toBeGreaterThanOrEqual(7.1);
    expect(core.collisionSize?.[0]).toBeGreaterThanOrEqual(6.4);
  });

  it('provides a safe and nearby fast-travel entry for every landmark', () => {
    for (const landmark of worldLandmarks) {
      expect(
        isPositionWalkable(landmark.entryPoint, worldBounds, {
          radius: avatarCollisionRadius,
          obstacles: worldColliders,
        }),
      ).toBe(true);
      expect(Math.hypot(landmark.entryPoint.x - landmark.position[0], landmark.entryPoint.z - landmark.position[2])).toBeLessThan(7.5);
      expect(campusPaths.some((path) => {
        const halfWidth = path.size[0] / 2;
        const halfDepth = path.size[2] / 2;
        return landmark.entryPoint.x >= path.position[0] - halfWidth
          && landmark.entryPoint.x <= path.position[0] + halfWidth
          && landmark.entryPoint.z >= path.position[2] - halfDepth
          && landmark.entryPoint.z <= path.position[2] + halfDepth;
      })).toBe(true);
    }
  });

  it('resolves each fast-travel command only once', () => {
    const request = { landmarkId: 'pluxxe' as const, sequence: 3 };
    expect(resolveFastTravelDestination(request, 2)).toEqual({ x: 15, z: -8.8 });
    expect(resolveFastTravelDestination(request, 3)).toBeNull();
  });
});
