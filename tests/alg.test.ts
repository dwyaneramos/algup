import { validateAlgorithm, sanitiseAlgorithm } from "@/src/logic/alg";


describe('sanitiseAlgorithm', () => {
  it('removes parentheses', () => {
    expect(sanitiseAlgorithm('(R U R\') (U\' F)')).toBe('R U R\' U\' F');
  });

  it('trims leading/trailing whitespace', () => {
    expect(sanitiseAlgorithm('  R U  ')).toBe('R U');
  });
});

describe('validateAlgorithm - valid algorithms', () => {
  it.each([
    "U2 R2 U' R' U' R U R U R U' R",
    "R' U R' U' R' U' R' U R U R2",
    "M2 U' M2 U2 M2 U' M2",
    "M' U' M2 U' M2 U' M' U2 M2",
    "l' U R' D2 R U' R' D2 R2 x'",
    "x R2 D2 R U R' D2 R U' R x'",
    "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
    "R2 u R' U R' U' R u' R2 y' R' U R",
    "U F' U' F R2 u R' U R U' R u' R2",
    "R2 u' R U' R U R' u R2 y R U' R'",
    "R U R' y' R2 u' R U' R' U R' u R2",
    "R U R' F' R U2 R' U2 R' F R U R U2 R'",
    "R' U2 R U2 R' F R U R' U' R' F' R2",
    "R' U L' U2 R U' R' U2 R L",
    "R U R' F' R U R' U' R' F R2 U' R' U'",
    "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
    "z D' R U' R2 D R' U D' R U' R2 D R' U z'",
    "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
    "R U R' U' R' F R2 U' R' U' R U R' F'",
    "R' U R' d' R' F' R2 U' R' U R' F R F",
  ])('accepts: %s', (alg) => {
    expect(validateAlgorithm(alg)).toBe(true);
  });
});

describe('validateAlgorithm - 222 event restricts to base face moves + rotations', () => {
  it.each([
    "R U R' U'",
    "x R2 D2 R U R' D2 R U' R x'",
    "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
    "z D' R U' R2 D R' U D' R U' R2 D R' U z'",
  ])('accepts for 222 (base face moves and rotations only): %s', (alg) => {
    expect(validateAlgorithm(alg, '222')).toBe(true);
  });

  it.each([
    "M2 U' M2 U2 M2 U' M2",
    "M' U' M2 U' M2 U' M' U2 M2",
    "l' U R' D2 R U' R' D2 R2 x'",
    "R2 u R' U R' U' R u' R2 y' R' U R",
    "U F' U' F R2 u R' U R U' R u' R2",
    "R' U R' d' R' F' R2 U' R' U R' F R F",
  ])('rejects for 222 (contains a slice or wide move): %s', (alg) => {
    expect(validateAlgorithm(alg, '222')).toBe(false);
  });

  it('still accepts slice and wide moves for 333, both explicit and default', () => {
    expect(validateAlgorithm("M2 U' M2 U2 M2 U' M2", '333')).toBe(true);
    expect(validateAlgorithm("R2 u R' U R' U' R u' R2")).toBe(true);
  });
});

