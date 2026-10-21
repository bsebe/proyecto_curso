import type { IcePriority } from '../types/IceScore';

export const HIGH_PRIORITY_MIN_ICE = 10;
export const MEDIUM_PRIORITY_MIN_ICE = 5;

// getIcePriority clasifica una puntuación ICE en prioridad alta, media o baja.
export function getIcePriority(score: number): IcePriority {
  if (score >= HIGH_PRIORITY_MIN_ICE) {
    return 'high';
  }

  if (score >= MEDIUM_PRIORITY_MIN_ICE) {
    return 'medium';
  }

  return 'low';
}
