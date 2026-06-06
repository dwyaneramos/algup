const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function generateScrambleFromAlg(algString: string): Promise<string> {
  const res = await fetch(`${API_URL}/scramble`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alg: algString }),
  });
  const { scramble } = await res.json();

  return scramble;
}
