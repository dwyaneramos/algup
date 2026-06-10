import { Alg } from 'cubing/alg';
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// 54 stickers, 9 per face in this order:
// U(0-8) R(9-17) F(18-26) D(27-35) L(36-44) B(45-53)
// Each face reading left-right, top-bottom:
//
// U (0-8)
// 0 1 2
// 3 4 5
// 6 7 8

// R (9-17)
// 9  10 11
// 12 13 14
// 15 16 17

// F (18-26)
// 18 19 20
// 21 22 23
// 24 25 26

// D (27-35)
// 27 28 29
// 30 31 32
// 33 34 35

// L (36-44)
// 36 37 38
// 39 40 41
// 42 43 44

// B (45-53)
// 45 46 47
// 48 49 50
// 51 52 53

export type CubeState = string[];


export enum Colour {
  White, Red, Green, Yellow, Orange, Blue
}

// Each array is a cycle — sticker at index[0] goes to index[1], index[1] goes to index[2], etc.
const BASE_MOVES: Record<string, number[][]> = {
  'U': [
    [0, 2, 8, 6],
    [1, 5, 7, 3],
    [18, 36, 45, 9],
    [19, 37, 46, 10],
    [20, 38, 47, 11]
  ],
  'R': [
    [9, 11, 17, 15],
    [10, 14, 16, 12],
    [2, 51, 29, 20],
    [5, 48, 32, 23],
    [8, 45, 35, 26],
  ],
  'F': [
    [18, 20, 26, 24],
    [19, 23, 25, 21],
    [8, 15, 27, 38],
    [7, 12, 28, 41],
    [6, 9, 29, 44],
  ],
  'D': [
    [27, 29, 35, 33],
    [28, 32, 34, 30],
    [24, 15, 51, 42],
    [25, 16, 52, 43],
    [26, 17, 53, 44]
  ],
  'L': [
    [36, 38, 44, 42],
    [37, 41, 43, 39],
    [0, 18, 27, 53],
    [3, 21, 30, 50],
    [6, 24, 33, 47]
  ],

  'B': [
    [45, 47, 53, 51],
    [46, 50, 52, 48],
    [2, 36, 33, 17,],
    [1, 39, 34, 14],
    [0, 42, 35, 11]
  ],

  'M': [
    [1, 19, 28, 52],
    [4, 22, 31, 49],
    [7, 25, 34, 46],
  ],

  'E': [
    [23, 14, 50, 41],
    [22, 13, 49, 40],
    [21, 12, 48, 39],
  ],

  'S': [
    [3, 10, 32, 43],
    [4, 13, 31, 40],
    [5, 16, 30, 37],
  ],


  'x': [
    [36, 42, 44, 38],
    [37, 39, 43, 41],
    [0, 53, 27, 18],
    [3, 50, 30, 21],
    [6, 47, 33, 24],

    [9, 11, 17, 15],
    [10, 14, 16, 12],
    [2, 51, 29, 20],
    [5, 48, 32, 23],
    [8, 45, 35, 26],

    [1, 52, 28, 19],
    [4, 49, 31, 22],
    [7, 46, 34, 25],
  ],

  'y': [
    [0, 2, 8, 6],
    [1, 5, 7, 3],
    [18, 36, 45, 9],
    [19, 37, 46, 10],
    [20, 38, 47, 11],

    [27, 33, 35, 29],
    [28, 30, 34, 32],
    [24, 42, 51, 15],
    [25, 43, 52, 16],
    [26, 44, 53, 17],

    [21, 39, 48, 12],
    [22, 40, 49, 13],
    [23, 41, 50, 14]
  ],

  'z': [

    [18, 20, 26, 24],
    [19, 23, 25, 21],
    [8, 15, 27, 38],
    [7, 12, 28, 41],
    [6, 9, 29, 44],

    [45, 51, 53, 47],
    [46, 48, 52, 50],
    [2, 17, 33, 36],
    [1, 14, 34, 39],
    [0, 11, 35, 42],

    [3, 10, 32, 43],
    [4, 13, 31, 40],
    [5, 16, 30, 37]
  ],

};

function invertCycle(cycle: number[]): number[] {
  return [...cycle].reverse();
}

const MOVES: Record<string, number[][]> = {
  ...BASE_MOVES,
  r: [...BASE_MOVES.R, ...BASE_MOVES.M.map(invertCycle)],
  l: [...BASE_MOVES.L, ...BASE_MOVES.M],
  u: [...BASE_MOVES.U, ...BASE_MOVES.E.map(invertCycle)],
  d: [...BASE_MOVES.D, ...BASE_MOVES.E],
  f: [...BASE_MOVES.F, ...BASE_MOVES.S],
  b: [...BASE_MOVES.B, ...BASE_MOVES.S.map(invertCycle)],
}


function applyMove(cube: CubeState, move: string): CubeState {
  const next = [...cube];
  const base = move.replace("'", '').replace('2', '');
  const isPrime = move.includes("'");
  const isDouble = move.includes('2');
  const cycles = MOVES[base];

  const times = isDouble ? 2 : isPrime ? 3 : 1; // 3 clockwise = 1 counter-clockwise

  for (let t = 0; t < times; t++) {
    const temp = [...next];
    for (const cycle of cycles) {
      for (let i = 0; i < cycle.length; i++) {
        next[cycle[(i + 1) % cycle.length]] = temp[cycle[i]];
      }
    }
  }

  return next;
}

export function applyScramble(scramble: string): CubeState {
  const clean = scramble.replace(/[()]/g, '');
  scramble = new Alg(clean).invert().toString();
  const moves = clean.trim().split(/\s+/);
  return moves.reduce((cube, move) => applyMove(cube, move), solvedCube());
}

export function solvedCube(): CubeState {
  return [
    ...Array(9).fill('W'),
    ...Array(9).fill('R'),
    ...Array(9).fill('G'),
    ...Array(9).fill('Y'),
    ...Array(9).fill('O'),
    ...Array(9).fill('B'),
  ];
}
export interface ScrambleSolutionPair {
  scramble: string,
  solution: string,
}

export async function generateScrambleFromAlg(algString: string): Promise<ScrambleSolutionPair> {
  const res = await fetch(`${API_URL}/scramble`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alg: algString }),
  });

  return await res.json();
}


