import { getAverageConfidence } from "@/src/db/queries"

const MAX_CONFIDENCE_SCORE = 5;

export function getAlgSetConfidencePercentage(algsetName: string) {
  const averageConfidence = getAverageConfidence(algsetName);
  return (averageConfidence - 1) / (MAX_CONFIDENCE_SCORE - 1) * 100;
}
