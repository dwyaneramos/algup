import { Router, Request, Response } from 'express';
import { experimentalSolve3x3x3IgnoringCenters } from 'cubing/search';
import { cube3x3x3 } from 'cubing/puzzles';
import { Alg } from 'cubing/alg';

const router = Router();

function generateMoveList(n: number): string {
  const possibleMoves = ['R', 'L', 'U', 'D', 'F', 'B'];
  const opposites: Record<string, string> = {
    'R': 'L', 'L': 'R',
    'U': 'D', 'D': 'U',
    'F': 'B', 'B': 'F',
  };
  const modifiers = ['', "'", '2'];
  const moves: string[] = [];
  let lastMove = '';

  for (let i = 0; i < n; i++) {
    const available = possibleMoves.filter(m => m !== lastMove && m !== opposites[lastMove]);
    const move = available[Math.floor(Math.random() * available.length)];
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    moves.push(move + modifier);
    lastMove = move;
  }

  return moves.join(' ');
}

router.post('/', async (req: Request, res: Response) => {
  const { alg } = req.body;

  if (!alg) {
    res.status(400).json({ error: 'alg is required' });
    return;
  }

  try {
    const kpuzzle = await cube3x3x3.kpuzzle();

    const prefixLength = 4;
    const minimumScrambleLength = 19;
    let prefix;
    let parsed;
    let pattern;
    let solution
    let scramble = '';

    do {
      prefix = generateMoveList(prefixLength);
      parsed = new Alg(`${prefix} ${alg}`);
      pattern = kpuzzle.algToTransformation(parsed).toKPattern();
      solution = await experimentalSolve3x3x3IgnoringCenters(pattern); scramble = new Alg(`${solution.toString()} ${prefix}`).experimentalSimplify({ cancel: true, puzzleLoader: cube3x3x3 }).toString();
    } while (scramble.split(" ").length < minimumScrambleLength);

    console.log('prefix: ', prefix)
    res.status(200).json({ scramble: scramble });
    console.log(`Generated scramble for alg "${alg}" with length ${scramble.split(" ").length}: ${scramble}`);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate scramble' });
  }
});

export default router;
