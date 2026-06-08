import Svg, { Rect, G } from 'react-native-svg';
import { applyScramble, solvedCube, Colour } from '@/src/utils/scramble';
import type { CubeState } from '@/src/utils/scramble';

const COLORS: Record<string, string> = {
  W: '#ffffff', R: '#ff0000', G: '#00aa00',
  Y: '#ffff00', O: '#ffa500', B: '#0000ff',
};

// These variables are very coupled with the transformation values
// sticker size
const s = 18;
// gap
const g = 1;

function Face({ cube, faceIndex }: {
  cube: CubeState,
  faceIndex: number,
}) {
  const offset = faceIndex * 9;
  return (
    <>
      {Array(9).fill(0).map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const hex = COLORS[cube[offset + i]];
        const fill = hex;
        return (
          <Rect
            key={i}
            x={col * (s + g)}
            y={row * (s + g)}
            rx={2}
            width={s}
            height={s}
            fill={fill}
            stroke="#d4d4d4"
            strokeWidth={0.5}
          />
        );
      })}
    </>
  );
}



export function DrawScramble({ scramble }: { scramble: string }) {
  const cube = scramble ? applyScramble(scramble) : solvedCube();

  return (
    <Svg width={118} height={140} transform={`scale(1.5) translate(0, 30)`}>
      <G transform={`translate(56,0 )  scale(1.43,0.81) rotate(45)`}>
        <Face cube={cube} faceIndex={Colour.White} />
      </G>

      <G transform={`translate(0,33) skewY(30) scale(1,1.15)`}>
        <Face cube={cube} faceIndex={Colour.Green} />
      </G>

      <G transform={`translate(57,65) skewY(-30) scale(1,1.15)`}>
        <Face cube={cube} faceIndex={Colour.Red} />
      </G>
    </Svg>
  );
}
