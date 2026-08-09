import Svg, { Rect, G } from 'react-native-svg';
import { applyScramble, solvedCube, Colour } from '@/src/logic/scramble';
import type { CubeState, CubeEvent } from '@/types';

const COLORS: Record<string, string> = {
  W: '#ffffff', R: '#ff0000', G: '#00aa00',
  Y: '#ffff00', O: '#ffa500', B: '#0000ff',
};

// These variables are very coupled with the transformation values
// sticker size
const s = 18;
// gap
const g = 1;

// Corner indices within a face's 9-sticker slice: top-left, top-right, bottom-left, bottom-right
const CORNER_INDICES = [0, 2, 6, 8];

function Face({ cube, faceIndex, cornersOnly }: {
  cube: CubeState,
  faceIndex: number,
  cornersOnly: boolean,
}) {
  const offset = faceIndex * 9;

  if (cornersOnly) {
    // Fills the same bounding box the 3x3 layout occupies (3*s + 2*g),
    // so the enclosing isometric <G transform> doesn't need to change.
    const cs = (3 * s + g) / 2;
    return (
      <>
        {CORNER_INDICES.map((i, idx) => {
          const row = Math.floor(idx / 2);
          const col = idx % 2;
          const hex = COLORS[cube[offset + i]];
          return (
            <Rect
              key={i}
              x={col * (cs + g)}
              y={row * (cs + g)}
              rx={2}
              width={cs}
              height={cs}
              fill={hex}
              stroke="#d4d4d4"
              strokeWidth={0.5}
            />
          );
        })}
      </>
    );
  }

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



export function DrawScramble({ scramble, scale = 1, event }: { scramble: string, scale?: number, event: CubeEvent }) {
  const cornersOnly = event === '222';
  const cube = scramble ? applyScramble(scramble, cornersOnly) : solvedCube();
  const w = 90 * scale;
  const h = 100 * scale;

  return (
    <Svg width={w} height={h} viewBox="0 0 112 135">
      <G transform="translate(0, 2.5)">
        <G transform="translate(56, 0) scale(1.43, 0.81) rotate(45)">
          <Face cube={cube} faceIndex={Colour.White} cornersOnly={cornersOnly} />
        </G>
        <G transform="translate(0, 33) skewY(30) scale(1, 1.15)">
          <Face cube={cube} faceIndex={Colour.Green} cornersOnly={cornersOnly} />
        </G>
        <G transform="translate(57, 65) skewY(-30) scale(1, 1.15)">
          <Face cube={cube} faceIndex={Colour.Red} cornersOnly={cornersOnly} />
        </G>
      </G>
    </Svg>
  );
}
