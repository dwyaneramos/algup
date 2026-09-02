import type { AlgSet } from '@/types';

const algSet: AlgSet = {
  name: 'PLL',
  event: '333',
  cases: [
    {
      alg: "U2 R2 U' R' U' R U R U R U' R",
    },
    {
      alg: "R' U R' U' R' U' R' U R U R2",
    },
    {
      alg: "M2 U' M2 U2 M2 U' M2",
    },
    {
      alg: "M' U' M2 U' M2 U' M' U2 M2",
    },
    {
      alg: "l' U R' D2 R U' R' D2 R2 x'",
    },
    {
      alg: "x R2 D2 R U R' D2 R U' R x'",
    },
    {
      alg: "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
    },
    {
      alg: "R2 u R' U R' U' R u' R2 y' R' U R",
    },
    {
      alg: "U F' U' F R2 u R' U R U' R u' R2",
    },
    {
      alg: "R2 u' R U' R U R' u R2 y R U' R'",
    },
    {
      alg: "R U R' y' R2 u' R U' R' U R' u R2",
    },
    {
      alg: "R U R' F' R U2 R' U2 R' F R U R U2 R'",
    },
    {
      alg: "R' U2 R U2 R' F R U R' U' R' F' R2",
    },
    {
      alg: "R' U L' U2 R U' R' U2 R L",
    },
    {
      alg: "R U R' F' R U R' U' R' F R2 U' R' U'",
    },
    {
      alg: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
    },
    {
      alg: "z D' R U' R2 D R' U D' R U' R2 D R' U z'",
    },
    {
      alg: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    },
    {
      alg: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
    },
    {
      alg: "R U R' U' R' F R2 U' R' U' R U R' F'",
    },
    {
      alg: "R' U R' d' R' F' R2 U' R' U R' F R F",
    },
  ],
};

export default algSet;
