import Svg, { Rect } from 'react-native-svg';
import { applyScramble, solvedCube, type CubeState } from '@/src/utils/scramble';

const COLORS: Record<string, string> = {
  W: '#ffffff', R: '#ff0000', G: '#00aa00',
  Y: '#ffff00', O: '#ffa500', B: '#0000ff',
};

const s = 20, g = 2, p = 4;
const f = s * 3 + g * 2;

interface FaceProps {
  cube: CubeState;
  faceIndex: number;
  x: number;
  y: number;
}

function Face({ cube, faceIndex, x, y }: FaceProps) {
  const offset = faceIndex * 9;
  return (
    <>
      {Array(9).fill(0).map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        return (
          <Rect
            key={i}
            x={x + col * (s + g)}
            y={y + row * (s + g)}
            width={s}
            height={s}
            fill={COLORS[cube[offset + i]]}
            rx={3}
          />
        );
      })}
    </>
  );
}

export function DrawScramble({ scramble }: { scramble: string }) {
  const cube = scramble ? applyScramble(scramble) : solvedCube();
  const totalW = f * 4 + p * 3;
  const totalH = f * 3 + p * 2;

  return (
    <Svg width={totalW} height={totalH}>
      <Face cube={cube} faceIndex={0} x={f + p} y={0} />
      <Face cube={cube} faceIndex={4} x={0} y={f + p} />
      <Face cube={cube} faceIndex={2} x={f + p} y={f + p} />
      <Face cube={cube} faceIndex={1} x={f * 2 + p * 2} y={f + p} />
      <Face cube={cube} faceIndex={5} x={f * 3 + p * 3} y={f + p} />
      <Face cube={cube} faceIndex={3} x={f + p} y={f * 2 + p * 2} />
    </Svg>
  );
}
