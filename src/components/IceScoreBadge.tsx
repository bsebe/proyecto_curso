import { Chip } from '@mui/material';

import { getIcePriority } from '../utils/getIcePriority';

import type { IcePriority } from '../types/IceScore';
import type { ChipProps } from '@mui/material';

const PRIORITY_COLORS: Record<IcePriority, ChipProps['color']> = {
  high: 'success',
  low: 'error',
  medium: 'warning',
};

interface IceScoreBadgeProps {
  score: number | null;
  muted?: boolean;
}

// formatIceScore muestra la puntuación ICE con un decimal solo si hace falta, o un guion si aún no existe.
function formatIceScore(score: number | null): string {
  return score === null ? 'ICE —' : `ICE ${Number(score.toFixed(1))}`;
}

// getBadgeColor devuelve el color del tema según la prioridad, o gris si no hay puntuación o está atenuada.
function getBadgeColor(
  score: number | null,
  muted: boolean,
): ChipProps['color'] {
  return score === null || muted
    ? 'default'
    : PRIORITY_COLORS[getIcePriority(score)];
}

// IceScoreBadge muestra la puntuación ICE con el color de su prioridad.
function IceScoreBadge({ score, muted = false }: IceScoreBadgeProps) {
  return (
    <Chip
      color={getBadgeColor(score, muted)}
      label={formatIceScore(score)}
      size="small"
      sx={{ fontWeight: 700 }}
    />
  );
}

export default IceScoreBadge;
