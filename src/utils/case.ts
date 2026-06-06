import { getCases } from "@/src/db/queries";
import { type Case } from "@/src/logic/algsets";

export async function getRandomCase(algsetName: string): Promise<Case> {
  const cases = getCases(algsetName);
  const i = Math.floor(Math.random() * cases.length)
  return cases[i]

}
