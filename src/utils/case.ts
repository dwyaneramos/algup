import { getCases, getFirstCase, getCasesWithProgress, getWorstCases } from "@/src/db/queries";
import { type Case } from "@/src/logic/algsets";
import type { CaseWithProgress } from "@/src/logic/caseQueue";

export async function getRandomCase(algsetName: string): Promise<Case> {
  const cases = getCases(algsetName);
  const i = Math.floor(Math.random() * cases.length);
  return cases[i];
}

export async function getAllCasesWithProgress(algsetName: string): Promise<CaseWithProgress[]> {
  const cases = await getCasesWithProgress(algsetName);
  return cases;
}

export async function getNWorstCases(algsetName: string, n: number): Promise<CaseWithProgress[]> {
  const cases = getWorstCases(algsetName, n);
  return cases;
}

export async function getDisplayCaseScramble(algsetName: string): Promise<string> {
  const displayCase = getFirstCase(algsetName);
  if (displayCase === null) return '';

  return displayCase.alg;
}
