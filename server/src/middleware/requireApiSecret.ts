import { Request, Response, NextFunction } from 'express';

export function requireApiSecret(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.API_SECRET;
  const provided = req.header('x-api-secret');

  if (!expected || provided !== expected) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}
