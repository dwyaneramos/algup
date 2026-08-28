import type { AlgSet } from '@/types';

const algSet: AlgSet = {
  name: 'U-ZB',
  event: '333',
  cases: [
    {
      alg: "U R' F' R U R' U' R' F D' R U R' D R2",
    },
    {
      alg: "U2 (l' R') D2 R U R' D2 R2 D' R' U' R D x'",
    },
    {
      alg: "U2 R U R' U R U2 R2 U' R U' R' U2 R",
    },
    {
      alg: "R' U' R U' R' U2 R2 U R' U R U2 R'",
    },
    {
      alg: "U' R' U' R U R' U R U2 R' U R U2 R' U' R",
    },
    {
      alg: "U' R U R' U' R U' R' U2 R U' R' U2 R U R'",
    },
    {
      alg: "U R U2 R' U' R U' R' U' R U R' U R U2 R'",
    },
    {
      alg: "U R' U2 R U R' U R U R' U' R U' R' U2 R",
    },
    {
      alg: "U R U2 R2 U' R2 U' R' U R' U' R U R' U R",
    },
    {
      alg: "U R' U2 R2 U R2 U R U' R U R' U' R U' R'",
    },
    {
      alg: "U2 R U R' U R' U2 R2 U R2 U R2 U' R'",
    },
    {
      alg: "R' U' R U' R U2 R2 U' R2 U' R2 U R",
    },
    {
      alg: "R U (R' L') U2 R U' R' U' R U' M' (x')",
    },
    {
      alg: "U2 L' R U R' U R U R' U2 L R U' R'",
    },
    {
      alg: "R' U2 R U2 R' F' R U R' U' R' F R2",
    },
    {
      alg: "U2 R2 D R' U' R D' R' U' R' U R U R'",
    },
    {
      alg: "R U' R' U' R U R D R' U R D' R2",
    },
    {
      alg: "U2 R' U R U R' U' R' D' R U' R' D R2",
    },
    {
      alg: "U' R U2 R2 F R F' U' S' R U' R' S",
    },
    {
      alg: "U' R' U2 R F U' R' U R U R' U R U' F'",
    },
    {
      alg: "U F U R U' R' F' R U R' U' M' U R U' r'",
    },
    {
      alg: "F U R U2 R' U R U R' U R U2 R' U R U R' F'",
    },
    {
      alg: "F U R U2 R2 U2 R U R' U R U2 R U R' F'",
    },
    {
      alg: "U' R U2 R2 D' R U' R' D R U' R' F R U R U' R' F'",
    },
    {
      alg: "R' F R U' R' U' R U R' F' R U R' U' R' F R F' R",
    },
    {
      alg: "U' F2 R U' R' U' R U R' F' R U R' U' R' F R F2'",
    },
    {
      alg: "U' R2 F' R U R' U' R' F R2 U' R' U2 R2 U R' U R",
    },
    {
      alg: "U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R' U2 R",
    },
    {
      alg: "(l R) U2 R' U2 R' F R F' r U' L' U R'",
    },
    {
      alg: "(r' L') U2 L U2 r U' r' F R' F R F' r",
    },
    {
      alg: "U' r U R' U' r' F R2 U' R' U' R U2 R' U' F'",
    },
    {
      alg: "U F U R U2 R' U R U2 R' U' R' F' R U2 R U2 R'",
    },
    {
      alg: "U F U R U2 R' U R U R2 F' r U R U' r'",
    },
    {
      alg: "U' F' U' r' F2 r U' r' F' r2 U R' U' r' F R",
    },
    {
      alg: "U' R' U' R F R2 D' R U R' D R2 U' F'",
    },
    {
      alg: "U' F U R2 D' R U' R' D R2 F' R' U R",
    },
    {
      alg: "F R U' R' U R U R' U R U' R' F'",
    },
    {
      alg: "U F' R U R' U' R' F R2 U R' U2 R U R' U2 R U' R'",
    },
    {
      alg: "U2 (l' R') D2 R U2 R' D2 R U2 l",
    },
    {
      alg: "(l R) D2 R' U2 R D2 R' U2 l'",
    },
    {
      alg: "R U R' U R U' R' U2 R' D' R U2 R' D R2 U' R'",
    },
    {
      alg: "U R2 D' R U2 R' D R U2 R U R' U' R U' R' U2 R",
    },
    {
      alg: "R' U2 R U R' U R' D' R U' R' D R U R",
    },
    {
      alg: "U2 R U2 R' U' R' D' R U R' D R U' R U' R'",
    },
    {
      alg: "U' R U' R' U' R U' R' U R' D' R U R' D R2 U R'",
    },
    {
      alg: "U' R' U R U R' U R U' R D R' U' R D' R2 U' R",
    },
    {
      alg: "R' U' R U2 R' F' R U R' U' R' F R2 U2 R' U R",
    },
    {
      alg: "U2 R U R' U R U R' U2 R U' R2 D' R U' R' D R",
    },
    {
      alg: "R2 D' R U2 R' D R U2 R",
    },
    {
      alg: "R2 D' r U2 r' D R U2 R",
    },
    {
      alg: "U R' U' R2 D R' U' R D' R2 U2 R",
    },
    {
      alg: "U2 R' U R U R' U2 R U R D R' U2 R D' R'",
    },
    {
      alg: "R U' R' D R' U' R D' R2 U R' U' R' U2 R'",
    },
    {
      alg: "U' R2 F' R U2 R U2 R' F U' R U R' U' R",
    },
    {
      alg: "R D r' U2 r D' R' U2 R' U R U R' U R",
    },
    {
      alg: "R2 U' S R2 S' R2 (U D') R U2 R' D R U2 R",
    },
    {
      alg: "U F U R U2 R' U R U2 R2 F R F' R U' R' F'",
    },
    {
      alg: "F U R U' R D R' U' R D' R2 U R U R' F'",
    },
    {
      alg: "U' R' U2 R' D' R U2 R' D R U2 R U R' U R",
    },
    {
      alg: "U' R' U R U' R' U' R U2 R D R' U' R D' R2 U' R",
    },
    {
      alg: "U2 R2 D R' U2 R D' R' U2 R'",
    },
    {
      alg: "U2 R2 D r' U2 r D' R' U2 R'",
    },
    {
      alg: "U R U R2 D' R U R' D R2 U2 R'",
    },
    {
      alg: "R U' R' U' R U2 R' U' R' D' R U2 R' D R",
    },
    {
      alg: "R' U' R U R U R' U' R' U F R U R U' R' F'",
    },
    {
      alg: "U' R U R' U R U' R' U F' R U2 R' U2 R' F R",
    },
    {
      alg: "U2 R' D' r U2 r' D R U2 R U' R' U' R U' R'",
    },
    {
      alg: "U R' U R' (U' D') R U' R' U2 R U' R' D R U' R",
    },
    {
      alg: "U' F' U' L' U2 L U' L' U2 L2 F' L' F L' U L F",
    },
    {
      alg: "U R U R' U R U' R' U R U' R' U' r' F R F' M'",
    },
    {
      alg: "U' R U2 R D R' U2 R D' R' U2 R' U' R U' R'",
    },
    {
      alg: "U' R U' R' U R U R' U2 R' D' R U R' D R2 U R'",
    },
  ],
  folder: 'ZB',
};

export default algSet;
