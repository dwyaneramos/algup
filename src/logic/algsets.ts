export interface Case {
  alg: string;
}

export const SELECTED_ALGSET_KEY = "selectedAlgset"

export interface AlgSet {
  name: string;
  cases: Case[];
}

export const ALG_SETS: AlgSet[] = [
  {
    name: 'CMLL',
    cases: [
      { alg: "R U2 R' U' R U' R2 U2 R U R' U R " },
      { alg: "r' U r U2 R2 F R F' R " },
      { alg: "(U') F R U' R' U R U R' F' " },
      { alg: "(U2) F R U R' U' R U' R' U' R U R' F' " },
      { alg: "(U') R U R' U' R' F R F' " },
      { alg: "R' U' R U' R' U R U' R' U F' U F R " },
      { alg: "(U') R' U' R U R' U R U2' R' U R U2' R' U' R " },
      { alg: "(U2) F R U R' U' R' U R U' F' U R' U' R " },
      { alg: "R' U2' R U2 F U' R' U R U F' " },
      { alg: "F R U' R' U R U R' U R U' R' F' " },
      { alg: "R2 D' R U2 R' D R U2 R " },
      { alg: "(U') F R U R' U' F' " },
      { alg: "(U) R' U' R U' R' U R U' R' U R U' R' U2' R " },
      { alg: "R' U' R U' R' U2' R2 U R' U' R' F R F' " },
      { alg: "F R' F' R U R U' R' " },
      { alg: "F R U' R' U' R U R' F' " },
      { alg: "(U') R' U2 R' D' R U2 R' D R2 " },
      { alg: "R U2 R2 F R F' R U2 R' " },
      { alg: "(U) R U R' U R U2' R' " },
      { alg: "(U) F R' F' R U2' R U2 R' " },
      { alg: "(U2) R' U' R U' R' U2 F R F' r U r' " },
      { alg: "(U) r U' r' F R' F' R " },
      { alg: "(U') R' U2 R U2 R f' U' f " },
      { alg: "(U2) R U R' U R' F R F' R U2 R' " },
      { alg: "(U2) R U2 R' U' R U' R' " },
      { alg: "(U2) F R U' R' U R U2 R' U' F' " },
      { alg: "(U') R U2 R' U2 R' F R F' " },
      { alg: "(U') R' F R F' r U r' " },
      { alg: "r U' r' F R' F' U2 R U R' U R " },
      { alg: "R' U' R U' R' U R' F R F' U R " },
      { alg: "F R U R' U' R U R' U' F' " },
      { alg: "(U) F U R U' R2' F' R U2 R U2' R' " },
      { alg: "(U') F R U' R' U' R U R' U R U' R' F' " },
      { alg: "R U2 R' U' R U R' U2' R' F R F' " },
      { alg: "(U2) R' F R F' r U' R' U' R U' r' " },
      { alg: "(U') R' U' R' F R F' R U' R' U2' R " },
      { alg: "(U) R' U' R U' R' U R U' R' U2 R " },
      { alg: "(U') R U R' U R U r' F R' F' r " },
      { alg: "(U) F R U' R' U R U2 R' U' R U R' U' F' " },
      { alg: "F R U R' U' R U R' U' R U R' U' F' " },
      { alg: "R U2 R' U' R U2 L' U R' U' L " },
      { alg: "F R U' R' U' R U R' F' R U R' U' R' F R F' " },
    ]
  },

  {
    name: 'PLL',
    cases: [
      { alg: "U2 R2 U' R' U' R U R U R U' R " },
      { alg: "R' U R' U' R' U' R' U R U R2 " },
      { alg: "M2 U' M2 U2 M2 U' M2 " },
      {
        alg: "M' U' M2 U' M2 U' M' U2 M2 "
      },
      { alg: "l' U R' D2 R U' R' D2 R2 x' " },
      { alg: "x R2 D2 R U R' D2 R U' R x' " },
      { alg: "x' R U' R' D R U R' D' R U R' D R U' R' D' x " },
      { alg: "R2 u R' U R' U' R u' R2 y' R' U R " },
      { alg: "U F' U' F R2 u R' U R U' R u' R2 " },
      { alg: "R2 u' R U' R U R' u R2 y R U' R' " },
      { alg: "R U R' y' R2 u' R U' R' U R' u R2 " },
      { alg: "R U R' F' R U2 R' U2 R' F R U R U2 R' " },
      { alg: "R' U2 R U2 R' F R U R' U' R' F' R2 " },
      { alg: "R' U L' U2 R U' R' U2 R L " },
      { alg: "R U R' F' R U R' U' R' F R2 U' R' U' " },
      { alg: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R' " },
      { alg: "z D' R U' R2 D R' U D' R U' R2 D R' U z' " },
      {
        alg: "F R U' R' U' R U R' F' R U R' U' R' F R F' "
      },
      { alg: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R " },
      { alg: "R U R' U' R' F R2 U' R' U' R U R' F' " },
      { alg: "R' U R' d' R' F' R2 U' R' U R' F R F " },
    ]
  },

  {
    name: 'OLL',
    cases: [


      { alg: "R U2 R2' F R F' U2 R' F R F' " },
      { alg: "F R U R' U' F' f R U R' U' f' " },
      { alg: "U' f R U R' U' f' U' F R U R' U' F' " },
      {
        alg: "U' f R U R' U' f' U F R U R' U' F' "
      },
      { alg: "r' U2 R U R' U r " },
      { alg: "r U2 R' U' R U' r' " },
      { alg: "r U R' U R U2 r' " },
      { alg: "U2 r' U' R U' R' U2 r " },
      { alg: "U R U R' U' R' F R2 U R' U' F' " },
      { alg: "R U R' U R' F R F' R U2 R' " },
      { alg: "r' R2 U R' U R U2 R' U M' " },
      { alg: "F R U R' U' F' U F R U R' U' F' " },
      { alg: "r U' r' U' r U r' F' U F " },
      { alg: "R' F R U R' F' R F U' F' " },
      { alg: "U2 l' U' l L' U' L U l' U l " },
      { alg: "r U r' R U R' U' r U' r' " },
      { alg: "R U R' U R' F R F' U2 R' F R F' " },
      { alg: "r U R' U R U2 r2 U' R U' R' U2 r " },
      { alg: "M U R U R' U' M' R' F R F' " },
      { alg: "M U R U R' U' M2 U R U' r' " },
      { alg: "U R U2 R' U' R U R' U' R U' R' " },
      { alg: "R U2 R2 U' R2 U' R2 U2 R " },
      { alg: "R2 D R' U2 R D' R' U2 R' " },
      { alg: "r U R' U' r' F R F' " },
      { alg: "U F' r U R' U' r' F R " },
      { alg: "U R U2 R' U' R U' R' " },
      { alg: "R U R' U R U2 R' " },
      { alg: "r U R' U' M U R U' R' " },
      {
        alg: "M U R U R' U' R' F R F' M' "
      },
      { alg: "U' r' D' r U' r' D r2 U' r' U r U r' " },
      { alg: "R' U' F U R U' R' F' R " },
      { alg: "S R U R' U' R' F R f' " },
      { alg: "R U R' U' R' F R F' " },
      { alg: "U2 R U R' U' B' R' F R F' B " },
      { alg: "R U2 R2' F R F' R U2 R' " },
      { alg: "U2 L' U' L U' L' U L U L F' L' F " },
      { alg: "F R U' R' U' R U R' F' " },
      { alg: "R U R' U R U' R' U' R' F R F' " },
      { alg: "U L F' L' U' L U F U' L' " },
      { alg: "U R' F R U R' U' F' U R " },
      { alg: "U2 R U R' U R U2' R' F R U R' U' F' " },
      { alg: "R' U' R U' R' U2 R F R U R' U' F' " },
      { alg: "f' L' U' L U f " },
      { alg: "f R U R' U' f' " },
      { alg: "F R U R' U' F' " },
      { alg: "R' U' R' F R F' U R " },
      { alg: "F' L' U' L U L' U' L U F " },
      { alg: "F R U R' U' R U R' U' F' " },
      { alg: "U2 r U' r2 U r2 U r2 U' r " },
      { alg: "r' U r2 U' r2' U' r2 U r' " },
      { alg: "f R U R' U' R U R' U' f' " },
      {
        alg: "R U R' U R d' R U' R' F' "
      },
      { alg: "r' U' R U' R' U R U' R' U2 r " },
      { alg: "r U R' U R U' R' U R U2 r' " },
      { alg: "R U2 R2 U' R U' R' U2 F R F' " },
      { alg: "r U r' U R U' R' U R U' R' r U' r' " },
      { alg: "R U R' U' M' U R U' r' " },
    ]
  },
];


