import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: '올바른 이메일을 입력해주세요.' }), { status: 400 });
    }

    const supabaseUrl = import.meta.env.SUPABASE_URL;
    const supabaseKey = import.meta.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Demo mode: just return success
      return new Response(JSON.stringify({ message: '구독 신청이 완료되었습니다. (데모 모드)' }), { status: 200 });
    }

    const token = crypto.randomUUID();

    // Check existing
    const checkRes = await fetch(`${supabaseUrl}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}&select=id,status`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });
    const existing = await checkRes.json();

    if (existing.length > 0 && existing[0].status === 'active') {
      return new Response(JSON.stringify({ error: '이미 구독 중인 이메일입니다.' }), { status: 409 });
    }

    // Upsert subscriber
    await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        email,
        status: 'pending',
        confirm_token: token,
        consent_at: new Date().toISOString(),
      }),
    });

    // Send confirmation email via Resend
    const resendKey = import.meta.env.RESEND_API_KEY;
    if (resendKey) {
      const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://brain-snack.vercel.app';
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: '뇌간식 <noreply@brainsnack.kr>',
          to: email,
          subject: '[뇌간식] 구독을 확인해주세요!',
          html: `
            <div style="max-width:600px;margin:0 auto;font-family:'Pretendard',sans-serif;padding:32px;">
              <h1 style="font-size:24px;color:#6C5CE7;">🧠 뇌간식</h1>
              <p style="font-size:16px;line-height:1.6;">구독 신청해주셔서 감사합니다!</p>
              <p style="font-size:16px;line-height:1.6;">아래 버튼을 클릭하면 구독이 완료됩니다.</p>
              <a href="${siteUrl}/api/confirm?token=${token}" style="display:inline-block;padding:14px 28px;background:#6C5CE7;color:white;text-decoration:none;border-radius:12px;font-weight:bold;font-size:16px;margin:16px 0;">구독 확인하기</a>
              <p style="font-size:13px;color:#636E72;margin-top:24px;">이 메일은 뇌간식 구독 확인 메일입니다. 본인이 요청하지 않았다면 무시해주세요.</p>
            </div>
          `,
        }),
      });
    }

    return new Response(JSON.stringify({ message: '확인 이메일을 보냈습니다.' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: '서버 오류가 발생했습니다.' }), { status: 500 });
  }
};
