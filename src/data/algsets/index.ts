import type { AlgSet } from '@/types';
import ASZBAlgSet from './AS-ZB';
import CLLAlgSet from './CLL';
import CMLLAlgSet from './CMLL';
import EG1AlgSet from './EG-1';
import EG2AlgSet from './EG-2';
import HZBAlgSet from './H-ZB';
import LZBAlgSet from './L-ZB';
import OLLAlgSet from './OLL';
import PLLAlgSet from './PLL';
import PiZBAlgSet from './Pi-ZB';
import SZBAlgSet from './S-ZB';
import TZBAlgSet from './T-ZB';
import UZBAlgSet from './U-ZB';

export const DEFAULT_ALGSETS: AlgSet[] = [
  OLLAlgSet,
  PLLAlgSet,
  CMLLAlgSet,
  CLLAlgSet,
  EG1AlgSet,
  EG2AlgSet,
  ASZBAlgSet,
  HZBAlgSet,
  LZBAlgSet,
  PiZBAlgSet,
  SZBAlgSet,
  TZBAlgSet,
  UZBAlgSet,
];
