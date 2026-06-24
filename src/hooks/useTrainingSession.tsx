import { useState, useEffect } from 'react';
import { getCasesWithProgress, updateCaseProgress, introduceNextCase } from '@/src/db/queries';
import { pickNextCase, getNextState, shouldIntroduceNewCase, CaseWithProgress, getUpdatedFluency } from '@/src/logic/caseQueue';
import { generateScrambleFromAlg } from '@/src/utils/scramble';

export function useTrainingSession(algset: string) {
  const [cases, setCases] = useState<CaseWithProgress[]>([]);
  const [currentCase, setCurrentCase] = useState<CaseWithProgress | null>(null);
  const [scramble, setScramble] = useState('');
  const [solution, setSolution] = useState('');

  useEffect(() => {
    if (!algset) return;
    (async () => {
      let initial = await getCasesWithProgress(algset);
      const hasActive = initial.some(c => c.state !== 'locked');
      if (!hasActive) {
        introduceNextCase(algset);
        introduceNextCase(algset);
        introduceNextCase(algset);
        initial = await getCasesWithProgress(algset);
      }
      setCases(initial);
      setCurrentCase(pickNextCase(initial));
    })();
  }, [algset]);

  useEffect(() => {
    if (!currentCase) return;
    (async () => {
      const { scramble, solution } = await generateScrambleFromAlg(currentCase.alg);
      setScramble(scramble);
      setSolution(solution);
    })();
  }, [currentCase]);

  const submitGrade = async (grade: number) => {
    if (!currentCase) return;
    const newFluency = getUpdatedFluency(currentCase.fluency, grade);
    const newState = getNextState(currentCase.state, newFluency);
    updateCaseProgress(currentCase.id, newFluency, newState);

    let updatedCases = cases.map(c =>
      c.id === currentCase.id
        ? { ...c, fluency: newFluency, state: newState }
        : c
    );

    if (shouldIntroduceNewCase(updatedCases)) {
      introduceNextCase(algset);
      updatedCases = await getCasesWithProgress(algset);
    }

    setCases(updatedCases);
    setCurrentCase(pickNextCase(updatedCases, currentCase.id));
  };

  return { currentCase, scramble, solution, submitGrade };
}
