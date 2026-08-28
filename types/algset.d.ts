export interface Case {
  id?: number;
  alg: string;
}

export type CubeEvent = '222' | '333';

export interface AlgSet {
  name: string;
  event: CubeEvent;
  cases: Case[];
  folder?: string | null;
}

export interface Folder {
  name: string;
}
