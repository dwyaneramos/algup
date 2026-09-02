import { useState, useCallback, useRef } from 'react';
import { InteractionManager } from 'react-native';
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
  let cases = await getCasesWithProgress(algset);
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

// Scramble generation is synchronous, CPU-heavy work - without waiting here,
// the "Loading scramble..." state set right before it would never actually
// get painted, since JS drains all pending work before it can render a frame.
function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => InteractionManager.runAfterInteractions(() => resolve()));
}

async function fetchFreshScramble(
  alg: string,
  event: CubeEvent,
  algset: string,
  errorLabel: string,
  scrambleWithAUF: boolean = false
): Promise<ScrambleSolutionPair | null> {
  try {
    const result = await generateScrambleFromAlg(alg, event, scrambleWithAUF);
    if (result.scramble === '') {
      console.error(`[Algset: ${algset}] Exhausted retries generating ${errorLabel} scramble`);
      alert('Something went wrong generating a scramble. Please refresh the app.');
      return null;
    }
    return result;
  } catch (err) {
    console.error(`[Algset: ${algset}] Failed to generate ${errorLabel} scramble:`, err);
    return null;
  }
}

export function useTrainingSession(algset: string) {
  const maxActive = useSettingsStore((s) => s.maxActive);
  const maxLearning = useSettingsStore((s) => s.maxLearning);

  const scrambleWithAUF = useSettingsStore(s => s.scrambleWithAUF);
  const event = useAlgSetStore((s) => s.selectedAlgSet?.event ?? '333');
  const [cases, setCases] = useState<CaseWithProgress[]>([]);
  const [currentCase, setCurrentCase] = useState<CaseWithProgress | null>(null);
  const [scramble, setScramble] = useState('');
  const [solution, setSolution] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const currentItem = useRef<PendingScrambleItem | null>(null);

  const resumeSession = useCallback(async () => {
    // Set loading (and let it paint) before any of the potentially heavy,
    // synchronous work below runs - otherwise a switch to a new algset would
    // leave the previous algset's stale scramble on screen while it hitches.
    setIsLoading(true);
    await waitForNextFrame();

    const active = await loadActiveCases(algset);
    setCases(active);

    const pending = consumePendingItem(algset);
    if (pending) {
      setCurrentCase(matchCaseForItem(active, pending));
      setScramble(pending.scramble);
      setSolution(pending.solution);
      currentItem.current = pending;
      setIsLoading(false);
    } else {
      const firstCase = pickNextCase(active);
      setCurrentCase(firstCase);
      if (firstCase) {
        const fetched = await fetchFreshScramble(firstCase.alg, event, algset, 'initial', scrambleWithAUF);
        if (fetched) {
          setScramble(fetched.scramble);
          setSolution(fetched.solution);
          currentItem.current = { caseId: firstCase.id, alg: firstCase.alg, ...fetched };
        }
      }
      setIsLoading(false);
    }
  }, [algset, event]);

  useFocusEffect(
    useCallback(() => {
      if (!algset) return;
      resumeSession();

      return () => {
        if (currentItem.current) {
          setPendingItem(algset, currentItem.current);
          currentItem.current = null;
        }
      };
    }, [algset, resumeSession])
  );

  const advanceToNextCase = async (updatedCases: CaseWithProgress[]) => {
    const nextCase = pickNextCase(updatedCases);
    setCurrentCase(nextCase);
    if (nextCase) {
      await waitForNextFrame();
      const fetched = await fetchFreshScramble(nextCase.alg, event, algset, 'next', scrambleWithAUF);
      if (fetched) {
        setScramble(fetched.scramble);
        setSolution(fetched.solution);
        currentItem.current = { caseId: nextCase.id, alg: nextCase.alg, ...fetched };
      }
    }
    // Always clear, even if there was no next case to pick - submitGrade
    // sets this true unconditionally before this runs, so it must not be
    // left stuck on if this branch is skipped.
    setIsLoading(false);
  };

  const submitGrade = async (grade: number) => {
    if (!currentCase) return;
    // Set before the `getCasesWithProgress` await below, which is a real
    // async DB round trip (unlike the sync calls around it) - without this,
    // handleGrade's synchronous setAttemptDone(false) would briefly
    // re-enable the timer with the stale scramble still showing, right
    // before the next scramble's heavy synchronous generation freezes the
    // JS thread underneath a finger that just landed on it.
    setIsLoading(true);

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
      updatedCases = await getCasesWithProgress(algset);
    }

    setCases(updatedCases);
    await advanceToNextCase(updatedCases);
  };

  return { currentCase, scramble, solution, submitGrade, isLoading };
}
