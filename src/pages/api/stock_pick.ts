import type { APIRoute } from 'astro';
import { readFile, writeFile } from 'node:fs/promises';

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const member = formData.get('member');
  const ticker = formData.get('ticker');

  const newPick = { member, ticker, date: new Date().toISOString() };

  try {
    const data = await readFile('data/stock_picks.json', 'utf-8');
    const picks = JSON.parse(data);
    picks.push(newPick);
    await writeFile('data/stock_picks.json', JSON.stringify(picks, null, 2));
  } catch (error) {
    console.error('Error saving stock pick:', error);
    return new Response(JSON.stringify({ message: 'Error saving stock pick' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  return new Response(JSON.stringify({ message: 'Stock pick received' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
