export interface IceScore {
  impact: number;
  confidence: number;
  effort: number;
}

export type IceField = keyof IceScore;

export type IcePriority = 'high' | 'medium' | 'low';

// IceScoreDraft representa valores ICE que el usuario aun puede no haber indicado.
export type IceScoreDraft = Record<IceField, number | null>;
