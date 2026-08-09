import { useState, useEffect, useRef } from 'react';
import { getCasesWithProgress, updateCaseProgress, introduceNextCase, recordPractice, updateLastPracticed } from '@/src/db/queries';
import { pickNextCase, getNextState, shouldIntroduceNewCase, getUpdatedFluency, applyDecay } from '@/src/logic/caseQueue';
import { generateScrambleFromAlg } from '@/src/logic/scramble';
import {
  fetchAndEnqueueBatch,
  dequeueNext,
  getQueueSize,
  peekQueue,
  setPendingItem,
  consumePendingItem,
  REFILL_THRESHOLD,
} from '@/src/logic/scrambleQueue';
import { useSettingsStore } from '@/src/store/settingsStore';
import type { CaseWithProgress, ScrambleQueueItem } from '@/types';

export function useTrainingSession(algset: string) {
  const maxActive = useSettingsStore(s => s.maxActive);
  const maxLearning = useSettingsStore(s => s.maxLearning);
  const [cases, setCases] = useState<CaseWithProgress[]>([]);
  const [currentCase, setCurrentCase] = useState<CaseWithProgress | null>(null);
  const [scramble, setScramble] = useState('');
  const [solution, setSolution] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const batchInFlight = useRef(false);
  const currentItem = useRef<ScrambleQueueItem | null>(null);

  useEffect(() => {
    if (!algset) return;
    (async () => {
      let initial = applyDecay(await getCasesWithProgress(algset));
      const hasActive = initial.some(c => c.state !== 'locked');
      if (!hasActive) {
        introduceNextCase(algset);
        introduceNextCase(algset);
        introduceNextCase(algset);
        initial = await getCasesWithProgress(algset);
      }
      setCases(initial);

      const queueSize = getQueueSize(algset);
      const queueItems = peekQueue(algset);
      console.log(`[Algset: ${algset}] Queue size: ${queueSize}, items:`, queueItems.map(q => `caseId=${q.caseId}`));

      const pending = consumePendingItem(algset);
      if (pending) {
        const matchedCase = initial.find(c => c.id === pending.caseId) ?? initial.find(c => c.alg === pending.alg) ?? pickNextCase(initial);
        setCurrentCase(matchedCase);
        setScramble(pending.scramble);
        setSolution(pending.solution);
        currentItem.current = pending;
        console.log(`[Algset: ${algset}] Restored pending item for caseId=${pending.caseId}`);
      } else if (queueSize > 0) {
        const next = dequeueNext(algset);
        if (next) {
          const matchedCase = initial.find(c => c.id === next.caseId) ?? initial.find(c => c.alg === next.alg) ?? pickNextCase(initial);
          setCurrentCase(matchedCase);
          setScramble(next.scramble);
          setSolution(next.solution);
          currentItem.current = next;
          console.log(`[Algset: ${algset}] Dequeued scramble for caseId=${next.caseId}, alg=${matchedCase?.alg}`);
        }
      } else {
        const firstCase = pickNextCase(initial);
        setCurrentCase(firstCase);
        if (firstCase) {
          setIsLoading(true);
          const { scramble: s, solution: sol } = await generateScrambleFromAlg(firstCase.alg);
          setScramble(s);
          setSolution(sol);
          setIsLoading(false);
        }
      }

      const currentQueueSize = getQueueSize(algset);
      if (currentQueueSize <= REFILL_THRESHOLD && !batchInFlight.current) {
        batchInFlight.current = true;
        fetchAndEnqueueBatch(algset, initial).finally(() => {
          batchInFlight.current = false;
        });
      }
    })();

    return () => {
      if (currentItem.current) {
        console.log(`[Algset: ${algset}] Storing pending item for caseId=${currentItem.current.caseId}`);
        setPendingItem(algset, currentItem.current);
        currentItem.current = null;
      }
    };
  }, [algset]);

  const submitGrade = async (grade: number) => {
    if (!currentCase) return;
    const newFluency = getUpdatedFluency(currentCase.fluency, grade);
    const newState = getNextState(currentCase.state, newFluency);
    updateCaseProgress(currentCase.id, newFluency, newState);
    updateLastPracticed(currentCase.id);
    recordPractice(algset);
    currentItem.current = null;

    let updatedCases = cases.map(c =>
      c.id === currentCase.id
        ? { ...c, fluency: newFluency, state: newState }
        : c
    );

    if (shouldIntroduceNewCase(updatedCases, maxActive, maxLearning)) {
      introduceNextCase(algset);
      updatedCases = applyDecay(await getCasesWithProgress(algset));
    }

    setCases(updatedCases);

    const queueSize = getQueueSize(algset);
    if (queueSize > 0) {
      const next = dequeueNext(algset);
      if (next) {
        const matchedCase = updatedCases.find(c => c.id === next.caseId) ?? updatedCases.find(c => c.alg === next.alg) ?? pickNextCase(updatedCases, currentCase.id);
        setCurrentCase(matchedCase);
        setScramble(next.scramble);
        setSolution(next.solution);
        currentItem.current = next;
      }
    } else {
      const nextCase = pickNextCase(updatedCases, currentCase.id);
      setCurrentCase(nextCase);
      if (nextCase) {
        setIsLoading(true);
        const { scramble: s, solution: sol } = await generateScrambleFromAlg(nextCase.alg);
        setScramble(s);
        setSolution(sol);
        setIsLoading(false);
      }
    }

    const currentQueueSize = getQueueSize(algset);
    if (currentQueueSize <= REFILL_THRESHOLD && !batchInFlight.current) {
      batchInFlight.current = true;
      fetchAndEnqueueBatch(algset, updatedCases).finally(() => {
        batchInFlight.current = false;
      });
    }
  };

  return { currentCase, scramble, solution, submitGrade, isLoading };
}
