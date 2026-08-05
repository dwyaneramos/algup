import {
  MAIN_SIZE,
  SATELLITE_SIZE,
  SATELLITE_HIT_SLOP,
  SATELLITE_BOTTOM_OFFSET,
  getSatelliteDistance,
  getFabContainerHeight,
} from '@/components/fabLayout';

describe('fab layout', () => {
  const counts = [1, 2, 3, 4];

  it.each(counts)('contains every satellite of a %i-action menu when open', (count) => {
    const height = getFabContainerHeight(count);

    for (let index = 0; index < count; index++) {
      const bottom = SATELLITE_BOTTOM_OFFSET + getSatelliteDistance(index);
      const top = bottom + SATELLITE_SIZE;

      expect(bottom - SATELLITE_HIT_SLOP).toBeGreaterThanOrEqual(0);
      expect(top + SATELLITE_HIT_SLOP).toBeLessThanOrEqual(height);
    }
  });

  it('keeps the main button inside the container', () => {
    expect(getFabContainerHeight(3)).toBeGreaterThanOrEqual(MAIN_SIZE);
  });

  it('stacks satellites without overlapping', () => {
    expect(getSatelliteDistance(1) - getSatelliteDistance(0)).toBeGreaterThanOrEqual(
      SATELLITE_SIZE
    );
  });
});
