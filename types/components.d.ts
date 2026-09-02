import type { ComponentType } from 'react';

export type SheetRef = {
  present: () => void;
  dismiss: () => void;
};

export type FabRef = {
  close: () => void;
};

export type IconComponent = ComponentType<{ color?: string; size?: number }>;

export type SatelliteAction = {
  key: string;
  icon: IconComponent;
  onPress: () => void;
  backgroundColor?: string;
};
