import { getCases, getFirstCase } from "@/src/db/queries";
import { type Case } from "@/src/logic/algsets";

export async function getRandomCase(algsetName: string): Promise<Case> {
  const cases = getCases(algsetName);
  const i = Math.floor(Math.random() * cases.length);
  return cases[i];
}

export async function getAllCases(algsetName: string): Promise<Case[]> {
  const cases = getCases(algsetName);
  return cases;
}

export async function getDisplayCaseScramble(algsetName: string): Promise<string> {
  const displayCase = getFirstCase(algsetName);
  if (displayCase === null) return '';

  return displayCase.alg;
}
