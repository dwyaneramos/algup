import { getOverallFluency } from "@/src/db/queries"

const MAX_FLUENCY_SCORE = 5;

export function getAlgSetFluencyPercentage(algsetName: string) {
  const overallFluency = getOverallFluency(algsetName);
  return (overallFluency - 1) / (MAX_FLUENCY_SCORE - 1) * 100;
}
