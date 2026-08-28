import type { AlgSet } from '@/types';

const algSet: AlgSet = {
  name: 'T-ZB',
  event: '333',
  cases: [
    {
      alg: "R U R' U R U2 R' U2 R' U' R U' R' U2 R",
    },
    {
      alg: "U x D' R' U R D R2' D2 R U' R' D2 (R l)",
    },
    {
      alg: "U R U2 R' U' R U' R2 U2 R U R' U R",
    },
    {
      alg: "U' R' U2 R U R' U R2 U2 R' U' R U' R'",
    },
    {
      alg: "R U R' U R U2 R' U' R U2 R' U' R U' R'",
    },
    {
      alg: "U' R U' R' U2 R U R' U2 R U R' U R U' R'",
    },
    {
      alg: "U R U2 R' U' R U' R' U R U R' U R U2 R'",
    },
    {
      alg: "U' R' U2 R U R' U R U' R' U' R U' R' U2 R",
    },
    {
      alg: "R U R' U R U' R' U R' U' R2 U' R2 U2 R",
    },
    {
      alg: "R' U' R U' R' U R U' R U R2 U R2 U2 R'",
    },
    {
      alg: "R U R2 U' R2 U' R2 U2 R U' R U' R'",
    },
    {
      alg: "R' U' R2 U R2 U R2 U2 R' U R' U R",
    },
    {
      alg: "U' R U' R2 D' r U2 r' D R2 U R'",
    },
    {
      alg: "U R' U R2 D r' U2 r D' R2 U' R",
    },
    {
      alg: "U' R U R' F' R U R' U' R' F R U' R' F R U R U' R' F'",
    },
    {
      alg: "U' R U2 R' U2 R U R2 D' R U' R' D R U2 R U' R'",
    },
    {
      alg: "U' R U R' U2 R' D' R U R' D R2 U' R' U R U' R'",
    },
    {
      alg: "U R' U' R U2 R D R' U' R D' R2 U R U' R' U R",
    },
    {
      alg: "U2 R U R' U' R U R2 D' R U' R' D R U2 R U' R'",
    },
    {
      alg: "U2 R' U' R U R' U' R2 D R' U R D' R' U2 R' U R",
    },
    {
      alg: "U' F R' D' R U R' D R U R' D' R U' R' D R U' F'",
    },
    {
      alg: "U R' F' R U R' U2 R' D R U2 R' D' R U' R' F R U R",
    },
    {
      alg: "U' R (U' D) R' U2 R D' R U R' U2 R U R2",
    },
    {
      alg: "U R U' R' U R U R' U' R U R' U R' D' R U R' D R",
    },
    {
      alg: "U R' U R U2 r' R' F R F' r",
    },
    {
      alg: "U' R U' R' U2 L R U' R' U L'",
    },
    {
      alg: "U' R' U' R2 U R' F' R U R' U' R' F R2 U' R' U' R' U R",
    },
    {
      alg: "U' r U' r U2 R' F R U2 r2 F",
    },
    {
      alg: "U' R' U' R U' R' U2 R' D' R U' R' D R U R",
    },
    {
      alg: "R U R D R' U' R D' R' U2 R' U' R U' R'",
    },
    {
      alg: "U R D R' U' R D' R' U' R' U R U' R' U R U R' U' R",
    },
    {
      alg: "U F U' R' U2 R U F' R' U' R U R' U R",
    },
    {
      alg: "U R U' R' U R U R' U' R U R' U' R' D' R U' R' D R",
    },
    {
      alg: "U R U R' U R U' R' U' R' F2 R F2 L' U2 L",
    },
    {
      alg: "U R' U2 R U R' U R F U R U2 R' U R U R' F'",
    },
    {
      alg: "U r' U' l' U2 R U' R' U2 l R U' R' U2 r",
    },
    {
      alg: "U' F R U R' U' R U' R' U' R U R' F'",
    },
    {
      alg: "R U R' U2 R U' R' U2 R U' R2 F' R U R U' R' F",
    },
    {
      alg: "l' U2 R' D2 R U2 R' D2 (R l)",
    },
    {
      alg: "l U2 R D2 R' U2 R D2 (R' l')",
    },
    {
      alg: "R U R2 D' R U2 R' D R U2 R U R' U' R U' R'",
    },
    {
      alg: "R' U2 R U R' U R U' R' U2 R' D' R U2 R' D R2",
    },
    {
      alg: "U2 R U R' U R' D' R U' R' D R U R U2 R'",
    },
    {
      alg: "U2 R' U' R U' R D R' U R D' R' U' R' U2 R",
    },
    {
      alg: "U' R U' R2 D' R U' R' D R U' R U R' U R U R'",
    },
    {
      alg: "U R' U R2 D R' U R D' R' U R' U' R U' R' U' R",
    },
    {
      alg: "U2 R' U' R U' F U' R' U R U F' R' U R",
    },
    {
      alg: "U2 R U R' L' U2 R U' R' U2 L U R U' R'",
    },
    {
      alg: "r U R' U' r' F R F'",
    },
    {
      alg: "R U2 R' U2 R' F R U R U' R' F'",
    },
    {
      alg: "U' R' U' R U D' R U' R U R U' R2 D",
    },
    {
      alg: "U R' D R2 U' R' U R U R' U' R U R2 D' R",
    },
    {
      alg: "F' U' r' F2 r U' r' F' r F",
    },
    {
      alg: "R U S' R' U' R S R2 F R F'",
    },
    {
      alg: "U2 R U R' U R U R' U2 L R U' R' U L'",
    },
    {
      alg: "U2 R2 U R' U' R' U R' (U' D) U' R' U2 R D'",
    },
    {
      alg: "U R' U' R U' R2 F' R U R U' R' F U R U' R' U2 R",
    },
    {
      alg: "U' r' F R F' r U' R' U' R U R' U' R U' R'",
    },
    {
      alg: "R U' R' U' R U R D R' U2 R D' R' U' R'",
    },
    {
      alg: "U M U' r U R' U' R' F R F' (r' R) U M'",
    },
    {
      alg: "F R F' r U R' U' r'",
    },
    {
      alg: "U2 R U R' U' R' F' R U2 R U2 R' F",
    },
    {
      alg: "U R U R' U' D R' U R' U' R' U R2 D'",
    },
    {
      alg: "R D R' U' R D' R2 U R U' R' U' R U R' U' R",
    },
    {
      alg: "U2 F U R U2 R' U R U R' F'",
    },
    {
      alg: "U R U R' U' R U' R' U' F R U R' U' R' F' R",
    },
    {
      alg: "U2 R' U' R U' R' U' R U2 r' R' F R F' r",
    },
    {
      alg: "U R' U2 R F U' R' U R U F' R' U R",
    },
    {
      alg: "U2 F R U R' U' R U R' U' F' R U R' U' R' F R F'",
    },
    {
      alg: "F U R' U' R F' R' U' R U R' U R",
    },
    {
      alg: "R' U R U R' U' R' D' R U2 R' D R U R",
    },
    {
      alg: "U M U R' F' r U r U' r' F (r' R) U' M'",
    },
  ],
  folder: 'ZB',
};

export default algSet;
