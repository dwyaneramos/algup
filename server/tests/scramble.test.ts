import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';

const { mockSolve } = vi.hoisted(() => ({ mockSolve: vi.fn() }));

vi.mock('cubing/search', () => ({
  experimentalSolve3x3x3IgnoringCenters: mockSolve,
}));

import app from '../src/index.js';

const AUTH_HEADER = { 'x-api-secret': 'test-secret' };
// Long enough that after experimentalSimplify merges it with any random prefix/AUF,
// the combined scramble is guaranteed >= the route's minimumScrambleLength (19),
// so the do/while loop always terminates on its first iteration.
const LONG_SOLUTION = Array.from({ length: 15 }, () => 'R U').join(' ');

beforeAll(() => {
  process.env.API_SECRET = 'test-secret';
});

describe('auth middleware', () => {
  it('rejects requests with no x-api-secret header', async () => {
    const res = await request(app).post('/scramble').send({ alg: 'R U' });
    expect(res.status).toBe(401);
  });

  it('rejects requests with the wrong x-api-secret header', async () => {
    const res = await request(app).post('/scramble').set('x-api-secret', 'wrong').send({ alg: 'R U' });
    expect(res.status).toBe(401);
  });

  it('passes through to the route handler with the correct header', async () => {
    // No `alg` in body -> proves we reached route validation (400), not auth (401).
    const res = await request(app).post('/scramble').set(AUTH_HEADER).send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /scramble', () => {
  it('400s when alg is missing', async () => {
    const res = await request(app).post('/scramble').set(AUTH_HEADER).send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'alg is required' });
  });

  it('200s with { scramble, solution } on success', async () => {
    mockSolve.mockResolvedValue({ toString: () => LONG_SOLUTION });
    const res = await request(app).post('/scramble').set(AUTH_HEADER).send({ alg: "R U R' U'" });
    expect(res.status).toBe(200);
    expect(typeof res.body.scramble).toBe('string');
    expect(res.body.scramble.split(' ').length).toBeGreaterThanOrEqual(19);
    expect(typeof res.body.solution).toBe('string');
  });

  it('500s when the solver throws', async () => {
    mockSolve.mockRejectedValue(new Error('solve failed'));
    const res = await request(app).post('/scramble').set(AUTH_HEADER).send({ alg: "R U R' U'" });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to generate scramble' });
  });
});

describe('POST /scramble/batch', () => {
  it('400s when algs is missing/empty/non-array', async () => {
    for (const algs of [undefined, [], 'not-an-array']) {
      const res = await request(app).post('/scramble/batch').set(AUTH_HEADER).send({ algs });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'algs array is required' });
    }
  });

  it('400s when more than 15 algs are given', async () => {
    const algs = Array.from({ length: 16 }, () => "R U R' U'");
    const res = await request(app).post('/scramble/batch').set(AUTH_HEADER).send({ algs });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Maximum 15 algs per batch' });
  });

  it('200s with one result per input alg', async () => {
    mockSolve.mockResolvedValue({ toString: () => LONG_SOLUTION });
    const algs = ["R U R' U'", "F R U R' U' F'"];
    const res = await request(app).post('/scramble/batch').set(AUTH_HEADER).send({ algs });
    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(algs.length);
    for (const result of res.body.results) {
      expect(typeof result.scramble).toBe('string');
      expect(typeof result.solution).toBe('string');
    }
  });

  it('500s when the solver throws', async () => {
    mockSolve.mockRejectedValue(new Error('solve failed'));
    const res = await request(app).post('/scramble/batch').set(AUTH_HEADER).send({ algs: ["R U R' U'"] });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to generate scramble batch' });
  });
});
