import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('잘못된 요청입니다.', { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response(unsubscribeHtml('구독이 해지되었습니다. (데모 모드)'), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Find subscriber by unsubscribe token
  const findRes = await fetch(
    `${supabaseUrl}/rest/v1/subscribers?confirm_token=eq.${encodeURIComponent(token)}&select=id,email,status`,
    { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
  );
  const subscribers = await findRes.json();

  if (!Array.isArray(subscribers) || subscribers.length === 0) {
    return new Response(unsubscribeHtml('유효하지 않은 링크입니다.'), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const sub = subscribers[0];

  if (sub.status === 'unsubscribed') {
    return new Response(unsubscribeHtml('이미 구독이 해지된 이메일입니다.'), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Update status to unsubscribed
  await fetch(`${supabaseUrl}/rest/v1/subscribers?id=eq.${sub.id}`, {
    method: 'PATCH',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() }),
  });

  return new Response(unsubscribeHtml('구독이 해지되었습니다.'), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};

function unsubscribeHtml(message: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>뇌간식 구독 해지</title></head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:'Pretendard',-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="max-width:400px;text-align:center;padding:32px;">
    <p style="font-size:48px;margin-bottom:16px;">🧠</p>
    <h1 style="font-size:20px;color:#2D3436;margin-bottom:8px;">${message}</h1>
    <p style="font-size:14px;color:#636E72;margin-bottom:24px;">뇌간식을 이용해주셔서 감사합니다.</p>
    <a href="/" style="display:inline-block;padding:12px 24px;background:#6C5CE7;color:white;text-decoration:none;border-radius:12px;font-weight:bold;">홈으로 돌아가기</a>
  </div>
</body>
</html>`;
}
