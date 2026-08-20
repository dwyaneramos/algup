import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  getCasesWithProgress,
  updateCaseProgress,
  introduceNextCase,
  recordPractice,
  updateLastPracticed,
} from '@/src/db/queries';
import {
  pickNextCase,
  getNextState,
  shouldIntroduceNewCase,
  getUpdatedFluency,
  applyDecay,
} from '@/src/logic/caseQueue';
import { generateScrambleFromAlg } from '@/src/logic/scramble';
import { setPendingItem, consumePendingItem } from '@/src/logic/pendingScramble';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useAlgSetStore } from '@/src/store/algsetStore';
import type {
  CaseWithProgress,
  PendingScrambleItem,
  CubeEvent,
  ScrambleSolutionPair,
} from '@/types';

async function loadActiveCases(algset: string): Promise<CaseWithProgress[]> {
  let cases = applyDecay(await getCasesWithProgress(algset));
  const hasActive = cases.some((c) => c.state !== 'locked');
  if (!hasActive) {
    introduceNextCase(algset);
    introduceNextCase(algset);
    introduceNextCase(algset);
    cases = await getCasesWithProgress(algset);
  }
  return cases;
}

function matchCaseForItem(
  cases: CaseWithProgress[],
  item: PendingScrambleItem
): CaseWithProgress | null {
  return (
    cases.find((c) => c.id === item.caseId) ??
    cases.find((c) => c.alg === item.alg) ??
    pickNextCase(cases)
  );
}

async function fetchFreshScramble(
  alg: string,
  event: CubeEvent,
  algset: string,
  errorLabel: string
): Promise<ScrambleSolutionPair | null> {
  try {
    return await generateScrambleFromAlg(alg, event);
  } catch (err) {
    console.error(`[Algset: ${algset}] Failed to generate ${errorLabel} scramble:`, err);
    return null;
  }
}

export function useTrainingSession(algset: string) {
  const maxActive = useSettingsStore((s) => s.maxActive);
  const maxLearning = useSettingsStore((s) => s.maxLearning);
  const event = useAlgSetStore((s) => s.selectedAlgSet?.event ?? '333');
  const [cases, setCases] = useState<CaseWithProgress[]>([]);
  const [currentCase, setCurrentCase] = useState<CaseWithProgress | null>(null);
  const [scramble, setScramble] = useState('');
  const [solution, setSolution] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const currentItem = useRef<PendingScrambleItem | null>(null);

  const resumeSession = useCallback(async () => {
    const active = await loadActiveCases(algset);
    setCases(active);

    const pending = consumePendingItem(algset);
    if (pending) {
      setCurrentCase(matchCaseForItem(active, pending));
      setScramble(pending.scramble);
      setSolution(pending.solution);
      currentItem.current = pending;
      console.log(`[Algset: ${algset}] Restored pending item for caseId=${pending.caseId}`);
    } else {
      const firstCase = pickNextCase(active);
      setCurrentCase(firstCase);
      if (firstCase) {
        setIsLoading(true);
        const fetched = await fetchFreshScramble(firstCase.alg, event, algset, 'initial');
        if (fetched) {
          setScramble(fetched.scramble);
          setSolution(fetched.solution);
          currentItem.current = { caseId: firstCase.id, alg: firstCase.alg, ...fetched };
        }
        setIsLoading(false);
      }
    }
  }, [algset, event]);

  useFocusEffect(
    useCallback(() => {
      if (!algset) return;
      resumeSession();

      return () => {
        if (currentItem.current) {
          console.log(
            `[Algset: ${algset}] Storing pending item for caseId=${currentItem.current.caseId}`
          );
          setPendingItem(algset, currentItem.current);
          currentItem.current = null;
        }
      };
    }, [algset, resumeSession])
  );

  const advanceToNextCase = async (updatedCases: CaseWithProgress[], excludeCaseId: number) => {
    const nextCase = pickNextCase(updatedCases, excludeCaseId);
    setCurrentCase(nextCase);
    if (nextCase) {
      setIsLoading(true);
      const fetched = await fetchFreshScramble(nextCase.alg, event, algset, 'next');
      if (fetched) {
        setScramble(fetched.scramble);
        setSolution(fetched.solution);
        currentItem.current = { caseId: nextCase.id, alg: nextCase.alg, ...fetched };
      }
      setIsLoading(false);
    }
  };

  const submitGrade = async (grade: number) => {
    if (!currentCase) return;
    const newFluency = getUpdatedFluency(currentCase.fluency, grade);
    const newState = getNextState(currentCase.state, newFluency);
    updateCaseProgress(currentCase.id, newFluency, newState);
    updateLastPracticed(currentCase.id);
    recordPractice(algset);
    currentItem.current = null;

    let updatedCases = cases.map((c) =>
      c.id === currentCase.id ? { ...c, fluency: newFluency, state: newState } : c
    );

    if (shouldIntroduceNewCase(updatedCases, maxActive, maxLearning)) {
      introduceNextCase(algset);
      updatedCases = applyDecay(await getCasesWithProgress(algset));
    }

    setCases(updatedCases);
    await advanceToNextCase(updatedCases, currentCase.id);
  };

  return { currentCase, scramble, solution, submitGrade, isLoading };
}
