import { getOverallConfidence } from "@/src/db/queries"

const MAX_CONFIDENCE_SCORE = 5;

export function getAlgSetConfidencePercentage(algsetName: string) {
  const overallConfidence = getOverallConfidence(algsetName);
  return (overallConfidence - 1) / (MAX_CONFIDENCE_SCORE - 1) * 100;
}
