import { describe, expect, it } from 'vitest';
import { TOUR_DURATION_MS, getTourStopAt, tourStops } from '../src/game/tour';

describe('guided tour', () => {
  it('runs for exactly 90 seconds with contiguous stops', () => {
    expect(TOUR_DURATION_MS).toBe(90_000);
    expect(tourStops.reduce((total, stop) => total + stop.durationMs, 0)).toBe(TOUR_DURATION_MS);
  });

  it('starts with impact and visits the key systems', () => {
    expect(tourStops[0].landmarkId).toBe('cassems');
    expect(tourStops.some((stop) => stop.landmarkId === 'engineering-core')).toBe(true);
    expect(tourStops.some((stop) => stop.landmarkId === 'ai-rd')).toBe(true);
  });

  it('resolves boundaries and completion deterministically', () => {
    expect(getTourStopAt(0).index).toBe(0);
    expect(getTourStopAt(tourStops[0].durationMs).index).toBe(1);
    expect(getTourStopAt(89_999).index).toBe(tourStops.length - 1);
    expect(getTourStopAt(90_000).complete).toBe(true);
  });
});
