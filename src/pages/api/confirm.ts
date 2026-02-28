import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, redirect }) => {
  const token = url.searchParams.get('token');
  if (!token) {
    return new Response('Invalid token', { status: 400 });
  }

  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_SERVICE_KEY;

  if (supabaseUrl && supabaseKey) {
    // Find subscriber by token
    const findRes = await fetch(
      `${supabaseUrl}/rest/v1/subscribers?confirm_token=eq.${token}&select=id,email,status`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    );
    const subscribers = await findRes.json();

    if (subscribers.length === 0) {
      return new Response('Invalid or expired token', { status: 404 });
    }

    // Update status to active
    await fetch(`${supabaseUrl}/rest/v1/subscribers?confirm_token=eq.${token}`, {
      method: 'PATCH',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'active',
        subscribed_at: new Date().toISOString(),
      }),
    });
  }

  return redirect('/subscribe/confirmed');
};
