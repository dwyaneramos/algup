export const SATELLITE_SIZE = 52;
export const MAIN_SIZE = 64;
export const GAP = 12;
export const SATELLITE_HIT_SLOP = 12;
export const HORIZONTAL_CENTER_OFFSET = 5;

export const SATELLITE_BOTTOM_OFFSET = MAIN_SIZE - SATELLITE_SIZE;

export function getSatelliteDistance(index: number): number {
  return (SATELLITE_SIZE + GAP) * (index + 1);
}

export function getFabContainerHeight(satelliteCount: number): number {
  return (
    SATELLITE_BOTTOM_OFFSET +
    getSatelliteDistance(satelliteCount - 1) +
    SATELLITE_SIZE +
    SATELLITE_HIT_SLOP
  );
}
