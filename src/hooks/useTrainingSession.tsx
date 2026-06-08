import { useState, useEffect } from 'react';
import { getCasesWithProgress, updateCaseProgress, introduceNextCase } from '@/src/db/queries';
import { pickNextCase, getNextState, shouldIntroduceNewCase, CaseWithProgress, getUpdatedConfidence } from '@/src/logic/caseQueue';
import { generateScrambleFromAlg } from '@/src/utils/scramble';


export function useTrainingSession(algset: string) {
  const [cases, setCases] = useState<CaseWithProgress[]>([]);
  const [currentCase, setCurrentCase] = useState<CaseWithProgress | null>(null);
  const [scramble, setScramble] = useState('');

  useEffect(() => {
    if (!algset) return;

    let initial = getCasesWithProgress(algset);
    const hasActive = initial.some(c => c.state !== 'locked');
    if (!hasActive) {
      introduceNextCase(algset);
      introduceNextCase(algset);
      introduceNextCase(algset);
      initial = getCasesWithProgress(algset);
    }

    setCases(initial);
    const newCase = pickNextCase(initial);
    setCurrentCase(newCase);
  }, [algset]);

  useEffect(() => {
    if (!currentCase) return;
    generateScrambleFromAlg(currentCase.alg).then(setScramble);
  }, [currentCase]);

  const submitGrade = (grade: number) => {
    if (!currentCase) return;
    const newConfidence = getUpdatedConfidence(currentCase.confidence, grade);
    const newState = getNextState(currentCase.state, newConfidence);
    updateCaseProgress(currentCase.id, newConfidence, newState);

    let updatedCases = cases.map(c =>
      c.id === currentCase.id
        ? { ...c, confidence: newConfidence, state: newState }
        : c
    );

    if (shouldIntroduceNewCase(updatedCases)) {
      introduceNextCase(algset);
      updatedCases = getCasesWithProgress(algset);
    }

    setCases(updatedCases);
    const newCase = pickNextCase(updatedCases, currentCase.id)
    setCurrentCase(newCase);
  };

  return { currentCase, scramble, submitGrade };
}
