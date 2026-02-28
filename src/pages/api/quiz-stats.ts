import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('slug');
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
  }

  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Demo stats
    const total = Math.floor(Math.random() * 500) + 100;
    const correctRate = 0.3 + Math.random() * 0.4;
    const distribution = [0, 0, 0, 0];
    distribution[1] = Math.round(total * correctRate);
    const remaining = total - distribution[1];
    distribution[0] = Math.round(remaining * 0.35);
    distribution[2] = Math.round(remaining * 0.35);
    distribution[3] = remaining - distribution[0] - distribution[2];
    return new Response(JSON.stringify({ total, distribution }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    });
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/quiz_responses?quiz_slug=eq.${slug}&select=selected_index`,
    { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
  );
  const responses = await res.json();

  const distribution = [0, 0, 0, 0];
  for (const r of responses) {
    if (r.selected_index >= 0 && r.selected_index <= 3) {
      distribution[r.selected_index]++;
    }
  }

  return new Response(JSON.stringify({ total: responses.length, distribution }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
  });
};
