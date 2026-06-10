import { getOverallFluency } from "@/src/db/queries"

const MAX_FLUENCY_SCORE = 5;

export function getAlgSetFluencyPercentage(algsetName: string) {
  const overallFluency = getOverallFluency(algsetName);
  return convertScoreToPercentage(overallFluency);
}

export function convertScoreToPercentage(score: number) {
  return (score - 1) / (MAX_FLUENCY_SCORE - 1) * 100;
}
