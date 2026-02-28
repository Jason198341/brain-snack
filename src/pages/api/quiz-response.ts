import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { quizSlug, selectedIndex, isCorrect } = await request.json();

    if (!quizSlug || selectedIndex === undefined || isCorrect === undefined) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    let anonymousId = cookies.get('anon_id')?.value;
    if (!anonymousId) {
      anonymousId = crypto.randomUUID();
      cookies.set('anon_id', anonymousId, { maxAge: 365 * 24 * 60 * 60, path: '/', sameSite: 'lax' });
    }

    const supabaseUrl = import.meta.env.SUPABASE_URL;
    const supabaseKey = import.meta.env.SUPABASE_SERVICE_KEY;

    if (supabaseUrl && supabaseKey) {
      await fetch(`${supabaseUrl}/rest/v1/quiz_responses`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quiz_slug: quizSlug,
          anonymous_id: anonymousId,
          selected_index: selectedIndex,
          is_correct: isCorrect,
          responded_at: new Date().toISOString(),
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
