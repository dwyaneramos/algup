const DEFAULT_MAX_SCRAMBLE_ATTEMPTS = 50;

// Shared by both scramble pipelines' retry loops (growing the prefix by one
// move on every failed attempt until the candidate reaches the target
// length - see the callers for why a fixed-length prefix doesn't work).
// Bounded by `maxAttempts` so a pathological case (e.g. a future regression
// in either pipeline's simplify step) can't spin forever with no way to
// surface an error - returns '' rather than throwing so callers can treat
// "generation failed" as an ordinary, displayable result.
//
// Lives in its own module rather than alongside `applyScramble`/`solvedCube`
// in `./scramble` - both scrambleGenerator3x3.ts and scrambleGenerator2x2.ts
// already import from `./scramble`, so re-exporting this from there as well
// closed a require cycle back onto them, which broke module resolution
// inside the worklet runtime used for cube solving (an imported function
// resolved to the exports object instead of itself).
export async function generateScrambleWithRetry(
  generateCandidate: (prefixLength: number) => Promise<string>,
  isLongEnough: (scramble: string) => boolean,
  startPrefixLength: number,
  maxAttempts: number = DEFAULT_MAX_SCRAMBLE_ATTEMPTS,
): Promise<string> {
  let prefixLength = startPrefixLength - 1;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    prefixLength++;
    const scramble = await generateCandidate(prefixLength);
    if (isLongEnough(scramble)) return scramble;
  }
  return '';
}
