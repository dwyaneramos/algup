import { Router, Request, Response } from 'express';
import { experimentalSolve2x2x2 } from 'cubing/search';
import { generateScrambleForAlg, MAX_BATCH_SIZE } from '../lib/scramble.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { alg } = req.body;

  if (!alg) {
    res.status(400).json({ error: 'alg is required' });
    return;
  }

  try {
    const { scramble, solution } = await generateScrambleForAlg(alg);

    res.status(200).json({ scramble, solution });

    console.log(`Generated scramble for alg "${alg}" with length ${scramble.split(' ').length}: ${scramble}`);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate scramble' });
  }
});

router.post('/batch', async (req: Request, res: Response) => {
  const { algs } = req.body;

  if (!Array.isArray(algs) || algs.length === 0) {
    res.status(400).json({ error: 'algs array is required' });
    return;
  }

  if (algs.length > MAX_BATCH_SIZE) {
    res.status(400).json({ error: `Maximum ${MAX_BATCH_SIZE} algs per batch` });
    return;
  }

  try {
    const results = await Promise.all(
      algs.map(async (rawAlg: string) => ({
        alg: rawAlg,
        ...(await generateScrambleForAlg(rawAlg)),
      }))
    );

    console.log(`Generated scramble batch of length ${results.length}`);
    res.status(200).json({ results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate scramble batch' });
  }
});

export default router;
