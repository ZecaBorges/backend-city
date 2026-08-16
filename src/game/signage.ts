import type { CameraMode } from './camera';

export interface SignPresentation {
  visible: boolean;
  shortLabel: boolean;
  panel: boolean;
  period: boolean;
  connector: boolean;
}

export function getSignPresentation(
  mode: CameraMode,
  selected: boolean,
  mobile: boolean,
): SignPresentation {
  if (mobile) {
    return {
      visible: selected,
      shortLabel: false,
      panel: selected,
      period: selected,
      connector: selected,
    };
  }
  if (mode === 'menu') {
    return { visible: true, shortLabel: true, panel: false, period: false, connector: false };
  }
  if (mode === 'tour') {
    return {
      visible: selected,
      shortLabel: false,
      panel: selected,
      period: selected,
      connector: selected,
    };
  }
  return {
    visible: true,
    shortLabel: !selected,
    panel: true,
    period: selected,
    connector: selected,
  };
}
